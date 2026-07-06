import { createClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!, // ✅ यहाँ ! डाला है
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // ✅ यहाँ ! डाला है
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Callback Error:', error.message)
      return NextResponse.redirect(new URL('/?error=login_failed', origin))
    }

    return NextResponse.redirect(new URL(next, origin))
  }

  return NextResponse.redirect(new URL('/', origin))
}