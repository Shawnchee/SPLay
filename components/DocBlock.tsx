"use client";

import { ExternalLink, BookOpen } from "lucide-react";

interface DocLink {
    label: string;
    href: string;
}

interface DocBlockProps {
    title: string;
    description: string;
    links: DocLink[];
}

export function DocBlock({ title, description, links }: DocBlockProps) {
    return (
        <div className="mt-12 p-6 bg-[#f4f7f9]/50 border border-dashed border-border rounded-[2rem] space-y-4">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                    <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h4 className="text-sm font-black text-foreground uppercase tracking-widest">{title}</h4>
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Educational Resources • Solana Docs</p>
                </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
                {description}
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
                {links.map((link, i) => (
                    <a
                        key={i}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-full text-[11px] font-bold text-slate-600 hover:text-primary hover:border-primary/30 transition-all shadow-sm group"
                    >
                        {link.label}
                        <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </a>
                ))}
            </div>
        </div>
    );
}
