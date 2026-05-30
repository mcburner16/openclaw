"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Film,
  Eye,
  TrendingUp,
  Star,
  PlusCircle,
  ArrowRight,
  Trophy,
  Clapperboard,
  BarChart,
  Lightbulb,
  Calendar,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatNumber, ratingStars, verdictEmoji, cn } from "@/lib/utils";
import type { Review, Analytics, DashboardStats } from "@/types";
import { VERDICT_COLORS } from "@/types";

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  accent?: "red" | "gold";
}) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
            <p
              className={cn(
                "text-3xl font-bold mt-1",
                accent === "gold" ? "text-amber-400" : accent === "red" ? "text-red-400" : "text-white"
              )}
            >
              {value}
            </p>
            {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
          </div>
          <div
            className={cn(
              "p-2.5 rounded-lg",
              accent === "gold" ? "bg-amber-500/10" : accent === "red" ? "bg-red-500/10" : "bg-[#2a2a2a]"
            )}
          >
            <Icon
              className={cn(
                "w-5 h-5",
                accent === "gold" ? "text-amber-400" : accent === "red" ? "text-red-400" : "text-gray-400"
              )}
            />
          </div>
        </div>
      </CardContent>
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 h-0.5",
          accent === "gold" ? "bg-amber-500/30" : accent === "red" ? "bg-red-500/30" : "bg-[#2a2a2a]"
        )}
      />
    </Card>
  );
}

export default function DashboardPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: reviewData } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      const { data: analyticsData } = await supabase.from("analytics").select("*");

      if (reviewData) {
        setReviews(reviewData);
        const allViews = (analyticsData ?? []).reduce((sum: number, a: Analytics) => sum + (a.views ?? 0), 0);
        const reviewCount = reviewData.length;

        const genreMap: Record<string, number> = {};
        const verdictMap: Record<string, number> = {};
        for (const r of reviewData) {
          if (r.genre) genreMap[r.genre] = (genreMap[r.genre] ?? 0) + 1;
          if (r.verdict) verdictMap[r.verdict] = (verdictMap[r.verdict] ?? 0) + 1;
        }
        const bestGenre = Object.entries(genreMap).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
        const bestVerdict = Object.entries(verdictMap).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

        setStats({
          totalReviews: reviewCount,
          totalViews: allViews,
          avgViewsPerPost: reviewCount > 0 ? Math.round(allViews / reviewCount) : 0,
          bestGenre,
          bestVerdict,
        });
      }
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Clapperboard className="w-6 h-6 text-red-500" />
            Command Center
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Your movie review hub</p>
        </div>
        <Button asChild>
          <Link href="/reviews/new">
            <PlusCircle className="w-4 h-4 mr-2" />
            New Review
          </Link>
        </Button>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="shimmer h-28 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard icon={Film} label="Total Reviews" value={String(stats?.totalReviews ?? 0)} accent="red" />
          <StatCard icon={Eye} label="Total Views" value={formatNumber(stats?.totalViews ?? 0)} accent="gold" />
          <StatCard
            icon={TrendingUp}
            label="Avg Views/Post"
            value={formatNumber(stats?.avgViewsPerPost ?? 0)}
          />
          <StatCard
            icon={Trophy}
            label="Best Genre"
            value={stats?.bestGenre ?? "—"}
            accent="gold"
          />
          <StatCard
            icon={Star}
            label="Top Verdict"
            value={stats?.bestVerdict ?? "—"}
            sub={stats?.bestVerdict ? verdictEmoji(stats.bestVerdict as any) : undefined}
          />
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Reviews */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Latest Reviews</h2>
            <Link href="/library" className="text-xs text-red-500 hover:text-red-400 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <div key={i} className="shimmer h-16 rounded-lg" />)
          ) : reviews.length === 0 ? (
            <Card className="p-8 text-center">
              <Film className="w-10 h-10 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No reviews yet.</p>
              <Button asChild className="mt-4" size="sm">
                <Link href="/reviews/new">Add your first review</Link>
              </Button>
            </Card>
          ) : (
            reviews.slice(0, 6).map((review) => (
              <Link key={review.id} href={`/reviews/${review.id}`}>
                <Card className="hover:border-[#3a3a3a] transition-all cursor-pointer group">
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-white text-sm truncate group-hover:text-red-400 transition-colors">
                          {review.title}
                        </p>
                        {review.year && (
                          <span className="text-xs text-gray-600 shrink-0">({review.year})</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {review.genre && (
                          <span className="text-xs text-gray-600">{review.genre}</span>
                        )}
                        {review.rating && (
                          <span className="text-xs text-amber-500">{ratingStars(review.rating)}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {review.verdict && (
                        <Badge
                          variant="verdict"
                          className={cn("text-xs", VERDICT_COLORS[review.verdict])}
                        >
                          {review.verdict}
                        </Badge>
                      )}
                      {review.posted ? (
                        <span className="text-[10px] text-green-500 bg-green-500/10 border border-green-500/20 rounded-full px-2 py-0.5">
                          Posted
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-600 bg-[#1e1e1e] border border-[#2a2a2a] rounded-full px-2 py-0.5">
                          Draft
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>

        {/* Recommended Actions */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Recommended Actions
          </h2>
          <Card>
            <CardContent className="p-4 space-y-3">
              {[
                {
                  icon: PlusCircle,
                  title: "Write a new review",
                  sub: "Keep your content flowing",
                  href: "/reviews/new",
                  accent: "red" as const,
                },
                {
                  icon: BarChart,
                  title: "Log analytics",
                  sub: "Track your performance",
                  href: "/analytics",
                  accent: "gold" as const,
                },
                {
                  icon: Lightbulb,
                  title: "Generate fresh ideas",
                  sub: "Beat creator's block",
                  href: "/ideas",
                  accent: undefined,
                },
                {
                  icon: Calendar,
                  title: "Plan your calendar",
                  sub: "Schedule upcoming posts",
                  href: "/calendar",
                  accent: undefined,
                },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <Link key={action.href} href={action.href}>
                    <div className="flex items-center gap-3 p-2.5 rounded-md hover:bg-[#1e1e1e] transition-colors group cursor-pointer">
                      <div
                        className={cn(
                          "p-1.5 rounded",
                          action.accent === "red"
                            ? "bg-red-500/10"
                            : action.accent === "gold"
                            ? "bg-amber-500/10"
                            : "bg-[#2a2a2a]"
                        )}
                      >
                        <Icon
                          className={cn(
                            "w-4 h-4",
                            action.accent === "red"
                              ? "text-red-400"
                              : action.accent === "gold"
                              ? "text-amber-400"
                              : "text-gray-400"
                          )}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white group-hover:text-red-400 transition-colors">
                          {action.title}
                        </p>
                        <p className="text-xs text-gray-600">{action.sub}</p>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-400 transition-colors" />
                    </div>
                  </Link>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

