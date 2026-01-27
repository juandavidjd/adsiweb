import express from "express";
import os from "os";
import fs from "fs";
import path from "path";
import { exec } from "child_process";

const app = express();
const PORT = 8080;
const baseDir = "C:\\adsiweb";
app.use(express.static(baseDir));

app.get("/api/state", async (req, res) => {
  const cpu = os.loadavg()[0].toFixed(2);
  const mem = ((1 - os.freemem() / os.totalmem()) * 100).toFixed(1);
  const uptime = (os.uptime() / 60).toFixed(0);
  res.json({ cpu, mem, uptime, ts: new Date().toISOString() });
});

app.listen(PORT, () =>
  console.log(`🎛️ ADSI Sensory Dashboard activo en http://localhost:${PORT}/dashboard-pro.html`)
);
