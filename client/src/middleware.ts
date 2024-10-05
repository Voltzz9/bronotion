import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { auth } from "@/../auth";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Check if the path is for a specific note
  if (pathname.startsWith('/notes')) {
    const session = await auth();
    if (!session) {
      // If there's no token, deny access
      return NextResponse.redirect('https://localhost:3000/auth/signin');
    }
    const noteId = pathname.split('/')[2]
    console.log(noteId);
    // Make a request to your backend to check if the user owns this note
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}notes/${noteId}/check`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.user?.id}`
      }
    })

    if (!response.ok) {
      return NextResponse.redirect('https://localhost:3000/home');
    }
  }

  if (pathname === '/home') {
    const session = await auth();
    if (!session) {
      return NextResponse.redirect('https://localhost:3000/auth/signin');
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/notes/:path*', '/home']
}