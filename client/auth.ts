import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import { createUser, enableOAuth, getUserByEmail, getUserById, loginUser } from "@/lib/api"
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
      async authorize(credentials: Partial<Record<"email" | "password", unknown>>) {
        console.log('Credentials:', credentials);  // Debugging
        if (!credentials?.email || !credentials?.password) {
          console.error('Missing credentials');
          return null;
        }
      
        try {
          // Your user login logic here
          const user = await loginUser(credentials.email as string, credentials.password as string);
          if (user) {
            return user;
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
    async session({token, session}){
      if (token.sub && session.user){
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({token, user, account}) {
      if (user) {
        token.sub = user.id;
      } else {
        user = token
      }
      if (!token.sub) return token;

      try {
        // Get UserID from email address
        let existingUser = null;
        let user_id = null;
        if (user.email) {
          // Does email exist user table
          const data = await getUserByEmail(user.email);
          user_id = data?.id;
          if (user_id) {
            existingUser = await getUserById(user_id);
          }
        }

        if (!existingUser) {
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
          console.log('Existing user:', newUser);
          existingUser = await createUser(newUser);
        } else {
          // Enable OAuth for account
          const id = existingUser.id;
          if (id) {
            enableOAuth(id);
          }
        }
        token.isOAuth = true;
        token.email = existingUser.email;
        token.role = "USER"; // You might want to set a default role
        console.log('JWT token:', token);
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