import { auth } from '@/../auth'
import { SessionProvider } from 'next-auth/react'

import { ReactNode } from 'react';

interface SessionWrapperProps {
  children: ReactNode;
}

export async function SessionWrapper({ children }: SessionWrapperProps) {
  const session = await auth()
  return (
    <SessionProvider session={session}>
      {children}
    </SessionProvider>
  )
}