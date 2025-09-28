import "dotenv/config";
import z from "zod/v4";

const envSchema = z.object({
  HA_URL: z.url(),
  HA_TOKEN: z.string().optional(),
  PORT: z.coerce.number().int().positive().default(3000)
});

export type Env = z.infer<typeof envSchema>;

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  const formattedErrors = JSON.stringify(z.treeifyError(parsed.error), null, 2);
  console.error("❌ Invalid environment variables:\n", formattedErrors);
  process.exit(1);
}

export const env: Env = parsed.data;
