import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface NavbarContextType {
  isNavbarOpen: boolean;
  toggleNavbar: () => void;
  setNavbarOpen: (open: boolean) => void;
}

const NavbarContext = createContext<NavbarContextType | undefined>(undefined);

interface NavbarProviderProps {
  children: ReactNode;
}

export const NavbarProvider: React.FC<NavbarProviderProps> = ({ children }) => {
  const [isNavbarOpen, setIsNavbarOpen] = useState(true); // Start with navbar open

  const toggleNavbar = () => {
    setIsNavbarOpen(!isNavbarOpen);
  };

  const setNavbarOpen = (open: boolean) => {
    setIsNavbarOpen(open);
  };

  return (
    <NavbarContext.Provider value={{
      isNavbarOpen,
      toggleNavbar,
      setNavbarOpen
    }}>
      {children}
    </NavbarContext.Provider>
  );
};

export const useNavbar = (): NavbarContextType => {
  const context = useContext(NavbarContext);
  if (context === undefined) {
    throw new Error('useNavbar must be used within a NavbarProvider');
  }
  return context;
};
