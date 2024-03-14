import prisma from "../../../../lib/prisma";

import { createEdgeRouter } from "next-connect";
import { NextResponse } from "next/server";
import { generateSaltAndHash } from "@/lib/utils";

const router = createEdgeRouter();

router.post(async (req) => {
  try {
    const data = await req.json();

    const userFound = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (userFound) {
      return NextResponse.json(
        {
          message: "Email already exists",
        },
        {
          status: 400,
        }
      );
    }

    const { salt, hash } = generateSaltAndHash({ password: data.password });
    const newUser = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        salt,
        hash,
      },
    });

    delete newUser?.salt;
    delete newUser?.hash;

    return NextResponse.json(newUser);
  } catch (error) {
    return NextResponse.json(
      {
        message: error.message,
      },
      {
        status: 400,
      }
    );
  }
});

export async function POST(request, ctx) {
  return router.run(request, ctx);
}
