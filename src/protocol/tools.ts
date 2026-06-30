import { imageTools } from "../image/index.js";
import { jpegTools } from "../jpeg/index.js";
import { audioTools } from "../audio/index.js";
import { textTools } from "../text/index.js";
import { fileTools } from "../file/index.js";
import { documentTools } from "../document/index.js";
import { cryptoTools } from "../crypto/index.js";
import { videoTools } from "../video/index.js";
import { gifTools } from "../gif/index.js";
import { networkTools } from "../network/index.js";
import { mp3Tools } from "../mp3/index.js";
import { jpegadvTools } from "../jpegadv/index.js";
import { spreadTools } from "../spread/index.js";
import { bpcsTools } from "../bpcs/index.js";
import { archiveTools } from "../archive/index.js";
import { createTools } from "../create/index.js";
import { qrcodeTools } from "../qrcode/index.js";

export const allTools = [
  ...imageTools,
  ...jpegTools,
  ...audioTools,
  ...textTools,
  ...fileTools,
  ...documentTools,
  ...cryptoTools,
  ...videoTools,
  ...gifTools,
  ...networkTools,
  ...mp3Tools,
  ...jpegadvTools,
  ...spreadTools,
  ...bpcsTools,
  ...archiveTools,
  ...createTools,
  ...qrcodeTools,
];
