"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { Star, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Review, Analytics } from "@/types";

interface Recommendation {
  type: "do_more" | "avoid" | "opportunity" | "info";
  title: string;
  body: string;
  tags?: string[];
}

function buildRecommendations(
  reviews: Review[],
  analytics: Analytics[]
): Recommendation[] {
  if (reviews.length === 0) {
    return [
      {
        type: "info",
        title: "Add some reviews to get recommendations",
        body: "Once you have reviews and analytics data, this page will suggest what content performs best for you.",
      },
    ];
  }

  const recs: Recommendation[] = [];
  const analyticsMap = new Map(analytics.map((a) => [a.review_id, a]));

  // Genre performance
  const genreStats: Record<string, { views: number; count: number }> = {};
  for (const r of reviews) {
    const a = analyticsMap.get(r.id);
    const g = r.genre ?? "Other";
    if (!genreStats[g]) genreStats[g] = { views: 0, count: 0 };
    genreStats[g].views += a?.views ?? 0;
    genreStats[g].count++;
  }

  const sortedGenres = Object.entries(genreStats)
    .filter(([, v]) => v.count > 0)
    .map(([genre, { views, count }]) => ({ genre, avg: count > 0 ? views / count : 0 }))
    .sort((a, b) => b.avg - a.avg);

  if (sortedGenres.length >= 2 && sortedGenres[0].avg > 0) {
    recs.push({
      type: "do_more",
      title: `Double down on ${sortedGenres[0].genre}`,
      body: `Your ${sortedGenres[0].genre} reviews average ${Math.round(sortedGenres[0].avg).toLocaleString()} views — your best genre. Post more in this space.`,
      tags: [sortedGenres[0].genre],
    });
  }

  if (sortedGenres.length >= 2) {
    const worst = sortedGenres[sortedGenres.length - 1];
    if (worst.avg === 0 && worst.genre !== sortedGenres[0].genre) {
      recs.push({
        type: "avoid",
        title: `${worst.genre} isn't landing`,
        body: `Your ${worst.genre} posts have zero recorded views. Either stop posting in this genre, or try a different angle/hook.`,
        tags: [worst.genre],
      });
    }
  }

  // Verdict performance
  const verdictStats: Record<string, { views: number; count: number }> = {};
  for (const r of reviews) {
    const a = analyticsMap.get(r.id);
    const v = r.verdict ?? "None";
    if (!verdictStats[v]) verdictStats[v] = { views: 0, count: 0 };
    verdictStats[v].views += a?.views ?? 0;
    verdictStats[v].count++;
  }

  const sortedVerdicts = Object.entries(verdictStats)
    .filter(([, v]) => v.count > 0 && v.views > 0)
    .map(([verdict, { views, count }]) => ({ verdict, avg: views / count }))
    .sort((a, b) => b.avg - a.avg);

  if (sortedVerdicts.length > 0) {
    recs.push({
      type: "opportunity",
      title: `"${sortedVerdicts[0].verdict}" verdict posts perform best`,
      body: `Reviews with "${sortedVerdicts[0].verdict}" average ${Math.round(sortedVerdicts[0].avg).toLocaleString()} views. Lead with clear verdicts in your hooks.`,
    });
  }

  // Posting cadence
  const postedCount = reviews.filter((r) => r.posted).length;
  const unpostedCount = reviews.filter((r) => !r.posted).length;
  if (unpostedCount > 3) {
    recs.push({
      type: "opportunity",
      title: `You have ${unpostedCount} reviews ready to post`,
      body: `Don't let content sit in draft. Schedule them out in your calendar — even 1 post/week adds up.`,
    });
  }

  // High engagement
  const highEngagement = analytics
    .filter((a) => (a.likes + a.comments + a.shares) / Math.max(a.views, 1) > 0.05)
    .map((a) => reviews.find((r) => r.id === a.review_id))
    .filter(Boolean) as Review[];

  if (highEngagement.length > 0) {
    recs.push({
      type: "do_more",
      title: "Replicate your high-engagement formats",
      body: `${highEngagement.map((r) => r.title).slice(0, 3).join(", ")} had strong like/comment ratios. Study those hooks and repeat the format.`,
      tags: highEngagement.slice(0, 3).map((r) => r.genre ?? "").filter(Boolean),
    });
  }

  // Consistency tip
  if (reviews.length < 5) {
    recs.push({
      type: "info",
      title: "Post at least 10 reviews to find your groove",
      body: "You don't have enough data yet to spot real patterns. Keep posting consistently and check back here.",
    });
  }

  return recs;
}

const TYPE_STYLES = {
  do_more: { icon: TrendingUp, color: "text-green-400", bg: "bg-green-400/10 border-green-400/20" },
  avoid: { icon: AlertCircle, color: "text-red-400", bg: "bg-red-400/10 border-red-400/20" },
  opportunity: { icon: Star, color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20" },
  info: { icon: CheckCircle, color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20" },
};

const TYPE_LABELS = {
  do_more: "Do More",
  avoid: "Reconsider",
  opportunity: "Opportunity",
  info: "Insight",
};

export default function RecommendationsPage() {
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [{ data: reviews }, { data: analytics }] = await Promise.all([
        supabase.from("reviews").select("*"),
        supabase.from("analytics").select("*"),
      ]);
      setRecs(buildRecommendations(reviews ?? [], analytics ?? []));
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Star className="w-6 h-6 text-amber-400" />
          Recommendations
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">Data-driven actions based on your analytics</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="shimmer h-28 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {recs.map((rec, i) => {
            const { icon: Icon, color, bg } = TYPE_STYLES[rec.type];
            return (
              <Card key={i} className={`border ${bg}`}>
                <CardContent className="p-5">
                  <div className="flex gap-4">
                    <div className={`shrink-0 p-2 rounded-lg bg-[#1a1a1a]`}>
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-white text-sm">{rec.title}</h3>
                        <Badge variant="outline" className={`text-[10px] ${color} border-current`}>
                          {TYPE_LABELS[rec.type]}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-400 leading-relaxed">{rec.body}</p>
                      {rec.tags && rec.tags.length > 0 && (
                        <div className="flex gap-1.5 flex-wrap">
                          {rec.tags.map((tag) => (
                            <span key={tag} className="text-xs bg-[#2a2a2a] text-gray-400 rounded px-2 py-0.5">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
