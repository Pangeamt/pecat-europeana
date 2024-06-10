import { NextResponse } from "next/server";
import fs from "fs";
import { pipeline } from "stream";
import { promisify } from "util";
import { uid } from "uid";
const pump = promisify(pipeline);
const axios = require("axios");
const contentDisposition = require("content-disposition");
const zlib = require("zlib");
import { getServerSession } from "next-auth";

import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const POST = async (req, res) => {
  try {
    const { user } = await auth();
    if (!user)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    // find user
    const userAuth = await prisma.user.findUnique({
      where: {
        email: user.email,
      },
    });
    console.log(userAuth);

    const formData = await req.formData();
    const projects = formData.getAll("projects");

    if (projects.length === 0) {
      return NextResponse.json(
        { message: "No file uploaded" },
        { status: 400 }
      );
    }

    for (const file of projects) {
      if (file && file.name) {
        const fileName = file.name.trim().replace(/\s+/g, "");
        const fileExtension = fileName.split(".").pop().toLowerCase();
        if (fileExtension !== "json") {
          return NextResponse.json(
            { message: "El archivo debe ser de tipo JSON" },
            { status: 400 }
          );
        }

        const filePath = `./public/files/${file.name}_${uid()}`;
        await pump(file.stream(), fs.createWriteStream(filePath));

        // read json file
        const data = fs.readFileSync(filePath, "utf8");
        const jsonData = JSON.parse(data);

        // save File to DB
        const createOne = await prisma.project.create({
          data: {
            filename: file.name.trim(),
            userId: userAuth.id,
          },
        });

        const createMany = await prisma.tu.createMany({
          data: jsonData.map((item) => {
            return {
              ...item,
              projectId: createOne.id,
            };
          }),
          skipDuplicates: true,
        });
        console.log(createMany);
      }
    }
    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (error) {
    return NextResponse.error({ message: error.message }, { status: 401 });
  }
};

export const PUT = async (req, res) => {
  try {
    const { user } = await auth();
    const { url } = await req.json();
    if (!user)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    // find user
    const userAuth = await prisma.user.findUnique({
      where: {
        email: user.email,
      },
    });

    await axios({
      method: "get",
      url,
      responseType: "stream",
    })
      .then(function (response) {
        let fileName = "downloaded-file";
        const contentDispositionHeader =
          response.headers["content-disposition"];
        if (contentDispositionHeader) {
          fileName = contentDisposition.parse(contentDispositionHeader)
            .parameters.filename;
        }
        // create folder
        const newFolder = new Date().getTime();
        if (!fs.existsSync(`./public/files/${newFolder}`)) {
          fs.mkdirSync(`./public/files/${newFolder}`);
        }

        const downloadPath = `./public/files/${newFolder}/${fileName}`;

        const writer = fs.createWriteStream(downloadPath);
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
          writer.on("finish", () => resolve({ downloadPath, fileName }));
          writer.on("error", reject);
        });
      })
      .then(function ({ downloadPath, fileName }) {
        console.log("File downloaded successfully:", downloadPath);
        const decompressedFilePath = `${downloadPath}.json`;

        const readStream = fs.createReadStream(downloadPath);
        const writeStream = fs.createWriteStream(decompressedFilePath);

        const unzip = zlib.createGunzip();

        readStream.pipe(unzip).pipe(writeStream);

        return new Promise((resolve, reject) => {
          writeStream.on("finish", () =>
            resolve({
              decompressedFilePath,
              fileName,
            })
          );
          writeStream.on("error", (err) => reject(err));
        });
      })
      .then(async function ({ decompressedFilePath, fileName }) {
        console.log("File decompressed successfully:", decompressedFilePath);
        // read json file
        const data = fs.readFileSync(decompressedFilePath, "utf8");
        const jsonData = JSON.parse(data);

        // save File to DB
        const createOne = await prisma.project.create({
          data: {
            filename: fileName.trim(),
            userId: userAuth.id,
            filePath: decompressedFilePath,
          },
        });

        await prisma.tu.createMany({
          data: jsonData.map((item) => {
            return {
              ...item,
              projectId: createOne.id,
            };
          }),
          skipDuplicates: true,
        });

        return new Promise((resolve) => {
          resolve({});
        });
      })
      .catch(function (err) {
        console.error("Error downloading file:", err);
        return new Promise((_, reject) => {
          reject({ error: err });
        });
      });

    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (error) {
    return NextResponse.error({ message: error.message }, { status: 401 });
  }
};

export const GET = async (req, res) => {
  try {
    const authValue = await getServerSession(authOptions);

    if (!authValue)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const { user } = authValue;
    if (!user)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const where = {
      deletedAt: null,
    };
    if (user.role !== "ADMIN") {
      where.userId = user.id;
    }
    const projects = await prisma.project.findMany({
      where,
      select: {
        id: true,
        filename: true,
        createdAt: true,
        deletedAt: true,
        label: true,
        User: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    for (let i = 0; i < projects.length; i++) {
      const element = projects[i];
      const countByStatus = await prisma.tu.groupBy({
        by: ["Status"],
        _count: true,
        where: {
          projectId: element.id,
        },
      });
      const totalCount = await prisma.tu.count({
        where: {
          projectId: element.id,
        },
      });
      projects[i].countByStatus = countByStatus;
      projects[i].totalCount = totalCount;
      console.log(countByStatus);
    }

    return NextResponse.json({ projects }, { status: 200 });
  } catch (error) {
    return NextResponse.error({ message: error.message }, { status: 401 });
  }
};

export const DELETE = async (req, res) => {
  try {
    const authValue = await auth();
    if (!authValue)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const { user } = authValue;
    if (!user)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { projectId } = await req.json();
    const file = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
    });

    if (!file) {
      return NextResponse.json({ message: "File not found" }, { status: 404 });
    }

    await prisma.project.update({
      where: {
        id: projectId,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (error) {
    return NextResponse.error({ message: error.message }, { status: 401 });
  }
};

// PATCH: Update file
export const PATCH = async (req, res) => {
  try {
    const authValue = await auth();
    if (!authValue)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const { user } = authValue;
    if (!user)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { projectId, data } = await req.json();
    const file = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
    });

    if (!file) {
      return NextResponse.json({ message: "File not found" }, { status: 404 });
    }

    await prisma.project.update({
      where: {
        id: projectId,
      },
      data: {
        ...data,
      },
    });

    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (error) {
    return NextResponse.error({ message: error.message }, { status: 401 });
  }
};
