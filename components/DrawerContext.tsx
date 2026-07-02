"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

type DrawerTab = "connect" | "upgrade";

interface DrawerCtx {
  isOpen: boolean;
  tab: DrawerTab;
  open: () => void;
  openUpgrade: () => void;
  close: () => void;
  setTab: (tab: DrawerTab) => void;
}

const DrawerContext = createContext<DrawerCtx>({
  isOpen: false,
  tab: "connect",
  open: () => {},
  openUpgrade: () => {},
  close: () => {},
  setTab: () => {},
});

export function DrawerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<DrawerTab>("connect");
  const open = useCallback(() => { setTab("connect"); setIsOpen(true); }, []);
  const openUpgrade = useCallback(() => { setTab("upgrade"); setIsOpen(true); }, []);
  const close = useCallback(() => setIsOpen(false), []);
  return (
    <DrawerContext.Provider value={{ isOpen, tab, open, openUpgrade, close, setTab }}>
      {children}
    </DrawerContext.Provider>
  );
}

export function useDrawer() {
  return useContext(DrawerContext);
}
