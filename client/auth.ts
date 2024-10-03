import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import { getUserById, createUser } from "@/lib/api"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [GitHub, Google],
  callbacks: {
    async session({token, session}){
      console.log('Session token:', session);
      if (token.sub && session.user){
        session.user.id = token.sub
      }
      return session;
    },
    async jwt({token, user, account}) {
      token.sub = account?.providerAccountId;
      if (!token.sub) return token;

      try {
        let existingUser = await getUserById(token.sub);

        if (!existingUser) {
          console.log('User does not exist, creating new user:', user);
          // User doesn't exist, create a new one
          const newUser = {
            id: token.sub,
            name: user.name || '',
            email: user.email || '',
            image: user.image || '',
          };

          existingUser = await createUser(newUser);
          console.log('New user created:', existingUser);
        }

        token.isOAuth = true;
        token.name = existingUser.name;
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
})