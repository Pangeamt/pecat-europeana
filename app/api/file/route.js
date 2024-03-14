import { NextResponse } from "next/server";
import fs from "fs";
import { pipeline } from "stream";
import { promisify } from "util";
import { uid } from "uid";
const pump = promisify(pipeline);

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
    console.log(searchParams);
    const fileId = searchParams.get("fileId");
    console.log(fileId);

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

    const response = NextResponse.json(tus, { status: 200 });
    response.headers.set("Content-Disposition", `filename=${file.filename}`);
    response.headers.set("Content-Type", "application/json");

    return response;
  } catch (error) {
    return NextResponse.error({ message: error.message }, { status: 401 });
  }
};
