import { Router } from "express";
import { db } from "@workspace/db";
import { watchlistTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

const FREE_WATCHLIST_LIMIT = 5;

router.get("/watchlist", async (req, res) => {
  const userId = String(req.query["userId"] || "guest");
  const items = await db
    .select()
    .from(watchlistTable)
    .where(eq(watchlistTable.userId, userId))
    .orderBy(watchlistTable.addedAt);

  const mapped = items.map((item) => ({
    id: item.id,
    userId: item.userId,
    movieId: item.movieId,
    title: item.title,
    poster_path: item.posterPath,
    ott_platform: item.ottPlatform,
    slug: item.slug,
    addedAt: item.addedAt.toISOString(),
  }));

  res.json(mapped);
});

router.post("/watchlist", async (req, res) => {
  const { userId = "guest", movieId, title, poster_path, ott_platform, slug } = req.body;

  if (!movieId || !title) {
    res.status(400).json({ error: "movieId and title are required" });
    return;
  }

  const user = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.userId, userId))
    .limit(1);

  const isPremium = user[0]?.isPremium ?? false;

  if (!isPremium) {
    const existing = await db
      .select()
      .from(watchlistTable)
      .where(eq(watchlistTable.userId, userId));

    if (existing.length >= FREE_WATCHLIST_LIMIT) {
      res.status(400).json({
        error: "Watchlist limit reached. Premium lo aur unlimited movies save karo!",
        limitReached: true,
      });
      return;
    }
  }

  const alreadyAdded = await db
    .select()
    .from(watchlistTable)
    .where(and(eq(watchlistTable.userId, userId), eq(watchlistTable.movieId, Number(movieId))))
    .limit(1);

  if (alreadyAdded.length > 0) {
    const mapped = {
      id: alreadyAdded[0].id,
      userId: alreadyAdded[0].userId,
      movieId: alreadyAdded[0].movieId,
      title: alreadyAdded[0].title,
      poster_path: alreadyAdded[0].posterPath,
      ott_platform: alreadyAdded[0].ottPlatform,
      slug: alreadyAdded[0].slug,
      addedAt: alreadyAdded[0].addedAt.toISOString(),
    };
    res.status(201).json(mapped);
    return;
  }

  const [item] = await db
    .insert(watchlistTable)
    .values({
      userId: String(userId),
      movieId: Number(movieId),
      title: String(title),
      posterPath: poster_path || null,
      ottPlatform: ott_platform || "unknown",
      slug: slug || "",
    })
    .returning();

  res.status(201).json({
    id: item.id,
    userId: item.userId,
    movieId: item.movieId,
    title: item.title,
    poster_path: item.posterPath,
    ott_platform: item.ottPlatform,
    slug: item.slug,
    addedAt: item.addedAt.toISOString(),
  });
});

router.delete("/watchlist/:id", async (req, res) => {
  const id = parseInt(req.params["id"]!, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }
  await db.delete(watchlistTable).where(eq(watchlistTable.id, id));
  res.json({ success: true });
});

export default router;
