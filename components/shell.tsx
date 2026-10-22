"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { short } from "@/lib/format";
import { useWallet } from "@/lib/wallet";

const links = [
  { href: "/packs", label: "Packs" },
  { href: "/vault", label: "Vault" },
  { href: "/launch", label: "Launch" },
];

export const TopNav = ({ tone }: { tone: "rip" | "dark" }) => {
  const pathname = usePathname();
  const { address, connect, connecting } = useWallet();
  const rip = tone === "rip";
  const mark = rip ? "/mark-black.svg" : "/mark-white.svg";

  const handleConnect = () => {
    void connect().catch(() => undefined);
  };

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-wrap items-center justify-between gap-x-4 gap-y-3">
      <Link href="/" className="flex items-center gap-2.5" aria-label="Pack Rips home">
        <img src={mark} alt="" className="h-8 w-8" />
        <span className={`font-display text-[22px] leading-none tracking-wide ${rip ? "text-ink" : "text-paper"}`}>PACKRIPS</span>
      </Link>
      <nav className="flex flex-wrap items-center gap-x-5 gap-y-2" aria-label="Primary">
        {links.map((link) => {
          const on = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={on ? "page" : undefined}
              className={`font-display text-sm tracking-wide ${
                rip ? "text-ink" : on ? "text-rip" : "text-paper hover:text-rip"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
        {address ? (
          <Link href="/me" className={`font-mono text-xs ${rip ? "text-ink" : "text-rip"}`} aria-label="My pulls">
            {short(address)}
          </Link>
        ) : (
          <button
            type="button"
            onClick={handleConnect}
            className={`font-display text-sm tracking-wide ${rip ? "text-ink" : "text-paper hover:text-rip"}`}
            aria-label="Connect Phantom"
          >
            {connecting ? "Connecting" : "Connect"}
          </button>
        )}
      </nav>
    </div>
  );
};

export const Shell = ({ ca, children }: { ca: string; children: ReactNode }) => {
  const pathname = usePathname();
  const [copied, setCopied] = useState(false);
  const home = pathname === "/";

  const handleCopy = async () => {
    if (!ca) return;
    try {
      await navigator.clipboard.writeText(ca);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-black text-paper">
      {home ? null : (
        <header className="border-b-[1.5px] border-line px-5 py-4 md:px-12">
          <TopNav tone="dark" />
        </header>
      )}
      <main className="flex-1">{children}</main>
      <footer className="mt-auto border-t-[1.5px] border-line px-5 py-4 md:px-12">
        <div className="mx-auto flex w-full max-w-[1200px] flex-wrap items-center justify-between gap-3">
          <a href="https://x.com/packripsfun" target="_blank" rel="noreferrer" className="font-mono text-xs text-mute hover:text-paper" aria-label="Pack Rips on X">
            X @packripsfun
          </a>
          {ca ? (
            <button type="button" onClick={() => void handleCopy()} className="max-w-full text-left font-mono text-xs" aria-label="Copy the RIPS contract address">
              <span className="text-rip">$RIPS</span> <span className="break-all text-mute">{ca}</span>
              {copied ? <span className="text-paper"> Copied</span> : null}
            </button>
          ) : null}
        </div>
      </footer>
    </div>
  );
};
