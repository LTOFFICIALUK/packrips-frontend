const Crimp = () => (
  <svg viewBox="0 0 280 28" className="block w-full" aria-hidden="true">
    <polygon points="0,28 0,10 20,28 40,10 60,28 80,10 100,28 120,10 140,28 160,10 180,28 200,10 220,28 240,10 260,28 280,10 280,28" fill="#140400" />
  </svg>
);

export const HeroPack = () => (
  <div className="relative mx-auto w-[240px] sm:w-[280px]">
    <div className="relative z-0 mx-auto w-[82%] rounded-t-[14px] border-[1.5px] border-b-0 border-rip bg-ink px-3 pb-8 pt-3 text-rip">
      <div className="flex items-center justify-between gap-2 font-mono text-[10px] tracking-wide">
        <span>SLAB</span>
        <span>GRADED</span>
      </div>
      <div className="mt-2 h-[1.5px] bg-rip" />
    </div>
    <div className="relative z-10 -mt-5">
      <Crimp />
      <div className="bg-ink px-4 pb-9 pt-2 text-center shadow-[0_28px_40px_rgba(0,0,0,0.35)]">
        <p className="font-display text-[40px] leading-none text-rip sm:text-[48px]">$RIPS</p>
        <p className="mt-3 font-mono text-[11px] tracking-[0.14em] text-rip">1 GRADED SLAB INSIDE</p>
      </div>
    </div>
  </div>
);

export const PreviewPack = ({ name, symbol, image }: { name: string; symbol: string; image: string }) => {
  const ticker = symbol.trim().toUpperCase();
  const title = name.trim();

  return (
    <div className="relative mx-auto w-[220px]">
      <div className="relative z-0 mx-auto w-[82%] overflow-hidden rounded-t-[14px] border-[1.5px] border-b-0 border-rip bg-ink text-rip">
        {image ? (
          <img src={image} alt="" className="aspect-[5/4] w-full object-cover" />
        ) : (
          <div className="px-3 pb-8 pt-3">
            <div className="flex items-center justify-between font-mono text-[10px] tracking-wide">
              <span>SLAB</span>
              <span>GRADED</span>
            </div>
            <div className="mt-2 h-[1.5px] bg-rip" />
          </div>
        )}
      </div>
      <div className="relative z-10 -mt-4">
        <Crimp />
        <div className="bg-ink px-4 pb-7 pt-2 text-center">
          {title ? <p className="truncate font-mono text-[10px] tracking-wide text-paper">{title}</p> : null}
          {ticker ? <p className="font-display text-[32px] leading-none text-rip">{`$${ticker}`}</p> : null}
          <p className="mt-3 font-mono text-[10px] tracking-[0.14em] text-rip">1 GRADED SLAB INSIDE</p>
        </div>
      </div>
    </div>
  );
};
