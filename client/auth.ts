import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
 

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [GitHub, Google],
  callbacks: {
    async session({token, session}){
      if (token.sub && session.user){
        session.user.id = token.sub
      }

      return session;
    },
    async jwt({token}) {
      if (!token.sub) return token;

      const existingUser = await getUserByID(token.sub);

      if (!existingUser) {
        return token;
      }

      token.isOAuth = true;
      token.name = existingUser.name;
      token.email = existingUser.email;
      token.role = "ADMIN";

      return token;
    },
  },
    session: { strategy: "jwt" },

})