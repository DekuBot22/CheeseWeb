import { z } from "zod";

export const loginSchema = z.object({ password: z.unknown() });
