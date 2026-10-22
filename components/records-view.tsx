"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageHead } from "@/components/ui";
import { getJson, type RecordRow } from "@/lib/api";
import { short, solscanAccount, solscanTx } from "@/lib/format";

const LinkIf = ({ href, label }: { href: string | null; label: string }) => {
  if (!href) return null;
  return (
    <a href={solscanTx(href)} className="text-rip hover:text-paper">
      {label}
    </a>
  );
};

export const RecordsView = () => {
  const [records, setRecords] = useState<RecordRow[] | null>(null);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    let stop = false;
    const load = async () => {
      try {
        const body = await getJson<{ records: RecordRow[] }>("/v1/records");
        if (stop) return;
        setRecords(body.records);
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
        <PageHead kicker="RECORDS" title="Public draws.">
          Every pack. Memo, roll, seed, snapshot, and winner, so the draw can be checked.
        </PageHead>
        {offline ? <p className="mt-8 text-mute">The server did not answer.</p> : null}
        {records && records.length === 0 ? (
          <div className="mt-8 rounded-[18px] border-[1.5px] border-dashed border-line px-5 py-6">
            <h2 className="font-display text-2xl">No draws yet.</h2>
            <p className="mt-2 text-mute">Memo, roll, seed, and winner show up here after a pack is bought.</p>
          </div>
        ) : null}
        {records && records.length > 0 ? (
          <ul className="mt-8 grid gap-4">
            {records.map((record) => (
              <li key={record.id} id={record.memo} className="rounded-[18px] border-[1.5px] border-line px-5 py-5">
                <p className="font-display text-xl">
                  <Link href={`/coin/${record.mint}`} className="text-rip">
                    ${record.symbol}
                  </Link>{" "}
                  <span className="text-paper">{record.grade || record.status}</span>
                </p>
                <p className="mt-2 font-mono text-xs text-mute">Memo {record.memo}</p>
                {record.roll ? <p className="mt-1 font-mono text-xs text-mute">Roll {record.roll}</p> : null}
                {record.seed ? <p className="mt-1 break-all font-mono text-xs text-mute">Seed {record.seed}</p> : null}
                <p className="mt-3 flex flex-wrap gap-3 font-mono text-xs">
                  {record.winner ? (
                    <a href={solscanAccount(record.winner)} className="text-paper hover:text-rip">
                      {short(record.winner)}
                    </a>
                  ) : null}
                  <LinkIf href={record.paySignature} label="Buy" />
                  <LinkIf href={record.openSignature} label="Open" />
                  <LinkIf href={record.transferSignature} label="Send" />
                </p>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
};
