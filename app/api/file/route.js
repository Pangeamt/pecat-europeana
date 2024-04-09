import { NextResponse } from "next/server";
const zlib = require("zlib");
const fs = require("fs");

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const GET = async (req, res) => {
  try {
    const authValue = await auth();
    if (!authValue)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const { user } = authValue;
    if (!user)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const searchParams = new URLSearchParams(url.searchParams);
    const fileId = searchParams.get("fileId");

    const file = await prisma.file.findUnique({
      where: {
        id: fileId,
      },
    });

    const tus = await prisma.tu.findMany({
      where: {
        fileId,
      },
    });
    const jsonString = JSON.stringify(tus);
    const fileNameAux = file.filename.split(".json")[0];
    const jsonFilePath = `./public/files/downloads/${fileNameAux}-pecat.json`;

    // Escribir el objeto JSON en un archivo
    const compress = async () => {
      return new Promise((resolve, reject) => {
        fs.writeFile(jsonFilePath, jsonString, (err) => {
          if (err) {
            console.error("Error al escribir el archivo JSON:", err);
            return;
          }
          console.log("Archivo JSON generado correctamente.");

          // Crear un flujo de lectura del archivo JSON
          const readStream = fs.createReadStream(jsonFilePath);

          // Crear un flujo de escritura para el archivo comprimido .gz
          const writeStream = fs.createWriteStream(`${jsonFilePath}.gz`);

          // Comprimir el archivo JSON utilizando gzip
          const gzip = zlib.createGzip();

          // Pipe: Leer el archivo JSON, comprimirlo y escribirlo en el archivo .gz
          readStream.pipe(gzip).pipe(writeStream);

          writeStream.on("finish", () => {
            console.log("Archivo comprimido correctamente.");
            resolve({ filePath: `${jsonFilePath}.gz` });
          });

          writeStream.on("error", (err) => {
            console.error("Error al escribir el archivo comprimido:", err);
            reject({ error: err });
          });
        });
      });
    };
    const { filePath } = await compress();

    const protocol = req.headers["x-forwarded-proto"] || "http"; // Obtener el protocolo HTTP o HTTPS
    const host = req.headers.host || "localhost:3000"; // Obtener el nombre de dominio
    const baseUrl = `${protocol}://${host}`;
    const downloadPath = baseUrl + filePath.replace("./public", "/");

    setTimeout(() => {
      fs.unlinkSync(jsonFilePath);
      fs.unlinkSync(`${jsonFilePath}.gz`);
    }, 1000 * 10);

    return NextResponse.redirect(downloadPath, {
      status: 302,
    });
  } catch (error) {
    return NextResponse.error({ message: error.message }, { status: 401 });
  }
};
