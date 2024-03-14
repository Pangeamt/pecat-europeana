import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { get } from "http";

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

    const tus = await prisma.tu.findMany({
      where: {
        fileId,
      },
    });

    return NextResponse.json({ tus }, { status: 200 });
  } catch (error) {
    return NextResponse.error({ message: error.message }, { status: 401 });
  }
};

export const POST = async (req, res) => {
  try {
    const { user } = await auth();
    if (!user)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const { tuId, review_literal, action } = await req.json();

    const tu = await prisma.tu.findUnique({
      where: {
        id: tuId,
      },
    });
    const data = {
      human_review: true,
    };
    if (action === "approve") {
      let Status = "NOT_REVIEWED";
      if (tu.original_literal === review_literal || !review_literal) {
        Status = "ORIGINAL_ACCEPTED";
      } else {
        Status = "EDITED";
      }
      data.Status = Status;
      data.review_literal = review_literal;
    } else if (action === "reject") {
      let Status = "REJECTED";
      data.Status = Status;
    }

    const tuUpdated = await prisma.tu.update({
      where: {
        id: tuId,
      },
      data,
    });

    return NextResponse.json({ tu: tuUpdated }, { status: 200 });
  } catch (error) {
    return NextResponse.error({ message: error.message }, { status: 401 });
  }
};
