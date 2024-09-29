import { object, string } from "zod";

export const signInSchema = object({
  email: string({required_error: "Email is required"}).email(),
  password: string({required_error: "Password is required"}).min(8),
});