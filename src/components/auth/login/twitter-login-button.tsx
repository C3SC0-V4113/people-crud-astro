import { Button } from "@/components/ui/button";
import { signIn } from "auth-astro/client";

export const TwitterLoginButton = () => {
  return <Button onClick={() => signIn("twitter")}>Login With Twitter</Button>;
};
