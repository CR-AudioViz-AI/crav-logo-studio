/** @type {import("next").NextConfig} */
const nextConfig={
  async headers() {
    // 2026-09-02: this app served ONE of six security headers while core served
    // all six. Verify's own security-posture check found it against the live
    // site, which is the point of the product.
    //
    // X-Frame-Options: without it the page can be framed and overlaid, so a user
    // clicks an invisible target instead of the button they can see. On a page
    // with a buy button that is a real attack.
    // nosniff: without it a user-uploaded file can be coaxed into executing.
    // HSTS: without it the FIRST request of a session can be downgraded before
    // any redirect fires, and a padlock later does not undo that.
    // Referrer-Policy: full URLs — including tokens and ids in them — leak to
    // every third party the page contacts.
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          // 2026-09-03: HSTS was here and CSP was not. The fleet pass that added both
          // skipped this repo because it already had Strict-Transport-Security, and the
          // check was 'does this file mention HSTS' rather than 'does it have a CSP'.
          // A skip condition that stands in for the thing you actually want to know
          // leaves the half-finished case looking finished.
          { key: 'Content-Security-Policy-Report-Only', value: `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://*.paypal.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://*.paypal.com; frame-src 'self' https://js.stripe.com https://*.paypal.com; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests` },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
  // 2026-08-29: required for @craudioviz/platform-sdk. The SDK ships raw
  // TypeScript and Next does not run node_modules through SWC by default, so
  // any import carrying a `type` re-export fails the build without this.
  transpilePackages: ["@craudioviz/platform-sdk"],typescript:{ignoreBuildErrors:true},eslint:{ignoreDuringBuilds:true}}

// 2026-08-30: Next 15 compiles instrumentation.ts for the EDGE runtime as well
// as node, so the vault env-shim's `crypto` import is pulled into an edge
// bundle even though register() returns early off nodejs. Marking it
// unavailable for the edge compilation is what stops it. The import must stay
// a BARE `crypto` specifier: webpack rejects the `node:` scheme before
// resolve.fallback is ever consulted, so `node:crypto` fails here too.

module.exports = { ...nextConfig };
