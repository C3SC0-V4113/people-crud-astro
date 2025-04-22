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
        console.log(credentials);
        if (credentials.email === "frankjose00@gmail.com") return null; // Invalid credentials

        return {
          id: "1",
          name: "John Doe",
          email: credentials?.email as string,
        };
      },
    }),
  ],
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log("Usuario Logueado", user);
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login", // Error code passed in query string as ?error=
    verifyRequest: "/verify-request", // (used for check email message)
  },
});
