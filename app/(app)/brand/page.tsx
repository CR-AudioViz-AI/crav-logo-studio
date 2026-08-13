// app/(app)/brand/page.tsx — the brand toolkit
//
// 2026-08-12: ported from the core platform's /apps/logo-studio so there is one
// logo product rather than two. javarilogo.com had the editor, saved projects
// and SVG export; the platform route had the brand thinking. Both now live here.
//
// Text generation goes through the core's /api/chat, which bills the message
// itself — this app must not charge separately, or the customer pays twice for
// one operation.
//
// CR AudioViz AI · EIN 39-3646201 · August 2026
'use client';

import { useCallback, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import {
  CentralChat,
  CentralImages,
  InsufficientCreditsError,
} from '@/lib/central-services';
import {
  BRAND_TOOLS, BRAND_VIBES, BRAND_COLORS, INDUSTRIES,
  buildBrandPrompt, buildLogoImagePrompt,
  type BrandInput, type BrandTool,
} from '@/lib/brand-prompts';

const SYSTEM =
  'You are a senior brand strategist. Be specific and usable — no filler, no ' +
  'restating the brief. Follow the requested structure exactly.';

export default function BrandPage() {
  const [tool, setTool] = useState<BrandTool | 'logo'>('names');
  const [input, setInput] = useState<BrandInput>({
    brandName: '', industry: INDUSTRIES[0], description: '',
    audience: '', vibe: BRAND_VIBES[0], colorPref: BRAND_COLORS[0], keywords: '',
  });
  const [output, setOutput] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof BrandInput>(k: K, v: BrandInput[K]) =>
    setInput((prev) => ({ ...prev, [k]: v }));

  const run = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    setOutput('');
    setLogoUrl('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        setError('Please sign in to use the brand toolkit.');
        return;
      }

      if (tool === 'logo') {
        const images = await CentralImages.generate(
          token, buildLogoImagePrompt(input), { count: 1 });
        setLogoUrl(images[0].url);
        return;
      }

      const text = await CentralChat.complete(
        token, buildBrandPrompt(tool, input), SYSTEM);
      setOutput(text);
    } catch (e: unknown) {
      if (e instanceof InsufficientCreditsError) {
        setError('You are out of credits. Top up to keep going.');
      } else {
        setError(e instanceof Error ? e.message : 'Something went wrong.');
      }
    } finally {
      setLoading(false);
    }
  }, [tool, input, loading]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Brand toolkit</h1>
        <p className="text-slate-600">
          Names, taglines, colour, type, briefs and guidelines — then generate
          the mark itself.
        </p>
      </header>

      <div className="mb-8 flex flex-wrap gap-2" role="tablist" aria-label="Brand tools">
        {BRAND_TOOLS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tool === t.id}
            onClick={() => setTool(t.id)}
            className={`rounded border px-3 py-2 text-sm ${
              tool === t.id
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-300 text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
        <button
          type="button"
          role="tab"
          aria-selected={tool === 'logo'}
          onClick={() => setTool('logo')}
          className={`rounded border px-3 py-2 text-sm ${
            tool === 'logo'
              ? 'border-slate-900 bg-slate-900 text-white'
              : 'border-slate-300 text-slate-700'
          }`}
        >
          Generate Logo
        </button>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Brand name</span>
          <input
            value={input.brandName}
            onChange={(e) => set('brandName', e.target.value)}
            placeholder="Leave blank if you want name ideas"
            className="w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Industry</span>
          <select
            value={input.industry}
            onChange={(e) => set('industry', e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2"
          >
            {INDUSTRIES.map((x) => <option key={x}>{x}</option>)}
          </select>
        </label>
        <label className="block md:col-span-2">
          <span className="mb-1 block text-sm font-medium">What the business does</span>
          <textarea
            value={input.description}
            onChange={(e) => set('description', e.target.value)}
            rows={3}
            className="w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Target audience</span>
          <input
            value={input.audience}
            onChange={(e) => set('audience', e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Brand personality</span>
          <select
            value={input.vibe}
            onChange={(e) => set('vibe', e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2"
          >
            {BRAND_VIBES.map((x) => <option key={x}>{x}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Colour preference</span>
          <select
            value={input.colorPref}
            onChange={(e) => set('colorPref', e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2"
          >
            {BRAND_COLORS.map((x) => <option key={x}>{x}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Keywords</span>
          <input
            value={input.keywords}
            onChange={(e) => set('keywords', e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>
      </div>

      <button
        type="button"
        onClick={() => void run()}
        disabled={loading}
        className="rounded bg-slate-900 px-5 py-2.5 font-semibold text-white disabled:opacity-50"
      >
        {loading ? 'Working…' : tool === 'logo' ? 'Generate logo' : 'Generate'}
      </button>

      {error && (
        <p role="alert" className="mt-6 rounded border border-red-200 bg-red-50 p-4 text-red-800">
          {error}
        </p>
      )}

      {logoUrl && (
        <div className="mt-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoUrl} alt={`Generated logo for ${input.brandName || 'the brand'}`}
               className="max-w-md rounded border border-slate-200" />
        </div>
      )}

      {output && (
        <pre className="mt-8 whitespace-pre-wrap rounded border border-slate-200 bg-slate-50 p-5 text-sm leading-relaxed">
          {output}
        </pre>
      )}
    </div>
  );
}
