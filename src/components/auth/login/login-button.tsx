import { Button } from "@/components/ui/button";
import { signIn } from "auth-astro/client";

export const LoginButton = () => {
  return <Button onClick={() => signIn("google")}>Login With Google</Button>;
};
