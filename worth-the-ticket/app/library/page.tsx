"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Film, Star } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn, ratingStars, verdictEmoji, formatDate } from "@/lib/utils";
import type { Review } from "@/types";
import { GENRES, VERDICTS, VERDICT_COLORS } from "@/types";

export default function LibraryPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filtered, setFiltered] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [genreFilter, setGenreFilter] = useState("all");
  const [verdictFilter, setVerdictFilter] = useState("all");
  const [postedFilter, setPostedFilter] = useState("all");

  useEffect(() => {
    supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setReviews(data ?? []);
        setFiltered(data ?? []);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let result = reviews;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) => r.title.toLowerCase().includes(q) || r.genre?.toLowerCase().includes(q)
      );
    }
    if (genreFilter !== "all") result = result.filter((r) => r.genre === genreFilter);
    if (verdictFilter !== "all") result = result.filter((r) => r.verdict === verdictFilter);
    if (postedFilter === "posted") result = result.filter((r) => r.posted);
    if (postedFilter === "unposted") result = result.filter((r) => !r.posted);
    setFiltered(result);
  }, [search, genreFilter, verdictFilter, postedFilter, reviews]);

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Content Library</h1>
        <p className="text-gray-500 text-sm mt-0.5">{reviews.length} reviews total</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-600" />
          <Input
            placeholder="Search movies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={genreFilter} onValueChange={setGenreFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Genre" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Genres</SelectItem>
            {GENRES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={verdictFilter} onValueChange={setVerdictFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Verdict" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Verdicts</SelectItem>
            {VERDICTS.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={postedFilter} onValueChange={setPostedFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="posted">Posted</SelectItem>
            <SelectItem value="unposted">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="shimmer h-48 rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Film className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500">No reviews match your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((review) => (
            <Link key={review.id} href={`/reviews/${review.id}`}>
              <Card className="h-full hover:border-[#3a3a3a] transition-all cursor-pointer group">
                <CardContent className="p-4 flex flex-col h-full gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white group-hover:text-red-400 transition-colors truncate">
                        {review.title}
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {review.year && `${review.year} · `}{review.genre ?? "Unknown genre"}
                      </p>
                    </div>
                    {review.posted ? (
                      <span className="text-[10px] text-green-500 bg-green-500/10 border border-green-500/20 rounded-full px-2 py-0.5 shrink-0">
                        Posted
                      </span>
                    ) : (
                      <span className="text-[10px] text-gray-600 bg-[#1e1e1e] border border-[#2a2a2a] rounded-full px-2 py-0.5 shrink-0">
                        Draft
                      </span>
                    )}
                  </div>

                  {review.rating && (
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={cn(
                            "w-3.5 h-3.5",
                            s <= review.rating! ? "fill-amber-400 text-amber-400" : "text-gray-700"
                          )}
                        />
                      ))}
                    </div>
                  )}

                  {review.what_worked && (
                    <p className="text-xs text-gray-500 line-clamp-2 flex-1">{review.what_worked}</p>
                  )}

                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-[#2a2a2a]">
                    {review.verdict ? (
                      <Badge variant="verdict" className={cn("text-xs", VERDICT_COLORS[review.verdict])}>
                        {verdictEmoji(review.verdict)} {review.verdict}
                      </Badge>
                    ) : (
                      <span />
                    )}
                    <span className="text-xs text-gray-600">{formatDate(review.watch_date)}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
