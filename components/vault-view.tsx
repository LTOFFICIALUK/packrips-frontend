"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageHead } from "@/components/ui";
import { getJson, type Pull } from "@/lib/api";
import { short, solscanAccount, solscanTx, usd } from "@/lib/format";

export const VaultView = () => {
  const [cards, setCards] = useState<Pull[] | null>(null);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    let stop = false;
    const load = async () => {
      try {
        const body = await getJson<{ cards: Pull[] }>("/v1/vault");
        if (stop) return;
        setCards(body.cards);
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
        <PageHead kicker="VAULT" title="Real cards only.">
          Every slab pulled for a coin launched here. Image, grade, insured value, and winner.
        </PageHead>
        {offline ? <p className="mt-8 text-mute">The server did not answer.</p> : null}
        {cards && cards.length === 0 ? (
          <div className="mt-8 rounded-[18px] border-[1.5px] border-dashed border-line px-5 py-6">
            <h2 className="font-display text-2xl">The first slab lands here.</h2>
            <p className="mt-2 text-mute">Every slab bought shows its image, grade, insured value and holder.</p>
          </div>
        ) : null}
        {cards && cards.length > 0 ? (
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => {
              const proof = card.transferSignature || card.openSignature || card.paySignature;
              return (
                <li key={card.id} className="rounded-[18px] border-[1.5px] border-line p-4">
                  <Link href={`/coin/${card.mint}`} className="block" aria-label={`$${card.symbol} ${card.grade}`}>
                    {card.image ? (
                      <img src={card.image} alt={card.name || card.grade} className="aspect-[3/4] w-full rounded-[14px] object-cover" />
                    ) : (
                      <div className="flex aspect-[3/4] items-center justify-center rounded-[14px] border-[1.5px] border-rip bg-ink font-display text-2xl text-rip">
                        {card.grade}
                      </div>
                    )}
                  </Link>
                  <p className="mt-3 font-display text-lg">
                    <span className="text-rip">${card.symbol}</span> {card.grade}
                  </p>
                  {card.insuredUsd != null ? <p className="mt-1 font-mono text-sm text-rip">{usd(card.insuredUsd)}</p> : null}
                  <p className="mt-2 font-mono text-xs text-mute">
                    {card.winner ? (
                      <a href={solscanAccount(card.winner)} className="hover:text-paper">
                        {short(card.winner)}
                      </a>
                    ) : (
                      "Winner pending"
                    )}
                    {proof ? (
                      <>
                        {" · "}
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
      </div>
    </div>
  );
};
