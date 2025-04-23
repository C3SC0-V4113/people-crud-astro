import type { MiddlewareHandler } from "astro";
import { getSession } from "auth-astro/server";

export const onRequest: MiddlewareHandler = async (
  { request, redirect, url },
  next
) => {
  const session = await getSession(request);

  console.log("Middleware session:", session);

  const isDashboardRoute = url.pathname.startsWith("/dashboard");

  const isAuthRoute = ["/login", "/register"].includes(url.pathname);

  if (isDashboardRoute && !session) {
    return redirect("/login");
  }

  if (isAuthRoute && session) {
    return redirect("/dashboard");
  }

  //   locals.session = session; // Aquí locals está **tipado** si defines tipos

  return next(); // Continúa con la petición
};
