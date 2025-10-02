import type { User } from "firebase/auth";
import { createContext, type ReactNode } from "react";

export interface AuthContextType {
  user: User | null;
  handleSignIn: (email: string, password: string) => Promise<void>;
  handleSignUp: (email: string, password: string) => Promise<void>;
  handleSignOut: () => Promise<void>;
  loading: boolean;
}


export interface AuthProviderProps {
    children : ReactNode;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);