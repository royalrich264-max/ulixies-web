'use client';

import './globals.css';
import { useState } from 'react';
import { ThemeProvider } from '../components/ThemeContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import CommandPalette from '../components/CommandPalette';

export default function RootLayout({ children }) {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  return (
    <html lang="en" className="light">
      <head>
        <title>ULIXIES Admin Tower | Enterprise Monorepo OS</title>
        <meta name="description" content="Nike-Level Enterprise Ecommerce Operating System" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#F8F9FA] text-[#111111] h-screen overflow-hidden flex antialiased font-sans">
        <ThemeProvider>
          <Sidebar />
          <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0 bg-[#F8F9FA]">
            <Header onOpenCommandPalette={() => setCommandPaletteOpen(true)} />
            <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-[#F8F9FA]">
              {children}
            </main>
          </div>
          <CommandPalette 
            isOpen={commandPaletteOpen} 
            onClose={() => setCommandPaletteOpen(false)} 
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
