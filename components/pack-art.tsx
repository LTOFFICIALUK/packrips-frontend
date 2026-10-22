"use client";

import { useEffect, useRef, useState } from "react";

const TICKER_SIZE = 33.12;
const TICKER_FIT = 248;

export const HeroPack = ({ ticker, image, subline }: { ticker: string; image?: string; subline: string }) => {
  const tickerRef = useRef<SVGTextElement>(null);
  const [tickerSize, setTickerSize] = useState(TICKER_SIZE);
  const art = image || "";

  useEffect(() => {
    const node = tickerRef.current;
    if (!node) return;
    node.style.fontSize = `${TICKER_SIZE}px`;
    const width = node.getBBox().width;
    const next = width > TICKER_FIT ? TICKER_SIZE * (TICKER_FIT / width) : TICKER_SIZE;
    setTickerSize(Number(next.toFixed(2)));
  }, [ticker]);

  return (
    <div id="hero-pack">
      <div style={{ position: "relative", width: 320, height: 480 }}>
        <div style={{ position: "absolute", left: 30, top: 0, transform: "translateY(92px)" }}>
          <div style={{ position: "relative", width: 260, height: 372, transform: "rotate(0deg)" }}>
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 22,
                background: "linear-gradient(155deg,#2a2a2a,#0d0d0d 60%,#1d1d1d)",
                border: "2px solid #3b3b3b",
                boxShadow: "0 40px 80px rgba(0,0,0,.6),0 0 0 6px #0b0b0b,0 0 60px -10px #FF4D2E",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 14,
                right: 14,
                top: 14,
                height: 61,
                borderRadius: 12,
                background: "#FF4D2E",
                color: "#140400",
                padding: "10px 14px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", font: "700 10px var(--font-code)" }}>
                <span>SLAB</span>
                <span>GRADED</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end" }}>
                <span style={{ font: "400 20px var(--font-bungee)" }}>GEM MT</span>
                <span style={{ font: "400 34px/0.9 var(--font-bungee)" }}>10</span>
              </div>
            </div>
            <div style={{ position: "absolute", left: 26, right: 26, top: 88, bottom: 26, borderRadius: 10, overflow: "hidden" }}>
              {art ? (
                <img src={art} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div className="holo" style={{ position: "absolute", inset: 0, opacity: 0.9 }} />
              )}
              {art ? null : (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "repeating-linear-gradient(115deg,rgba(255,255,255,0) 0 14px,rgba(255,255,255,.28) 14px 18px),radial-gradient(circle at 30% 20%,rgba(255,255,255,.55),transparent 45%)",
                  }}
                />
              )}
              <div className="shine" />
              <div style={{ position: "absolute", inset: 0, borderRadius: 10, border: "2px solid rgba(0,0,0,.35)" }} />
            </div>
          </div>
        </div>
        <svg viewBox="0 0 320 300" style={{ position: "absolute", left: 0, bottom: 0, width: 320, height: 300, filter: "drop-shadow(0 30px 40px rgba(0,0,0,.45))" }}>
          <polygon
            points="0,10 0,10 13,0 27,10 40,0 53,10 67,0 80,10 93,0 107,10 120,0 133,10 147,0 160,10 173,0 187,10 200,0 213,10 227,0 240,10 253,0 267,10 280,0 293,10 307,0 320,10 320,10 320,290 320,290 307,300 293,290 280,300 267,290 253,300 240,290 227,300 213,290 200,300 187,290 173,300 160,290 147,300 133,290 120,300 107,290 93,300 80,290 67,300 53,290 40,300 27,290 13,300 0,290 0,290"
            fill="#140400"
          />
          <text
            ref={tickerRef}
            x="160"
            y="168"
            textAnchor="middle"
            fill="#FF4D2E"
            style={{ font: `400 ${tickerSize}px var(--font-bungee)` }}
          >
            {ticker}
          </text>
          <foreignObject x="28" y="184" width="264" height="26">
            <div
              xmlns="http://www.w3.org/1999/xhtml"
              style={{
                font: "400 14px var(--font-code)",
                color: "#FF4D2E",
                opacity: 0.7,
                textAlign: "center",
                textTransform: "uppercase",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {subline}
            </div>
          </foreignObject>
        </svg>
        <svg viewBox="0 0 320 60" style={{ position: "absolute", left: 0, bottom: 270, width: 320, height: 60 }}>
          <polygon
            points="0,50 0,50 13,40 27,50 40,40 53,50 67,40 80,50 93,40 107,50 120,40 133,50 147,40 160,50 173,40 187,50 200,40 213,50 227,40 240,50 253,40 267,50 280,40 293,50 307,40 320,50 320,50 320,60 0,60"
            fill="#140400"
          />
        </svg>
      </div>
    </div>
  );
};
