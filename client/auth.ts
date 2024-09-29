import { signInSchema } from '@/lib/zod';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';


export const {handlers, signIn, signOut, auth} = NextAuth({
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email", placeholder: "Email"},
                password: {  label: "Password", type: "password", placeholder: "Password"}
            },
            async authorize(credentials){
                let user = null;
                
                const parsedCredentials = signInSchema.safeParse(credentials);

                if (!parsedCredentials.success) {
                    console.log('Invalid credentials', parsedCredentials.error);
                    return null;
                }

                user = {
                    id: '1',
                    name: 'Test User',
                    email: 'admin@exmaple.com'
                }

                if (user) {
                    console.log('User found');
                    return user;
                }
                else {
                    console.log('User not found');
                    return null;
            }
        }})
    
    ],
    pages: { 
        signIn: '/auth/signin',
        signOut: '/',
        error: '/auth/error'
    },
});