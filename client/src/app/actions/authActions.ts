'use server';

import { signIn, signOut } from "../../../auth";
import { AuthError } from "next-auth";

export async function handleCredentialsSignIn(email: string, password: string) {
    try {
        await signIn("credentials", { email, password, redirectTo: "/home" });
    } catch (error) {
        if (error instanceof AuthError) {
           switch (error.type) {
                case "CredentialsSignin":
                    return "Invalid credentials";
                default:
                     return "An error occurred";
              }
        }
        throw error;
    }
}

export async function handleSignOut() {
    await signOut();
}
