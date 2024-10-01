import React from 'react'
import { NoteDashboardV2 } from '@/components/note-dashboard';
import  Header  from '@/components/ui/header'
import { SessionWrapper } from '../SessionProvider';
import { auth } from '../../../auth';
import { redirect } from 'next/navigation';


export default async function Dashboard (){
  const session = await auth();
  if (!session) {
    redirect("/auth/signin");
    return null;
  }
  return (
    <SessionWrapper>
    <div className="min-h-screen flex flex-col bg-primary text-foreground">

    <Header />

      <main className="flex-grow container mx-auto py-6 px-4">
        <h2 className="text-3xl font-bold mb-6">Dashboard</h2>

        <NoteDashboardV2 />
      </main>
    </div>
    </SessionWrapper>

  );
};

