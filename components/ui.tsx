import type { ReactNode } from "react";

export const cardClass = "rounded-[18px] border-[1.5px] border-line bg-black";

export const fieldClass =
  "w-full rounded-[14px] border-[1.5px] border-line bg-black px-3 py-3 text-paper outline-none placeholder:text-[#555]";

export const PageHead = ({ kicker, title, children }: { kicker: string; title: string; children?: ReactNode }) => (
  <header>
    <p className="font-mono text-[11px] tracking-[0.16em] text-rip">{kicker}</p>
    <h1 className="mt-3 font-display text-3xl leading-none text-paper md:text-5xl">{title}</h1>
    {children ? <p className="mt-4 max-w-xl text-lg leading-snug text-mute">{children}</p> : null}
  </header>
);

export const Field = ({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) => (
  <label className="grid gap-2">
    <span className="font-mono text-[11px] tracking-[0.14em] text-rip">{label}</span>
    {children}
    {hint ? <span className="text-sm leading-snug text-mute">{hint}</span> : null}
  </label>
);

export const Zigzag = () => {
  const teeth: string[] = [];
  for (let x = 0; x <= 1440; x += 60) {
    const down = (x / 60) % 2 === 1;
    teeth.push(`${x},${down ? 48 : 0}`);
  }
  const points = `0,0 ${teeth.join(" ")} 1440,0`;
  return (
    <svg viewBox="0 0 1440 48" preserveAspectRatio="none" className="block h-8 w-full md:h-12" aria-hidden="true">
      <polygon points={points} fill="#FF4D2E" />
    </svg>
  );
};
