"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface DrawerCtx {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const DrawerContext = createContext<DrawerCtx>({ isOpen: false, open: () => {}, close: () => {} });

export function DrawerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  return <DrawerContext.Provider value={{ isOpen, open, close }}>{children}</DrawerContext.Provider>;
}

export function useDrawer() {
  return useContext(DrawerContext);
}
