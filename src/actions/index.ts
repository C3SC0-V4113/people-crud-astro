import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { api } from "../lib/clients";

export const server = {
  registerUser: defineAction({
    accept: "form",
    input: z.object({
      name: z.string(),
      email: z.string().email(),
      password: z.string().min(6),
    }),
    handler: async ({ name, email, password }) => {
      try {
        const response = await api.post("/users/register", {
          name,
          email,
          password,
        });
        return { success: true, user: response.data };
      } catch (error) {
        console.error("Error en registerUser action:", error);
        return { success: false, message: "Error al registrar el usuario" };
      }
    },
  }),
};
