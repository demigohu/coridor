"use client";

import { memo, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface CoridorInteractiveModalProps {
  open: boolean;
  url: string;
  onClose: () => void;
}

function CoridorInteractiveModalInner({
  open,
  url,
  onClose,
}: CoridorInteractiveModalProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] overscroll-none"
      role="dialog"
      aria-modal="true"
      aria-label="Coridor checkout"
    >
      {/* Solid backdrop — replaces WebGL while checkout is open */}
      <div className="absolute inset-0 bg-zinc-950" aria-hidden />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(1,1,254,0.18),transparent_55%)]"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_100%,rgba(1,1,254,0.08),transparent_50%)]"
        aria-hidden
      />

      <div
        className="relative flex h-full w-full items-center justify-center p-4"
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        <div className="relative flex h-[min(85dvh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-zinc-800/90 bg-zinc-950 shadow-[0_24px_80px_rgba(0,0,0,0.65)]">
          <div className="flex shrink-0 items-start justify-between border-b border-zinc-800 px-5 py-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Coridor checkout</h2>
              <p className="mt-1 text-xs text-zinc-400">
                Pay with local fiat or enter bank details. Sandbox: use Simulate for VA/QRIS.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
              aria-label="Close"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="relative min-h-0 flex-1 bg-white">
            <iframe
              src={url}
              title="Coridor SEP-24"
              className="absolute inset-0 h-full w-full border-0"
              allow="payment"
            />
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export const CoridorInteractiveModal = memo(
  CoridorInteractiveModalInner,
  (prev, next) => prev.open === next.open && prev.url === next.url,
);
