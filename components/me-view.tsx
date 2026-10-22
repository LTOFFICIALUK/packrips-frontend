"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageHead } from "@/components/ui";
import { getJson, type Pull } from "@/lib/api";
import { short, solscanTx, usd } from "@/lib/format";
import { useWallet } from "@/lib/wallet";

export const MeView = () => {
  const wallet = useWallet();
  const [pulls, setPulls] = useState<Pull[] | null>(null);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    if (!wallet.address) return;
    let stop = false;
    const load = async () => {
      try {
        const body = await getJson<{ pulls: Pull[] }>("/v1/pulls");
        if (stop) return;
        setPulls(body.pulls.filter((pull) => pull.winner === wallet.address));
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
  }, [wallet.address]);

  return (
    <div className="px-5 py-10 md:px-12">
      <div className="mx-auto max-w-[1200px]">
        <PageHead kicker="MY PULLS" title="Slabs drawn to this wallet.">
          {wallet.address ? short(wallet.address) : "Connect Phantom to see the slabs drawn to you."}
        </PageHead>
        {wallet.address ? (
          <button type="button" onClick={() => void wallet.disconnect()} className="mt-4 font-mono text-xs text-mute hover:text-paper">
            Disconnect
          </button>
        ) : (
          <button type="button" onClick={() => void wallet.connect().catch(() => undefined)} className="mt-6 rounded-full bg-rip px-5 py-3 font-display text-sm text-ink">
            Connect
          </button>
        )}
        {offline ? <p className="mt-8 text-mute">The server did not answer.</p> : null}
        {wallet.address && pulls && pulls.length === 0 ? <p className="mt-8 text-mute">No pulls on this wallet yet.</p> : null}
        {pulls && pulls.length > 0 ? (
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pulls.map((pull) => {
              const proof = pull.transferSignature || pull.openSignature || pull.paySignature;
              return (
                <li key={pull.id} className="rounded-[18px] border-[1.5px] border-line p-4">
                  <Link href={`/coin/${pull.mint}`} className="font-display text-xl text-rip">
                    ${pull.symbol}
                  </Link>
                  <p className="mt-2 font-display">{pull.grade}</p>
                  {pull.insuredUsd != null ? <p className="mt-1 font-mono text-sm text-rip">{usd(pull.insuredUsd)}</p> : null}
                  {proof ? (
                    <a href={solscanTx(proof)} className="mt-3 inline-block font-mono text-xs text-rip">
                      Solscan
                    </a>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </div>
  );
};
