import { createClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const returnTo = searchParams.get('returnTo') ?? '/'; // ✅ Default Homepage

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Callback Error:', error.message);
      return NextResponse.redirect(new URL('/?error=login_failed', origin));
    }

    // ✅ Login के बाद returnTo वाले URL (पते) पर Redirect (पुनर्निर्देशन) करें
    return NextResponse.redirect(new URL(returnTo, origin));
  }

  // ❌ अगर Code (कोड) नहीं है → Homepage (होमपेज)
  return NextResponse.redirect(new URL('/', origin));
}