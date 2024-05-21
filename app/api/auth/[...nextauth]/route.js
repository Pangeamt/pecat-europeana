import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "../../../../lib/prisma";
import { validatePassword } from "@/lib/utils";

const authOptions = {
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
    {
      id: "mint",
      name: "Mint",
      type: "oauth",
      wellKnown:
        "https://auth.europeana.eu/auth/realms/europeana/.well-known/openid-configuration",
      authorization: { params: { scope: "openid email profile" } },
      idToken: true,
      checks: ["pkce", "state"],
      clientId: process.env.MINT_CLIENT_ID,
      clientSecret: process.env.MINT_CLIENT_SECRET,
      redirectUri: "http://localhost:3000/api/auth/callback/mint",
      profile: async (profile) => {
        const userFound = await prisma.user.findUnique({
          where: {
            email: profile?.email,
          },
        });

        if (!userFound) {
          const newUser = await prisma.user.create({
            data: {
              name: profile?.preferred_username,
              email: profile?.email,
              role: "USER",
              image: profile?.picture,
              provider: "mint",
            },
          });

          return {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            image: newUser.image,
            emailVerified: newUser.emailVerified,
            provider: newUser.provider,
          };
        } else {
          return {
            id: userFound.id,
            name: userFound.name,
            email: userFound.email,
            role: userFound.role,
            image: userFound.image,
            emailVerified: userFound.emailVerified,
          };
        }
      },
    },
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
// export const { auth } = handler;

export { handler as GET, handler as POST };
