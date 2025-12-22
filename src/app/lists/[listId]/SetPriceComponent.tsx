"use client";

import { useState, useTransition } from "react";

import { fetchSetRrpEurAction } from "@/app/lists/[listId]/actions";

export function SetPriceComponent({
  listId,
  setNum,
}: {
  listId: string;
  setNum: string;
}) {
  const [priceText, setPriceText] = useState<string>("€—");
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => {
        startTransition(async () => {
          const res = await fetchSetRrpEurAction(listId, setNum);
          if (typeof res.rrpEur === "number") {
            setPriceText(
              new Intl.NumberFormat(undefined, {
                style: "currency",
                currency: "EUR",
              }).format(res.rrpEur),
            );
          } else {
            setPriceText("€—");
          }
        });
      }}
      disabled={isPending}
      className="rounded-md border border-black/20 px-3 py-1 text-sm dark:border-white/15"
      aria-label={`Fetch EUR RRP for ${setNum}`}
      title="Click to fetch EUR RRP"
    >
      {isPending ? "…" : priceText}
    </button>
  );
}
