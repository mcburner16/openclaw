"use client";
import { useEffect, useState } from "react";
import { BarChart2, Loader2, Save } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { formatNumber } from "@/lib/utils";
import type { Review, Analytics } from "@/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface ReviewWithAnalytics extends Review {
  analytics: Analytics | null;
}

export default function AnalyticsPage() {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<ReviewWithAnalytics[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    views: "",
    likes: "",
    comments: "",
    shares: "",
    saves: "",
    followers_gained: "",
    avg_watch_time: "",
    retention_notes: "",
  });

  useEffect(() => {
    async function load() {
      const { data: reviewData } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });

      const { data: analyticsData } = await supabase.from("analytics").select("*");

      const analyticsMap = new Map(
        (analyticsData ?? []).map((a: Analytics) => [a.review_id, a])
      );

      setReviews(
        (reviewData ?? []).map((r: Review) => ({
          ...r,
          analytics: analyticsMap.get(r.id) ?? null,
        }))
      );
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    const review = reviews.find((r) => r.id === selectedId);
    if (review?.analytics) {
      const a = review.analytics;
      setForm({
        views: String(a.views ?? ""),
        likes: String(a.likes ?? ""),
        comments: String(a.comments ?? ""),
        shares: String(a.shares ?? ""),
        saves: String(a.saves ?? ""),
        followers_gained: String(a.followers_gained ?? ""),
        avg_watch_time: String(a.avg_watch_time ?? ""),
        retention_notes: a.retention_notes ?? "",
      });
    } else {
      setForm({ views: "", likes: "", comments: "", shares: "", saves: "", followers_gained: "", avg_watch_time: "", retention_notes: "" });
    }
  }, [selectedId, reviews]);

  async function save() {
    if (!selectedId) return;
    setSaving(true);
    try {
      const existing = reviews.find((r) => r.id === selectedId)?.analytics;
      const payload = {
        review_id: selectedId,
        views: parseInt(form.views) || 0,
        likes: parseInt(form.likes) || 0,
        comments: parseInt(form.comments) || 0,
        shares: parseInt(form.shares) || 0,
        saves: parseInt(form.saves) || 0,
        followers_gained: parseInt(form.followers_gained) || 0,
        avg_watch_time: parseFloat(form.avg_watch_time) || null,
        retention_notes: form.retention_notes || null,
      };

      if (existing) {
        await supabase.from("analytics").update(payload).eq("id", existing.id);
      } else {
        await supabase.from("analytics").insert(payload);
      }

      // Refresh
      const { data: analyticsData } = await supabase.from("analytics").select("*");
      const analyticsMap = new Map(
        (analyticsData ?? []).map((a: Analytics) => [a.review_id, a])
      );
      setReviews((prev) =>
        prev.map((r) => ({ ...r, analytics: analyticsMap.get(r.id) ?? null }))
      );

      toast({ title: "Analytics saved!" });
    } catch (err) {
      toast({ title: "Failed to save", description: String(err), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  // Chart data
  const chartData = reviews
    .filter((r) => r.analytics?.views)
    .sort((a, b) => (b.analytics?.views ?? 0) - (a.analytics?.views ?? 0))
    .slice(0, 8)
    .map((r) => ({
      name: r.title.length > 14 ? r.title.slice(0, 14) + "…" : r.title,
      views: r.analytics?.views ?? 0,
      likes: r.analytics?.likes ?? 0,
    }));

  const genreData = Object.entries(
    reviews.reduce<Record<string, { views: number; count: number }>>((acc, r) => {
      const g = r.genre ?? "Other";
      if (!acc[g]) acc[g] = { views: 0, count: 0 };
      acc[g].views += r.analytics?.views ?? 0;
      acc[g].count++;
      return acc;
    }, {})
  )
    .map(([genre, { views, count }]) => ({ genre, avgViews: count > 0 ? Math.round(views / count) : 0 }))
    .filter((d) => d.avgViews > 0)
    .sort((a, b) => b.avgViews - a.avgViews);

  const tooltipStyle = {
    backgroundColor: "#1e1e1e",
    border: "1px solid #2a2a2a",
    borderRadius: "6px",
    color: "#fff",
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <BarChart2 className="w-6 h-6 text-red-500" />
          Analytics
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">Track performance across all your reviews</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Entry Form */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Log Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label>Select Review</Label>
              <Select value={selectedId} onValueChange={setSelectedId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a review" />
                </SelectTrigger>
                <SelectContent>
                  {reviews.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.title} {r.year ? `(${r.year})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {[
              { key: "views", label: "Views" },
              { key: "likes", label: "Likes" },
              { key: "comments", label: "Comments" },
              { key: "shares", label: "Shares" },
              { key: "saves", label: "Saves" },
              { key: "followers_gained", label: "Followers Gained" },
              { key: "avg_watch_time", label: "Avg Watch Time (s)" },
            ].map(({ key, label }) => (
              <div key={key} className="space-y-1.5">
                <Label>{label}</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={(form as Record<string, string>)[key]}
                  onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                  disabled={!selectedId}
                />
              </div>
            ))}

            <div className="space-y-1.5">
              <Label>Retention Notes</Label>
              <Textarea
                placeholder="Drop off points, hooks that worked..."
                value={form.retention_notes}
                onChange={(e) => setForm((prev) => ({ ...prev, retention_notes: e.target.value }))}
                disabled={!selectedId}
                rows={2}
              />
            </div>

            <Button onClick={save} disabled={!selectedId || saving} className="w-full">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Analytics
            </Button>
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="lg:col-span-2 space-y-6">
          {chartData.length > 0 ? (
            <>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Top Performing Reviews (Views)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                      <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 11 }} />
                      <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} tickFormatter={formatNumber} />
                      <Tooltip contentStyle={tooltipStyle} formatter={(v) => [formatNumber(Number(v)), "Views"]} />
                      <Bar dataKey="views" fill="#dc2626" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {genreData.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Avg Views by Genre</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={genreData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                        <XAxis dataKey="genre" tick={{ fill: "#6b7280", fontSize: 11 }} />
                        <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} tickFormatter={formatNumber} />
                        <Tooltip contentStyle={tooltipStyle} formatter={(v) => [formatNumber(Number(v)), "Avg Views"]} />
                        <Bar dataKey="avgViews" fill="#d97706" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card className="p-12 text-center">
              <BarChart2 className="w-10 h-10 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No analytics data yet.</p>
              <p className="text-gray-600 text-xs mt-1">Select a review and log your performance numbers.</p>
            </Card>
          )}

          {/* Stats table */}
          {reviews.filter((r) => r.analytics).length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">All Logged Analytics</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[#2a2a2a]">
                      {["Movie", "Views", "Likes", "Comments", "Shares", "Saves"].map((h) => (
                        <th key={h} className="text-left py-2 pr-4 text-gray-500 font-medium">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reviews
                      .filter((r) => r.analytics)
                      .map((r) => (
                        <tr key={r.id} className="border-b border-[#1e1e1e] hover:bg-[#1a1a1a]">
                          <td className="py-2 pr-4 text-white font-medium max-w-[140px] truncate">
                            {r.title}
                          </td>
                          <td className="py-2 pr-4 text-amber-400">{formatNumber(r.analytics!.views)}</td>
                          <td className="py-2 pr-4 text-gray-400">{formatNumber(r.analytics!.likes)}</td>
                          <td className="py-2 pr-4 text-gray-400">{formatNumber(r.analytics!.comments)}</td>
                          <td className="py-2 pr-4 text-gray-400">{formatNumber(r.analytics!.shares)}</td>
                          <td className="py-2 pr-4 text-gray-400">{formatNumber(r.analytics!.saves)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
