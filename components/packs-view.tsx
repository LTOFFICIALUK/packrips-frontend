"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageHead } from "@/components/ui";
import { getJson, type Coin, type Site } from "@/lib/api";
import { countdown, short, solscanAccount, solscanToken, usd } from "@/lib/format";

export const PacksView = () => {
  const [coins, setCoins] = useState<Coin[] | null>(null);
  const [site, setSite] = useState<Site | null>(null);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    let stop = false;
    const load = async () => {
      try {
        const [nextCoins, nextSite] = await Promise.all([getJson<{ coins: Coin[] }>("/v1/coins"), getJson<Site>("/v1/site")]);
        if (stop) return;
        setCoins(nextCoins.coins);
        setSite(nextSite);
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

  return (
    <div className="px-5 py-10 md:px-12">
      <div className="mx-auto max-w-[1200px]">
        <PageHead kicker="PACKS" title="Every coin is a pack.">
          Coins launched on Pack Rips. Holders, slabs, and the fee balance are read from the server.
        </PageHead>
        {site?.seedWallet ? (
          <p className="mt-4 font-mono text-xs text-mute">
            Pack Rips launch wallet{" "}
            <a href={solscanAccount(site.seedWallet)} className="text-paper hover:text-rip">
              {site.seedWallet}
            </a>
          </p>
        ) : null}
        {offline ? <p className="mt-8 text-mute">The server did not answer.</p> : null}
        {coins && coins.length === 0 ? (
          <div className="mt-8 rounded-[18px] border-[1.5px] border-dashed border-line px-5 py-6">
            <h2 className="font-display text-2xl">The first pack has not launched.</h2>
            <Link href="/launch" className="mt-5 inline-block rounded-full bg-rip px-5 py-3 font-display text-sm text-ink">
              LAUNCH THE FIRST PACK
            </Link>
          </div>
        ) : null}
        {coins && coins.length > 0 ? (
          <ul className="mt-8 grid gap-4">
            {coins.map((coin) => (
              <li key={coin.mint} className="rounded-[18px] border-[1.5px] border-line px-5 py-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <Link href={`/coin/${coin.mint}`} className="font-display text-2xl text-paper hover:text-rip">
                      ${coin.symbol}
                    </Link>
                    <p className="mt-1 text-mute">{coin.name}</p>
                    {coin.seed ? <p className="mt-2 font-mono text-[11px] tracking-wide text-rip">Launched by Pack Rips</p> : null}
                    <p className="mt-2 font-mono text-xs text-mute">
                      <a href={solscanToken(coin.mint)} className="hover:text-paper">
                        {short(coin.mint)}
                      </a>
                    </p>
                  </div>
                  <dl className="grid grid-cols-2 gap-x-6 gap-y-2 font-mono text-xs sm:grid-cols-4">
                    <div>
                      <dt className="text-mute">Holders</dt>
                      <dd>{coin.holders}</dd>
                    </div>
                    <div>
                      <dt className="text-mute">Slabs</dt>
                      <dd>{coin.pulls}</dd>
                    </div>
                    <div>
                      <dt className="text-mute">Vault</dt>
                      <dd className="text-rip">{usd(coin.vaultUsd)}</dd>
                    </div>
                    <div>
                      <dt className="text-mute">Fees</dt>
                      <dd className="text-rip">
                        {coin.packPriceUsdc > 0 ? `${usd(coin.packBalanceUsdc)} / ${usd(coin.packPriceUsdc)}` : usd(coin.packBalanceUsdc)}
                        <span className="mt-1 block text-mute">{countdown(coin.etaMs) || "When fees cover a pack"}</span>
                      </dd>
                    </div>
                  </dl>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
};
