"use client";
import { useEffect, useState } from "react";
import { Lightbulb, Loader2, Check, RefreshCw, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import type { PostIdea } from "@/types";

const CATEGORIES = [
  "Hills to Die On",
  "Overrated Picks",
  "Best Theater Experiences",
  "Underrated Gems",
  "Franchise Deep Dives",
  "Genre Debates",
  "Director Spotlights",
  "Sequel vs Original",
  "Hot Takes",
  "Crowd Reactions",
];

const CATEGORY_COLORS: Record<string, string> = {
  "Hills to Die On": "text-red-400 bg-red-400/10 border-red-400/20",
  "Overrated Picks": "text-orange-400 bg-orange-400/10 border-orange-400/20",
  "Best Theater Experiences": "text-amber-400 bg-amber-400/10 border-amber-400/20",
  "Underrated Gems": "text-green-400 bg-green-400/10 border-green-400/20",
  "Franchise Deep Dives": "text-blue-400 bg-blue-400/10 border-blue-400/20",
  "Genre Debates": "text-purple-400 bg-purple-400/10 border-purple-400/20",
  "Director Spotlights": "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
  "Sequel vs Original": "text-pink-400 bg-pink-400/10 border-pink-400/20",
  "Hot Takes": "text-red-400 bg-red-400/10 border-red-400/20",
  "Crowd Reactions": "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
};

export default function IdeasPage() {
  const { toast } = useToast();
  const [ideas, setIdeas] = useState<PostIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [category, setCategory] = useState(CATEGORIES[0]);

  useEffect(() => {
    supabase
      .from("post_ideas")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setIdeas(data ?? []);
        setLoading(false);
      });
  }, []);

  async function generate() {
    setGenerating(true);
    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category }),
      });
      if (!res.ok) throw new Error("Failed to generate");
      const { ideas: newIdeas } = await res.json();

      const inserts = newIdeas.map((idea: string) => ({ category, idea, used: false }));
      const { data } = await supabase.from("post_ideas").insert(inserts).select();
      setIdeas((prev) => [...(data ?? []), ...prev]);
      toast({ title: "5 new ideas generated!" });
    } catch (err) {
      toast({ title: "Generation failed", description: String(err), variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  }

  async function markUsed(id: string, used: boolean) {
    await supabase.from("post_ideas").update({ used: !used }).eq("id", id);
    setIdeas((prev) => prev.map((i) => (i.id === id ? { ...i, used: !used } : i)));
  }

  async function deleteIdea(id: string) {
    await supabase.from("post_ideas").delete().eq("id", id);
    setIdeas((prev) => prev.filter((i) => i.id !== id));
  }

  const unusedIdeas = ideas.filter((i) => !i.used);
  const usedIdeas = ideas.filter((i) => i.used);

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Lightbulb className="w-6 h-6 text-amber-400" />
          Daily Ideas
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">Beat creator's block with fresh post ideas</p>
      </div>

      {/* Generator */}
      <Card className="border-amber-500/20">
        <CardContent className="p-5">
          <div className="flex gap-3 flex-wrap">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="flex-1 min-w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={generate} disabled={generating} variant="gold">
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Generate 5 Ideas
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="shimmer h-16 rounded-lg" />
          ))}
        </div>
      ) : (
        <>
          {/* Unused ideas */}
          {unusedIdeas.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Fresh Ideas ({unusedIdeas.length})
              </h2>
              {unusedIdeas.map((idea) => (
                <Card key={idea.id} className="hover:border-[#3a3a3a] transition-all">
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className="flex-1 space-y-1.5">
                      {idea.category && (
                        <Badge
                          variant="verdict"
                          className={cn(
                            "text-[10px]",
                            CATEGORY_COLORS[idea.category] ?? "text-gray-400 bg-gray-400/10 border-gray-400/20"
                          )}
                        >
                          {idea.category}
                        </Badge>
                      )}
                      <p className="text-sm text-gray-200 leading-relaxed">{idea.idea}</p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => markUsed(idea.id, idea.used)}
                        title="Mark as used"
                        className="p-1.5 rounded hover:bg-green-500/10 text-gray-600 hover:text-green-400 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteIdea(idea.id)}
                        title="Delete"
                        className="p-1.5 rounded hover:bg-red-500/10 text-gray-600 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Used ideas */}
          {usedIdeas.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Used ({usedIdeas.length})
              </h2>
              {usedIdeas.map((idea) => (
                <Card key={idea.id} className="opacity-50">
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className="flex-1">
                      {idea.category && (
                        <p className="text-[10px] text-gray-600 mb-1">{idea.category}</p>
                      )}
                      <p className="text-sm text-gray-500 line-through">{idea.idea}</p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => markUsed(idea.id, idea.used)}
                        title="Mark as unused"
                        className="p-1.5 rounded hover:bg-[#2a2a2a] text-gray-700 hover:text-gray-400 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteIdea(idea.id)}
                        className="p-1.5 rounded hover:bg-red-500/10 text-gray-700 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {ideas.length === 0 && (
            <Card className="p-10 text-center">
              <Lightbulb className="w-10 h-10 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No ideas yet.</p>
              <p className="text-gray-600 text-xs mt-1">Pick a category and click Generate.</p>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
