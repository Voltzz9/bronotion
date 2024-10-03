import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { getUserById, createUser } from "@/lib/api";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub,
    Google,
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "admin@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        
        // Hardcoded admin credentials
        if (credentials.email === "admin@example.com" && credentials.password === "adminpassword") {
          return {
            id: "admin-id",
            email: "admin@example.com",
            name: "Admin User",
            role: "ADMIN"
          };
        }
        return null;
      }
    }),
  ],
  callbacks: {
    async session({token, session}){
      console.log('Session token:', session);
      if (token.sub && session.user){
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({token, user, account}) {
      if (user) {
        token.sub = user.id;
      }
      if (!token.sub) return token;
      if (account && account.provider !== "credentials") {
        try {
          let existingUser = await getUserById(token.sub);
          if (!existingUser) {
            console.log('User does not exist, creating new user:', user);
            const newUser = {
              id: token.sub,
              name: user.name || '',
              email: user.email || '',
              image: user.image || ''
            };
            existingUser = await createUser(newUser);
            console.log('New user created:', existingUser);
          }
          token.name = existingUser.name;
          token.email = existingUser.email;
        } catch (error) {
          console.error('Error in jwt callback:', error);
          throw error;
        }
      }
      
      token.isOAuth = account ? account.provider !== "credentials" : token.isOAuth;
      return token;
    },
  },
  session: { strategy: "jwt" },
});