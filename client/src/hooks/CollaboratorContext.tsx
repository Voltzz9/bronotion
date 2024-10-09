import React, { createContext, useContext, useState } from 'react';

interface User {
  id: string;
  name: string;
}

interface CollaboratorContextType {
  connectedUsers: User[];
  setConnectedUsers: (users: User[]) => void;
}

const CollaboratorContext = createContext<CollaboratorContextType | undefined>(undefined);

export const CollaboratorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connectedUsers, setConnectedUsers] = useState<User[]>([]);

  return (
    <CollaboratorContext.Provider value={{ connectedUsers, setConnectedUsers }}>
      {children}
    </CollaboratorContext.Provider>
  );
};

export const useCollaborator = () => {
  const context = useContext(CollaboratorContext);
  if (!context) {
    throw new Error('useCollaborator must be used within a CollaboratorProvider');
  }
  return context;
};