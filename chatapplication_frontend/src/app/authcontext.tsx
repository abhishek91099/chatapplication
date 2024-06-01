// authContext.tsx

import React, { createContext, useContext, useState } from 'react';

interface AuthContextType {
  auth: boolean;
  toggleAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC = ({ children }) => {
  const [auth, setAuth] = useState<boolean>(false);

  const toggleAuth = () => {
    setAuth((prevAuth) => !prevAuth);
  };

  return (
    <AuthContext.Provider value={{ auth, toggleAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
