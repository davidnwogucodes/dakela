/** Env lookup shared by the browser and server Supabase clients. */

export function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      name +
        " is not set. Copy .env.example to .env.local and fill it in, and set the " +
        "same variables in the Vercel dashboard for deployed builds.",
    );
  }
  return value;
}
