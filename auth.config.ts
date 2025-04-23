import { HttpAdapter } from "@/lib/auth-adapter";
import Credentials from "@auth/core/providers/credentials";
import Google from "@auth/core/providers/google";
import { defineConfig } from "auth-astro";

export default defineConfig({
  providers: [
    Google({
      clientId: import.meta.env.GOOGLE_CLIENT_ID,
      clientSecret: import.meta.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Puedes hacer validación contra tu backend:
        const response = await fetch(
          `${import.meta.env.API_BASE_URL}/auth/validate`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
          }
        );

        if (!response.ok) return null;

        const user = await response.json();
        return user; // { id, email, name, ... }
      },
    }),
  ],
  session: {
    strategy: "database",
    maxAge: 60 * 60 * 24 * 30, // 30 días
  },
  callbacks: {
    async session({ session, user, token }) {
      console.log("Callback - session:", session, user, token);
      return {
        ...session,
        user: {
          ...session.user,
          id: user?.id! || token?.sub!,
        },
      };
    },

    // async jwt({ token, user, account, profile, session }) {
    //   console.log("Callback - jwt:", token, user);

    //   // Guarda el user.id en el token para tenerlo luego en session
    //   if (user) {
    //     token.id = user.id;
    //   }

    //   return token;
    // },
  },
  adapter: HttpAdapter(), // 👈 Tu nuevo adapter
  cookies: {
    sessionToken: {
      name: "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: false,
      },
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login", // Error code passed in query string as ?error=
    verifyRequest: "/verify-request", // (used for check email message)
  },
});
