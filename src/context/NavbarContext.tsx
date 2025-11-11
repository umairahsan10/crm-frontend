import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface NavbarContextType {
  isNavbarOpen: boolean;
  isNavbarExpanded: boolean;
  toggleNavbar: () => void;
  setNavbarOpen: (open: boolean) => void;
  setNavbarExpanded: (expanded: boolean) => void;
}

const NavbarContext = createContext<NavbarContextType | undefined>(undefined);

interface NavbarProviderProps {
  children: ReactNode;
}

export const NavbarProvider: React.FC<NavbarProviderProps> = ({ children }) => {
  const [isNavbarOpen, setIsNavbarOpen] = useState(false); // Start with navbar collapsed
  const [isNavbarExpanded, setIsNavbarExpanded] = useState(false); // Track if navbar is expanded (hover or manual)

  const toggleNavbar = () => {
    setIsNavbarOpen(!isNavbarOpen);
  };

  const setNavbarOpen = (open: boolean) => {
    setIsNavbarOpen(open);
  };

  const setNavbarExpanded = (expanded: boolean) => {
    setIsNavbarExpanded(expanded);
  };

  return (
    <NavbarContext.Provider value={{
      isNavbarOpen,
      isNavbarExpanded,
      toggleNavbar,
      setNavbarOpen,
      setNavbarExpanded
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
