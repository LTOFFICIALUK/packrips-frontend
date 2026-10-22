"use client";

import { Transaction, VersionedTransaction } from "@solana/web3.js";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PageHead } from "@/components/ui";
import { getJson, type Coin, type Pull } from "@/lib/api";
import { countdown, short, solscanAccount, solscanToken, solscanTx, usd } from "@/lib/format";
import { useWallet } from "@/lib/wallet";

const bytes = (b64: string) => Uint8Array.from(atob(b64), (char) => char.charCodeAt(0));
const encode = (tx: Transaction | VersionedTransaction) => {
  const raw = tx instanceof VersionedTransaction ? tx.serialize() : tx.serialize();
  let binary = "";
  raw.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
};
const decode = (b64: string) => {
  const raw = bytes(b64);
  try {
    return Transaction.from(raw);
  } catch {
    return VersionedTransaction.deserialize(raw);
  }
};

const openForCash = (pull: Pull) => {
  if (!pull.openedAt || pull.choice) return false;
  return Date.now() - new Date(pull.openedAt).getTime() < 72 * 60 * 60 * 1000;
};

export const CoinView = ({ mint }: { mint: string }) => {
  const wallet = useWallet();
  const [coin, setCoin] = useState<Coin | null>(null);
  const [pulls, setPulls] = useState<Pull[]>([]);
  const [missing, setMissing] = useState(false);
  const [offline, setOffline] = useState(false);
  const [note, setNote] = useState("");

  const load = async () => {
    try {
      const body = await getJson<{ coin: Coin; pulls: Pull[] }>(`/v1/coins/${mint}`);
      setCoin(body.coin);
      setPulls(body.pulls);
      setMissing(false);
      setOffline(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (message.includes("not launched")) {
        setMissing(true);
        setOffline(false);
        return;
      }
      setOffline(true);
      setMissing(false);
    }
  };

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 15_000);
    return () => window.clearInterval(timer);
  }, [mint]);

  const handleKeep = async (pull: Pull) => {
    if (!wallet.address || !pull.nft) return;
    setNote("");
    try {
      const message = await getJson<{ message: string }>(`/v1/packs/${pull.id}/keep-message`);
      const signature = await wallet.signMessage(message.message);
      await getJson(`/v1/packs/${pull.id}/keep`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ wallet: wallet.address, signature }),
      });
      setNote("The card stays with you. Redeem the physical card on Collector Crypt.");
      await load();
    } catch (err) {
      setNote(err instanceof Error ? err.message : "Sign again to keep the card.");
    }
  };

  const handleCash = async (pull: Pull) => {
    if (!wallet.address) return;
    setNote("");
    try {
      const built = await getJson<{ transaction: string }>(`/v1/packs/${pull.id}/cashout`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ wallet: wallet.address }),
      });
      const [signed] = await wallet.signAll([decode(built.transaction)]);
      await getJson(`/v1/packs/${pull.id}/cashout/submit`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ wallet: wallet.address, signedTransaction: encode(signed) }),
      });
      setNote("Cash out is signed. USDC is on the way to your wallet.");
      await load();
    } catch (err) {
      setNote(err instanceof Error ? err.message : "Sign again to cash out.");
    }
  };

  if (offline) {
    return (
      <div className="px-5 py-16 md:px-12">
        <PageHead kicker="PACK" title="This coin did not load.">
          The server did not answer.
        </PageHead>
      </div>
    );
  }
  if (missing) {
    return (
      <div className="px-5 py-16 md:px-12">
        <PageHead kicker="PACK" title="This coin was not launched here.">
          Coins paired with CARDS show up with holders, slabs, and the next pack.
        </PageHead>
      </div>
    );
  }
  if (!coin) {
    return (
      <div className="px-5 py-16 md:px-12">
        <p className="text-mute">Loading this coin.</p>
      </div>
    );
  }

  return (
    <div className="px-5 py-10 md:px-12">
      <div className="mx-auto max-w-[1200px]">
        <p className="font-mono text-xs text-mute">
          <Link href="/packs" className="hover:text-rip">
            Packs
          </Link>
          {" / "}${coin.symbol}
        </p>
        <div className="mt-4">
          <PageHead kicker="PAIRED WITH CARDS" title={`$${coin.symbol}`}>
            {coin.description || coin.name}
          </PageHead>
          {coin.seed ? <p className="mt-3 font-mono text-[11px] tracking-wide text-rip">Launched by Pack Rips</p> : null}
          <p className="mt-4 flex flex-wrap gap-4 font-mono text-xs">
            <a href={solscanToken(coin.mint)} className="text-mute hover:text-rip">
              {coin.mint}
            </a>
            {coin.launchSignature ? (
              <a href={solscanTx(coin.launchSignature)} className="text-rip hover:text-paper">
                Launch
              </a>
            ) : null}
            {coin.websiteUrl ? (
              <a href={coin.websiteUrl} className="text-paper hover:text-rip" rel="noreferrer">
                Site
              </a>
            ) : null}
          </p>
          <dl className="mt-6 grid gap-3 font-mono text-sm sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[18px] border-[1.5px] border-line p-4">
              <dt className="text-[11px] tracking-wide text-mute">Holders</dt>
              <dd className="mt-2 text-xl">{coin.holders}</dd>
            </div>
            <div className="rounded-[18px] border-[1.5px] border-line p-4">
              <dt className="text-[11px] tracking-wide text-mute">Slabs</dt>
              <dd className="mt-2 text-xl">{coin.pulls}</dd>
            </div>
            <div className="rounded-[18px] border-[1.5px] border-line p-4">
              <dt className="text-[11px] tracking-wide text-mute">Vault</dt>
              <dd className="mt-2 text-xl text-rip">{usd(coin.vaultUsd)}</dd>
            </div>
            <div className="rounded-[18px] border-[1.5px] border-line p-4">
              <dt className="text-[11px] tracking-wide text-mute">Next pack</dt>
              <dd className="mt-2 text-xl text-rip">
                {coin.packPriceUsdc > 0 ? `${usd(coin.packBalanceUsdc)} / ${usd(coin.packPriceUsdc)}` : usd(coin.packBalanceUsdc)}
              </dd>
              <p className="mt-1 text-xs text-mute">{countdown(coin.etaMs) || "When fees cover a pack"}</p>
            </div>
          </dl>
        </div>
        <h2 className="mt-12 font-display text-xl text-rip">PULLS</h2>
        {pulls.length === 0 ? <p className="mt-4 text-mute">No slabs for this coin yet.</p> : null}
        {pulls.length > 0 ? (
          <ul className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pulls.map((pull) => {
              const mine = wallet.address && pull.winner === wallet.address && !pull.choice;
              return (
                <li key={pull.id} className="rounded-[18px] border-[1.5px] border-line p-4">
                  {pull.image ? (
                    <img src={pull.image} alt={pull.name || pull.grade} className="aspect-[3/4] w-full rounded-[14px] object-cover" />
                  ) : (
                    <div className="flex aspect-[3/4] items-center justify-center rounded-[14px] bg-ink font-display text-2xl text-rip">{pull.grade}</div>
                  )}
                  <p className="mt-3 font-display">{pull.grade}</p>
                  {pull.insuredUsd != null ? <p className="mt-1 font-mono text-sm text-rip">{usd(pull.insuredUsd)}</p> : null}
                  <p className="mt-2 font-mono text-xs text-mute">
                    {pull.winner ? (
                      <a href={solscanAccount(pull.winner)} className="hover:text-paper">
                        {short(pull.winner)}
                      </a>
                    ) : (
                      "Winner pending"
                    )}
                  </p>
                  <p className="mt-2 flex flex-wrap gap-3 font-mono text-xs">
                    {pull.paySignature ? (
                      <a href={solscanTx(pull.paySignature)} className="text-rip">
                        Buy
                      </a>
                    ) : null}
                    {pull.openSignature ? (
                      <a href={solscanTx(pull.openSignature)} className="text-rip">
                        Open
                      </a>
                    ) : null}
                    {pull.transferSignature ? (
                      <a href={solscanTx(pull.transferSignature)} className="text-rip">
                        Send
                      </a>
                    ) : null}
                  </p>
                  {mine ? (
                    <div className="mt-3 flex gap-2">
                      <button type="button" onClick={() => void handleKeep(pull)} className="rounded-full bg-rip px-3 py-2 font-display text-sm text-ink">
                        Keep
                      </button>
                      {openForCash(pull) ? (
                        <button type="button" onClick={() => void handleCash(pull)} className="rounded-full border-[1.5px] border-line px-3 py-2 font-display text-sm">
                          Cash out
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                  {pull.choice === "keep" ? <p className="mt-2 text-sm text-mute">Kept. Redeem the physical card on Collector Crypt.</p> : null}
                  {pull.choice === "cashout" ? <p className="mt-2 text-sm text-mute">Cashed out.</p> : null}
                </li>
              );
            })}
          </ul>
        ) : null}
        {note ? <p className="mt-4 text-sm">{note}</p> : null}
      </div>
    </div>
  );
};
