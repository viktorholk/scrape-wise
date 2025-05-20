import { UserProvider } from "@/UserContext";
import { Outlet } from "react-router-dom";

export default function RootLayout() {
  return (
    <UserProvider>
      <Outlet />
    </UserProvider>
  );
}
