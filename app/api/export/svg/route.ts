import { NextRequest, NextResponse } from 'next/server';

import { requireUser } from "@/lib/api/require-user";
import { createServerClient } from '@/lib/supabase/server';
import { optimize } from 'svgo';

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


export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { svgContent, projectId } = await req.json();

    const supabase = await createSupabaseServiceClient();
        // 2026-08-19: read the session from COOKIES via @supabase/auth-helpers or
    // @supabase/ssr. Sessions live in localStorage on this platform and nothing
    // writes a Supabase auth cookie, so this found no user and answered 401 to
    // EVERYONE - signed in or not. It never errored; it took the unauthenticated
    // path and looked like it worked. Same bug that broke 32 core routes.
    const _auth = await requireUser(req);
    if (!_auth.ok) return _auth.res;
    const user = { id: _auth.userId, email: _auth.email };

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const optimized = optimize(svgContent, {
      plugins: [
        'removeDoctype',
        'removeXMLProcInst',
        'removeComments',
        'removeMetadata',
        'removeEditorsNSData',
        'cleanupAttrs',
        'mergeStyles',
        'inlineStyles',
        'minifyStyles',
        'cleanupIds',
        'removeUselessDefs',
        'cleanupNumericValues',
        'convertColors',
        'removeUnknownsAndDefaults',
        'removeNonInheritableGroupAttrs',
        'removeUselessStrokeAndFill',
        'removeViewBox',
        'cleanupEnableBackground',
        'removeHiddenElems',
        'removeEmptyText',
        'convertShapeToPath',
        'moveElemsAttrsToGroup',
        'moveGroupAttrsToElems',
        'collapseGroups',
        'convertPathData',
        'convertTransform',
        'removeEmptyAttrs',
        'removeEmptyContainers',
        'mergePaths',
        'removeUnusedNS',
        'sortAttrs',
        'removeTitle',
        'removeDesc',
      ],
    });

    return NextResponse.json({
      svg: optimized.data,
      size: optimized.data.length,
    });
  } catch (error: any) {
    console.error('SVG export error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
