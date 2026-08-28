'use client';

import { useCallback, useMemo, useState } from 'react';
import { PageLayout } from '@/components/ToolShell';

const PANTONES: { name: string; hex: string }[] = [
  { name: 'Yellow C', hex: '#FEDD00' },
  { name: 'Yellow 012 C', hex: '#FFD700' },
  { name: 'Orange 021 C', hex: '#FE5000' },
  { name: 'Warm Red C', hex: '#F9423A' },
  { name: 'Red 032 C', hex: '#EF3340' },
  { name: 'Rubine Red C', hex: '#CE0058' },
  { name: 'Rhodamine Red C', hex: '#E10098' },
  { name: 'Pink C', hex: '#D62598' },
  { name: 'Purple C', hex: '#BB29BB' },
  { name: 'Violet C', hex: '#440099' },
  { name: 'Blue 072 C', hex: '#10069F' },
  { name: 'Reflex Blue C', hex: '#001489' },
  { name: 'Process Blue C', hex: '#0085CA' },
  { name: 'Cyan C', hex: '#00AEEF' },
  { name: 'Green C', hex: '#00AB84' },
  { name: 'Green 0921 C', hex: '#00A651' },
  { name: 'Warm Gray 1 C', hex: '#D7D2CB' },
  { name: 'Cool Gray 1 C', hex: '#D9D9D6' },
  { name: 'Cool Gray 9 C', hex: '#75787B' },
  { name: 'Black 6 C', hex: '#101820' },
  { name: 'Black C', hex: '#2D2926' },
  { name: 'White C', hex: '#FFFFFF' },
  { name: 'Pantone 185 C', hex: '#E4002B' },
  { name: 'Pantone 186 C', hex: '#C8102E' },
  { name: 'Pantone 187 C', hex: '#A6192E' },
  { name: 'Pantone 1955 C', hex: '#8A1538' },
  { name: 'Pantone 299 C', hex: '#0072CE' },
  { name: 'Pantone 300 C', hex: '#005EB8' },
  { name: 'Pantone 301 C', hex: '#004B87' },
  { name: 'Pantone 320 C', hex: '#009193' },
  { name: 'Pantone 321 C', hex: '#00847D' },
  { name: 'Pantone 328 C', hex: '#00594F' },
  { name: 'Pantone 330 C', hex: '#006747' },
  { name: 'Pantone 357 C', hex: '#004332' },
  { name: 'Pantone 361 C', hex: '#00843D' },
  { name: 'Pantone 368 C', hex: '#4B9C2B' },
  { name: 'Pantone 375 C', hex: '#7AC143' },
  { name: 'Pantone 381 C', hex: '#C4D600' },
  { name: 'Pantone 396 C', hex: '#D5D800' },
  { name: 'Pantone 7401 C', hex: '#F5D5A0' },
  { name: 'Pantone 7402 C', hex: '#F2CE9B' },
  { name: 'Pantone 7403 C', hex: '#F3C98B' },
  { name: 'Pantone 7549 C', hex: '#99C2C8' },
  { name: 'Pantone 7548 C', hex: '#6FA6AB' },
  { name: 'Pantone 7547 C', hex: '#35808A' },
  { name: 'Pantone 7546 C', hex: '#26606B' },
  { name: 'Pantone 7545 C', hex: '#1F4D57' },
  { name: 'Pantone 7544 C', hex: '#173C4C' },
  { name: 'Pantone 7543 C', hex: '#132C3A' },
  { name: 'Pantone 7542 C', hex: '#0D2B43' },
  { name: 'Pantone 420 C', hex: '#C8C8C8' },
  { name: 'Pantone 421 C', hex: '#B2B4B2' },
  { name: 'Pantone 422 C', hex: '#9D9FA2' },
  { name: 'Pantone 423 C', hex: '#8A8D8F' },
  { name: 'Pantone 424 C', hex: '#77797C' },
  { name: 'Pantone 425 C', hex: '#63666A' },
  { name: 'Pantone 426 C', hex: '#42484F' },
  { name: 'Pantone 427 C', hex: '#DCDDDE' },
  { name: 'Pantone 428 C', hex: '#CFD0D0' },
  { name: 'Pantone 429 C', hex: '#C0C1C2' },
  { name: 'Pantone 430 C', hex: '#AFB1B2' },
  { name: 'Pantone 431 C', hex: '#9A9C9E' },
  { name: 'Pantone 432 C', hex: '#6F7273' },
  { name: 'Pantone 433 C', hex: '#565A5C' },
  { name: 'Pantone 434 C', hex: '#E4DCD3' },
  { name: 'Pantone 435 C', hex: '#DAD2CB' },
  { name: 'Pantone 436 C', hex: '#CAC3BC' },
  { name: 'Pantone 437 C', hex: '#B4AEA8' },
  { name: 'Pantone 438 C', hex: '#97928A' },
  { name: 'Pantone 439 C', hex: '#7E7871' },
  { name: 'Pantone 440 C', hex: '#65605B' },
  { name: 'Pantone 441 C', hex: '#DBD9D2' },
  { name: 'Pantone 442 C', hex: '#CDCAC4' },
  { name: 'Pantone 443 C', hex: '#BCB9B2' },
  { name: 'Pantone 444 C', hex: '#A4A19A' },
  { name: 'Pantone 445 C', hex: '#8B8880' },
  { name: 'Pantone 446 C', hex: '#6F6C64' },
  { name: 'Pantone 447 C', hex: '#5A574F' },
  { name: 'Pantone 448 C', hex: '#4A412A' },
  { name: 'Pantone 449 C', hex: '#6A5A31' },
  { name: 'Pantone 450 C', hex: '#7A6A3F' },
  { name: 'Pantone 451 C', hex: '#94885B' },
  { name: 'Pantone 452 C', hex: '#A79B70' },
  { name: 'Pantone 453 C', hex: '#C2B790' },
  { name: 'Pantone 454 C', hex: '#D3C8A6' },
  { name: 'Pantone 455 C', hex: '#9B7833' },
  { name: 'Pantone 456 C', hex: '#A8892F' },
  { name: 'Pantone 457 C', hex: '#B68C2E' },
  { name: 'Pantone 458 C', hex: '#CDAE41' },
  { name: 'Pantone 459 C', hex: '#D9C554' },
  { name: 'Pantone 460 C', hex: '#E7D988' },
  { name: 'Pantone 461 C', hex: '#F0E6A5' },
  { name: 'Pantone 462 C', hex: '#55361D' },
  { name: 'Pantone 463 C', hex: '#744D2C' },
  { name: 'Pantone 464 C', hex: '#8A5A2B' },
  { name: 'Pantone 465 C', hex: '#A66E3F' },
  { name: 'Pantone 466 C', hex: '#BF8C55' },
  { name: 'Pantone 467 C', hex: '#D3A564' },
  { name: 'Pantone 468 C', hex: '#E1BE7D' },
  { name: 'Pantone 469 C', hex: '#7D3F24' },
  { name: 'Pantone 470 C', hex: '#9B4722' },
  { name: 'Pantone 471 C', hex: '#AA4E22' },
  { name: 'Pantone 472 C', hex: '#C06A2F' },
  { name: 'Pantone 473 C', hex: '#D48A4E' },
  { name: 'Pantone 474 C', hex: '#E2AB6D' },
  { name: 'Pantone 475 C', hex: '#ECC896' },
  { name: 'Pantone 476 C', hex: '#4B3B2A' },
  { name: 'Pantone 477 C', hex: '#5B3D2E' },
  { name: 'Pantone 478 C', hex: '#6C4430' },
  { name: 'Pantone 479 C', hex: '#7E5239' },
  { name: 'Pantone 480 C', hex: '#91684B' },
  { name: 'Pantone 481 C', hex: '#A9835E' },
  { name: 'Pantone 482 C', hex: '#BE9B76' },
  { name: 'Pantone 483 C', hex: '#6B3B24' },
  { name: 'Pantone 484 C', hex: '#7C3524' },
  { name: 'Pantone 485 C', hex: '#DA291C' },
  { name: 'Pantone 486 C', hex: '#E27C62' },
  { name: 'Pantone 487 C', hex: '#EBA28A' },
  { name: 'Pantone 488 C', hex: '#F2C1A8' },
  { name: 'Pantone 489 C', hex: '#F6D5BE' },
  { name: 'Pantone 490 C', hex: '#4A2C2A' },
  { name: 'Pantone 491 C', hex: '#5E3A38' },
  { name: 'Pantone 492 C', hex: '#754C4C' },
  { name: 'Pantone 493 C', hex: '#99666A' },
  { name: 'Pantone 494 C', hex: '#B48386' },
  { name: 'Pantone 495 C', hex: '#CCA0A3' },
  { name: 'Pantone 496 C', hex: '#DFBEBE' },
  { name: 'Pantone 497 C', hex: '#4B2E24' },
  { name: 'Pantone 498 C', hex: '#5F3A2C' },
  { name: 'Pantone 499 C', hex: '#754832' },
  { name: 'Pantone 500 C', hex: '#955C4C' },
  { name: 'Pantone 501 C', hex: '#B3816C' },
  { name: 'Pantone 502 C', hex: '#CCA08A' },
  { name: 'Pantone 503 C', hex: '#E0C0AC' },
  { name: 'Pantone 504 C', hex: '#3F2226' },
  { name: 'Pantone 505 C', hex: '#55312E' },
  { name: 'Pantone 506 C', hex: '#6F3A3A' },
  { name: 'Pantone 507 C', hex: '#96595D' },
  { name: 'Pantone 508 C', hex: '#B47B7E' },
  { name: 'Pantone 509 C', hex: '#CB9A9B' },
  { name: 'Pantone 510 C', hex: '#DDB5B3' },
  { name: 'Pantone 511 C', hex: '#4F2452' },
  { name: 'Pantone 512 C', hex: '#5E275C' },
  { name: 'Pantone 513 C', hex: '#7D2E7F' },
  { name: 'Pantone 514 C', hex: '#9B5190' },
  { name: 'Pantone 515 C', hex: '#B878AA' },
  { name: 'Pantone 516 C', hex: '#CF9DBA' },
  { name: 'Pantone 517 C', hex: '#E1BFD0' },
  { name: 'Pantone 518 C', hex: '#3B2839' },
  { name: 'Pantone 519 C', hex: '#4E3454' },
  { name: 'Pantone 520 C', hex: '#6B3F73' },
  { name: 'Pantone 521 C', hex: '#8F5C93' },
  { name: 'Pantone 522 C', hex: '#A87DAC' },
  { name: 'Pantone 523 C', hex: '#C19EC2' },
  { name: 'Pantone 524 C', hex: '#D5BCD7' },
  { name: 'Pantone 525 C', hex: '#37274A' },
  { name: 'Pantone 526 C', hex: '#4A2D5C' },
  { name: 'Pantone 527 C', hex: '#62316E' },
  { name: 'Pantone 528 C', hex: '#8B63A8' },
  { name: 'Pantone 529 C', hex: '#AD90BC' },
  { name: 'Pantone 530 C', hex: '#C9B1D3' },
  { name: 'Pantone 531 C', hex: '#DFD2E6' },
  { name: 'Pantone 532 C', hex: '#263441' },
  { name: 'Pantone 533 C', hex: '#304656' },
  { name: 'Pantone 534 C', hex: '#365A75' },
  { name: 'Pantone 535 C', hex: '#5E7C96' },
  { name: 'Pantone 536 C', hex: '#8DA3B8' },
  { name: 'Pantone 537 C', hex: '#B4C5D4' },
  { name: 'Pantone 538 C', hex: '#CEDAE5' },
  { name: 'Pantone 539 C', hex: '#263C50' },
  { name: 'Pantone 540 C', hex: '#2B4B65' },
  { name: 'Pantone 541 C', hex: '#38637E' },
  { name: 'Pantone 542 C', hex: '#6286A8' },
  { name: 'Pantone 543 C', hex: '#9BB6CC' },
  { name: 'Pantone 544 C', hex: '#BFD2E2' },
  { name: 'Pantone 545 C', hex: '#D6E3EC' },
  { name: 'Pantone 546 C', hex: '#273A36' },
  { name: 'Pantone 547 C', hex: '#2B4A43' },
  { name: 'Pantone 548 C', hex: '#316050' },
  { name: 'Pantone 549 C', hex: '#6C8F86' },
  { name: 'Pantone 550 C', hex: '#9CB5A9' },
  { name: 'Pantone 551 C', hex: '#C0D3C7' },
  { name: 'Pantone 552 C', hex: '#DAE7E1' },
  { name: 'Pantone 553 C', hex: '#2A4A2C' },
  { name: 'Pantone 554 C', hex: '#336B3A' },
  { name: 'Pantone 555 C', hex: '#4D7C51' },
  { name: 'Pantone 556 C', hex: '#73A07B' },
  { name: 'Pantone 557 C', hex: '#9BC0A0' },
  { name: 'Pantone 558 C', hex: '#B8D1BA' },
  { name: 'Pantone 559 C', hex: '#D1E1D0' },
  { name: 'Pantone 560 C', hex: '#234B3C' },
  { name: 'Pantone 561 C', hex: '#2B6450' },
  { name: 'Pantone 562 C', hex: '#368068' },
  { name: 'Pantone 563 C', hex: '#75A58D' },
  { name: 'Pantone 564 C', hex: '#A6C6B6' },
  { name: 'Pantone 565 C', hex: '#C9DFD4' },
  { name: 'Pantone 566 C', hex: '#DCEBE2' },
  { name: 'Pantone 567 C', hex: '#1F4B38' },
  { name: 'Pantone 568 C', hex: '#286B4C' },
  { name: 'Pantone 569 C', hex: '#35845C' },
  { name: 'Pantone 570 C', hex: '#71AA82' },
  { name: 'Pantone 571 C', hex: '#A5CBAE' },
  { name: 'Pantone 572 C', hex: '#C8DFCF' },
  { name: 'Pantone 573 C', hex: '#DCECDF' },
  { name: 'Pantone 574 C', hex: '#3A5B28' },
  { name: 'Pantone 575 C', hex: '#4E7023' },
  { name: 'Pantone 576 C', hex: '#5E7C25' },
  { name: 'Pantone 577 C', hex: '#8CA846' },
  { name: 'Pantone 578 C', hex: '#B3C66A' },
  { name: 'Pantone 579 C', hex: '#CFDC99' },
  { name: 'Pantone 580 C', hex: '#E2E9C2' },
  { name: 'Pantone 581 C', hex: '#4D4B23' },
  { name: 'Pantone 582 C', hex: '#6A6520' },
  { name: 'Pantone 583 C', hex: '#8B8429' },
  { name: 'Pantone 584 C', hex: '#AAA832' },
  { name: 'Pantone 585 C', hex: '#C6C551' },
  { name: 'Pantone 586 C', hex: '#DAD66E' },
  { name: 'Pantone 587 C', hex: '#E8E49C' },
];

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = hex.match(/^#?([0-9a-f]{6})$/i);
  if (!m) return null;
  const v = parseInt(m[1], 16);
  return { r: (v >> 16) & 255, g: (v >> 8) & 255, b: v & 255 };
}

const toHex = (n: number) => n.toString(16).padStart(2, '0').toUpperCase();

function colorDistance(a: { r: number; g: number; b: number }, b: { r: number; g: number; b: number }): number {
  return Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2);
}

export default function HexToPantonePage() {
  const [hex, setHex] = useState('#336699');
  const [copied, setCopied] = useState(false);

  const rgb = useMemo(() => hexToRgb(hex), [hex]);

  const match = useMemo(() => {
    if (!rgb) return null;
    let best = PANTONES[0];
    let bestDist = Infinity;
    for (const p of PANTONES) {
      const prgb = hexToRgb(p.hex);
      if (!prgb) continue;
      const d = colorDistance(rgb, prgb);
      if (d < bestDist) {
        bestDist = d;
        best = p;
      }
    }
    return { pantone: best, distance: bestDist };
  }, [rgb]);

  const luminance = (r: number, g: number, b: number) => (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const textColor = rgb && luminance(rgb.r, rgb.g, rgb.b) > 0.6 ? '#000000' : '#ffffff';

  const copy = useCallback((s: string) => {
    navigator.clipboard.writeText(s).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    });
  }, []);

  return (
    <PageLayout title="Hex → Pantone Converter" description="Find the closest Pantone-style color to any hex value.">
      <div className="mx-auto max-w-xl space-y-5">
        <div className="flex items-center gap-4">
          <input
            type="color"
            value={hexToRgb(hex) ? hex : '#000000'}
            onChange={(e) => setHex(e.target.value)}
            className="h-14 w-20 cursor-pointer rounded-xl border border-neutral-200"
            aria-label="Pick a color"
          />
          <div className="flex-1">
            <label className="text-sm font-medium text-neutral-700">Hex Color</label>
            <input
              value={hex}
              onChange={(e) => setHex(e.target.value)}
              onBlur={() => { if (!hexToRgb(hex)) setHex('#000000'); }}
              placeholder="#RRGGBB"
              className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 font-mono text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {!hexToRgb(hex) && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">Enter a valid hex color, e.g. #336699.</div>
        )}

        {rgb && match && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 rounded-2xl border border-neutral-200/80 bg-white p-5">
              <div className="h-20 w-20 shrink-0 rounded-xl border border-neutral-200" style={{ backgroundColor: hex, color: textColor }} />
              <div className="min-w-0 flex-1">
                <div className="text-xs uppercase tracking-wide text-neutral-400">Your color</div>
                <div className="font-mono text-lg font-semibold text-neutral-900">{hex.toUpperCase()}</div>
                <div className="text-sm text-neutral-500">RGB {rgb.r}, {rgb.g}, {rgb.b}</div>
              </div>
              <button onClick={() => copy(hex.toUpperCase())} className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-50">
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <div className="flex items-center justify-center text-neutral-300">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-primary/30 bg-primary/5 p-5">
              <div className="h-20 w-20 shrink-0 rounded-xl border border-neutral-200" style={{ backgroundColor: match.pantone.hex }} />
              <div className="min-w-0 flex-1">
                <div className="text-xs uppercase tracking-wide text-primary/70">Closest match</div>
                <div className="text-lg font-semibold text-neutral-900">{match.pantone.name}</div>
                <div className="text-sm text-neutral-500">{match.pantone.hex} · ΔE≈{Math.round(match.distance)}</div>
              </div>
              <button onClick={() => copy(`${match.pantone.name} · ${match.pantone.hex}`)} className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-50">
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <div className="text-center text-xs text-neutral-400">
              Best match from {PANTONES.length} embedded Pantone-style swatches. Not an official Pantone product.
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}