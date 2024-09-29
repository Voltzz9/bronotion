'use client';
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ErrorMessage from "@/components/ui/error-message";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signInSchema } from "@/lib/zod";
import LoadingButton from "@/components/ui/loading-button";
import { handleCredentialsSignIn } from "@/app/actions/authActions";

export default function LoginPage() {
    const [globalError, setGlobalError] = useState<string>("");
    const form = useForm<z.infer<typeof signInSchema>>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof signInSchema>) => {
        try {
            const result = await handleCredentialsSignIn(values.email, values.password);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="text-center p-6">
                    <h2 className="text-2xl font-bold">Login</h2>
                    <p className="text-gray-500">Welcome back! Please login to your account</p>
                </CardHeader>

                <CardContent className="space-y-4 p-6">
                    {globalError && <ErrorMessage message={globalError} />}
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
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
                                                {...field} />
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
                                                {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            <LoadingButton pending={form.formState.isSubmitting}/>
                        </form>
                    </Form>
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
