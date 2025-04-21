import { Button } from "@/components/ui/button";
import { signOut } from "auth-astro/client";

export const LogoutButton = () => {
  return (
    <Button variant={"outline"} onClick={() => signOut()}>
      Logout
    </Button>
  );
};
