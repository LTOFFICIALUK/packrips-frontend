"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { short } from "@/lib/format";
import { useWallet } from "@/lib/wallet";

const links = [
  { href: "/packs", label: "Packs" },
  { href: "/vault", label: "Vault" },
  { href: "/records", label: "Records" },
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
      <nav className="flex flex-wrap items-center gap-x-3 gap-y-2 sm:gap-x-5" aria-label="Primary">
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
      window.setTimeout(() => setCopied(false), 1500);
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
        <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-3">
          <a href="https://x.com/packripsfun" target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-2 font-mono text-xs text-mute hover:text-paper" aria-label="Pack Rips on X">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden="true">
              <path
                fill="currentColor"
                d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z"
              />
            </svg>
            @packripsfun
          </a>
          {ca ? (
            <div className="flex min-w-0 items-center gap-2 whitespace-nowrap font-mono text-xs">
              <span className="text-rip">$RIPS</span>
              <a href={`https://solscan.io/token/${ca}`} target="_blank" rel="noreferrer" className="text-mute hover:text-paper">
                <span className="hidden sm:inline">{ca}</span>
                <span className="sm:hidden">{`${ca.slice(0, 4)}…${ca.slice(-4)}`}</span>
              </a>
              <button type="button" onClick={() => void handleCopy()} className="text-paper" aria-label="Copy the RIPS contract address">
                {copied ? "copied" : "[copy]"}
              </button>
            </div>
          ) : null}
        </div>
      </footer>
    </div>
  );
};
