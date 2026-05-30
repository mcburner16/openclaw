"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Copy,
  Check,
  Loader2,
  RefreshCw,
  Film,
  Tv,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { cn, ratingStars, formatDate, verdictEmoji } from "@/lib/utils";
import type { Review, GeneratedContent, TikTokSlide } from "@/types";
import { VERDICT_COLORS } from "@/types";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="p-1.5 rounded hover:bg-[#2a2a2a] transition-colors text-gray-500 hover:text-gray-300"
      title="Copy to clipboard"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function ContentBlock({ label, content }: { label: string; content: string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
        <CopyButton text={content} />
      </div>
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3">
        <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{content}</p>
      </div>
    </div>
  );
}

function TikTokSlides({ slides }: { slides: TikTokSlide[] }) {
  const allText = slides.map((s) => s.text).join("\n\n---\n\n");
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500 uppercase tracking-wider">4-Slide Script</p>
        <CopyButton text={allText} />
      </div>
      <div className="grid grid-cols-1 gap-2">
        {slides.map((slide) => (
          <div key={slide.slide} className="flex gap-3">
            <div className="shrink-0 w-8 h-8 rounded-full bg-red-600/20 border border-red-600/30 flex items-center justify-center">
              <span className="text-xs font-bold text-red-400">{slide.slide}</span>
            </div>
            <div className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3">
              <p className="text-sm text-gray-300 whitespace-pre-wrap">{slide.text}</p>
            </div>
            <CopyButton text={slide.text} />
          </div>
        ))}
      </div>
    </div>
  );
}


export default function ReviewDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();

  const [review, setReview] = useState<Review | null>(null);
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    async function load() {
      const [{ data: r }, { data: c }] = await Promise.all([
        supabase.from("reviews").select("*").eq("id", id).single(),
        supabase.from("generated_content").select("*").eq("review_id", id).maybeSingle(),
      ]);
      setReview(r);
      setContent(c);
      setLoading(false);
    }
    load();
  }, [id]);

  async function regenerate() {
    setRegenerating(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId: id }),
      });
      if (!res.ok) throw new Error("Failed");
      const { data: c } = await supabase
        .from("generated_content")
        .select("*")
        .eq("review_id", id)
        .maybeSingle();
      setContent(c);
      toast({ title: "Content regenerated!" });
    } catch {
      toast({ title: "Regeneration failed", variant: "destructive" });
    } finally {
      setRegenerating(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  if (!review) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Review not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/library")}>
          Back to Library
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-white truncate">{review.title}</h1>
            {review.year && <span className="text-gray-500 text-sm">({review.year})</span>}
            {review.verdict && (
              <Badge variant="verdict" className={cn(VERDICT_COLORS[review.verdict])}>
                {verdictEmoji(review.verdict)} {review.verdict}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
            {review.genre && <span>{review.genre}</span>}
            {review.rating && (
              <span className="text-amber-500">{ratingStars(review.rating)}</span>
            )}
            <span className="flex items-center gap-1">
              {review.watch_type === "theater" ? (
                <Film className="w-3 h-3" />
              ) : (
                <Tv className="w-3 h-3" />
              )}
              {review.platform ?? review.watch_type}
            </span>
            <span>{formatDate(review.watch_date)}</span>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={regenerate}
          disabled={regenerating}
        >
          {regenerating ? (
            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          )}
          Regenerate
        </Button>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Review Details */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              {review.what_worked && (
                <div>
                  <p className="text-xs text-green-500 font-medium uppercase tracking-wider mb-1.5">What Worked</p>
                  <p className="text-sm text-gray-300 leading-relaxed">{review.what_worked}</p>
                </div>
              )}
              {review.what_didnt_work && (
                <div>
                  <p className="text-xs text-red-500 font-medium uppercase tracking-wider mb-1.5">What Didn&apos;t Work</p>
                  <p className="text-sm text-gray-300 leading-relaxed">{review.what_didnt_work}</p>
                </div>
              )}
              {review.theater_notes && (
                <div>
                  <p className="text-xs text-amber-500 font-medium uppercase tracking-wider mb-1.5">Theater Notes</p>
                  <p className="text-sm text-gray-300 leading-relaxed">{review.theater_notes}</p>
                </div>
              )}
              {review.raw_thoughts && (
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1.5">Raw Thoughts</p>
                  <p className="text-sm text-gray-500 leading-relaxed italic">{review.raw_thoughts}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Generated Content */}
        <div className="lg:col-span-3">
          {!content ? (
            <Card className="p-8 text-center">
              <RefreshCw className="w-8 h-8 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No content generated yet.</p>
              <Button className="mt-4" onClick={regenerate} disabled={regenerating}>
                {regenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Generate Now
              </Button>
            </Card>
          ) : (
            <Tabs defaultValue="tiktok">
              <TabsList className="flex flex-wrap h-auto gap-1 p-1">
                <TabsTrigger value="tiktok">TikTok</TabsTrigger>
                <TabsTrigger value="instagram">Instagram</TabsTrigger>
                <TabsTrigger value="facebook">Facebook</TabsTrigger>
                <TabsTrigger value="twitter">X / Twitter</TabsTrigger>
                <TabsTrigger value="podcast">Podcast</TabsTrigger>
              </TabsList>

              <TabsContent value="tiktok" className="space-y-4 mt-4">
                {content.tiktok_slides && (
                  <TikTokSlides slides={content.tiktok_slides} />
                )}
                {content.tiktok_caption && (
                  <ContentBlock label="Caption" content={content.tiktok_caption} />
                )}
              </TabsContent>

              <TabsContent value="instagram" className="mt-4">
                {content.instagram_caption && (
                  <ContentBlock label="Caption" content={content.instagram_caption} />
                )}
              </TabsContent>

              <TabsContent value="facebook" className="mt-4">
                {content.facebook_post && (
                  <ContentBlock label="Post" content={content.facebook_post} />
                )}
              </TabsContent>

              <TabsContent value="twitter" className="mt-4">
                {content.twitter_post && (
                  <ContentBlock label="Tweet" content={content.twitter_post} />
                )}
              </TabsContent>

              <TabsContent value="podcast" className="mt-4">
                {content.podcast_seed && (
                  <ContentBlock label="Episode Opening" content={content.podcast_seed} />
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
}
