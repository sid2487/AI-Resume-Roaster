import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({

        name: "Credentials",
     
      credentials: {
        email: { label: "email", type: "email", placeholder: "abc@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        
        if(!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({
            where: {
                email: credentials.email
            }
        });

        if(!user) return null;

        const valid = await bcrypt.compare(credentials.password, user.password);
        if(!valid) return null;

        return {
            id: user.id,
            email: user.email,
        }
      },
    }),
  ],

  callbacks: {
    async jwt({token, user}){
        if(user){
            token.user = { id: user.id, email: user.email }
        }
        return token;
    },

    async session({session, token}){
        if(token.user){
            session.user = token.user;
        }
        return session;
    }
  },

  pages: {
    signIn: "/login"
  },
  session: {
    strategy: "jwt"
  },
  secret: process.env.NEXTAUTH_SECRET


};
