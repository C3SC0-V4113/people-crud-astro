import type { Adapter } from "@auth/core/adapters";
import { api } from "./clients";

export function HttpAdapter(): Adapter {
  return {
    // USERS -----------------------
    async createUser(user) {
      const response = await api.post("/users", user);
      console.log("Usuario creado:", response.data); // Asegúrate que hay id correcto
      console.log("Adapter - createUser - input:", user);
      console.log("Adapter - createUser - response:", response.data);
      return response.data;
    },

    async getUser(id) {
      console.log("Adapter - getUser - input:", id);
      const response = await api.get(`/users/${id}`);
      return response.data;
    },

    async getUserByEmail(email) {
      console.log("Adapter - getUserByEmail - input:", email);
      const response = await api.get(`/users/email/${email}`);
      return response.data;
    },

    async updateUser(user) {
      const response = await api.patch(`/users/${user.id}`, user);
      return response.data;
    },

    async deleteUser(id) {
      await api.delete(`/users/${id}`);
    },

    // ACCOUNTS -----------------------
    async linkAccount(account) {
      console.log("linkAccount", account);
      const response = await api.post("/accounts", account);
      return response.data;
    },

    async unlinkAccount({ provider, providerAccountId }) {
      await api.delete("/accounts", { data: { provider, providerAccountId } });
    },

    async getUserByAccount({ provider, providerAccountId }) {
      console.log("Adapter - getUserByAccount - input:", {
        provider,
        providerAccountId,
      });
      const response = await api.get("/accounts", {
        params: { provider, providerAccountId },
      });
      console.log("Adapter - getUserByAccount - response:", response.data);
      return response.data;
    },

    // SESSIONS -----------------------
    async createSession(session) {
      console.log("Adapter - createSession - input:", session);
      try {
        const response = await api.post("/sessions", {
          ...session,
          expires: new Date(session.expires), // Asegúrate que sea Date
        });
        console.log("Adapter - createSession - response:", response.data);

        return {
          userId: response.data.user_id,
          sessionToken: response.data.session_token,
          expires: new Date(response.data.expires),
        };
      } catch (error) {
        console.error("Error en createSession:", error);
        return {
          userId: null,
          sessionToken: null,
          expires: new Date(),
        };
      }
    },

    async getSessionAndUser(sessionToken) {
      console.log("Adapter - getSessionAndUser - token:", sessionToken);
      const response = await api.get(`/sessions/${sessionToken}`);
      if (!response.data) return null;

      const { session, user } = response.data;
      console.log("createSession - expires:", session.expires);

      return {
        session: {
          ...session,
          expires: new Date(session.expires),
        },
        user,
      };
    },

    async updateSession(session) {
      const response = await api.patch(`/sessions/${session.sessionToken}`, {
        ...session,
      });
      console.log("createSession - expires:", session.expires);

      return {
        ...response.data,
        expires: new Date(response.data.expires),
      };
    },

    async deleteSession(sessionToken) {
      await api.delete(`/sessions/${sessionToken}`);
    },

    // VERIFICATION TOKENS -----------------------
    async createVerificationToken(token) {
      const response = await api.post("/verification-tokens", token);
      return response.data;
    },

    async useVerificationToken({ identifier, token }) {
      const response = await api.post("/verification-tokens/use", {
        identifier,
        token,
      });
      return response.data;
    },
  };
}
