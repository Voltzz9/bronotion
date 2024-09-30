"use server";
import { signIn, signOut } from "@/../../auth";

export async function handleGithubSignIn() {
  await signIn("github", {redirectTo: "/home"});
}

export async function handleGoogleSignIn() {
  await signIn("google", {redirectTo: "/home"});
}

export async function handleSignOut() {
  await signOut({redirectTo: "/"});
}