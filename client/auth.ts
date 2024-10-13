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
        password: { label: "Password", type: "password" },
        remember: { label: "Remember Me", type: "checkbox" },
      },
      async authorize(credentials: Partial<Record<"email" | "password" | "remember", unknown>>) {
        if (!credentials?.email || !credentials?.password) {
          console.error('Missing credentials');
          return null;
        }
        try {
          const user = await loginUser(credentials.email as string, credentials.password as string, credentials.remember as boolean);
          if (user) {
            return {...user, remember: credentials.remember};
          }
          console.error('User not found');
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
        session.user.id = token.id;
        const existingUser = await getUserByEmail(session.user.email);
        session.user.name = existingUser?.username;
        session.user.image = existingUser?.image || session.user.image;
        session.expires = token.expires;
      }
      return session;
    },
    async jwt({ token, user, account }: { token: any, user?: any, account?: any }) {
      if (user) {
        let existingUser = await getUserByEmail(user.email as string);
        if (!existingUser) {
          const newUser = await createUser({
            username: user.name as string || '',
            email: user.email as string || '',
            image: user.image as string || '',
            auth_method: account.provider as string || '',
            provider_account_id: account.providerAccountId as string || '',
          });
          token.id = newUser.user?.id;
        } else {
          token.id = existingUser.id;
        }
        if (account.provider === 'credentials') {
        token.expires = user.token.expires;
        } else {
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
          },
            body: JSON.stringify({ email: token.email, remember: true, oauth: true }),
          });
          token.expires = Date.now() + 10 * 60 * 1000; // 10 minutes
        }

      }
      return token;
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  }
});