import { createClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

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

    // ✅ Login के बाद कहाँ जाना है?
    // अगर /quote से आया था, तो वहीं वापस भेजें
    const returnTo = searchParams.get('returnTo') ?? '/';
    return NextResponse.redirect(new URL(returnTo, origin));
  }

  return NextResponse.redirect(new URL('/', origin));
}