import { useState, useRef, useEffect } from "react";

const ITEM_H = 44;
const VISIBLE = 5;
const PAD = 2; // Math.floor(VISIBLE / 2)
const FONT = `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Inter', 'Helvetica Neue', sans-serif`;

// ─── Drum column ──────────────────────────────────────────────────────────────

interface ColumnProps {
  items: string[];
  selected: string;
  onSelect: (v: string) => void;
  accentColor: string;
}

function Column({ items, selected, onSelect, accentColor }: ColumnProps) {
  const getOffset = (idx: number) => PAD * ITEM_H - idx * ITEM_H;
  const initIdx = Math.max(0, items.indexOf(selected));

  const [offset, setOffset] = useState(getOffset(initIdx));
  const [snapping, setSnapping] = useState(false);
  const drag = useRef<{ y: number; o: number } | null>(null);

  // Which item is visually centred right now (live during drag)
  const centeredIdx = Math.max(
    0,
    Math.min(items.length - 1, Math.round((PAD * ITEM_H - offset) / ITEM_H))
  );

  // Sync when parent changes `selected`
  useEffect(() => {
    const idx = items.indexOf(selected);
    if (idx >= 0) {
      setSnapping(true);
      setOffset(getOffset(idx));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  const clamp = (o: number) =>
    Math.max(-(items.length - 1 - PAD) * ITEM_H, Math.min(PAD * ITEM_H, o));

  const snapTo = (raw: number) => {
    const o = clamp(raw);
    const idx = Math.max(
      0,
      Math.min(items.length - 1, Math.round((PAD * ITEM_H - o) / ITEM_H))
    );
    setSnapping(true);
    setOffset(getOffset(idx));
    onSelect(items[idx]);
    drag.current = null;
  };

  return (
    <div
      style={{
        width: 72,
        height: ITEM_H * VISIBLE,
        overflow: "hidden",
        position: "relative",
        cursor: "ns-resize",
        userSelect: "none",
        touchAction: "none",
        WebkitUserSelect: "none",
      }}
      onPointerDown={e => {
        e.currentTarget.setPointerCapture(e.pointerId);
        setSnapping(false);
        drag.current = { y: e.clientY, o: offset };
      }}
      onPointerMove={e => {
        if (!drag.current) return;
        setOffset(clamp(drag.current.o + e.clientY - drag.current.y));
      }}
      onPointerUp={e => {
        if (!drag.current) return;
        snapTo(drag.current.o + e.clientY - drag.current.y);
      }}
      onPointerCancel={e => {
        if (!drag.current) return;
        snapTo(drag.current.o + e.clientY - drag.current.y);
      }}
    >
      {/* Highlight band for selected row */}
      <div
        style={{
          position: "absolute",
          top: PAD * ITEM_H,
          left: 8,
          right: 8,
          height: ITEM_H,
          background: "rgba(255,165,0,0.09)",
          border: `1px solid ${accentColor}44`,
          borderRadius: 10,
          pointerEvents: "none",
          zIndex: 2,
        }}
      />

      {/* Top fade */}
      <div
        style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: PAD * ITEM_H,
          background: "linear-gradient(to bottom, rgba(8,18,38,0.97) 0%, transparent 100%)",
          pointerEvents: "none",
          zIndex: 3,
        }}
      />

      {/* Bottom fade */}
      <div
        style={{
          position: "absolute",
          bottom: 0, left: 0, right: 0,
          height: PAD * ITEM_H,
          background: "linear-gradient(to top, rgba(8,18,38,0.97) 0%, transparent 100%)",
          pointerEvents: "none",
          zIndex: 3,
        }}
      />

      {/* Scrolling list */}
      <div
        style={{
          transform: `translateY(${offset}px)`,
          transition: snapping
            ? "transform 0.24s cubic-bezier(0.25,0.46,0.45,0.94)"
            : "none",
          willChange: "transform",
        }}
      >
        {items.map((item, i) => {
          const isSel = i === centeredIdx;
          const dist = Math.abs(i - centeredIdx);
          return (
            <div
              key={item}
              style={{
                height: ITEM_H,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: isSel ? 24 : dist === 1 ? 19 : 15,
                fontWeight: isSel ? 600 : 400,
                color: isSel
                  ? accentColor
                  : dist === 1
                  ? "rgba(255,255,255,0.32)"
                  : "rgba(255,255,255,0.10)",
                fontVariantNumeric: "tabular-nums",
                letterSpacing: "0.04em",
                fontFamily: FONT,
                transition: "color 0.1s, font-size 0.1s",
              }}
            >
              {item}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Public component ─────────────────────────────────────────────────────────

export interface DrumTimePickerProps {
  value: string;           // "HH:MM"
  onChange: (v: string) => void;
  accentColor?: string;
  style?: React.CSSProperties;
}

export function DrumTimePicker({
  value,
  onChange,
  accentColor = "#FFB830",
  style,
}: DrumTimePickerProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
  const mins  = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

  const parts = (value || "").split(":");
  const hh = (parts[0] || "00").padStart(2, "0");
  const mm = (parts[1] || "00").padStart(2, "0");

  const display = value ? `${hh}:${mm}` : "--:--";

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={wrapperRef} style={{ position: "relative", ...style }}>
      {/* ── Trigger button ── */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0px 12px 0px 12px",
          height: 42,
          background: open ? "rgba(255,165,0,0.10)" : "rgba(255,165,0,0.05)",
          border: `1px solid ${open ? "rgba(255,165,0,0.50)" : "rgba(255,165,0,0.28)"}`,
          borderRadius: 10,
          cursor: "pointer",
          color: value ? accentColor : "rgba(255,165,0,0.35)",
          fontSize: 16,
          fontWeight: 500,
          fontFamily: FONT,
          letterSpacing: "0.06em",
          fontVariantNumeric: "tabular-nums",
          transition: "background 0.18s, border-color 0.18s",
          outline: "none",
        }}
      >
        <span className="text-[15px] text-[14px]">{display}</span>
        {/* Clock icon */}
        <svg
          width="15" height="15" viewBox="0 0 24 24" fill="none"
          stroke={accentColor} strokeWidth="1.6"
          strokeLinecap="round" strokeLinejoin="round"
          style={{ opacity: 0.55, flexShrink: 0 }}
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      </button>

      {/* ── Drum popover ── */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9999,
            background: "rgba(7,16,36,0.97)",
            border: "1px solid rgba(255,165,0,0.22)",
            borderRadius: 20,
            boxShadow:
              "0 12px 48px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,165,0,0.07), inset 0 1px 0 rgba(255,255,255,0.05)",
            backdropFilter: "blur(28px)",
            WebkitBackdropFilter: "blur(28px)",
            padding: "10px 8px 14px",
            minWidth: 200,
          }}
        >
          {/* Hint label */}
          <div
            style={{
              textAlign: "center",
              color: "rgba(255,165,0,0.45)",
              fontSize: 10,
              letterSpacing: 1.6,
              fontFamily: FONT,
              marginBottom: 4,
              textTransform: "uppercase",
            }}
          >
            Kéo để chọn
          </div>

          {/* HH  :  MM */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Column
              items={hours}
              selected={hh}
              onSelect={h => onChange(`${h}:${mm}`)}
              accentColor={accentColor}
            />

            <div
              style={{
                fontSize: 30,
                fontWeight: 700,
                color: accentColor,
                opacity: 0.6,
                padding: "0 2px",
                lineHeight: 1,
                userSelect: "none",
                flexShrink: 0,
                fontFamily: FONT,
              }}
            >
              :
            </div>

            <Column
              items={mins}
              selected={mm}
              onSelect={m => onChange(`${hh}:${m}`)}
              accentColor={accentColor}
            />
          </div>

          {/* Done */}
          <button
            type="button"
            onClick={() => setOpen(false)}
            style={{
              display: "block",
              width: "calc(100% - 20px)",
              margin: "10px 10px 0",
              padding: "8px 0",
              background: "rgba(255,165,0,0.12)",
              border: "1px solid rgba(255,165,0,0.32)",
              borderRadius: 10,
              color: accentColor,
              fontSize: 13,
              fontWeight: 600,
              fontFamily: FONT,
              letterSpacing: 0.4,
              cursor: "pointer",
              outline: "none",
            }}
          >
            Xong
          </button>
        </div>
      )}
    </div>
  );
}