import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signIn } from "auth-astro/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const formSchema = z.object({
  email: z.string().min(2).max(50).email("Invalid email"),
  password: z.string().min(8).max(50),
});

export const CredentialsForm = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const [authError, setAuthError] = useState<string>();

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const authData = {
      ...data,
      redirect: true,
      callbackUrl: "/api/auth/bridge?to=/dashboard",
    };
    await signIn("credentials", {
      prefix: "/api/auth",
      ...authData,
    });
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");

    if (!error) return;
    console.error("Error de login:", error);
    setAuthError(error?.toString());
  }, []);

  useEffect(() => {
    if (!authError) return;
    toast.error(authError);
  }, [authError]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="email@people.com" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input placeholder="********" type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="w-full" type="submit">
          Log In with Email
        </Button>
      </form>
    </Form>
  );
};
