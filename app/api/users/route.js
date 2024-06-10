import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { generateSaltAndHash } from "@/lib/utils";

import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const GET = async (req, res) => {
  try {
    const authValue = await getServerSession(authOptions);

    if (!authValue)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const { user } = authValue;
    if (!user)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        emailVerified: true,
      },
    });
    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    return NextResponse.error({ message: error.message }, { status: 401 });
  }
};

export const POST = async (req, res) => {
  try {
    const authValue = await getServerSession(authOptions);

    if (!authValue)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const { user } = authValue;
    if (!user)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { name, email, password } = await req.json();
    const { salt, hash } = generateSaltAndHash({ password });
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        salt,
        hash,
      },
    });
    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (error) {
    return NextResponse.error({ message: error.message }, { status: 401 });
  }
};
