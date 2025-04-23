import { HttpAdapter } from "@/lib/auth-adapter";
import Credentials from "@auth/core/providers/credentials";
import Google from "@auth/core/providers/google";
import Twitter from "@auth/core/providers/twitter";
import { defineConfig } from "auth-astro";

export default defineConfig({
  providers: [
    Google({
      clientId: import.meta.env.GOOGLE_CLIENT_ID,
      clientSecret: import.meta.env.GOOGLE_CLIENT_SECRET,
    }),
    Twitter({
      clientId: import.meta.env.AUTH_TWITTER_ID,
      clientSecret: import.meta.env.AUTH_TWITTER_SECRET,
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
    // maxAge: 60 * 60 * 24 * 30, // 30 días
    maxAge: 60 * 5, // 5 minutos
  },
  callbacks: {
    async session({ session, user }) {
      console.log("Callback - session:", session, user);
      return {
        ...session,
        user: {
          ...user,
        },
      };
    },
  },
  adapter: HttpAdapter(), // 👈 Tu nuevo adapter
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login", // Error code passed in query string as ?error=
    verifyRequest: "/verify-request", // (used for check email message)
  },
});
