"use client";

import { Keypair, Transaction, VersionedTransaction } from "@solana/web3.js";
import bs58 from "bs58";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Field, fieldClass } from "@/components/ui";
import { getJson } from "@/lib/api";
import { useWallet } from "@/lib/wallet";

const bytes = (b64: string) => Uint8Array.from(atob(b64), (char) => char.charCodeAt(0));

const decode = (b64: string) => {
  const raw = bytes(b64);
  try {
    return Transaction.from(raw);
  } catch {
    return VersionedTransaction.deserialize(raw);
  }
};

const encode = (tx: Transaction | VersionedTransaction) => {
  const raw = tx instanceof VersionedTransaction ? tx.serialize() : tx.serialize({ requireAllSignatures: false, verifySignatures: false });
  let binary = "";
  raw.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
};

export const LaunchForm = () => {
  const wallet = useWallet();
  const router = useRouter();
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [description, setDescription] = useState("");
  const [xUrl, setXUrl] = useState("");
  const [website, setWebsite] = useState("");
  const [devBuy, setDevBuy] = useState("");
  const [vanity, setVanity] = useState("");
  const [image, setImage] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const ticker = symbol.trim().toUpperCase();

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  const handleLaunch = async () => {
    setNote("");
    if (!wallet.address) {
      await wallet.connect();
    }
    const address = wallet.address || window.localStorage.getItem("packrips.wallet");
    if (!address) throw new Error("Connect Phantom to launch.");
    setBusy(true);
    try {
      const built = await getJson<{ launchId: string; mint: string; mintSecret: string; transactions: { kind: string; tx: string }[] }>("/v1/launch/build", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          wallet: address,
          name,
          symbol,
          description,
          xUrl,
          website,
          image,
          devBuySol: devBuy ? Number(devBuy) : 0,
          vanity,
        }),
      });
      const mintKey = Keypair.fromSecretKey(bs58.decode(built.mintSecret));
      const signed: string[] = [];
      for (const item of built.transactions) {
        setNote(item.kind === "swap" ? "Confirm the CARDS swap in Phantom." : "Confirm the coin create in Phantom.");
        const tx = decode(item.tx);
        if (item.kind === "create" && tx instanceof Transaction) tx.partialSign(mintKey);
        const [one] = await wallet.signAll([tx]);
        signed.push(encode(one));
      }
      setNote("Sending the coin.");
      const sent = await getJson<{ mint: string; buy: string | null }>("/v1/launch/submit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ launchId: built.launchId, transactions: signed }),
      });
      if (sent.buy) {
        setNote("Confirm the dev buy in Phantom.");
        const [buySigned] = await wallet.signAll([decode(sent.buy)]);
        await getJson("/v1/launch/buy", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ launchId: built.launchId, transaction: encode(buySigned) }),
        });
      }
      router.push(`/coin/${sent.mint}`);
    } catch (err) {
      setNote(err instanceof Error ? err.message : "Launch needs another try.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="px-5 py-10 md:px-12">
      <div className="mx-auto grid max-w-[1200px] items-start gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div>
          <p className="font-mono text-[11px] tracking-[0.16em] text-rip">PAIRED WITH CARDS</p>
          <h1 className="mt-3 font-display text-4xl leading-none md:text-5xl">Launch a coin</h1>
          <p className="mt-4 max-w-md text-lg leading-snug text-mute">
            Each coin gets its own creator wallet, so its fees stay separate. 90 percent buys slabs for that coin&apos;s holders. 10 percent goes to the platform.
          </p>
          <div className="mt-8 rounded-[18px] border-[1.5px] border-line bg-ink px-5 py-8 text-center">
            {image ? <img src={image} alt={name || "Coin image"} className="mx-auto mb-4 h-28 w-28 rounded-[14px] object-cover" /> : null}
            <p className="font-display text-4xl text-rip">{ticker ? `$${ticker}` : "YOUR COIN"}</p>
            <p className="mt-2 font-mono text-[11px] tracking-[0.16em] text-rip">LAUNCH IT AS A PACK</p>
          </div>
        </div>
        <form
          className="grid gap-5 rounded-[18px] border-[1.5px] border-line p-5 md:p-6"
          onSubmit={(event) => {
            event.preventDefault();
            void handleLaunch().catch((err) => setNote(err instanceof Error ? err.message : "Launch needs another try."));
          }}
        >
          <Field label="Name">
            <input value={name} onChange={(event) => setName(event.target.value)} maxLength={32} required className={fieldClass} />
          </Field>
          <Field label="Ticker">
            <input value={symbol} onChange={(event) => setSymbol(event.target.value.toUpperCase())} maxLength={13} required className={`${fieldClass} font-mono`} />
          </Field>
          <Field label="Image">
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              required
              onChange={(event) => handleFile(event.target.files?.[0])}
              className="text-sm text-mute file:mr-3 file:rounded-full file:border-0 file:bg-rip file:px-3 file:py-2 file:font-display file:text-ink"
            />
          </Field>
          <Field label="Description">
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} maxLength={500} rows={4} className={fieldClass} />
          </Field>
          <Field label="X link">
            <input value={xUrl} onChange={(event) => setXUrl(event.target.value)} placeholder="https://x.com/" inputMode="url" className={fieldClass} />
          </Field>
          <Field label="Website" hint="Optional. This address is written into the coin metadata.">
            <input value={website} onChange={(event) => setWebsite(event.target.value)} placeholder="https://" inputMode="url" className={fieldClass} />
          </Field>
          <Field label="Dev buy in SOL" hint="Optional. SOL swaps to CARDS, then buys the coin. Extra CARDS stays in your wallet.">
            <input value={devBuy} onChange={(event) => setDevBuy(event.target.value)} inputMode="decimal" placeholder="0" className={`${fieldClass} font-mono`} />
          </Field>
          <Field label="Vanity suffix" hint="Optional. One or two characters at the end of the mint.">
            <input
              value={vanity}
              onChange={(event) => setVanity(event.target.value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 2))}
              className={`${fieldClass} font-mono`}
            />
          </Field>
          <button type="submit" disabled={busy} className="rounded-full bg-rip px-5 py-3.5 font-display text-sm text-ink disabled:opacity-60">
            {busy ? "Building the pack" : wallet.address ? "Sign and launch" : "Connect and launch"}
          </button>
          {note ? <p className="text-sm text-paper">{note}</p> : null}
        </form>
      </div>
    </div>
  );
};
