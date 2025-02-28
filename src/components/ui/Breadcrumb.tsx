"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  children?: React.ReactNode;
}

export function Breadcrumb({ items, children }: BreadcrumbProps) {
  return (
    <nav className="flex items-center justify-between sticky top-0 z-10 bg-blue-100 p-2 mb-4 h-12">
      <div className="flex items-center space-x-1 text-sm">
      <Link 
        href="/" 
        className="flex items-center text-gray-500 hover:text-blue-600"
      >
        <Home className="h-4 w-4 mr-1" />
        <span>Home</span>
      </Link>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />
          <Link
            href={item.href}
            className={`hover:text-blue-600 ${
              index === items.length - 1 
                ? "font-medium text-gray-900" 
                : "text-gray-500"
            }`}
          >
            {item.label}
          </Link>
        </div>
      ))}
      </div>
      {children && <div>{children}</div>}
    </nav>
  );
}
