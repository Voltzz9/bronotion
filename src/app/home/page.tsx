import React from 'react'
import { NoteDashboardV2 } from '@/components/note-dashboard';
import  Header  from '@/components/ui/header'


const Dashboard = () => {
  const recentNotes = [
    { id: 1, title: "Project Brainstorm", author: "Alice", avatar: "/api/placeholder/32/32" },
    { id: 2, title: "Meeting Minutes", author: "Bob", avatar: "/api/placeholder/32/32" },
    { id: 3, title: "Product Roadmap", author: "Charlie", avatar: "/api/placeholder/32/32" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-primary text-foreground">

    <Header />

      <main className="flex-grow container mx-auto py-6 px-4">
        <h2 className="text-3xl font-bold mb-6">Dashboard</h2>

        <NoteDashboardV2 />
      </main>
    </div>
  );
};

export default Dashboard;