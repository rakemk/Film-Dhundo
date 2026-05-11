import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const watchlistTable = pgTable("watchlist", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  movieId: integer("movie_id").notNull(),
  title: text("title").notNull(),
  posterPath: text("poster_path"),
  ottPlatform: text("ott_platform").notNull().default("unknown"),
  slug: text("slug").notNull().default(""),
  addedAt: timestamp("added_at").notNull().defaultNow(),
});

export const insertWatchlistSchema = createInsertSchema(watchlistTable).omit({ id: true, addedAt: true });
export type InsertWatchlist = z.infer<typeof insertWatchlistSchema>;
export type WatchlistEntry = typeof watchlistTable.$inferSelect;
