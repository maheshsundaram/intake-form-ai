"use client";

import Link from "next/link";
import { ClipboardList, Camera } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300">
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col items-center">
        <div className="mb-8 bg-blue-600 text-white p-6 rounded-full shadow-lg">
          <svg width="64" height="64" viewBox="0 0 100 100" className="w-16 h-16">
            <rect x="30" y="25" width="40" height="50" rx="3" fill="white" />
            <line x1="38" y1="35" x2="62" y2="35" stroke="#2563eb" strokeWidth="3" />
            <line x1="38" y1="45" x2="62" y2="45" stroke="#2563eb" strokeWidth="3" />
            <line x1="38" y1="55" x2="62" y2="55" stroke="#2563eb" strokeWidth="3" />
            <line x1="38" y1="65" x2="52" y2="65" stroke="#2563eb" strokeWidth="3" />
            <path d="M75 15 L83 32 L100 35 L83 38 L75 55 L67 38 L50 35 L67 32 Z" fill="#fbbf24" stroke="#2563eb" strokeWidth="1" />
          </svg>
        </div>
        
        <h1 className="text-4xl font-bold mb-2 text-blue-800">Intake Form AI</h1>
        <p className="text-gray-600 mb-8 text-center max-w-md"></p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg">
          <Link 
            href="/forms" 
            className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-6 rounded-md text-center hover:bg-blue-700 transition-colors cursor-pointer shadow-md flex-1"
          >
            <ClipboardList className="h-5 w-5" />
            <span>View Forms</span>
          </Link>
          <Link 
            href="/snap" 
            className="flex items-center justify-center gap-2 bg-green-600 text-white py-3 px-6 rounded-md text-center hover:bg-green-700 transition-colors cursor-pointer shadow-md flex-1"
          >
            <Camera className="h-5 w-5" />
            <span>Take a Picture</span>
          </Link>
        </div>
      </div>
      
      <style jsx>{`
        .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>
    </div>
  );
}
