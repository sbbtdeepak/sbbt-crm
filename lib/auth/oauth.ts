import { createClient } from "@/lib/supabase/client";

export function signInWithGoogle(returnTo: string) {
  const supabase = createClient();
  const redirectTo = `${window.location.origin}/auth/callback?returnTo=${encodeURIComponent(returnTo)}`;

  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
    },
  });
}
