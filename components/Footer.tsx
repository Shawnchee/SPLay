"use client";

import { Github, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-white py-8 mt-16">
      <div className="container mx-auto max-w-6xl px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <p className="text-sm font-semibold text-foreground">
              Developed by <span className="font-black text-primary">Shawn Chee</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Learn DeFi on Solana Devnet
            </p>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com/Shawnchee"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl border border-slate-200 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer flex items-center justify-center"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5 text-slate-600 hover:text-primary" />
            </a>
            <a
              href="https://www.linkedin.com/in/shawn-chee-b39384267/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl border border-slate-200 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer flex items-center justify-center"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-5 h-5 text-slate-600 hover:text-primary" />
            </a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-muted-foreground">
            © 2026 SPLay. Built to help developers understand DeFi concepts on Solana.
          </p>
        </div>
      </div>
    </footer>
  );
}
