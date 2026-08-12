// app/pricing/page.tsx — prices read live from the core catalogue
//
// 2026-08-12: this page imported PLANS and CREDIT_PACKS from lib/wallet.ts,
// which hardcoded a "Starter $12/mo — 300 credits" tier and 200/500/1000
// credit packs. None of those are things CR AudioViz AI sells. It was
// advertising invented prices on a public page.
//
// craudiovizai.com/api/pricing reads Supabase `tiers` and `credit_packs`, which
// are the source of truth. Checkout happens on the core so there is one Stripe
// account and one place a price can change.
//
// CR AudioViz AI · EIN 39-3646201 · August 2026
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CentralPayments,
  tierPriceLabel,
  packPriceLabel,
  type Pricing,
} from "@/lib/central-services";

export default function PricingPage() {
  const [pricing, setPricing] = useState<Pricing | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    CentralPayments.getPricing()
      .then((p) => { if (!cancelled) setPricing(p); })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Could not load pricing");
        }
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <header className="mb-12 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Javari Logo pricing</h1>
        <p className="mt-3 text-slate-600">
          One account across every CR AudioViz AI app. Credits you buy here work
          everywhere.
        </p>
      </header>

      {error && (
        <p role="alert" className="mb-8 rounded border border-red-200 bg-red-50 p-4 text-red-800">
          Pricing is temporarily unavailable. {error}
        </p>
      )}

      {!pricing && !error && (
        <p className="text-center text-slate-500">Loading pricing…</p>
      )}

      {pricing && (
        <>
          <section aria-labelledby="plans-heading" className="mb-16">
            <h2 id="plans-heading" className="mb-6 text-xl font-semibold">Plans</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {pricing.tiers.map((t) => (
                <div key={t.id} className="rounded-lg border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold">{t.name}</h3>
                  <p className="mt-1 text-2xl font-bold">{tierPriceLabel(t)}</p>
                  <p className="mt-2 text-sm text-slate-600">
                    {t.monthly_credits
                      ? `${t.monthly_credits.toLocaleString()} credits a month`
                      : t.signup_bonus
                        ? `${t.signup_bonus} credits to start`
                        : "Contact us"}
                  </p>
                  {t.seat_limit > 1 && (
                    <p className="mt-1 text-sm text-slate-600">
                      Up to {t.seat_limit} seats
                    </p>
                  )}
                  <a
                    href={CentralPayments.checkoutUrl(t.id)}
                    className="mt-5 inline-block rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                  >
                    {t.price_monthly_usd === 0 ? "Get started" : `Choose ${t.name}`}
                  </a>
                </div>
              ))}
            </div>
          </section>

          <section aria-labelledby="packs-heading">
            <h2 id="packs-heading" className="mb-2 text-xl font-semibold">Credit packs</h2>
            <p className="mb-6 text-sm text-slate-600">
              Top up any time. Packs never expire while your account is active.
            </p>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {pricing.packs.map((p) => (
                <div key={p.id} className="rounded-lg border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold">
                    {p.credits.toLocaleString()} credits
                  </h3>
                  <p className="mt-1 text-2xl font-bold">{packPriceLabel(p)}</p>
                  <p className="mt-2 text-sm text-slate-600">{p.name}</p>
                  <a
                    href={CentralPayments.checkoutUrl(p.id)}
                    className="mt-5 inline-block rounded border border-slate-300 px-4 py-2 text-sm font-semibold"
                  >
                    Buy pack
                  </a>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      <p className="mt-16 text-center text-sm text-slate-500">
        Questions? <Link href="/" className="underline">Back to Javari Logo</Link>
      </p>
    </main>
  );
}
