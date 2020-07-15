// @flow
import express from "express";
import expressRateLimit from "express-rate-limit";
import expressSlowDown from "express-slow-down";
import { longCache, shortCache } from "./utils";
import routes from "./routes";
import { handleError } from "./helpers/error";

const PORT = 8000;

const app = express();

const rateLimit = expressRateLimit({
  windowMs: shortCache * 1000,
  max: 50,
});

const speedLimit = expressSlowDown({
  windowMs: shortCache * 1000,
  delayAfter: 10,
  delayMs: 100,
});

const cacheControl = (req, res, next) => {
  res.set("Cache-Control", `public, max-age=${longCache}`);
  next();
};

app.use(rateLimit, speedLimit, cacheControl);
app.use(routes);

app.use((err, req, res, next) => {
  handleError(err, res);
});

app.listen(PORT, () => {
  const version = process.env.npm_package_version || "broken";
  console.info(`Server listening on port ${PORT}. Version ${version}`);
});
