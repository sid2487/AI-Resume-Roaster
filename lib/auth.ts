import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcrypt";
import GoogleProvider from "next-auth/providers/google"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),

    CredentialsProvider({
      name: "Credentials",

      credentials: {
        email: {
          label: "email",
          type: "email",
          placeholder: "abc@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user) return null;

        const valid = await bcrypt.compare(credentials.password, user.password!);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, account }) {
      // when logging in
      if(account && user){
        // credential login
        if(account.provider === "credentials"){
          token.user = {
            id: user.id,
            email: user.email,
          };
        }
        
        // google login
        if(account.provider === "google"){
          const dbUser = await prisma.user.findUnique({
            where: {email: user.email!},
          });

          // if not exist
          if (!dbUser) {
            await prisma.user.create({
              data: {
                email: user.email!,
                password: "",
              },
            });
          }

          // put into token
          token.user = {
            id: String(dbUser?.id),
            email: String(dbUser?.email),
          };
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token.user) {
        session.user = token.user;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
