// src/lib/styles/tokens.ts

export const container = 'mx-auto w-full max-w-7xl px-5 md:px-10 lg:px-14';

export const section = 'w-full py-8 font-Poppins md:py-10 lg:py-14';
export const sectionTight = 'w-full py-4 font-Poppins md:py-6';
export const sectionAfterHero = 'w-full pt-6 pb-2 font-Poppins md:pt-8 md:pb-3';

export const h2 = 'font-serif text-[26px] leading-tight tracking-[-0.02em] text-zinc-900 sm:text-[30px] lg:text-[36px]';
export const h3 = 'font-serif text-[20px] leading-tight text-zinc-900 md:text-[22px]';
export const body = 'text-[13.5px] leading-relaxed text-zinc-500 md:text-[14.5px]';
export const eyebrow = 'text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-400';
export const label = 'text-[11px] font-medium uppercase tracking-[0.06em] text-zinc-400';

export const card = 'rounded-2xl border border-zinc-200/80 bg-white';
export const cardInteractive = `${card} transition-all duration-300 hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md`;
export const cardDark = 'rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-black ring-1 ring-white/5 sm:rounded-3xl';

export const btnPrimary =
    'group inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-6 py-3.5 text-[14px] font-semibold text-zinc-950 transition-all duration-200 hover:bg-amber-300 active:scale-[0.98]';
export const btnGhost = 'inline-flex items-center gap-1.5 text-[13px] font-medium text-zinc-600 transition-colors duration-200 hover:text-zinc-900';
export const iconBtn = 'flex h-9 w-9 items-center justify-center rounded-full text-zinc-500 transition-colors duration-300 hover:bg-zinc-100 hover:text-zinc-900';

export const chip = 'w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10.5px] font-medium uppercase tracking-[0.12em] text-zinc-400';

export const dateWrapper =
    'group relative flex min-h-12 items-center gap-2.5 rounded-xl bg-white px-3.5 transition-all duration-200 focus-within:ring-2 focus-within:ring-amber-400';
export const dateIcon = 'pointer-events-none shrink-0 text-zinc-500 transition-colors group-focus-within:text-zinc-900';
