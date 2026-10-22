const splitGrade = (grade: string) => {
  const match = grade.trim().match(/^(.*?)(\d+)$/);
  if (!match) return { label: grade, score: "" };
  return { label: match[1].trim() || grade, score: match[2] };
};

export const HeroPack = ({
  symbol,
  slabs,
  grade,
}: {
  symbol: string | null;
  slabs: number | null;
  grade: string | null;
}) => {
  const live = Boolean(grade);
  const parts = live && grade ? splitGrade(grade) : null;
  const title = live ? "$RIPS" : symbol ? `$${symbol}` : "YOUR COIN";
  const caption = live && slabs != null ? `PACK · ${slabs} SLABS` : "LAUNCH IT AS A PACK";

  return (
    <div className="relative mx-auto w-[230px] sm:w-[280px]">
      <div className="relative z-0 mx-auto w-[78%] rounded-t-[16px] border-[1.5px] border-b-0 border-rip bg-ink px-3 pb-8 pt-3 text-rip">
        <div className="flex items-center justify-between gap-2 font-mono text-[10px] tracking-wide">
          <span>{live ? "SLAB" : "SLAB #001"}</span>
          <span>{live ? (symbol ? `$${symbol}` : "SLAB") : "FIRST PULL"}</span>
        </div>
        <div className="mt-3 flex items-end justify-between gap-2">
          <span className="font-display text-[26px] leading-none sm:text-[32px]">{parts ? parts.label : "GRADE"}</span>
          <span className="font-display text-[42px] leading-none sm:text-[52px]">{parts?.score || (live ? "" : "?")}</span>
        </div>
      </div>
      <div className="relative z-10 -mt-6">
        <svg viewBox="0 0 280 28" className="block w-full" aria-hidden="true">
          <polygon points="0,28 0,10 20,28 40,10 60,28 80,10 100,28 120,10 140,28 160,10 180,28 200,10 220,28 240,10 260,28 280,10 280,28" fill="#140400" />
        </svg>
        <div className="bg-ink px-4 pb-10 pt-2 text-center shadow-[0_28px_40px_rgba(0,0,0,0.35)]">
          <p className="font-display text-[40px] leading-none text-rip sm:text-[48px]">{title}</p>
          <p className="mt-3 font-mono text-[11px] tracking-[0.16em] text-rip">{caption}</p>
        </div>
      </div>
    </div>
  );
};
