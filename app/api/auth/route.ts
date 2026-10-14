import { NextRequest, NextResponse } from "next/server";
import chalk from "chalk";
import prisma from "@/lib/prisma";
import * as jose from "jose";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    //check is both email and password given
    if (!email || !password) {
      console.log(chalk.bgRed("both email and password 're reqired!"));
      return NextResponse.json(
        {
          message: "both email and password 're reqired!",
        },
        {
          status: 403,
        },
      );
    }

    //check is a valid user
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      console.log(chalk.bgRed("User not found!"));
      return NextResponse.json(
        {
          message: "User not found!",
        },
        {
          status: 401,
        },
      );
    }

    //check is password correct
    const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordCorrect) {
      console.log(chalk.red("Invalid email or password"));
      return NextResponse.json(
        {
          message: "invalid email or password!",
        },
        {
          status: 401,
        },
      );
    }
    //generate token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new jose.SignJWT({
      email: user.email,
      role: user.role,
      fName: user.fName,
      lName: user.lName,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(user.id)
      .setExpirationTime("7d")
      .sign(secret);

    const response = NextResponse.json({
      message: "Login Successfully!",
      role: user.role,
    });

    response.cookies.set({
      name: "login-token",
      value: token,
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });

    console.log(chalk.green("Login successfully"));
    return response;
  } catch (error: any) {
    return NextResponse.json(
      {
        message: "Server Error while processing!",
      },
      {
        status: 500,
      },
    );
  }
}
