import type { MetaFunction } from "@remix-run/node";

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
   </div>
  );
}
