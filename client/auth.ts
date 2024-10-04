import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { createUser, getUserByEmail, loginUser } from "@/lib/api";
import Credentials from "next-auth/providers/credentials";

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
      async authorize(credentials: Partial<Record<"email" | "password", unknown>>) {
        console.log('Credentials:', credentials);  // Debugging
        if (!credentials?.email || !credentials?.password) {
          console.error('Missing credentials');
          return null;
        }

        try {
          // User login logic
          const user = await loginUser(credentials.email as string, credentials.password as string);
          if (user) {
            return user; // Make sure the user object returned contains the ID
          }
          return null;
        } catch (error) {
          console.error('Error during login:', error);
          return null;
        }
      }
    }),
  ],
  callbacks: {
    async session({ session, token }: { session: any, token: any }) {
      if (token.id && session.user) {
        session.user.id = token.id; // Ensure session.user.id is set from token.id
      }
      return session;
    },

    async jwt({ token, user, account }: { token: any, user?: any, account?: any }) {

      // If this is the first time the user logs in, "user" will be set
      if (user) {
        let existingUser = await getUserByEmail(user.email as string);

        if (!existingUser) {
          // Create the user if they do not exist
          const newUser = await createUser({
            username: user.name || '',
            email: user.email || '',
            image: user.image || '',
          });
          token.id = newUser.id; // Store the newly created user's ID in token.id
        } else {
          token.id = existingUser.id; // Store existing user's ID in token.id
        }
      }
      return token;
    }
  },
  session: { strategy: "jwt" }, // Ensure JWT is used as session strategy
});
