import { HttpAdapter } from "@/lib/auth-adapter";
import { api } from "@/lib/clients";
import Credentials from "@auth/core/providers/credentials";
import Google from "@auth/core/providers/google";
import Twitter from "@auth/core/providers/twitter";
import { CredentialsSignin } from "@auth/core/errors";
import { defineConfig } from "auth-astro";
import { encode } from "@auth/core/jwt";

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

const SESSION_MAX_AGE = 60 * 5; // 5 minutos

export default defineConfig({
  trustHost: true,
  session: {
    strategy: "database",
    maxAge: SESSION_MAX_AGE,
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

        if (response.status !== 200 || !response.data.id)
          throw new CredentialsSignin("Invalid login");

        console.log(JSON.stringify(response.data));
        const user = await response.data;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image || null,
        };
      },
    }),
  ],
  jwt: {
    async encode(params) {
      // deja que Auth.js genere el token (JWE/JWT)
      const tokenStr = await encode(params);

      // Solo nos interesa cuando está generando la cookie de sesión
      // (el "salt" coincide con el nombre de cookie de sesión).
      const salt = params.salt;
      const isSessionCookie =
        salt === "authjs.session-token" ||
        salt === "__Secure-authjs.session-token";

      const userId = params?.token?.sub as string | undefined;

      if (isSessionCookie && userId) {
        try {
          const maxAge = params.maxAge ?? SESSION_MAX_AGE;
          const expires = new Date(Date.now() + maxAge * 1000);

          // Crear la sesión en tu backend usando el JWE como session_token
          await api.post("/sessions", {
            sessionToken: tokenStr,
            userId,
            expires,
          });
        } catch (err: any) {
          // Evita romper el login si hay duplicados u otros errores.
          console.warn("jwt.encode bridge: createSession falló:", err?.message);
        }
      }

      // Devuelve el token para que Auth.js lo ponga en la cookie
      return tokenStr;
    },
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
  events: {
    async signIn({ user, account }) {
      console.log("Evento signIn user:", user);
      console.log("Evento signIn account:", account);
      if (account?.type !== "credentials") {
        console.warn("Account type no es credentials, es:", account?.type);
      }
    },
  },
  adapter: HttpAdapter(),
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login", // Error code passed in query string as ?error=
    verifyRequest: "/verify-request", // (used for check email message)
  },
});
