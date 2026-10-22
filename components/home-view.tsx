"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HeroPack } from "@/components/pack-art";
import { TopNav } from "@/components/shell";
import { Zigzag } from "@/components/ui";
import { getJson, type Coin, type Pull, type Site } from "@/lib/api";
import { short, solscanAccount, solscanTx } from "@/lib/format";

const steps = [
  { n: "01", title: "LAUNCH A COIN", body: "Every coin launched here is a pack, paired with CARDS." },
  { n: "02", title: "FEES BUY SLABS", body: "Creator fees buy real graded cards into the vault. Each has a Solscan link." },
  { n: "03", title: "HOLDERS GET DRAWN", body: "The more you hold, the bigger your chance to pull the slab." },
];

const proofOf = (pull: Pull) => pull.transferSignature || pull.openSignature || pull.paySignature;

export const HomeView = () => {
  const [site, setSite] = useState<Site | null>(null);
  const [pulls, setPulls] = useState<Pull[] | null>(null);
  const [coins, setCoins] = useState<Coin[] | null>(null);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    let stop = false;
    const load = async () => {
      try {
        const [nextSite, nextPulls, nextCoins] = await Promise.all([
          getJson<Site>("/v1/site"),
          getJson<{ pulls: Pull[] }>("/v1/pulls"),
          getJson<{ coins: Coin[] }>("/v1/coins"),
        ]);
        if (stop) return;
        setSite(nextSite);
        setPulls(nextPulls.pulls);
        setCoins(nextCoins.coins);
        setOffline(false);
      } catch {
        if (!stop) setOffline(true);
      }
    };
    void load();
    const timer = window.setInterval(() => void load(), 15_000);
    return () => {
      stop = true;
      window.clearInterval(timer);
    };
  }, []);

  const live = pulls || [];

  return (
    <div>
      <section className="rip-tear">
        <div className="bg-rip px-5 pb-8 pt-5 text-ink md:px-12 md:pb-12 md:pt-6">
          <TopNav tone="rip" />
          <div className="mx-auto mt-8 grid max-w-[1200px] items-center gap-10 lg:mt-12 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <h1 className="font-display text-[52px] leading-[0.86] sm:text-[72px] lg:text-[92px]">
                RIP IT.
                <br />
                PULL IT.
              </h1>
              <p className="mt-6 max-w-[520px] text-lg leading-snug sm:text-xl">
                Every coin is a pack. Its fees buy real graded cards, and holders get drawn to pull them.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {site?.vault ? (
                  <a href={solscanAccount(site.vault)} target="_blank" rel="noreferrer" className="rounded-full bg-ink px-3.5 py-2 font-mono text-[11px] tracking-wide text-rip">
                    VAULT WALLET ↗
                  </a>
                ) : null}
                {site?.platform ? (
                  <a href={solscanAccount(site.platform)} target="_blank" rel="noreferrer" className="rounded-full bg-ink px-3.5 py-2 font-mono text-[11px] tracking-wide text-rip">
                    FEE ROUTE ↗
                  </a>
                ) : null}
                <Link href="/packs" className="rounded-full bg-ink px-3.5 py-2 font-mono text-[11px] tracking-wide text-rip">
                  PACKS LIVE ↗
                </Link>
              </div>
            </div>
            <div className="hero-pack-slot">
              <HeroPack ticker="$RIPS" subline="1 GRADED SLAB INSIDE" />
            </div>
          </div>
        </div>
        <Zigzag />
      </section>

      <section className="rise-in px-5 py-10 md:px-12 md:py-14">
        <div className="mx-auto grid max-w-[1200px] gap-4 md:grid-cols-3">
          {steps.map((step) => (
            <article key={step.n} className="rounded-[18px] border-[1.5px] border-line px-5 py-6">
              <p className="font-display text-xl text-rip">{step.n}</p>
              <h2 className="mt-4 font-display text-xl leading-tight text-paper">{step.title}</h2>
              <p className="mt-3 text-[15px] leading-snug text-mute">{step.body}</p>
            </article>
          ))}
        </div>

        <div className="mx-auto mt-4 max-w-[1200px] rounded-[18px] border-[1.5px] border-dashed border-line px-5 py-6 md:px-7">
          <p className="font-mono text-[11px] tracking-[0.16em] text-mute">LIVE PULLS</p>
          {offline ? <p className="mt-4 text-mute">The server did not answer.</p> : null}
          {!offline && live.length === 0 ? (
            <div className="mt-3 flex flex-wrap items-end justify-between gap-6">
              <div>
                <h2 className="font-display text-2xl text-paper md:text-[32px]">THE FIRST PULL LANDS HERE.</h2>
                <p className="mt-2 max-w-md text-mute">Every pull shows the holder, the slab and its Solscan proof.</p>
              </div>
              <Link href="/launch" className="rounded-full bg-rip px-5 py-3 font-display text-sm text-ink">
                LAUNCH THE FIRST PACK
              </Link>
            </div>
          ) : null}
          {live.length > 0 ? (
            <ul className="mt-4 grid gap-3">
              {live.slice(0, 8).map((pull) => {
                const proof = proofOf(pull);
                return (
                  <li key={pull.id} className="flex flex-wrap items-baseline justify-between gap-3 border-t border-line pt-3 first:border-t-0 first:pt-0">
                    <p className="font-display text-lg text-paper">
                      <Link href={`/coin/${pull.mint}`} className="text-rip">
                        ${pull.symbol}
                      </Link>{" "}
                      {pull.grade}
                    </p>
                    <p className="font-mono text-xs text-mute">
                      {pull.winner ? (
                        <a href={solscanAccount(pull.winner)} className="hover:text-paper">
                          {short(pull.winner)}
                        </a>
                      ) : (
                        "Winner pending"
                      )}
                      {proof ? (
                        <>
                          {" "}
                          <a href={solscanTx(proof)} className="text-rip hover:text-paper">
                            Solscan
                          </a>
                        </>
                      ) : null}
                    </p>
                  </li>
                );
              })}
            </ul>
          ) : null}
          {site?.seedWallet ? (
            <p className="mt-5 font-mono text-xs text-mute">
              Pack Rips launch wallet{" "}
              <a href={solscanAccount(site.seedWallet)} className="text-paper hover:text-rip">
                {short(site.seedWallet)}
              </a>
            </p>
          ) : null}
          {coins && coins.length > 0 && live.length === 0 ? (
            <p className="mt-4 font-mono text-xs text-mute">
              {coins.length} coin{coins.length === 1 ? "" : "s"} launched.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
};
