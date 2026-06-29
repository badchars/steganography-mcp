<p align="center">
  <a href="../../README.md">English</a> |
  <a href="README.zh.md">中文</a> |
  <strong>繁體中文</strong> |
  <a href="README.ko.md">한국어</a> |
  <a href="README.ja.md">日本語</a> |
  <a href="README.de.md">Deutsch</a> |
  <a href="README.es.md">Español</a> |
  <a href="README.fr.md">Français</a> |
  <a href="README.it.md">Italiano</a> |
  <a href="README.da.md">Dansk</a> |
  <a href="README.no.md">Norsk</a> |
  <a href="README.pl.md">Polski</a> |
  <a href="README.ru.md">Русский</a> |
  <a href="README.bs.md">Bosanski</a> |
  <a href="README.uk.md">Українська</a> |
  <a href="README.pt-BR.md">Português (BR)</a> |
  <a href="README.ar.md">العربية</a> |
  <a href="README.th.md">ไทย</a> |
  <a href="README.tr.md">Türkçe</a> |
  <a href="README.bn.md">বাংলা</a> |
  <a href="README.hi.md">हिन्दी</a> |
  <a href="README.el.md">Ελληνικά</a> |
  <a href="README.vi.md">Tiếng Việt</a>
</p>

<div align="center">
  <br>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="../banner-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="../banner-light.svg">
    <img alt="steganography-mcp" src="../banner-dark.svg" width="830">
  </picture>
</div>

<h3 align="center">專為 AI 代理打造的最全面隱寫術分析工具包。</h3>

<p align="center">
  LSB 偵測、卡方隱寫分析、RS 分析、DCT 鑑識、音訊隱寫術、零寬文字編碼、檔案鑑識、多格式檔案偵測、編碼識別 &mdash; 全部整合於單一 MCP 伺服器中。<br>
  <b>60 個工具。7 大類別。4 個相依套件。100% 離線運作。</b>無需 API 金鑰。所有工具均在本機執行。
</p>

<br>

<p align="center">
  <a href="#問題所在">問題所在</a> &bull;
  <a href="#有何不同">有何不同</a> &bull;
  <a href="#快速開始">快速開始</a> &bull;
  <a href="#ai-能做什麼">AI 能做什麼</a> &bull;
  <a href="#工具參考60-個工具">工具 (60)</a> &bull;
  <a href="#cli-用法">CLI 用法</a> &bull;
  <a href="#架構">架構</a> &bull;
  <a href="../../CONTRIBUTING.md">貢獻指南</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/steganography-mcp"><img src="https://img.shields.io/npm/v/steganography-mcp.svg" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/steganography-mcp"><img src="https://img.shields.io/npm/dm/steganography-mcp" alt="npm downloads"></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="License MIT"></a>
  <img src="https://img.shields.io/badge/node-%3E%3D18-brightgreen" alt="Node >= 18">
  <img src="https://img.shields.io/badge/MCP-Compatible-blueviolet" alt="MCP Compatible">
  <img src="https://img.shields.io/badge/tools-60-cyan" alt="60 Tools">
  <img src="https://img.shields.io/badge/API_keys-Zero-green" alt="Zero API Keys">
  <img src="https://img.shields.io/badge/TypeScript-strict-3178c6" alt="TypeScript strict">
  <a href="https://github.com/badchars/steganography-mcp"><img src="https://img.shields.io/github/stars/badchars/steganography-mcp" alt="GitHub stars"></a>
</p>

---

## 問題所在

隱寫術是一門將資料隱藏於表象之下的技術 &mdash; 藏在圖片、音訊檔案、文件甚至 Unicode 文字中。它被廣泛應用於 CTF 競賽、數位鑑識調查、隱蔽通訊通道以及惡意軟體酬載中。偵測隱寫術需要結合統計分析、格式特定解析、熵值測量和領域專業知識。

```
傳統隱寫術分析工作流程：
  偵測圖片隱寫              ->  zsteg + stegsolve（2 個工具，Ruby + Java）
  卡方分析                  ->  自訂 Python 腳本
  RS 分析                   ->  自訂 MATLAB/Python 程式碼
  JPEG DCT 鑑識             ->  stegdetect（2004 年已停止維護的 C 工具）
  擷取 LSB 資料             ->  zsteg + steghide + openstego（3 個工具）
  音訊隱寫術                ->  Audacity 手動操作 + 自訂腳本
  零寬字元偵測              ->  線上工具 + 手動檢查
  檔案鑑識 / binwalk        ->  binwalk + foremost + xxd（3 個工具）
  EXIF 中繼資料             ->  exiftool（Perl 相依套件）
  編碼偵測                  ->  CyberChef 網頁介面 + 手動猜測
  ─────────────────────────────────
  總計：10+ 個工具，5+ 種語言，數小時手動關聯
```

**steganography-mcp** 透過 [Model Context Protocol](https://modelcontextprotocol.io) 為你的 AI 代理提供橫跨 7 大類別的 60 個工具。代理可以執行圖片隱寫分析、JPEG 鑑識、音訊分析、文字隱寫偵測、檔案鑑識、文件分析和編碼識別 &mdash; 全部在一次對話中完成，100% 本機運作，完全不依賴外部服務。

```
使用 steganography-mcp：
  你：「分析這張 CTF 挑戰圖片中的隱藏資料」

  代理：-> img_detect：卡方 p=0.0001（偵測到 LSB 嵌入），
            RS 分析估算嵌入率 42%，右下區域存在熵值異常
         -> img_lsb_extract：從 RGB LSB 中擷取了 847 位元組
         -> crypto_detect：擷取的資料為 Base64 編碼
         -> crypto_decode：解碼結果為 "FLAG{hidden_in_plain_sight_2024}"
         -> img_known_tools：簽章匹配 OpenStego

         「該圖片包含使用 OpenStego 嵌入的 LSB 隱寫術。
          卡方檢定確認所有三個 RGB 通道中均存在 LSB 替換，
          嵌入率為 42%。隱藏酬載使用 Base64 編碼，
          解碼後得到 flag：
          FLAG{hidden_in_plain_sight_2024}」
```

---

## 有何不同

大多數隱寫術工具都是單一用途的公用程式。steganography-mcp 賦予你的 AI 代理**同時跨所有隱寫術技術進行推理**的能力。

<table>
<thead>
<tr>
<th></th>
<th>傳統方法</th>
<th>steganography-mcp</th>
</tr>
</thead>
<tbody>
<tr>
<td><b>介面</b></td>
<td>10+ 個 CLI 工具，5+ 種語言，網頁介面</td>
<td>MCP &mdash; AI 代理以對話方式呼叫工具</td>
</tr>
<tr>
<td><b>涵蓋範圍</b></td>
<td>一次只能用一種技術</td>
<td>7 大類別，60 個工具並行運作</td>
</tr>
<tr>
<td><b>圖片分析</b></td>
<td>zsteg（Ruby）、stegsolve（Java）、自訂腳本</td>
<td>代理同時執行卡方檢定、RS 分析、SPA、熵圖、直方圖、位元平面擷取、中繼資料和工具簽章偵測</td>
</tr>
<tr>
<td><b>JPEG 鑑識</b></td>
<td>stegdetect（已停止維護）、手動 DCT 檢查</td>
<td>代理分析 DCT 直方圖、雙重壓縮、量化表、EXIF 深度分析、縮圖比較、註解欄位</td>
</tr>
<tr>
<td><b>音訊隱寫</b></td>
<td>Audacity + 手動 LSB 腳本</td>
<td>代理執行 LSB 卡方檢定、頻譜分析、靜音區域 LSB 檢查、回聲隱藏偵測、中繼資料擷取</td>
</tr>
<tr>
<td><b>文字隱寫</b></td>
<td>線上工具、手動檢查</td>
<td>代理偵測零寬字元、空白編碼、不可見 Unicode、同形字、首字母隱藏 &mdash; 並可嵌入/擷取零寬字元訊息</td>
</tr>
<tr>
<td><b>相依套件</b></td>
<td>Ruby、Java、Perl、Python、C、網頁工具</td>
<td><code>npx -y steganography-mcp</code> &mdash; 4 個相依套件，純 TypeScript</td>
</tr>
<tr>
<td><b>API 金鑰</b></td>
<td>不適用（但工具鏈分散）</td>
<td>零。100% 離線，無外部呼叫</td>
</tr>
<tr>
<td><b>輸出</b></td>
<td>原始文字、圖片、手動關聯</td>
<td>結構化 JSON &mdash; AI 自動關聯發現結果</td>
</tr>
</tbody>
</table>

---

## 快速開始

### 方式一：npx（無需安裝）

```bash
npx -y steganography-mcp
```

全部 60 個工具即刻可用。無需 API 金鑰。無需設定。100% 離線運作。

### 方式二：bunx（更快）

```bash
bunx steganography-mcp
```

### 方式三：複製儲存庫

```bash
git clone https://github.com/badchars/steganography-mcp.git
cd steganography-mcp
bun install
```

### 連接到你的 AI 代理

<details open>
<summary><b>Claude Code</b></summary>

```bash
# 使用 npx
claude mcp add steganography -- npx -y steganography-mcp

# 使用本機複製
claude mcp add steganography -- bun run /path/to/steganography-mcp/src/index.ts
```

</details>

<details>
<summary><b>Claude Desktop</b></summary>

新增至 `~/Library/Application Support/Claude/claude_desktop_config.json`：

```json
{
  "mcpServers": {
    "steganography": {
      "command": "npx",
      "args": ["-y", "steganography-mcp"]
    }
  }
}
```

</details>

<details>
<summary><b>Cursor / Windsurf / 其他 MCP 用戶端</b></summary>

相同的 JSON 設定格式。將命令指向 `npx -y steganography-mcp` 或你的本機安裝路徑。

</details>

### 開始分析

```
你：「檢查這張圖片是否有隱藏資料」
```

就這麼簡單。代理會自動執行卡方分析、RS 分析、熵圖、中繼資料擷取、附加資料偵測和工具簽章掃描。

---

## AI 能做什麼

### CTF 挑戰求解器

```
你：「解決這道 CTF 隱寫術挑戰 — 圖片在 challenge.png」

代理：-> img_detect：卡方隱寫分析偵測到 LSB 嵌入
          （p=0.00012），RS 分析估算嵌入率 38%，
          區塊 (12,4)-(15,8) 存在熵值異常
       -> img_lsb_extract：從 RGB 通道 LSB 中擷取了 1,247 位元組
       -> crypto_detect：資料匹配 Base64 模式（信心度：0.95）
       -> crypto_decode："Q1RGe3N0M2cwX21hc3Rlcn0=" -> "CTF{st3g0_master}"
       -> img_known_tools：在 PNG 區塊中偵測到 OpenStego 簽章

       「找到 flag：CTF{st3g0_master}
        該圖片使用了由 OpenStego 嵌入的 LSB 隱寫術。
        酬載以 Base64 編碼儲存在 RGB 最低有效位元中，
        嵌入率為 38%。」
```

### 數位鑑識調查

```
你：「分析 suspect.png 和 suspect.wav 是否存在隱蔽通訊」

代理：-> img_detect：未偵測到 LSB 隱寫，但發現附加資料
          （PNG IEND 標記後有 12,847 位元組）
       -> file_identify：附加資料以 ZIP 簽章（PK）開頭
       -> img_metadata：PNG tEXt 區塊包含異常鍵 "comm"，
          值為 Base64 編碼
       -> audio_detect：WAV 檔案存在 LSB 卡方異常（p=0.003）
       -> audio_silence：偵測到 3 個具有活躍 LSB 的靜音段
       -> audio_lsb_extract：擷取了 2,048 位元組隱藏資料

       「兩個檔案都包含隱藏資料：
        1. suspect.png 在 PNG EOF 標記之後附加了一個 ZIP 封存檔，
           中繼資料中還有 Base64 編碼的訊息
        2. suspect.wav 包含 LSB 隱寫術，特別集中在靜音段 —
           這是蓄意隱藏的強力指標。
        建議擷取 ZIP 並分析 WAV 酬載。」
```

### 零寬字元偵測

```
你：「這封郵件看起來正常，但可能包含隱藏文字」

代理：-> text_detect：在可見字元之間偵測到 847 個零寬字元
       -> text_zwc_detect：發現 ZWSP（342）、ZWNJ（505），
          分佈在全文 127 個位置
       -> text_zwc_extract：二進位解碼結果為 "EXFIL-ROUTE-7"
       -> text_invisible_scan：在標頭區域發現 3 個額外的
          不可見 Unicode 字元（U+2060、U+FEFF）

       「該郵件包含用零寬字元編碼的隱藏訊息：'EXFIL-ROUTE-7'。
        847 個不可見字元分散在可見文字中，使用 ZWSP/ZWNJ
        二進位編碼。此外，在標頭發現了 3 個 Word Joiner 和
        BOM 字元 — 可能是中繼資料殘留。」
```

### JPEG 鑑識分析

```
你：「這張 JPEG 圖片是原圖還是被竄改過？」

代理：-> jpeg_structure：解析出 14 個標記，正常 JFIF 結構
       -> jpeg_double_compression：偵測到雙重壓縮 —
          區塊效應評分 0.73，量化異常比率 0.81
       -> jpeg_quantization：品質約 75（亮度），但殘餘模式
          表明原始品質約 92
       -> jpeg_exif_deep：EXIF 顯示 "iPhone 14 Pro"，但軟體
          欄位顯示 "Adobe Photoshop 25.0"
       -> jpeg_thumbnail_compare：縮圖尺寸與主圖片不匹配
          （縮圖：4032x3024，主圖片：2048x1536）

       「這張 JPEG 已被竄改。證據如下：
        1. 偵測到雙重壓縮 — 圖片被解碼後以更低品質重新編碼
           （原始約 92，目前約 75）
        2. EXIF 聲稱是 iPhone 14 Pro 拍攝，但軟體欄位暴露了
           Photoshop 編輯痕跡
        3. 縮圖來自原始 4032x3024 拍攝，但主圖片被縮放至
           2048x1536
        三項發現獨立證實了拍攝後的修改行為。」
```

---

## 工具參考（60 個工具）

### 類別概覽

| 類別 | 工具數 | 描述 |
|------|--------|------|
| [圖片隱寫分析](#-圖片隱寫分析14) | 14 | LSB 偵測、卡方檢定、RS 分析、熵圖、位元平面、直方圖、中繼資料、工具簽章 |
| [JPEG 分析](#-jpeg-分析7) | 7 | DCT 直方圖、雙重壓縮、量化表、EXIF 深度分析、縮圖鑑識、註解分析 |
| [音訊隱寫分析](#-音訊隱寫分析7) | 7 | WAV LSB 偵測、頻譜分析、靜音區域分析、回聲隱藏、中繼資料擷取 |
| [文字與 Unicode](#-文字與-unicode10) | 10 | 零寬字元、空白編碼、不可見 Unicode、同形字、首字母隱藏、Unicode 分析 |
| [檔案鑑識](#-檔案鑑識10) | 10 | 魔術位元組、多格式檔案偵測、嵌入檔案、附加資料、熵值、十六進位傾印、字串、檔頭 |
| [文件分析](#-文件分析5) | 5 | PDF 隱藏內容、PDF 中繼資料、PDF 串流、HTML 隱藏內容、XML 中繼資料 |
| [編碼與密碼](#-編碼與密碼7) | 7 | 編碼偵測、多格式解碼器、頻率分析、熵值、XOR 暴力破解、雜湊識別、密碼模式 |

---

<details open>
<summary><h3>圖片隱寫分析（14）</h3></summary>

| 工具 | 描述 |
|------|------|
| `img_detect` | 自動偵測圖片中的隱寫術。執行卡方檢定、RS 分析、熵值、中繼資料、附加資料和工具簽章檢查。傳回完整的 JSON 報告 |
| `img_lsb_detect` | 統計型 LSB 隱寫術偵測。對每個色彩通道獨立執行卡方檢定和樣本對分析 |
| `img_lsb_extract` | 從圖片 LSB 中擷取隱藏資料。從指定通道和位元平面擷取位元，嘗試 UTF-8 解碼，並顯示十六進位傾印 |
| `img_lsb_embed` | 使用 LSB 隱寫術將訊息嵌入圖片。讀取 PNG 檔案，將訊息嵌入最低有效位元，並寫入新的 PNG 檔案 |
| `img_bitplane` | 擷取並視覺化圖片通道的特定位元平面。顯示尺寸、1 位元百分比和 ASCII 藝術預覽 |
| `img_chi_square` | 對每個色彩通道獨立進行卡方隱寫分析攻擊。透過測試相鄰像素值對是否均等化來偵測 LSB 替換 |
| `img_rs_analysis` | 使用 Fridrich-Goljan-Du 方法的 RS（正規-奇異）隱寫分析。分析像素群組以估算每個通道的 LSB 嵌入率 |
| `img_histogram` | 產生帶有異常偵測的像素值直方圖。偵測指示 LSB 隱寫術的值對（PoV）異常 |
| `img_entropy_map` | 圖片的逐區塊熵值分析。將圖片分割成區塊並計算每區塊的 Shannon 熵，標記高熵區域 |
| `img_metadata` | 圖片的深度中繼資料擷取。PNG：文字區塊、區塊清單、IHDR 資訊。JPEG：EXIF、註解、量化表、標記清單 |
| `img_appended_data` | 偵測並擷取圖片 EOF 標記之後附加的資料。檢查 PNG IEND、JPEG EOI 或 BMP 檔案大小邊界之後的隱藏資料 |
| `img_compare` | 兩張圖片的逐像素比較。報告相同/不同像素數量、最大差異以及受影響的通道 |
| `img_channel_analysis` | R、G、B 和 A 通道的獨立統計分析。報告平均值、標準差、熵值、最小值、最大值和唯一值數量 |
| `img_known_tools` | 掃描圖片檔案位元組以匹配已知隱寫術工具簽章。與 OpenStego、Steghide、JSteg、F5 等工具的模式資料庫進行比對 |

</details>

<details>
<summary><h3>JPEG 分析（7）</h3></summary>

| 工具 | 描述 |
|------|------|
| `jpeg_structure` | 解析 JPEG 標記/段落及其偏移量和大小。顯示內部結構，包括所有標記、位置和段落長度 |
| `jpeg_dct_histogram` | 用於隱寫術偵測的 DCT 係數分佈分析。分析 Y 通道像素值分佈和 SOS 熵資料，以偵測 JSteg、F5 和 OutGuess 造成的異常 |
| `jpeg_double_compression` | 偵測 JPEG 雙重壓縮偽影。識別特徵性區塊效應和量化表異常 &mdash; 圖片竄改或隱寫嵌入的常見指標 |
| `jpeg_quantization` | 量化表分析與品質估算。以 8x8 網格格式顯示所有量化表並估算 JPEG 品質因子 |
| `jpeg_exif_deep` | 深度 EXIF 分析，包括 GPS 座標、時間戳記、軟體資訊、縮圖、製造商備註和所有 IFD 項目。標記鑑識相關欄位 |
| `jpeg_thumbnail_compare` | 將 EXIF 縮圖與 JPEG 主圖片進行比較。尺寸或內容不匹配表示拍攝後有修改 &mdash; 常見的鑑識痕跡 |
| `jpeg_comment` | 擷取並分析 JPEG COM（註解）標記。檢查隱藏資料模式、異常大的註解和高熵內容 |

</details>

<details>
<summary><h3>音訊隱寫分析（7）</h3></summary>

| 工具 | 描述 |
|------|------|
| `audio_detect` | 自動偵測 WAV 檔案中的音訊隱寫術。執行 LSB 卡方檢定、熵值分析、中繼資料檢查，並偵測附加資料 |
| `audio_lsb_detect` | PCM 取樣 LSB 統計分析。對按值對分組的 LSB 執行卡方檢定，以偵測 LSB 替換隱寫術 |
| `audio_lsb_extract` | 從音訊取樣中擷取 LSB 資料。讀取每個 PCM 取樣的最低有效位元並嘗試解碼隱藏資料 |
| `audio_spectrum` | WAV 音訊中隱藏訊號的頻譜分析。分析取樣值分佈、過零率、每區塊 RMS 能量，並偵測異常靜音段 |
| `audio_metadata` | 從 WAV 檔案中擷取中繼資料，包括 RIFF INFO 區塊、格式詳情和所有區塊資訊 |
| `audio_silence` | 分析 WAV 音訊中靜音段的隱藏資料。找到接近零取樣的區域並檢查其 LSB &mdash; 具有活躍 LSB 的靜音段是強力隱寫指標 |
| `audio_echo_detect` | 透過自相關分析進行回聲隱藏偵測。計算常見回聲延遲處的歸一化自相關。規律性回聲模式表明存在隱寫回聲隱藏 |

</details>

<details>
<summary><h3>文字與 Unicode（10）</h3></summary>

| 工具 | 描述 |
|------|------|
| `text_detect` | 自動偵測文字隱寫術。檢查零寬字元、空白編碼、不可見 Unicode、同形字和異常模式 |
| `text_zwc_detect` | 偵測文字中的零寬字元（ZWSP、ZWNJ、ZWJ、BOM）。報告位置、數量和潛在編碼訊息長度 |
| `text_zwc_extract` | 解碼零寬字元編碼的訊息。擷取零寬字元並進行二進位解碼：ZWSP=0，ZWNJ=1（嘗試兩種極性） |
| `text_zwc_embed` | 使用零寬字元將秘密訊息嵌入封面文字。將訊息編碼為二進位並將位元對映為 ZWSP(0)/ZWNJ(1) |
| `text_whitespace_detect` | 偵測文字中的空白編碼。檢查每行末尾的空白模式，其中空格=0、定位字元=1 可能編碼二進位資料 |
| `text_whitespace_extract` | 從文字中擷取空白編碼的訊息。讀取每行末尾的空白並解碼空格=0/定位字元=1 的二進位編碼 |
| `text_invisible_scan` | 掃描文字中所有不可見的 Unicode 字元。將每個字元與完整的不可見字元資料庫進行比對，報告位置和名稱 |
| `text_homoglyph` | 偵測文字中的 Unicode 同形字替換。識別視覺上類似 ASCII 字母的非 ASCII 字元（如西里爾字母 a 與拉丁字母 a） |
| `text_unicode_analysis` | 完整的 Unicode 字元分佈分析。按腳本區塊對所有字元進行分類，執行熵值分析，並偵測可疑的腳本混合 |
| `text_acrostic` | 偵測隱藏在文字各行中的首字母、首詞、末字母、末詞或第 n 個字元的模式（離合詩訊息） |

</details>

<details>
<summary><h3>檔案鑑識（10）</h3></summary>

| 工具 | 描述 |
|------|------|
| `file_identify` | 透過魔術位元組識別檔案類型。讀取檔頭並與已知檔案簽章的綜合資料庫進行匹配。檢查副檔名不匹配 |
| `file_polyglot` | 偵測同時可作為兩種或多種格式有效的多格式檔案。檢查不同偏移處的多個有效檔案簽章（PDF+ZIP、PNG+PDF 等） |
| `file_embedded` | 掃描二進位檔案中的嵌入檔案，類似於 binwalk。在每個偏移處搜尋已知魔術位元組簽章以發現隱藏或附加的檔案 |
| `file_appended` | 偵測檔案格式特定 EOF 標記之後附加的資料。支援 PNG (IEND)、JPEG (FFD9)、BMP、ZIP (EOCD) 和 PDF (%%EOF) |
| `file_entropy` | 逐段熵值分析。計算每區塊和整體的 Shannon 熵，標記異常的高熵段 |
| `file_entropy_visual` | 檔案的 ASCII 熵值視覺化。渲染基於文字的長條圖，顯示檔案各部分的熵值級別，用於視覺異常偵測 |
| `file_strings` | 從二進位檔案中擷取可列印和 Unicode 字串。掃描可列印字元序列並報告檔案偏移。支援 ASCII、UTF-8、UTF-16 |
| `file_hex` | 帶 ASCII 側欄的十六進位傾印。傳統的十六進位編輯器格式，包含偏移位址、十六進位位元組和可列印 ASCII 表示 |
| `file_header` | 已知格式的深度檔頭和結構分析。解析 PNG IHDR、JPEG SOF、BMP 資訊標頭、ZIP 本機檔頭和 PDF 版本/中繼資料 |
| `file_compare` | 兩個檔案的二進位差異比較。逐位元組比較並報告差異偏移、相同百分比，以及用於隱寫分析的僅 LSB 差異偵測 |

</details>

<details>
<summary><h3>文件分析（5）</h3></summary>

| 工具 | 描述 |
|------|------|
| `doc_pdf_hidden` | PDF 隱藏內容偵測。掃描 JavaScript、自動動作、OpenAction、隱藏註解、不可見文字、嵌入檔案和其他隱蔽內容 |
| `doc_pdf_metadata` | PDF 中繼資料擷取。解析 /Info 字典和 XMP 中繼資料區塊，用於鑑識歸因和文件溯源分析 |
| `doc_pdf_streams` | PDF 串流分析。定位所有 stream/endstream 區塊，嘗試 zlib 解壓縮，並報告大小和熵值以發現隱藏資料 |
| `doc_html_hidden` | HTML 隱藏內容偵測。掃描註解、display:none 元素、data-* 屬性、隱藏輸入、base64 內容、零尺寸元素和不可見文字 |
| `doc_xml_metadata` | XML 和 Office 文件中繼資料擷取。解析 Dublin Core、Microsoft Office 屬性、處理指令和其他中繼資料欄位 |

</details>

<details>
<summary><h3>編碼與密碼（7）</h3></summary>

| 工具 | 描述 |
|------|------|
| `crypto_detect` | 自動偵測輸入字串的編碼類型。針對所有已知模式進行測試（Base64、十六進位、二進位、摩爾斯、URL 編碼、HTML 實體等），按信心度排序傳回匹配結果 |
| `crypto_decode` | 多格式解碼器，支援 Base64、十六進位、二進位、十進位、八進位、URL 編碼、ROT13、Base32、摩爾斯電碼和 HTML 實體。自動模式會先偵測編碼 |
| `crypto_frequency` | 用於密碼分析的字元頻率分析。統計字元出現次數，與標準英語頻率（ETAOINSHRDLU）進行比較，並計算重合指數 |
| `crypto_entropy` | 字串的 Shannon 熵計算與分類。計算字元級和位元組級熵值，分類從重複資料到加密/隨機資料 |
| `crypto_xor` | 單位元組和多位元組金鑰的 XOR 暴力破解。嘗試所有 256 個單位元組金鑰並按英語文字機率評分。使用重合指數估算多位元組金鑰長度 |
| `crypto_hash_id` | 雜湊類型識別。根據長度和格式與已知雜湊模式進行匹配（MD5、SHA-1、SHA-256、SHA-512、bcrypt、CRC32、NTLM 等） |
| `crypto_patterns` | 已知密碼和編碼模式偵測。分析文字中的凱撒密碼、替換密碼、維吉尼亞密碼、柵欄密碼、Atbash 和反轉文字 |

</details>

---

## CLI 用法

```bash
# 顯示說明
npx -y steganography-mcp --help

# 列出所有 60 個工具及其描述
npx -y steganography-mcp --list

# 偵測圖片中的隱寫術
npx -y steganography-mcp --tool img_detect '{"file_path":"challenge.png"}'

# 從 LSB 中擷取隱藏訊息
npx -y steganography-mcp --tool img_lsb_extract '{"file_path":"stego.png"}'

# 卡方隱寫分析
npx -y steganography-mcp --tool img_chi_square '{"file_path":"suspect.png"}'

# RS 分析（Fridrich-Goljan-Du 方法）
npx -y steganography-mcp --tool img_rs_analysis '{"file_path":"suspect.png"}'

# JPEG 雙重壓縮偵測
npx -y steganography-mcp --tool jpeg_double_compression '{"file_path":"photo.jpg"}'

# 深度 EXIF 分析
npx -y steganography-mcp --tool jpeg_exif_deep '{"file_path":"photo.jpg"}'

# 音訊隱寫術偵測
npx -y steganography-mcp --tool audio_detect '{"file_path":"message.wav"}'

# 偵測零寬字元編碼
npx -y steganography-mcp --tool text_zwc_detect '{"text":"suspicious text here"}'

# 使用零寬字元嵌入隱藏訊息
npx -y steganography-mcp --tool text_zwc_embed '{"text":"cover text","message":"secret"}'

# 識別檔案類型和偵測多格式檔案
npx -y steganography-mcp --tool file_polyglot '{"file_path":"suspicious.pdf"}'

# 掃描嵌入檔案（類似 binwalk）
npx -y steganography-mcp --tool file_embedded '{"file_path":"mystery.bin"}'

# 熵值視覺化
npx -y steganography-mcp --tool file_entropy_visual '{"file_path":"data.bin"}'

# 自動偵測編碼
npx -y steganography-mcp --tool crypto_detect '{"input":"aGVsbG8gd29ybGQ="}'

# XOR 暴力破解
npx -y steganography-mcp --tool crypto_xor '{"input":"4f5243484e"}'

# 偵測密碼模式
npx -y steganography-mcp --tool crypto_patterns '{"input":"Gur dhvpx oebja sbk"}'

# 使用 Bun（啟動更快）
bunx steganography-mcp --tool img_detect '{"file_path":"image.png"}'
```

---

## 應用情境

### CTF 競賽
解決搶旗競賽中的隱寫術挑戰。AI 代理可以系統性地應用所有偵測技術 &mdash; LSB 分析、中繼資料檢查、附加資料、編碼偵測和密碼識別 &mdash; 在圖片、音訊檔案、文件和文字中尋找隱藏的 flag。

### 數位鑑識
在鑑識調查中偵測隱蔽通訊通道。使用統計隱寫分析（卡方檢定、RS 分析）分析可疑檔案中的隱藏資料，檢查 EOF 標記後附加的資料，掃描嵌入檔案，識別隱寫術工具簽章。

### 安全研究
分析隱寫術工具和技術。逐像素比較原始圖片和隱寫圖片，研究 JPEG 隱寫中的 DCT 係數分佈，測量嵌入造成的熵值變化，逆向工程編碼方案。

### 教育
學習隱寫術技術的運作原理。嵌入和擷取 LSB 訊息，使用零寬字元編碼文字，視覺化位元平面和熵圖，使用十六進位傾印分析檔案結構，使用頻率分析研究密碼模式。

### 事件回應
在事件回應過程中，檢查文件和圖片中的隱藏資料外洩通道。掃描 PDF 中的隱藏 JavaScript 和嵌入檔案，偵測郵件中的零寬字元編碼，識別多格式檔案，分析可疑編碼。

---

## 架構

```
src/
  index.ts                    # CLI 進入點（--help、--list、--tool、stdio 伺服器）
  protocol/
    mcp-server.ts             # MCP 伺服器設定（stdio 傳輸）
    tools.ts                  # 工具註冊表 — 所有 60 個工具在此組裝
  types/
    index.ts                  # 共用類型（ToolDef、ToolContext、ToolResult）
  utils/
    binary.ts                 # 二進位檔案讀取、十六進位傾印、格式偵測
    stats.ts                  # Shannon 熵、卡方檢定、位元組頻率
    cache.ts                  # TTL 快取
    png-parser.ts             # 純 TS PNG 解析器（IHDR、區塊、像素資料）
    jpeg-parser.ts            # 純 TS JPEG 解析器（標記、EXIF、量化）
    wav-parser.ts             # 純 TS WAV 解析器（RIFF 區塊、PCM 取樣）
    bmp-parser.ts             # 純 TS BMP 解析器（檔頭、像素資料）
  image/                      # 圖片隱寫分析工具（14）
  jpeg/                       # JPEG 分析工具（7）
  audio/                      # 音訊隱寫分析工具（7）
  text/                       # 文字與 Unicode 工具（10）
  file/                       # 檔案鑑識工具（10）
  document/                   # 文件分析工具（5）
  crypto/                     # 編碼與密碼工具（7）
  data/
    encoding-patterns.ts      # 編碼正規表達式模式 + 解碼器
    magic-bytes.ts            # 檔案簽章資料庫（100+ 種格式）
    stego-signatures.ts       # 已知隱寫術工具簽章
    unicode-invisible.ts      # 不可見 Unicode 字元資料庫
```

**設計決策：**

- **4 個相依套件，僅此而已** &mdash; `@modelcontextprotocol/sdk` 用於 MCP 協定，`zod` 用於輸入驗證，`pngjs` 用於 PNG 像素存取，`jpeg-js` 用於 JPEG 解碼。沒有臃腫的相依樹。沒有原生模組。沒有 C 繫結。沒有 Python。沒有 Java。
- **100% 離線** &mdash; 所有工具完全在本機執行。無 HTTP 請求。無 API 呼叫。無遙測。無雲端相依。你的檔案永遠不會離開你的機器。
- **純 TypeScript 統計分析** &mdash; 卡方檢定、RS 分析（Fridrich-Goljan-Du）、樣本對分析、Shannon 熵、重合指數和頻率分析均以純 TypeScript 實作。無外部數學函式庫。
- **自訂格式解析器** &mdash; PNG 區塊、JPEG 標記/EXIF/量化表、WAV RIFF 區塊和 BMP 檔頭均使用 `utils/` 解析器以零外部相依進行解析。這使得通用函式庫無法提供的格式特定深度分析成為可能。
- **7 個提供者，1 個伺服器** &mdash; 每個分析類別都是獨立的模組。AI 代理根據調查脈絡選擇使用哪些工具。
- **統一的 ToolDef 模式** &mdash; 每個工具都遵循相同的 `{ name, description, schema, execute }` 模式。新增工具只需在相應模組中建立一個物件。
- **每個欄位都有 Zod 驗證** &mdash; 每個 schema 欄位都有 `.describe()` 為 AI 代理提供脈絡。無效輸入在執行前被捕獲，並提供清晰的錯誤訊息。

---

## MCP 安全套件

| 專案 | 領域 | 工具數 |
|------|------|--------|
| [hackbrowser-mcp](https://github.com/badchars/hackbrowser-mcp) | 基於瀏覽器的安全測試 | 39 |
| [cloud-audit-mcp](https://github.com/badchars/cloud-audit-mcp) | 雲端安全（AWS/Azure/GCP） | 38 |
| [github-security-mcp](https://github.com/badchars/github-security-mcp) | GitHub 安全態勢 | 39 |
| [cve-mcp](https://github.com/badchars/cve-mcp) | 弱點情報 | 23 |
| [osint-mcp-server](https://github.com/badchars/osint-mcp-server) | OSINT 與偵察 | 37 |
| [darknet-mcp-server](https://github.com/badchars/darknet-mcp-server) | 暗網與威脅情報 | 66 |
| [dns-security-mcp](https://github.com/badchars/dns-security-mcp) | DNS 安全情報 | 103 |
| **steganography-mcp** | **隱寫術分析** | **60** |

---

## 貢獻

歡迎貢獻。請參閱 [CONTRIBUTING.md](../../CONTRIBUTING.md) 瞭解指南。

---

<p align="center">
<b>僅限授權的安全研究和教育用途。</b><br>
在對不屬於你的檔案執行隱寫術分析之前，請務必確保已獲得適當授權。
</p>

<p align="center">
  <a href="../../LICENSE">MIT 授權條款</a> &bull; 由 <a href="https://orhanyildirim.us">Orhan Yildirim</a> 建置 &bull; <a href="mailto:contact@orhanyildirim.us">contact@orhanyildirim.us</a>
</p>
