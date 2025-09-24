import type { APIRoute } from "astro";
import { decode } from "@auth/core/jwt";
import { api } from "@/lib/clients";

const NON_SECURE = "authjs.session-token";
const SECURE = "__Secure-authjs.session-token";

export const GET: APIRoute = async ({ cookies, url, redirect }) => {
  // Lectura del query param "to" para redirección post-login
  const to = url.searchParams.get("to") ?? "/dashboard";

  // Determina el nombre de la cookie según el esquema
  const isHttps = url.protocol === "https:";
  const name = isHttps ? SECURE : NON_SECURE;
  const altName = isHttps ? NON_SECURE : SECURE;

  // Lee la cookie que dejó el callback de Credentials (JWE)
  const cookieVal = cookies.get(name)?.value ?? cookies.get(altName)?.value;
  if (!cookieVal) return redirect("/login?error=NoSessionCookie");

  // Si YA es token corto (sin puntos), no hay nada que hacer
  if (!cookieVal.includes(".")) {
    return redirect(to);
  }

  // Decodifica el JWE para obtener userId
  try {
    const payload = await decode({
      token: cookieVal,
      secret: import.meta.env.AUTH_SECRET!,
      salt: "",
    });
    const userId = (payload?.sub as string) || "";
    if (!userId) return redirect("/login?error=NoSubInJWT");

    // Crea la fila de sesión en tu backend con un token corto nuevo
    const maxAge = 60 * 5; // segundos
    const sessionToken = crypto.randomUUID();
    const expires = new Date(Date.now() + maxAge * 1000);

    await api.post("/sessions", { sessionToken, userId, expires });

    // Reemplaza la cookie JWE por la de BD
    cookies.set(name, sessionToken, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: isHttps,
      maxAge,
    });

    // Limpia la versión alterna si existiera
    if (cookies.get(altName)) cookies.delete(altName, { path: "/" });

    return redirect(to);
  } catch (err) {
    console.error("Bridge error:", err);
    return redirect("/login?error=BridgeFailed");
  }
};
