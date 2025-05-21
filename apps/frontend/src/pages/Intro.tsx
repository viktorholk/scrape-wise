import React from "react";

export default function Intro() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
      <h1 className="text-3xl font-bold mb-4">Welcome to Scrape Wise!</h1>
      <p className="text-lg max-w-2xl mb-6">
        Scrape Wise helps you extract, analyze, and visualize data from any website. 
        Use the navigation to start a new analysis, view your jobs, or manage your settings.
      </p>
      <p className="text-md text-muted-foreground">
        Get started by selecting <b>Analysere</b> or <b>Jobs</b> from the sidebar.
      </p>
    </div>
  );
}