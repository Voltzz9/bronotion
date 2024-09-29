'use client';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signInSchema } from "@/lib/zod";
import LoadingButton from "@/components/ui/loading-button";


export default function LoginPage() {
    const form = useForm<z.infer<typeof signInSchema>>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            email: "",
            password: "",
            },
        });
  return (

    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center p-6">
          <h2 className="text-2xl font-bold">Login</h2>
          <p className="text-gray-500">Welcome back! Please login to your account</p>
        </CardHeader>

        <CardContent className="space-y-4 p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => console.log(data))}>
            <FormField
             name="email" 
             control={form.control}
             render={({ field }) => (
                <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                <Input 
                type="email"
                placeholder="Email"
                {...field}/>
                </FormControl>
                <FormMessage />
                </FormItem>
            )} />
            <FormField 
            name="password" 
            control={form.control}
            render={({ field }) => (
                <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                <Input 
                type="password"
                placeholder="Password"
                {...field}/>
                </FormControl>
                <FormMessage />
                </FormItem>
            )} />
          </form>
        </Form>

          <LoadingButton pending={form.formState.isSubmitting} />
        </CardContent>

        <CardFooter className="p-6 text-center">
          <p className="text-sm text-gray-500">
            Don’t have an account? <a href="#" className="text-blue-600 hover:underline">Sign up</a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
