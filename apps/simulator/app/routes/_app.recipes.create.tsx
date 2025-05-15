import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Scrape Wise Simulator" },
    { name: "description", content: "Welcome to the Scrape Wise Simulator!" },
  ];
};

export default function Index() {
  return (
    <div>
      <h1>Scrape Wise Simulator</h1>
    </div>
  );
}
