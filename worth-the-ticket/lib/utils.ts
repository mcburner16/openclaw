import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Verdict } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function verdictEmoji(verdict: Verdict | null | undefined): string {
  switch (verdict) {
    case "Worth the Ticket":
      return "🎟️";
    case "Stream It":
      return "📺";
    case "Skip It":
      return "🚫";
    case "Wait for Sale":
      return "🕐";
    default:
      return "🎬";
  }
}

export function ratingStars(rating: number | null): string {
  if (!rating) return "—";
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return "★".repeat(full) + (half ? "½" : "") + "☆".repeat(empty);
}

export function truncate(text: string, len: number): string {
  if (text.length <= len) return text;
  return text.slice(0, len).trimEnd() + "…";
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
