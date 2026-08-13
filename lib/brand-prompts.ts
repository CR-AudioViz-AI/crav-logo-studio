// lib/brand-prompts.ts — the brand toolkit's prompts
//
// Ported verbatim from the core platform's /apps/logo-studio on 2026-08-12 as
// part of consolidating two logo products into one. The prompts are the product
// here: they are what turns "make me a logo" into a brand a person can actually
// use. Rewriting them would have quietly changed the output customers get.
//
// CR AudioViz AI · EIN 39-3646201 · August 2026

export interface BrandInput {
  brandName: string;
  industry: string;
  description: string;
  audience: string;
  vibe: string;
  colorPref: string;
  keywords: string;
}

export type BrandTool =
  | "names" | "taglines" | "palette" | "fonts"
  | "logo_brief" | "guidelines" | "favicon" | "mission";

export const BRAND_TOOLS: ReadonlyArray<{
  id: BrandTool; label: string; desc: string;
}> = [
  { id: "names",      label: "Brand Name Ideas",  desc: "Name options with rationale and domain thinking" },
  { id: "taglines",   label: "Tagline Generator", desc: "Tagline options across four strategic angles" },
  { id: "palette",    label: "Color Palette",     desc: "Full colour system with hex codes and contrast ratios" },
  { id: "fonts",      label: "Font Pairing",      desc: "Primary, secondary and accent fonts with rationale" },
  { id: "logo_brief", label: "Logo Design Brief", desc: "A brief you can hand to a designer" },
  { id: "guidelines", label: "Brand Guidelines",  desc: "Voice, colour, type, logo usage, dos and don'ts" },
  { id: "favicon",    label: "Favicon Concepts",  desc: "Icon concepts that survive being 16 pixels wide" },
  { id: "mission",    label: "Mission & Values",  desc: "Mission, vision, values and positioning" },
];

export const INDUSTRIES: ReadonlyArray<string> = [
  "Technology / SaaS", "Healthcare", "Real Estate", "Finance / Fintech",
  "Marketing / Media", "Education", "Food & Beverage", "Retail / E-commerce",
  "Consulting", "Creative / Design", "Nonprofit", "Fitness / Wellness",
  "Legal", "Construction", "Travel / Hospitality", "Other",
];

export const BRAND_VIBES: ReadonlyArray<string> = [
  "Professional & Trustworthy", "Bold & Energetic", "Warm & Approachable",
  "Minimal & Modern", "Playful & Fun", "Luxurious & Premium",
  "Earthy & Sustainable", "Tech-Forward & Innovative", "Classic & Timeless",
];

export const BRAND_COLORS: ReadonlyArray<string> = [
  "Blue", "Green", "Red", "Orange", "Purple", "Yellow", "Black", "Teal",
];

function context(i: BrandInput): string {
  return `Brand: ${i.brandName || "the brand"}
Industry: ${i.industry}
Description: ${i.description || "a professional service business"}
Target audience: ${i.audience || "professionals and decision-makers"}
Brand vibe/personality: ${i.vibe}
Color preference: ${i.colorPref}
Keywords to consider: ${i.keywords || "professional, trustworthy, modern"}`;
}

export function buildBrandPrompt(tool: BrandTool, i: BrandInput): string {
  const c = context(i);
  switch (tool) {
    case "names":
      return `Generate 15 creative brand name ideas for the following:
${c}

For each name provide:
**[Name]**
- Type: (invented word / real word / compound / acronym / metaphor)
- Meaning/rationale: why this works for this brand
- Domain likelihood: is [name].com likely available?
- Pronunciation: any notes
- Strength: what makes it memorable

Group them: 5 Safe & Professional | 5 Bold & Memorable | 5 Creative & Unexpected
End with your top 3 picks and why.`;

    case "taglines":
      return `Generate 12 tagline options for:
${c}

Create 4 groups of 3:
**Problem-Solution Taglines** (focus on what you solve)
**Benefit Taglines** (focus on what you provide)
**Identity Taglines** (who you are as a brand)
**Provocative Taglines** (challenge assumptions)

For each: write the tagline, then one sentence on why it works.
End with your top 3 picks and the strategic reasoning.`;

    case "palette":
      return `Design a complete brand color palette for:
${c}

Provide:
## PRIMARY COLOR
Hex code, RGB, CMYK, Pantone equivalent (approximate), psychology

## SECONDARY COLOR
Same format

## ACCENT COLOR
Same format

## NEUTRAL COLORS (2-3)
Light and dark versions for backgrounds and text

## COLOR PSYCHOLOGY
Why these colors work for this brand and audience

## USAGE RULES
- Primary color: used for...
- Secondary: used for...
- Accent: used for...
- What to avoid

## ACCESSIBILITY
Contrast ratios for key color pairings (AA/AAA WCAG compliance)

## DARK MODE EQUIVALENTS
Adjusted versions for dark backgrounds`;

    case "fonts":
      return `Recommend a complete font pairing system for:
${c}

Provide:
## PRIMARY FONT (Headlines & Logo)
Name | Source (Google Fonts, Adobe Fonts, etc.) | Why it fits this brand
Character: 3 adjectives describing its personality

## SECONDARY FONT (Body Text)
Same format

## ACCENT FONT (Optional — quotes, callouts)
Same format (or say "not recommended for this brand")

## PAIRING RATIONALE
Why these fonts work together

## USAGE HIERARCHY
- Logo/primary headline: [size, weight]
- H1: [size, weight]
- H2: [size, weight]
- Body: [size, line height]
- Captions: [size]

## FREE ALTERNATIVES
Google Fonts options for each paid font recommendation

## WHAT TO AVOID
Font styles that clash with this brand's personality`;

    case "logo_brief":
      return `Write a complete logo design brief for:
${c}

Include:
## BRAND OVERVIEW
(2-3 sentences)

## LOGO STYLE
Recommend: wordmark / lettermark / icon + wordmark / abstract mark / emblem
Explain why this style fits the brand

## VISUAL DIRECTION
3 specific visual concepts with descriptions — what the designer should explore

## COLORS
Reference the brand palette or provide specific hex codes

## TYPOGRAPHY DIRECTION
Font personality, not specific fonts (let the designer choose)

## ICONS & SYMBOLS TO EXPLORE
5 specific icon directions with brief descriptions

## MOOD BOARD REFERENCES
5 existing logos to reference (style, not copy)

## WHAT TO AVOID
Clichés, overused elements in this industry

## DELIVERABLES TO REQUEST
Complete list of files and formats to ask for

## BUDGET GUIDANCE
What to pay for this quality of work (freelancer vs agency)`;

    case "guidelines":
      return `Create a complete mini brand guidelines document for:
${c}

Format as a real brand guide:

## BRAND FOUNDATION
Mission, vision, values (3-5 each)

## BRAND PERSONALITY
5 personality traits with "We are X, not Y" statements

## BRAND VOICE & TONE
How to write as this brand: 3-5 principles with examples
DO say: [examples]
DON'T say: [examples]

## VISUAL IDENTITY
Color palette (with hex codes)
Typography system
Logo usage rules (spacing, sizing, backgrounds)
Logo misuse examples (what never to do)

## PHOTOGRAPHY/IMAGERY STYLE
What images feel on-brand vs off-brand

## SOCIAL MEDIA VOICE
How tone adapts per platform: LinkedIn / Instagram / Twitter

## EMAIL SIGNATURE TEMPLATE
Formatted email signature text

## TAGLINE USAGE
Where to use the tagline, where not to`;

    case "favicon":
      return `Design favicon concepts for:
${c}

Provide 5 distinct favicon concepts:

For each concept:
**Concept [N]: [Name]**
- Visual element: exactly what appears in the 16x16 / 32x32 square
- Rationale: why this works at tiny size
- Color: primary and background color
- Simplicity test: what does it look like at 16x16?

Then:
## FAVICON DESIGN RULES
What makes a good favicon for this industry

## TECHNICAL SPECS
File formats, sizes, and how to implement in Next.js / HTML

## WHAT NOT TO DO
Common favicon mistakes`;

    case "mission":
      return `Write brand mission, vision, and core values for:
${c}

## MISSION STATEMENT (1-2 sentences)
What you do, for whom, and why it matters
Write 3 versions: short (under 10 words) / medium (1-2 sentences) / expanded (paragraph)

## VISION STATEMENT
Where you're going in 5-10 years — the world you're building toward
Write 2 versions

## CORE VALUES (5-7 values)
For each: value name | 1-sentence description | what it looks like in practice | what violating it looks like

## BRAND PURPOSE
The "why" behind everything — deeper than what you sell
(Think: Apple sells computers, but their purpose is challenging the status quo)

## POSITIONING STATEMENT
Template: For [target audience] who [have this need], [Brand] is the [category] that [key benefit] because [reason to believe].

## ELEVATOR PITCH VARIATIONS
15 seconds / 30 seconds / 60 seconds versions`;
  }
}

/** The image prompt used when generating an actual logo, not a document. */
export function buildLogoImagePrompt(i: BrandInput): string {
  return `Professional vector logo for "${i.brandName || "the brand"}", ` +
    `${i.industry} industry. Style: ${i.vibe}. Primary color ${i.colorPref}. ` +
    `${i.description ? `Concept: ${i.description}. ` : ""}` +
    `Clean, modern, minimal, iconic, centered on a plain white background, ` +
    `high contrast, scalable, no text unless the brand name reads clearly, ` +
    `suitable as a real company logo.`;
}
