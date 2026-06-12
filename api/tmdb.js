module.exports = async function handler(req, res) {
  try {
    const path = req.query.path;

    if (!path || !path.startsWith("/")) {
      return res.status(400).json({ error: "Invalid TMDB path" });
    }

    const tmdbUrl = `https://api.themoviedb.org/3${path}`;

    const response = await fetch(tmdbUrl, {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.text();

    res.setHeader("Content-Type", "application/json");
    return res.status(response.status).send(data);
  } catch (error) {
    return res.status(500).json({ error: "TMDB proxy failed" });
  }
};
