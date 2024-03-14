import { NextResponse } from "next/server";
import fs from "fs";
import { pipeline } from "stream";
import { promisify } from "util";
import { uid } from "uid";
const pump = promisify(pipeline);

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

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
    const files = formData.getAll("files");

    if (files.length === 0) {
      return NextResponse.json(
        { message: "No file uploaded" },
        { status: 400 }
      );
    }

    for (const file of files) {
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
        const createOne = await prisma.file.create({
          data: {
            filename: file.name.trim(),
            userId: userAuth.id,
          },
        });

        const createMany = await prisma.tu.createMany({
          data: jsonData.map((item) => {
            return {
              ...item,
              fileId: createOne.id,
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

export const GET = async (req, res) => {
  try {
    const authValue = await auth();
    if (!authValue)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const { user } = authValue;
    if (!user)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const files = await prisma.file.findMany({
      select: {
        id: true,
        filename: true,
        createdAt: true,
        User: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    for (let i = 0; i < files.length; i++) {
      const element = files[i];
      const countByStatus = await prisma.tu.groupBy({
        by: ["Status"],
        _count: true,
        where: {
          fileId: element.id,
        },
      });
      const totalCount = await prisma.tu.count({
        where: {
          fileId: element.id,
        },
      });
      files[i].countByStatus = countByStatus;
      files[i].totalCount = totalCount;
      console.log(countByStatus);
    }

    return NextResponse.json({ files }, { status: 200 });
  } catch (error) {
    return NextResponse.error({ message: error.message }, { status: 401 });
  }
};
