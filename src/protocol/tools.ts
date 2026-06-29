import { imageTools } from "../image/index.js";
import { jpegTools } from "../jpeg/index.js";
import { audioTools } from "../audio/index.js";
import { textTools } from "../text/index.js";
import { fileTools } from "../file/index.js";
import { documentTools } from "../document/index.js";
import { cryptoTools } from "../crypto/index.js";

export const allTools = [
  ...imageTools,
  ...jpegTools,
  ...audioTools,
  ...textTools,
  ...fileTools,
  ...documentTools,
  ...cryptoTools,
];
