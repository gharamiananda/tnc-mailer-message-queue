import app from "../src/app";

// Local dev only
if (process.env.NODE_ENV !== "production") {
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
}

export default app;