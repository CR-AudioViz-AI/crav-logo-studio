// lib/central-services.ts — the only way this app reaches shared services
//
// Javari Logo is its own product on its own domain, but it does not own auth,
// credits, payments, support or CRM. Those live once, on craudiovizai.com.
//
// ── 2026-08-12 rewrite. What was here before, and why it is gone ────────────
//
// A hardcoded ADMIN_EMAILS list with a shouldChargeCredits() bypass, and a
// CentralCredits.spend(amount, appId, description, userEmail) that skipped the
// charge entirely when isAdmin(userEmail) was true. userEmail was supplied by
// the caller. lib/admin-utils.ts went further: isAdminRequest() read the
// x-user-email HEADER and granted admin on a string match. Anyone could send
// x-user-email: admin@craudiovizai.com and generate for free.
//
// Admin identity is decided once, server-side, in the core against the
// authenticated session — never from a header, an argument, or a list kept in a
// satellite app. This client cannot grant itself anything.
//
// CR AudioViz AI · EIN 39-3646201 · August 2026

export const CENTRAL_DOMAIN = "craudiovizai.com";
export const CENTRAL_API_BASE =
  process.env.NEXT_PUBLIC_CENTRAL_API_URL ?? `https://${CENTRAL_DOMAIN}/api`;

/** Identifies this app to the core, for per-app credit accounting. */
export const APP_ID = "javari-logo";

export class CentralServiceError extends Error {
  readonly status: number;
  readonly code: string;
  constructor(message: string, status: number, code = "central_error") {
    super(message);
    this.name = "CentralServiceError";
    this.status = status;
    this.code = code;
  }
}

/** Thrown when the customer cannot afford the operation. Surface as 402. */
export class InsufficientCreditsError extends CentralServiceError {
  constructor(message = "Insufficient credits") {
    super(message, 402, "insufficient_credits");
    this.name = "InsufficientCreditsError";
  }
}

interface CallOptions {
  method?: "GET" | "POST";
  body?: unknown;
  /** The caller's Supabase access token. Every credited call needs one. */
  accessToken?: string | null;
  timeoutMs?: number;
}

async function call<T>(path: string, opts: CallOptions = {}): Promise<T> {
  const { method = "GET", body, accessToken, timeoutMs = 20_000 } = opts;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${CENTRAL_API_BASE}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-App-Id": APP_ID,
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
      cache: "no-store",
    });
    const text = await res.text();
    let parsed: unknown = null;
    if (text) {
      try {
        parsed = JSON.parse(text) as unknown;
      } catch {
        throw new CentralServiceError(
          `Non-JSON response from ${path}`, res.status, "bad_response");
      }
    }
    if (!res.ok) {
      const msg = (parsed as { error?: string } | null)?.error
        ?? `Request failed (${res.status})`;
      if (res.status === 402) throw new InsufficientCreditsError(msg);
      throw new CentralServiceError(msg, res.status);
    }
    return parsed as T;
  } catch (err) {
    if (err instanceof CentralServiceError) throw err;
    if (err instanceof Error && err.name === "AbortError") {
      throw new CentralServiceError(`Timed out calling ${path}`, 504, "timeout");
    }
    throw new CentralServiceError(
      err instanceof Error ? err.message : "Unknown error", 502, "network");
  } finally {
    clearTimeout(timer);
  }
}

// ─── CREDITS ─────────────────────────────────────────────────────────────────
// The core owns the ledger and the atomic cl_spend_direct RPC. It decides admin
// status and plan entitlements. This app only ever asks.

export interface CreditBalance { balance: number; plan: string | null }

export const CentralCredits = {
  async getBalance(accessToken: string): Promise<CreditBalance> {
    const d = await call<{ balance?: number; plan?: string; tier?: string }>(
      "/credits/balance", { accessToken });
    return { balance: Number(d.balance ?? 0), plan: d.plan ?? d.tier ?? null };
  },

  /**
   * Spend credits. Throws InsufficientCreditsError when the customer cannot
   * afford it — callers must let that reach the user rather than proceeding
   * with the work anyway.
   */
  async spend(
    accessToken: string,
    amount: number,
    operation: string,
    metadata?: Record<string, unknown>,
  ): Promise<{ balance: number }> {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new CentralServiceError("Spend amount must be positive", 400, "bad_amount");
    }
    const d = await call<{ balance?: number }>("/credits/spend", {
      method: "POST",
      accessToken,
      body: { amount, operation, appId: APP_ID, description: operation, metadata },
    });
    return { balance: Number(d.balance ?? 0) };
  },

  /** Give credits back when paid-for work fails. */
  async refund(accessToken: string, amount: number, reason: string): Promise<void> {
    await call("/credits/refund", {
      method: "POST",
      accessToken,
      body: { amount, reason, appId: APP_ID },
    });
  },
};

// ─── PRICING ─────────────────────────────────────────────────────────────────
// Never hardcode a price here. The previous lib/wallet.ts advertised a $12/mo
// Starter tier and 200/500/1000 credit packs that the company does not sell.

/** Mirrors craudiovizai.com/api/pricing exactly. Do not add fields here that
 *  the core does not return — a divergent shape is how the old hardcoded price
 *  table started. */
export interface PricingTier {
  id: string;
  name: string;
  price_monthly_usd: number | null;
  price_annual_usd: number | null;
  monthly_credits: number | null;
  credits_reset_monthly: boolean;
  signup_bonus: number;
  seat_limit: number;
  sort: number;
}

export interface PricingPack {
  id: string;
  name: string;
  credits: number;
  /** The core returns this as a string (numeric column). Do not assume number. */
  price_usd: string | number;
  per_credit?: string | number;
}

export interface Pricing {
  ok: boolean;
  credit_floor_usd: number;
  tiers: PricingTier[];
  packs: PricingPack[];
  action_costs?: Record<string, number>;
}

/** "$9.99/mo", "Free", or "" when the tier is quote-only. */
export function tierPriceLabel(t: PricingTier): string {
  if (t.price_monthly_usd === 0) return "Free";
  if (t.price_monthly_usd == null) return "";
  return `$${t.price_monthly_usd.toFixed(2)}/mo`;
}

export function packPriceLabel(p: PricingPack): string {
  return `$${Number(p.price_usd).toFixed(2)}`;
}

export const CentralPayments = {
  async getPricing(): Promise<Pricing> {
    return call<Pricing>("/pricing");
  },
  /** Checkout runs on the core, against the canonical catalogue. */
  checkoutUrl(target?: string): string {
    const u = new URL(`https://${CENTRAL_DOMAIN}/pricing`);
    u.searchParams.set("app", APP_ID);
    if (target) u.searchParams.set("select", target);
    return u.toString();
  },
};

// ─── AUTH ────────────────────────────────────────────────────────────────────
// Sessions are issued by the core. This app links out and comes back.

export const CentralAuth = {
  signInUrl(returnTo: string): string {
    const u = new URL(`https://${CENTRAL_DOMAIN}/api/auth/sso`);
    u.searchParams.set("redirect", returnTo);
    return u.toString();
  },
  accountUrl(): string {
    return `https://${CENTRAL_DOMAIN}/account`;
  },
};

// ─── SUPPORT & CRM ───────────────────────────────────────────────────────────

export const CentralSupport = {
  async createTicket(
    accessToken: string,
    subject: string,
    message: string,
    metadata?: Record<string, unknown>,
  ): Promise<{ id: string }> {
    return call<{ id: string }>("/support/tickets", {
      method: "POST",
      accessToken,
      body: { subject, message, appId: APP_ID, metadata },
    });
  },
  helpUrl(): string {
    return `https://${CENTRAL_DOMAIN}/help`;
  },
};

export const CentralCrm = {
  /** Best-effort: a failed analytics write must never fail a user action. */
  async record(
    accessToken: string,
    event: string,
    properties?: Record<string, unknown>,
  ): Promise<void> {
    try {
      await call("/crm", {
        method: "POST",
        accessToken,
        body: { event, appId: APP_ID, properties },
        timeoutMs: 5_000,
      });
    } catch {
      /* swallowed on purpose */
    }
  },
};

// ─── IMAGE GENERATION ────────────────────────────────────────────────────────
// The core owns the model cascade and its cost law. This app describes what it
// wants; it does not choose a provider or hold a provider key.

export interface GeneratedImage { url: string; revisedPrompt?: string }

export const CentralImages = {
  async generate(
    accessToken: string,
    prompt: string,
    opts: { count?: number; size?: string } = {},
  ): Promise<GeneratedImage[]> {
    const d = await call<{ images?: GeneratedImage[]; url?: string; urls?: string[] }>(
      "/images/generate",
      {
        method: "POST",
        accessToken,
        body: {
          prompt,
          appId: APP_ID,
          count: opts.count ?? 1,
          size: opts.size ?? "1024x1024",
        },
        timeoutMs: 90_000,
      },
    );
    if (Array.isArray(d.images) && d.images.length) return d.images;
    if (Array.isArray(d.urls) && d.urls.length) return d.urls.map((url) => ({ url }));
    if (d.url) return [{ url: d.url }];
    throw new CentralServiceError("No image returned", 502, "empty_result");
  },
};

export const CentralServices = {
  auth: CentralAuth,
  credits: CentralCredits,
  payments: CentralPayments,
  support: CentralSupport,
  crm: CentralCrm,
  images: CentralImages,
  domain: CENTRAL_DOMAIN,
  apiBase: CENTRAL_API_BASE,
  appId: APP_ID,
};

export default CentralServices;
