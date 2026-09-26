import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import { getMetrics } from "./northbeam.js";
import creatorUploadRouter from "./routes/creatorUpload.js";
import adminRouter from "./routes/admin.js";
import creatorAuthRouter from "./routes/creatorAuth.js";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/api/creator", creatorUploadRouter);
app.use("/api/admin", adminRouter);
app.use("/api/creator-auth", creatorAuthRouter);

// Route to fetch creator metrics filtered by date range and code (dashboard data)
app.get(["/api/northbeam/metrics", "/api/metrics"], async (req, res) => {
  // Edge/CDN response caching header for Vercel and downstream proxies
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");

  try {
    const dateRange = (req.query.dateRange as string) || "7d";
    const creatorCode = (req.query.creatorCode as string) || "";
    const data = await getMetrics(creatorCode, dateRange);
    res.json(data);
  } catch (error: any) {
    console.error("Error in /api/northbeam/metrics:", error);
    const msg = error?.message || "Failed to fetch metrics";
    const isTimeout = msg.toLowerCase().includes("longer than usual") || msg.toLowerCase().includes("timed out");
    res.status(isTimeout ? 504 : 500).json({
      error: isTimeout ? "Northbeam is taking longer than usual to respond, please try again" : msg,
      retryable: true,
    });
  }
});

export default app;
