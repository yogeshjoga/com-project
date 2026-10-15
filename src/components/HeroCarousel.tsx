"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { HeroSlide } from "@/lib/hero";
import { formatINR } from "@/lib/format";
import { ProductMedia } from "./ProductMedia";

const AUTOPLAY_MS = 6000;

const reducedMotion = {
  subscribe(cb: () => void) {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    mq.addEventListener("change", cb);
    return () => mq.removeEventListener("change", cb);
  },
  get: () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  server: () => true, // no autoplay until we know the visitor's preference
};

function Arrow({ dir }: { dir: "prev" | "next" }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={dir === "prev" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
    </svg>
  );
}

function Copy({ slide, light = false }: { slide: HeroSlide; light?: boolean }) {
  return (
    <div className="max-w-[34rem]">
      <p className="text-sm font-semibold text-signal">{slide.eyebrow}</p>
      <h2 className="mt-1 font-display text-[clamp(1.9rem,1rem+3.4vw,3.5rem)] font-semibold leading-[0.98]">{slide.title}</h2>
      <p className={`mt-2 hidden text-[1.0625rem] sm:block ${light ? "text-white/85" : "text-white/75"}`}>{slide.text}</p>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 sm:mt-5">
        <Link href={slide.cta.href} className="inline-flex h-11 items-center rounded-md bg-signal px-5 font-semibold text-ink hover:bg-signal-hover">
          {slide.cta.label}
        </Link>
        {slide.from ? (
          <p className="text-sm text-white/80">
            From <b className="text-base font-semibold text-white tabular">{formatINR(slide.from)}</b>
          </p>
        ) : null}
      </div>
    </div>
  );
}

function Slide({ slide, active, first }: { slide: HeroSlide; active: boolean; first: boolean }) {
  return (
    <div
      role="group"
      aria-roledescription="slide"
      aria-label={slide.title}
      // Slides that aren't showing can't be tabbed into or read out.
      inert={!active}
      className="relative h-[31rem] w-full shrink-0 snap-center overflow-hidden sm:h-[26rem] lg:h-[28rem] xl:h-[30rem] wide:h-[32rem]"
    >
      {slide.kind === "banner" ? (
        <>
          <Image
            src={slide.image.src}
            alt={slide.image.alt}
            fill
            priority={first}
            sizes="100vw"
            className="object-cover"
            style={{ objectPosition: slide.image.position }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/20 to-transparent" aria-hidden="true" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/10 to-transparent" aria-hidden="true" />
          <div className="relative mx-auto flex h-full max-w-[110rem] flex-col justify-end px-4 pb-28 lg:px-6">
            <Copy slide={slide} light />
          </div>
        </>
      ) : (
        <>
          <div
            className="absolute inset-0 bg-ink bg-[radial-gradient(ellipse_at_85%_15%,#1d527f_0%,transparent_55%),radial-gradient(ellipse_at_0%_100%,#123a5e_0%,transparent_60%)]"
            aria-hidden="true"
          />
          <div className="relative mx-auto grid h-full max-w-[110rem] grid-cols-[minmax(0,1fr)] content-center gap-4 px-4 pb-28 pt-6 sm:pt-0 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] md:items-center md:gap-8 lg:px-6">
            <Copy slide={slide} />
            <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
              {slide.items.map((p, i) => (
                <li key={p.id} className={i === 2 ? "hidden sm:block" : undefined}>
                  <Link href={`/product/${p.slug}`} className="group block rounded-lg bg-white p-2 text-ink shadow-lg shadow-black/20 sm:p-2.5">
                    <span className="relative block aspect-[4/3] overflow-hidden rounded-md bg-paper sm:aspect-square">
                      <ProductMedia
                        imageUrl={p.imageUrl}
                        art={p.art}
                        hue={p.hue}
                        alt=""
                        priority={first}
                        sizes="(min-width: 1024px) 14rem, (min-width: 640px) 30vw, 45vw"
                        className="size-full p-2 transition-transform duration-300 group-hover:scale-[1.04]"
                      />
                    </span>
                    <span className="mt-1.5 block truncate text-xs sm:line-clamp-2 sm:whitespace-normal sm:text-sm sm:leading-snug">{p.name}</span>
                    <span className="block text-sm font-semibold tabular sm:text-base">{formatINR(p.price)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const track = useRef<HTMLDivElement>(null);
  const indexRef = useRef(0);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true); // the visitor's play/pause choice
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const reduced = useSyncExternalStore(reducedMotion.subscribe, reducedMotion.get, reducedMotion.server);
  const n = slides.length;

  const go = useCallback(
    (i: number) => {
      const el = track.current;
      if (!el) return;
      const target = (i + n) % n;
      // Glide to a neighbouring slide; jump straight to a distant one instead of sliding past all of them.
      const near = Math.abs(target - indexRef.current) <= 1;
      el.scrollTo({ left: target * el.clientWidth, behavior: reduced || !near ? "auto" : "smooth" });
    },
    [n, reduced],
  );

  const onScroll = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== indexRef.current) {
      indexRef.current = i;
      setIndex(i);
    }
  }, []);

  // Advance on a timer, but never while someone is reading, pointing at or tabbing through a slide.
  useEffect(() => {
    if (!playing || hovered || focused || reduced || n < 2) return;
    const t = window.setInterval(() => {
      if (document.visibilityState === "visible") go(indexRef.current + 1);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(t);
  }, [playing, hovered, focused, reduced, n, go]);

  if (!n) return null;
  const autoplaying = playing && !reduced;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured offers"
      className="relative bg-ink text-white"
      onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={() => setFocused(false)}
      onTouchStart={() => setPlaying(false)}
    >
      <div
        ref={track}
        onScroll={onScroll}
        className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
        aria-live={autoplaying ? "off" : "polite"}
      >
        {slides.map((s, i) => (
          <Slide key={s.id} slide={s} active={i === index} first={i === 0} />
        ))}
      </div>

      {n > 1 ? (
        <>
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Previous slide"
            className="absolute left-3 top-1/2 hidden size-12 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink shadow-lg hover:bg-white md:grid lg:left-5"
          >
            <Arrow dir="prev" />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Next slide"
            className="absolute right-3 top-1/2 hidden size-12 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink shadow-lg hover:bg-white md:grid lg:right-5"
          >
            <Arrow dir="next" />
          </button>

          <div className="absolute inset-x-0 bottom-[4.25rem] flex justify-center">
            <div className="flex items-center gap-0.5 rounded-full bg-ink/70 px-2 py-0.5 backdrop-blur">
              <button
                type="button"
                onClick={() => setPlaying((v) => !v)}
                aria-label={autoplaying ? "Pause slideshow" : "Play slideshow"}
                className="grid size-8 place-items-center rounded-full text-white/90 hover:text-white"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  {autoplaying ? <path d="M6 4h4v16H6zM14 4h4v16h-4z" /> : <path d="M7 4l13 8-13 8z" />}
                </svg>
              </button>
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Go to slide ${i + 1}: ${s.title}`}
                  aria-current={i === index}
                  className="grid size-7 place-items-center"
                >
                  <span className={`block rounded-full transition-all ${i === index ? "h-2.5 w-6 bg-signal" : "size-2.5 bg-white/50 hover:bg-white/80"}`} />
                </button>
              ))}
            </div>
          </div>
        </>
      ) : null}
      <p className="sr-only" role="status">
        Slide {index + 1} of {n}
      </p>
    </section>
  );
}
