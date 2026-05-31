"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalIcon,
  Loader2,
  X,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
} from "date-fns";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import type { ContentCalendar, Review } from "@/types";

const STATUS_STYLES = {
  planned: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  posted: "bg-green-500/20 text-green-400 border-green-500/30",
  draft: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

export default function CalendarPage() {
  const { toast } = useToast();
  const [current, setCurrent] = useState(new Date());
  const [entries, setEntries] = useState<ContentCalendar[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selected, setSelected] = useState<Date | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    review_id: "",
    status: "planned" as "planned" | "posted" | "draft",
    notes: "",
  });

  useEffect(() => {
    async function load() {
      const [{ data: calData }, { data: reviewData }] = await Promise.all([
        supabase.from("content_calendar").select("*, review:reviews(*)").order("scheduled_date"),
        supabase.from("reviews").select("*").order("title"),
      ]);
      setEntries(calData ?? []);
      setReviews(reviewData ?? []);
    }
    load();
  }, []);

  const monthStart = startOfMonth(current);
  const monthEnd = endOfMonth(current);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days: Date[] = [];
  let d = startDate;
  while (d <= endDate) {
    days.push(d);
    d = addDays(d, 1);
  }

  function getEntriesForDay(day: Date) {
    return entries.filter((e) => isSameDay(parseISO(e.scheduled_date), day));
  }

  async function saveEntry() {
    if (!selected) return;
    setSaving(true);
    try {
      await supabase.from("content_calendar").insert({
        scheduled_date: format(selected, "yyyy-MM-dd"),
        review_id: form.review_id || null,
        status: form.status,
        notes: form.notes || null,
      });

      const { data } = await supabase
        .from("content_calendar")
        .select("*, review:reviews(*)")
        .order("scheduled_date");
      setEntries(data ?? []);
      setShowForm(false);
      setForm({ review_id: "", status: "planned", notes: "" });
      toast({ title: "Entry added!" });
    } catch (err) {
      toast({ title: "Failed", description: String(err), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function deleteEntry(id: string) {
    await supabase.from("content_calendar").delete().eq("id", id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <CalIcon className="w-6 h-6 text-red-500" />
            Content Calendar
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Plan and track your posting schedule</p>
        </div>
        {selected && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            Add for {format(selected, "MMM d")}
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-4">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="icon" onClick={() => setCurrent(subMonths(current, 1))}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h2 className="font-semibold text-white">{format(current, "MMMM yyyy")}</h2>
            <Button variant="ghost" size="icon" onClick={() => setCurrent(addMonths(current, 1))}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center text-xs text-gray-600 font-medium py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-0.5">
            {days.map((day) => {
              const dayEntries = getEntriesForDay(day);
              const isCurrentMonth = isSameMonth(day, current);
              const isToday = isSameDay(day, new Date());
              const isSelected = selected && isSameDay(day, selected);

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelected(day)}
                  className={cn(
                    "min-h-[80px] p-1.5 rounded text-left transition-all border",
                    !isCurrentMonth && "opacity-30",
                    isToday ? "border-red-600/50 bg-red-600/5" : "border-transparent",
                    isSelected ? "border-red-600 bg-red-600/10" : "hover:bg-[#1a1a1a] hover:border-[#2a2a2a]"
                  )}
                >
                  <span
                    className={cn(
                      "text-xs font-medium block mb-1",
                      isToday ? "text-red-400" : isCurrentMonth ? "text-gray-300" : "text-gray-700"
                    )}
                  >
                    {format(day, "d")}
                  </span>
                  <div className="space-y-0.5">
                    {dayEntries.slice(0, 2).map((entry) => (
                      <div
                        key={entry.id}
                        className={cn(
                          "text-[9px] rounded px-1 py-0.5 truncate border",
                          STATUS_STYLES[entry.status]
                        )}
                      >
                        {(entry.review as unknown as Review)?.title ?? entry.notes ?? "Entry"}
                      </div>
                    ))}
                    {dayEntries.length > 2 && (
                      <div className="text-[9px] text-gray-600">+{dayEntries.length - 2} more</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected day entries */}
      {selected && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              {format(selected, "EEEE, MMMM d")}
            </h3>
            <Button size="sm" onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-1" /> Add Entry
            </Button>
          </div>

          {getEntriesForDay(selected).length === 0 ? (
            <p className="text-gray-600 text-sm">Nothing scheduled. Add an entry above.</p>
          ) : (
            getEntriesForDay(selected).map((entry) => (
              <Card key={entry.id}>
                <CardContent className="p-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-white font-medium">
                      {(entry.review as unknown as Review)?.title ?? "No movie linked"}
                    </p>
                    {entry.notes && <p className="text-xs text-gray-500 mt-0.5">{entry.notes}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-xs border rounded-full px-2 py-0.5 capitalize",
                        STATUS_STYLES[entry.status]
                      )}
                    >
                      {entry.status}
                    </span>
                    <button
                      onClick={() => deleteEntry(entry.id)}
                      className="text-gray-600 hover:text-red-400 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Add Entry Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">
                  Add Entry — {selected && format(selected, "MMM d, yyyy")}
                </h3>
                <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1.5">
                <Label>Link to Review (optional)</Label>
                <Select value={form.review_id} onValueChange={(v) => setForm((p) => ({ ...p, review_id: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a review" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No review</SelectItem>
                    {reviews.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.title} {r.year ? `(${r.year})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm((p) => ({ ...p, status: v as typeof form.status }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="posted">Posted</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Notes</Label>
                <Textarea
                  placeholder="Any notes for this slot..."
                  value={form.notes}
                  onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                  rows={2}
                />
              </div>

              <div className="flex gap-2 pt-1">
                <Button onClick={saveEntry} disabled={saving} className="flex-1">
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Save
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
