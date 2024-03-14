import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "../../../../lib/prisma";
import { validatePassword } from "@/lib/utils";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password", placeholder: "*****" },
      },
      async authorize(credentials, req) {
        const userFound = await prisma.user.findUnique({
          where: {
            email: credentials?.email,
          },
        });

        if (!userFound) throw new Error("No user found");

        if (
          !validatePassword({
            user: userFound,
            inputPassword: credentials?.password,
          })
        )
          throw new Error("Invalid email and password combination");

        return {
          id: userFound.id,
          name: userFound.name,
          email: userFound.email,
          role: userFound.role,
          image: userFound.image,
          emailVerified: userFound.emailVerified,
        };
      },
    }),
  ],
  callbacks: {
    authorized({ req, token }) {
      if (token) return true; // If there is a token, the user is authenticated
    },
  },
  pages: {
    signIn: "/auth/login",
  },
};

const handler = NextAuth(authOptions);
export const { auth } = handler;

export { handler as GET, handler as POST };
