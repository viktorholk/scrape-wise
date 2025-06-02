import { BrainCircuit } from 'lucide-react';

export default function Intro() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-8  m-4">
      <div className="p-6 bg-white dark:bg-slate-800 rounded-full shadow-2xl mb-8">
        <BrainCircuit 
          size={80} 
          className="text-blue-500 dark:text-blue-400"
          strokeWidth={1.5}
        />
      </div>
      
      <h1 className="text-4xl md:text-5xl font-bold mb-6 text-slate-800 dark:text-slate-100">
        Unlock Web Data with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-500 dark:from-blue-400 dark:to-sky-400">Scrape Wise</span>
      </h1>
      
      <p className="text-lg md:text-xl max-w-3xl mb-8 text-slate-600 dark:text-slate-300 leading-relaxed">
        Effortlessly extract insights, analyze content, and visualize information from any corner of the web. 
        Scrape Wise empowers you to turn raw data into actionable intelligence.
      </p>
    </div>
  );
}