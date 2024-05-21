import prisma from "../../../../lib/prisma";

import { createEdgeRouter } from "next-connect";
import { NextResponse } from "next/server";
import { generateSaltAndHash } from "@/lib/utils";

const router = createEdgeRouter();

router.post(async (req, res) => {
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

    // const result = await NextResponse.json(newUser);

    return res.status(200).json(newUser);
  } catch (error) {
    // const result = await NextResponse.json(
    //   {
    //     message: error.message,
    //   },
    //   {
    //     status: 400,
    //   }
    // );

    return res.status(400).json({
      message: error.message,
    });
  }
});

export async function POST(request, ctx) {
  return router.run(request, ctx);
}
