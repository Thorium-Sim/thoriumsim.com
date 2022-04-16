import { User } from "@prisma/client";
import { createContext, ReactNode, useContext } from "react";

const UserContext = createContext<(User & { roles: string[] }) | null>(null);

export function UserProvider({
  user,
  children,
}: {
  user: (User & { roles: string[] }) | null;
  children: ReactNode;
}) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}
