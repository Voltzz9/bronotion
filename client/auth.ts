import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import { createUser, enableOAuth, getUserByEmail } from "@/lib/api"
import Credentials from "next-auth/providers/credentials"

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

      try {
        // Get UserID from email address
        let existingUser = null;
        if (user.email) {
          // Does email exist user table
          existingUser = await getUserByEmail(user.email);
          console.log('Existing user:', existingUser);
        }

        if (!existingUser) {
          console.log('User does not exist, creating new user:', user);
          // User doesn't exist, create a new one
          // if not make an entry (dont specify id it will generate one)
          // add account table entry
          // add UserAuthMethod table entry
          
          const newUser = {
            username: user.name || '',
            email: user.email || '',
            image: user.image || '',
            auth_method: account?.provider,
            provider_account_id: account?.providerAccountId,
          };

          existingUser = await createUser(newUser);
          console.log('New user created:', existingUser);
        } else {
          console.log('User exists:', existingUser);
          // Enable OAuth for account
          const id = existingUser.id;
          if (id) {
            enableOAuth(id);
          }
        }

        token.isOAuth = true;
        token.email = existingUser.email;
        token.role = "USER"; // You might want to set a default role
        return token;
      } catch (error) {
        console.error('Error in jwt callback:', error);
        // You might want to handle this error differently
        throw error;
      }
    },
  },
  session: { strategy: "jwt" },
});