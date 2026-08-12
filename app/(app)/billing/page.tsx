// app/(app)/billing/page.tsx — billing, read from the core
//
// 2026-08-12: this page read PLANS and CREDIT_PACKS from lib/wallet.ts (prices
// the company does not sell) and getLedgerEntries() from a `ledger_entries`
// table that does not exist on the Supabase project. So the plan cards were
// wrong and the history was always empty.
//
// Everything here is now the core's answer: pricing from /api/pricing,
// transaction history from /api/credits/transactions, and checkout on
// craudiovizai.com so there is one Stripe account.
//
// CR AudioViz AI · EIN 39-3646201 · August 2026
'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, History } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { supabase } from '@/lib/supabase/client';
import {
  CENTRAL_API_BASE,
  CentralPayments,
  tierPriceLabel,
  packPriceLabel,
  type Pricing,
} from '@/lib/central-services';

interface Transaction {
  id: string;
  amount: number;
  description: string | null;
  created_at: string;
}

export default function BillingPage() {
  const { user, balance } = useAppStore();
  const [pricing, setPricing] = useState<Pricing | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [p, session] = await Promise.all([
        CentralPayments.getPricing(),
        supabase.auth.getSession(),
      ]);
      setPricing(p);

      const token = session.data.session?.access_token;
      if (token) {
        const res = await fetch(`${CENTRAL_API_BASE}/credits/transactions`, {
          headers: { Authorization: `Bearer ${token}`, 'X-App-Id': 'javari-logo' },
          cache: 'no-store',
        });
        if (res.ok) {
          const body = (await res.json()) as { transactions?: Transaction[] };
          setTransactions(body.transactions ?? []);
        }
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not load billing');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) void load();
  }, [user, load]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Billing</h1>
        <p className="text-slate-600">
          Your plan and credits work across every CR AudioViz AI app.
        </p>
        <p className="mt-3 text-lg">
          Balance: <span className="font-semibold">{balance.toLocaleString()}</span> credits
        </p>
      </header>

      {error && (
        <p role="alert" className="mb-6 rounded border border-red-200 bg-red-50 p-4 text-red-800">
          {error}
        </p>
      )}

      <Tabs defaultValue="plans">
        <TabsList>
          <TabsTrigger value="plans"><CreditCard className="mr-2 h-4 w-4" />Plans</TabsTrigger>
          <TabsTrigger value="credits">Credit packs</TabsTrigger>
          <TabsTrigger value="history"><History className="mr-2 h-4 w-4" />History</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="mt-6 grid gap-4 md:grid-cols-2">
          {pricing?.tiers.map((t) => (
            <Card key={t.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {t.name}
                  <Badge variant="secondary">{tierPriceLabel(t)}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  {t.monthly_credits
                    ? `${t.monthly_credits.toLocaleString()} credits a month`
                    : t.signup_bonus
                      ? `${t.signup_bonus} credits to start`
                      : 'Contact us'}
                </p>
                <a
                  href={CentralPayments.checkoutUrl(t.id)}
                  className="mt-4 inline-block rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                >
                  Choose {t.name}
                </a>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="credits" className="mt-6 grid gap-4 md:grid-cols-2">
          {pricing?.packs.map((p) => (
            <Card key={p.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {p.credits.toLocaleString()} credits
                  <Badge variant="secondary">{packPriceLabel(p)}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">{p.name}</p>
                <a
                  href={CentralPayments.checkoutUrl(p.id)}
                  className="mt-4 inline-block rounded border border-slate-300 px-4 py-2 text-sm font-semibold"
                >
                  Buy pack
                </a>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          {loading && <p className="text-slate-500">Loading…</p>}
          {!loading && transactions.length === 0 && (
            <p className="text-slate-500">No transactions yet.</p>
          )}
          <ul className="divide-y divide-slate-200">
            {transactions.map((t) => (
              <li key={t.id} className="flex items-center justify-between py-3">
                <span className="text-sm">{t.description ?? 'Credit activity'}</span>
                <span className={t.amount < 0 ? 'text-slate-700' : 'text-green-700'}>
                  {t.amount > 0 ? '+' : ''}{t.amount}
                </span>
              </li>
            ))}
          </ul>
        </TabsContent>
      </Tabs>
    </div>
  );
}
