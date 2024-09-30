import { signInSchema } from '@/lib/zod';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email", placeholder: "Email" },
        password: { label: "Password", type: "password", placeholder: "Password" },
      },
      async authorize(credentials, req) {
        // Validate the credentials using the zod schema
        const parsedCredentials = signInSchema.safeParse(credentials);

        if (!parsedCredentials.success) {
          console.log('Invalid credentials:', parsedCredentials.error);
          return null;
        }

        try {
          // Make a request to your backend API to log in the user
          const response = await fetch('http://localhost:8080/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials?.email,
              password: credentials?.password,
            }),
          });

          // Check if the login was successful
          if (response.ok) {
            const user = await response.json();
            console.log('User logged in:', user);
            return {
              id: user.userId,
              email: user.email,
              username: user.username,
            };
          } else {
            console.log('Login failed');
            return null;
          }
        } catch (error) {
          console.error('Error during login:', error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    signOut: '/',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
});
