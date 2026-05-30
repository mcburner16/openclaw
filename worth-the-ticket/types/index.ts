export type WatchType = "theater" | "streaming";
export type Verdict =
  | "Worth the Ticket"
  | "Stream It"
  | "Skip It"
  | "Wait for Sale";
export type CalendarStatus = "planned" | "posted" | "draft";

export interface Review {
  id: string;
  created_at: string;
  title: string;
  year: number | null;
  genre: string | null;
  watch_type: WatchType | null;
  platform: string | null;
  rating: number | null;
  verdict: Verdict | null;
  what_worked: string | null;
  what_didnt_work: string | null;
  theater_notes: string | null;
  spoiler_free: boolean;
  raw_thoughts: string | null;
  posted: boolean;
  watch_date: string | null;
}

export interface TikTokSlide {
  slide: number;
  text: string;
}

export interface GeneratedContent {
  id: string;
  review_id: string;
  created_at: string;
  tiktok_slides: TikTokSlide[] | null;
  tiktok_caption: string | null;
  instagram_caption: string | null;
  facebook_post: string | null;
  twitter_post: string | null;
  podcast_seed: string | null;
}

export interface Analytics {
  id: string;
  review_id: string;
  created_at: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  followers_gained: number;
  avg_watch_time: number | null;
  retention_notes: string | null;
}

export interface ContentCalendar {
  id: string;
  review_id: string | null;
  scheduled_date: string;
  status: CalendarStatus;
  notes: string | null;
  created_at: string;
  review?: Review;
}

export interface PostIdea {
  id: string;
  created_at: string;
  category: string | null;
  idea: string;
  used: boolean;
}

export interface ReviewWithContent extends Review {
  generated_content?: GeneratedContent[];
  analytics?: Analytics[];
}

export interface DashboardStats {
  totalReviews: number;
  totalViews: number;
  avgViewsPerPost: number;
  bestGenre: string | null;
  bestVerdict: string | null;
}

export const GENRES = [
  "Action",
  "Adventure",
  "Animation",
  "Comedy",
  "Crime",
  "Documentary",
  "Drama",
  "Fantasy",
  "Horror",
  "Musical",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Thriller",
  "Western",
  "Other",
] as const;

export const VERDICTS: Verdict[] = [
  "Worth the Ticket",
  "Stream It",
  "Skip It",
  "Wait for Sale",
];

export const VERDICT_COLORS: Record<Verdict, string> = {
  "Worth the Ticket": "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  "Stream It": "text-blue-400 bg-blue-400/10 border-blue-400/20",
  "Skip It": "text-red-400 bg-red-400/10 border-red-400/20",
  "Wait for Sale": "text-orange-400 bg-orange-400/10 border-orange-400/20",
};

export const STREAMING_PLATFORMS = [
  "Netflix",
  "Max",
  "Disney+",
  "Hulu",
  "Amazon Prime",
  "Apple TV+",
  "Peacock",
  "Paramount+",
  "Tubi",
  "Other",
] as const;
