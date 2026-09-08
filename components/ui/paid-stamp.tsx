"use client";

import React from "react";

interface PaidStampProps {
  displayName?: string | null;
  date?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
  style?: React.CSSProperties;
}

export function PaidStamp({ displayName, date, size = "md", className = "", style = {} }: PaidStampProps) {
  const isLg = size === "lg";
  const isSm = size === "sm";

  // Capitalize display name from profile page
  const capitalizedName = (displayName || "").trim().toUpperCase();

  // Format date text safely - clean raw ISO timestamp if present
  let displayDate = (date || "").trim();
  if (/^\d{4}-\d{2}-\d{2}T/.test(displayDate)) {
    try {
      const d = new Date(displayDate);
      if (!isNaN(d.getTime())) {
        displayDate = d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
      }
    } catch {
      // keep
    }
  }

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
        maxWidth: isSm ? "160px" : isLg ? "260px" : "210px",
        ...style,
      }}
    >
      {/* Top Banner: Capitalized Display Name from Profile */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          fontSize: isSm ? "8px" : isLg ? "11px" : "9px",
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "#059669",
          borderBottom: "1px solid rgba(5, 150, 105, 0.4)",
          paddingBottom: "2px",
          marginBottom: "3px",
          width: "100%",
          justifyContent: "center",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        <span>{capitalizedName || "VERIFIED"}</span>
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

      {/* Bottom Subtitle: Settled Date with Invoice Date */}
      <div
        style={{
          fontSize: isSm ? "7px" : isLg ? "10px" : "8px",
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#059669",
          borderTop: "1px solid rgba(5, 150, 105, 0.4)",
          paddingTop: "2px",
          marginTop: "3px",
          width: "100%",
          justifyContent: "center",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {displayDate ? `SETTLED • ${displayDate}` : "SETTLED IN FULL"}
      </div>
    </div>
  );
}

