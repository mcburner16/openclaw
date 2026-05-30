"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Loader2, Film, Tv } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { GENRES, STREAMING_PLATFORMS, VERDICTS } from "@/types";
import type { Verdict } from "@/types";

const VERDICT_META: Record<Verdict, { color: string; emoji: string }> = {
  "Worth the Ticket": { color: "border-yellow-500 bg-yellow-500/10 text-yellow-400", emoji: "🎟️" },
  "Stream It": { color: "border-blue-500 bg-blue-500/10 text-blue-400", emoji: "📺" },
  "Skip It": { color: "border-red-500 bg-red-500/10 text-red-400", emoji: "🚫" },
  "Wait for Sale": { color: "border-orange-500 bg-orange-500/10 text-orange-400", emoji: "🕐" },
};

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="text-2xl transition-all"
        >
          <Star
            className={cn(
              "w-6 h-6 transition-colors",
              (hover || value) >= star ? "fill-amber-400 text-amber-400" : "text-gray-700"
            )}
          />
        </button>
      ))}
    </div>
  );
}

export default function NewReviewPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    year: new Date().getFullYear(),
    genre: "",
    watch_type: "theater" as "theater" | "streaming",
    platform: "",
    rating: 0,
    verdict: "" as Verdict | "",
    what_worked: "",
    what_didnt_work: "",
    theater_notes: "",
    spoiler_free: true,
    raw_thoughts: "",
    watch_date: new Date().toISOString().split("T")[0],
  });

  const set = (key: string, value: unknown) => setForm((prev) => ({ ...prev, [key]: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      toast({ title: "Movie title required", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const { data: review, error } = await supabase
        .from("reviews")
        .insert({
          title: form.title,
          year: form.year || null,
          genre: form.genre || null,
          watch_type: form.watch_type,
          platform: form.platform || null,
          rating: form.rating || null,
          verdict: (form.verdict as Verdict) || null,
          what_worked: form.what_worked || null,
          what_didnt_work: form.what_didnt_work || null,
          theater_notes: form.theater_notes || null,
          spoiler_free: form.spoiler_free,
          raw_thoughts: form.raw_thoughts || null,
          watch_date: form.watch_date || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Generate AI content
      if (review) {
        setGenerating(true);
        try {
          const res = await fetch("/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reviewId: review.id }),
          });
          if (!res.ok) throw new Error("Generation failed");
        } catch {
          toast({
            title: "Review saved",
            description: "AI content generation failed — you can retry from the review page.",
            variant: "destructive",
          });
        }
      }

      toast({ title: "Review saved!", description: "Content generated successfully." });
      router.push(`/reviews/${review?.id}`);
    } catch (err) {
      toast({ title: "Failed to save", description: String(err), variant: "destructive" });
    } finally {
      setSaving(false);
      setGenerating(false);
    }
  }

  const isLoading = saving || generating;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">New Review</h1>
        <p className="text-gray-500 text-sm mt-0.5">Fill out the details — AI will generate all your content.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Movie Info */}
        <Card>
          <CardContent className="p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Movie Info</h3>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="title">Movie Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g. Dune: Part Two"
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  placeholder="2024"
                  min={1900}
                  max={2030}
                  value={form.year}
                  onChange={(e) => set("year", parseInt(e.target.value))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Genre</Label>
                <Select value={form.genre} onValueChange={(v) => set("genre", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select genre" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENRES.map((g) => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Watch Date</Label>
                <Input
                  type="date"
                  value={form.watch_date}
                  onChange={(e) => set("watch_date", e.target.value)}
                  className="[color-scheme:dark]"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Where You Watched */}
        <Card>
          <CardContent className="p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Where You Watched</h3>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => set("watch_type", "theater")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border text-sm font-medium transition-all",
                  form.watch_type === "theater"
                    ? "border-red-600 bg-red-600/10 text-red-400"
                    : "border-[#2a2a2a] bg-[#141414] text-gray-500 hover:border-[#3a3a3a]"
                )}
              >
                <Film className="w-4 h-4" />
                Theater
              </button>
              <button
                type="button"
                onClick={() => set("watch_type", "streaming")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border text-sm font-medium transition-all",
                  form.watch_type === "streaming"
                    ? "border-blue-600 bg-blue-600/10 text-blue-400"
                    : "border-[#2a2a2a] bg-[#141414] text-gray-500 hover:border-[#3a3a3a]"
                )}
              >
                <Tv className="w-4 h-4" />
                Streaming
              </button>
            </div>

            {form.watch_type === "streaming" ? (
              <div className="space-y-1.5">
                <Label>Platform</Label>
                <Select value={form.platform} onValueChange={(v) => set("platform", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {STREAMING_PLATFORMS.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label>Theater Name (optional)</Label>
                <Input
                  placeholder="e.g. AMC Lincoln Square"
                  value={form.platform}
                  onChange={(e) => set("platform", e.target.value)}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rating & Verdict */}
        <Card>
          <CardContent className="p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Rating & Verdict</h3>

            <div className="space-y-1.5">
              <Label>Rating</Label>
              <StarRating value={form.rating} onChange={(v) => set("rating", v)} />
            </div>

            <div className="space-y-1.5">
              <Label>Verdict</Label>
              <div className="grid grid-cols-2 gap-2">
                {VERDICTS.map((v) => {
                  const meta = VERDICT_META[v];
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => set("verdict", v)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all text-left",
                        form.verdict === v
                          ? meta.color
                          : "border-[#2a2a2a] bg-[#141414] text-gray-500 hover:border-[#3a3a3a]"
                      )}
                    >
                      <span>{meta.emoji}</span>
                      {v}
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* The Review */}
        <Card>
          <CardContent className="p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">The Review</h3>

            <div className="space-y-1.5">
              <Label htmlFor="what_worked">What Worked</Label>
              <Textarea
                id="what_worked"
                rows={3}
                placeholder="What made you love it, or at least appreciate it?"
                value={form.what_worked}
                onChange={(e) => set("what_worked", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="what_didnt_work">What Didn&apos;t Work</Label>
              <Textarea
                id="what_didnt_work"
                rows={3}
                placeholder="What let you down? Be honest."
                value={form.what_didnt_work}
                onChange={(e) => set("what_didnt_work", e.target.value)}
              />
            </div>

            {form.watch_type === "theater" && (
              <div className="space-y-1.5">
                <Label htmlFor="theater_notes">Theater Experience</Label>
                <Textarea
                  id="theater_notes"
                  rows={2}
                  placeholder="Crowd energy, sound system, worth the premium seats?"
                  value={form.theater_notes}
                  onChange={(e) => set("theater_notes", e.target.value)}
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="raw_thoughts">Raw Thoughts (private fuel for AI)</Label>
              <Textarea
                id="raw_thoughts"
                rows={4}
                placeholder="Dump everything here — unfiltered. This just guides the AI."
                value={form.raw_thoughts}
                onChange={(e) => set("raw_thoughts", e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between py-2 border-t border-[#2a2a2a]">
              <div>
                <p className="text-sm text-white">Spoiler-free content</p>
                <p className="text-xs text-gray-500">Keep generated content free of major spoilers</p>
              </div>
              <Switch
                checked={form.spoiler_free}
                onCheckedChange={(v) => set("spoiler_free", v)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-3 pb-6">
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {generating ? "Generating content…" : "Saving…"}
              </>
            ) : (
              "Save & Generate Content"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/")}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
