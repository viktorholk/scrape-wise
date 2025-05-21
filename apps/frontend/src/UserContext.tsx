import React, { createContext, useContext, useState, useEffect } from "react";

// Helper to get cookie by name
function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

// Helper to decode JWT payload
function parseJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

type User = {
  firstname: string;
  lastname: string;
  email: string;
} | null;

type UserContextType = {
  user: User;
  setUser: (user: User) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);

  // Decode token and set user on mount and when cookies change
  useEffect(() => {
    const updateUserFromToken = () => {
      const token = getCookie("token");
      if (token) {
        const payload = parseJwt(token);
        if (payload && payload.email) {
          setUser({
            firstname: payload.firstname,
            lastname: payload.lastname,
            email: payload.email,
          });
          return;
        }
      }
      setUser(null);
    };

    updateUserFromToken();

    // Listen for cookie changes (e.g., login/logout in another tab)
    const interval = setInterval(updateUserFromToken, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
}