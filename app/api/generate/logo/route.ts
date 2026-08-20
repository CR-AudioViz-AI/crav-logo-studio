// app/api/generate/logo/route.ts — real logo generation through the core
//
// 2026-08-12: this route used to charge credits against a `wallets` table that
// does not exist on the Supabase project, and then return PLACEHOLDER logos
// behind a `// TODO: Replace with actual AI generation when ready`. So it never
// generated anything, and its charge silently failed. javarilogo.com has never
// produced a real logo.
//
// Generation and billing both happen on craudiovizai.com now: one model
// cascade, one cost law, one atomic ledger. If generation fails after the
// charge lands, the credits are refunded rather than quietly kept.
//
// CR AudioViz AI · EIN 39-3646201 · August 2026
import { NextRequest, NextResponse } from "next/server";

import { requireUser } from "@/lib/api/require-user";
import {

  CentralCredits,
  CentralImages,
  CentralCrm,
  CentralServiceError,
  InsufficientCreditsError,
} from "@/lib/central-services";

// Service-role client. Identity comes from requireUser above; this only
// reads and writes data.
import { createClient as _mkClient } from '@supabase/supabase-js';
function createSupabaseServiceClient() {
  return _mkClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false },
      global: { fetch: (u: RequestInfo | URL, o?: RequestInit) => fetch(u, { ...o, cache: 'no-store' }) } },
  );
}


export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Credits per logo concept. The core is authoritative; this is the request. */
const CREDITS_PER_CONCEPT = 5;
const MAX_CONCEPTS = 4;

export async function POST(req: NextRequest): Promise<NextResponse> {
  let charged = 0;
  let accessToken: string | null = null;

  try {
    const body = (await req.json()) as {
      prompt?: unknown; style?: unknown; count?: unknown;
    };

    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
    if (!prompt) {
      return NextResponse.json({ error: "Prompt required" }, { status: 400 });
    }
    const style = typeof body.style === "string" ? body.style.trim() : "";
    const requested = Number(body.count ?? 4);
    const count = Number.isFinite(requested)
      ? Math.min(Math.max(Math.trunc(requested), 1), MAX_CONCEPTS)
      : 4;

    // The session is the only thing that decides who this is. No email
    // argument, no x-user-email header, no local admin list.
    const supabase = await createSupabaseServiceClient();
        // 2026-08-19: read the session from COOKIES via @supabase/auth-helpers or
    // @supabase/ssr. Sessions live in localStorage on this platform and nothing
    // writes a Supabase auth cookie, so this found no user and answered 401 to
    // EVERYONE - signed in or not. It never errored; it took the unauthenticated
    // path and looked like it worked. Same bug that broke 32 core routes.
    const _auth = await requireUser(req);
    if (!_auth.ok) return _auth.res;
    const user = { id: _auth.userId, email: _auth.email };
    if (!session?.user || !session.access_token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    accessToken = session.access_token;

    const cost = CREDITS_PER_CONCEPT * count;
    await CentralCredits.spend(accessToken, cost, "logo.concept", {
      prompt, style, count,
    });
    charged = cost;

    const fullPrompt = style
      ? `${prompt}. Logo design, ${style} style. Clean vector mark, flat, ` +
        `high contrast, centred on a plain background, no text.`
      : `${prompt}. Logo design. Clean vector mark, flat, high contrast, ` +
        `centred on a plain background, no text.`;

    const images = await CentralImages.generate(accessToken, fullPrompt, { count });

    void CentralCrm.record(accessToken, "logo.generated", { count, style });

    return NextResponse.json({
      logos: images.map((img, i) => ({
        id: `logo-${Date.now()}-${i}`,
        url: img.url,
        prompt: img.revisedPrompt ?? fullPrompt,
      })),
      creditsCharged: cost,
    });
  } catch (error) {
    if (error instanceof InsufficientCreditsError) {
      return NextResponse.json(
        { error: "Insufficient credits", code: "insufficient_credits" },
        { status: 402 },
      );
    }

    // Generation failed after the customer paid. Give it back.
    if (charged > 0 && accessToken) {
      try {
        await CentralCredits.refund(accessToken, charged, "logo generation failed");
      } catch {
        // Refund failure must be visible, not swallowed into a 500 that looks
        // like a plain generation error.
        return NextResponse.json(
          { error: "Generation failed and the refund did not go through. " +
                   "Support has the details.", code: "refund_failed" },
          { status: 500 },
        );
      }
    }

    if (error instanceof CentralServiceError) {
      return NextResponse.json({ error: error.message, code: error.code },
        { status: error.status >= 500 ? 502 : error.status });
    }
    return NextResponse.json({ error: "Logo generation failed" }, { status: 500 });
  }
}
