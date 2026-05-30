import { openai, MODEL } from "./openai";
import type { Review, GeneratedContent, TikTokSlide } from "@/types";

function buildSystemPrompt(): string {
  return `You are a movie review content creator for the "Worth the Ticket?" brand.
Voice: first-person, honest, like a regular moviegoer talking to a friend. NOT a film critic. Short sentences. Direct. Conversational. Never use words like "cinematography", "auteur", "nuanced", "poignant", or film-school jargon.
Tone: real talk. Sometimes sarcastic. Sometimes enthusiastic. Always genuine.`;
}

function buildReviewContext(review: Review): string {
  return `Movie: ${review.title} (${review.year || "unknown year"})
Genre: ${review.genre || "unknown"}
Watch type: ${review.watch_type || "unknown"}${review.platform ? ` on ${review.platform}` : ""}
Rating: ${review.rating || "??"}/5
Verdict: ${review.verdict || "unknown"}
What worked: ${review.what_worked || "n/a"}
What didn't work: ${review.what_didnt_work || "n/a"}
Theater notes: ${review.theater_notes || "n/a"}
Raw thoughts: ${review.raw_thoughts || "n/a"}
Spoiler-free: ${review.spoiler_free ? "yes" : "no"}`;
}

export async function generateAllContent(
  review: Review
): Promise<Omit<GeneratedContent, "id" | "created_at" | "review_id">> {
  const system = buildSystemPrompt();
  const context = buildReviewContext(review);

  const prompt = `Based on this review, generate ALL of the following content. Return ONLY valid JSON matching the exact schema below. No extra text.

Review context:
${context}

Required JSON schema:
{
  "tiktok_slides": [
    {"slide": 1, "text": "..."},
    {"slide": 2, "text": "..."},
    {"slide": 3, "text": "..."},
    {"slide": 4, "text": "..."}
  ],
  "tiktok_caption": "...",
  "instagram_caption": "...",
  "facebook_post": "...",
  "twitter_post": "...",
  "podcast_seed": "..."
}

Rules:
- tiktok_slides[0]: "${review.title} (${review.year}) | ${review.rating}/5 ⭐ | Verdict: ${review.verdict}" — keep this exact format, maybe add a punchy hook line
- tiktok_slides[1]: "What Worked: ..." — 2-3 punchy sentences
- tiktok_slides[2]: "What Didn't: ..." — 2-3 punchy sentences
- tiktok_slides[3]: "Final Word: ..." — 1-2 sentences then "— ${review.verdict}"
- tiktok_caption: under 150 chars, hashtags at end, punchy hook
- instagram_caption: 3-5 sentences, conversational, 5-8 relevant hashtags
- facebook_post: 2-3 paragraphs, share-worthy, complete thoughts, no hashtags needed
- twitter_post: under 280 chars, punchy, includes verdict
- podcast_seed: 150-200 word monologue opening for a podcast episode about this movie, casual and engaging`;

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: system },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.8,
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) throw new Error("No content from AI");

  const parsed = JSON.parse(raw);

  return {
    tiktok_slides: parsed.tiktok_slides as TikTokSlide[],
    tiktok_caption: parsed.tiktok_caption,
    instagram_caption: parsed.instagram_caption,
    facebook_post: parsed.facebook_post,
    twitter_post: parsed.twitter_post,
    podcast_seed: parsed.podcast_seed,
  };
}

export async function generatePostIdeas(
  category: string
): Promise<string[]> {
  const system = buildSystemPrompt();

  const prompt = `Generate 5 fresh TikTok/social post ideas for the "Worth the Ticket?" movie review brand in the category: "${category}".

Return ONLY valid JSON:
{"ideas": ["idea 1", "idea 2", "idea 3", "idea 4", "idea 5"]}

Each idea should be a short, punchy concept (1-2 sentences). Think hooks, debate starters, opinion pieces, list formats.`;

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: system },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.9,
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) throw new Error("No content from AI");

  const parsed = JSON.parse(raw);
  return parsed.ideas as string[];
}
