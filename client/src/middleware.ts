import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { auth } from "@/../auth";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Check if the path is for a specific note
  if (pathname.startsWith('/notes')) {
    const noteId = pathname.split('/')[2]

    // Special case for note 2: allow access without authentication
    if (noteId === '2') {
      return NextResponse.next()
    }

    // For all other notes, check authentication
    const session = await auth();
    if (!session) {
      // If there's no session, redirect to sign in
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }

    // Make a request to your backend to check if the user owns this note
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}notes/${noteId}/check`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.user?.id}`
      }
    })

    if (!response.ok) {
      return NextResponse.redirect(new URL('/home', request.url))
    }
  }

  if (pathname === '/home') {
    const session = await auth();
    if (!session) {
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/notes/:path*', '/home']
}