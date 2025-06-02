import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "Scrape Wise Simulator" },
    { name: "description", content: "Welcome to the Scrape Wise Simulator!" },
  ];
};

export default function Index() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gradient-to-br from-sky-100 to-blue-50 text-slate-800">
        <h1 className="mb-4 text-6xl font-bold tracking-tight">
          Scrape Wise Simulator
        </h1>
        <Link to="/recipes" className="mt-4 px-4 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition-colors">
          View Recipes
        </Link>
   </div>
  );
}
