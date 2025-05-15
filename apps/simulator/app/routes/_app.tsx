import { Outlet } from "@remix-run/react";


export default function Index() {
  return (
    <div className="h-screen w-full bg-gradient-to-br from-sky-100 to-blue-50 text-slate-800">
      <Outlet />
    </div>
  );
}
