import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText, Users, Activity } from 'lucide-react';
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

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Notes</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">128</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Edits Today</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">37</div>
            </CardContent>
          </Card>
        </div>

        <h3 className="text-xl font-semibold mb-4">Recent Notes</h3>
        <div className="space-y-4">
          {recentNotes.map((note) => (
            <Card key={note.id}>
              <CardHeader className="flex flex-row items-center">
                <div>
                  <CardTitle>{note.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">by {note.author}</p>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;