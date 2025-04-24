import { HttpAdapter } from "@/lib/auth-adapter";
import { api } from "@/lib/clients";
import Credentials from "@auth/core/providers/credentials";
import Google from "@auth/core/providers/google";
import Twitter from "@auth/core/providers/twitter";
import { defineConfig } from "auth-astro";

export interface LoginResponse {
  id: string;
  name: string;
  email: string;
  email_verified: null;
  image: null;
  phone: null;
  role: string;
  created_at: Date;
  updated_at: Date;
  password: string;
}

export default defineConfig({
  session: {
    strategy: "database",
    // maxAge: 60 * 60 * 24 * 30, // 30 días
    maxAge: 60 * 5, // 5 minutos
  },
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
        console.log(credentials);
        const response = await api.post<LoginResponse>(
          "/users/validate",
          credentials
        );

        if (response.status !== 200) return null;

        console.log(JSON.stringify(response.data));
        const user = await response.data;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image || null,
        }; // { id, email, name, ... }
      },
    }),
  ],

  callbacks: {
    // async jwt(params) {
    //   console.log("Callback - jwt:", params);
    //   return {};
    // },
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
  events: {
    async signIn({ user, account }) {
      console.log("Evento signIn user:", user);
      console.log("Evento signIn account:", account);
      if (account?.type !== "credentials") {
        console.warn("Account type no es credentials, es:", account?.type);
      }
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
