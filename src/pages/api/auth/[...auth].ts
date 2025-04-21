import { AstroAuth } from "auth-astro/server";
import config from "auth:config";

const handler = AstroAuth(config);

export const GET = handler.GET;
export const POST = handler.POST;
