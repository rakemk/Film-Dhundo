import { Router } from "express";
import { getTrending, searchMovies, getNewReleases, getMovieDetail, getSimilarMovies } from "../lib/tmdb";

const router = Router();

router.get("/movies/trending", async (req, res) => {
  const page = parseInt(String(req.query["page"] || "1"), 10);
  const platform = req.query["platform"] ? String(req.query["platform"]) : undefined;
  const result = await getTrending(page, platform);
  res.json(result);
});

router.get("/movies/search", async (req, res) => {
  const q = String(req.query["q"] || "");
  const page = parseInt(String(req.query["page"] || "1"), 10);
  if (!q) {
    res.status(400).json({ error: "Query required" });
    return;
  }
  const result = await searchMovies(q, page);
  res.json(result);
});

router.get("/movies/new-releases", async (req, res) => {
  const result = await getNewReleases();
  res.json(result);
});

router.get("/movies/:id", async (req, res) => {
  const id = parseInt(req.params["id"]!, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid movie ID" });
    return;
  }
  const movie = await getMovieDetail(id);
  res.json(movie);
});

router.get("/movies/:id/similar", async (req, res) => {
  const id = parseInt(req.params["id"]!, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid movie ID" });
    return;
  }
  const movies = await getSimilarMovies(id);
  res.json(movies);
});

export default router;
