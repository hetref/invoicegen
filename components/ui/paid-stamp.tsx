"use client";

import React from "react";
import { CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";

interface PaidStampProps {
  date?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
  style?: React.CSSProperties;
}

export function PaidStamp({ date, size = "md", className = "", style = {} }: PaidStampProps) {
  const isLg = size === "lg";
  const isSm = size === "sm";

  return (
    <div
      data-paid-stamp="true"
      className={`select-none pointer-events-none ${className}`}
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: isSm ? "6px 14px" : isLg ? "14px 28px" : "10px 22px",
        border: isSm ? "2.5px double #059669" : "3.5px double #059669",
        borderRadius: isSm ? "6px" : "10px",
        backgroundColor: "rgba(16, 185, 129, 0.06)",
        color: "#047857",
        transform: "rotate(-12deg)",
        opacity: 0.86,
        boxShadow: "0 0 0 1px rgba(5, 150, 105, 0.15) inset",
        fontFamily: "system-ui, -apple-system, sans-serif",
        textAlign: "center",
        zIndex: 20,
        ...style,
      }}
    >
      {/* Top Banner: DevAlly Emblem */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          fontSize: isSm ? "8px" : isLg ? "11px" : "9px",
          fontWeight: 700,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "#059669",
          borderBottom: "1px solid rgba(5, 150, 105, 0.4)",
          paddingBottom: "2px",
          marginBottom: "3px",
          width: "100%",
          justifyContent: "center",
        }}
      >
        <svg
          width={isSm ? "10" : "12"}
          height={isSm ? "10" : "12"}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
        <span>DevAlly VERIFIED</span>
      </div>

      {/* Main Center Text */}
      <div
        style={{
          fontSize: isSm ? "18px" : isLg ? "34px" : "26px",
          fontWeight: 900,
          letterSpacing: "0.22em",
          lineHeight: 1,
          color: "#047857",
          textTransform: "uppercase",
          margin: isSm ? "2px 0" : "4px 0",
          textShadow: "0 1px 0 rgba(255, 255, 255, 0.4)",
        }}
      >
        PAID
      </div>

      {/* Bottom Subtitle: Date / Settlement */}
      <div
        style={{
          fontSize: isSm ? "7px" : isLg ? "10px" : "8px",
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "#059669",
          borderTop: "1px solid rgba(5, 150, 105, 0.4)",
          paddingTop: "2px",
          marginTop: "3px",
          width: "100%",
          justifyContent: "center",
        }}
      >
        {date ? `SETTLED • ${date}` : "SETTLED IN FULL"}
      </div>
    </div>
  );
}
