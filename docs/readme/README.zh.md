<p align="center">
  <a href="../../README.md">English</a> |
  <strong>中文</strong> |
  <a href="README.zh-TW.md">繁體中文</a> |
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

<h3 align="center">面向 AI 智能体的最全面隐写术分析工具包。</h3>

<p align="center">
  LSB 检测、卡方隐写分析、RS 分析、DCT 取证、音频隐写术、零宽文本编码、文件取证、多格式文件检测、编码识别、视频与 GIF 隐写、网络隐蔽通道、MP3 分析、BPCS 与扩频、压缩包隐写、QR 码隐写、创建与嵌入 &mdash; 统一集成到单个 MCP 服务器中。<br>
  <b>128 个工具。17 大类别。4 个依赖。100% 离线运行。</b>无需 API 密钥。所有工具均在本地执行。
</p>

<br>

<p align="center">
  <a href="#问题所在">问题所在</a> &bull;
  <a href="#有何不同">有何不同</a> &bull;
  <a href="#快速开始">快速开始</a> &bull;
  <a href="#ai-能做什么">AI 能做什么</a> &bull;
  <a href="#工具参考128-个工具">工具 (128)</a> &bull;
  <a href="#cli-用法">CLI 用法</a> &bull;
  <a href="#架构">架构</a> &bull;
  <a href="../../CONTRIBUTING.md">贡献指南</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/steganography-mcp"><img src="https://img.shields.io/npm/v/steganography-mcp.svg" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/steganography-mcp"><img src="https://img.shields.io/npm/dm/steganography-mcp" alt="npm downloads"></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="License MIT"></a>
  <img src="https://img.shields.io/badge/node-%3E%3D18-brightgreen" alt="Node >= 18">
  <img src="https://img.shields.io/badge/MCP-Compatible-blueviolet" alt="MCP Compatible">
  <img src="https://img.shields.io/badge/tools-128-cyan" alt="128 Tools">
  <img src="https://img.shields.io/badge/API_keys-Zero-green" alt="Zero API Keys">
  <img src="https://img.shields.io/badge/TypeScript-strict-3178c6" alt="TypeScript strict">
  <a href="https://github.com/badchars/steganography-mcp"><img src="https://img.shields.io/github/stars/badchars/steganography-mcp" alt="GitHub stars"></a>
</p>

---

## 问题所在

隐写术是一门将数据隐藏于表象之下的技术 &mdash; 藏在图像、音频文件、文档甚至 Unicode 文本中。它被广泛应用于 CTF 竞赛、数字取证调查、隐蔽通信通道以及恶意软件载荷中。检测隐写术需要结合统计分析、格式特定解析、熵值测量和领域专业知识。

```
传统隐写术分析工作流：
  检测图像隐写              ->  zsteg + stegsolve（2 个工具，Ruby + Java）
  卡方分析                  ->  自定义 Python 脚本
  RS 分析                   ->  自定义 MATLAB/Python 代码
  JPEG DCT 取证             ->  stegdetect（2004 年已停止维护的 C 工具）
  提取 LSB 数据             ->  zsteg + steghide + openstego（3 个工具）
  音频隐写术                ->  Audacity 手动操作 + 自定义脚本
  零宽字符检测              ->  在线工具 + 手动检查
  文件取证 / binwalk        ->  binwalk + foremost + xxd（3 个工具）
  EXIF 元数据               ->  exiftool（Perl 依赖）
  编码检测                  ->  CyberChef 网页界面 + 手动猜测
  ─────────────────────────────────
  总计：10+ 个工具，5+ 种语言，数小时手动关联
```

**steganography-mcp** 通过 [Model Context Protocol](https://modelcontextprotocol.io) 为你的 AI 智能体提供跨 17 大类别的 128 个工具。智能体可以执行图像隐写分析、JPEG 取证、音频分析、文本隐写检测、文件取证、文档分析、编码识别、视频与 GIF 隐写、网络隐蔽通道、MP3 分析、BPCS 与扩频分析、压缩包隐写、QR 码隐写和创建与嵌入 &mdash; 全部在一次对话中完成，100% 本地运行，完全不依赖外部服务。

```
使用 steganography-mcp：
  你："分析这张 CTF 挑战图片中的隐藏数据"

  智能体：-> img_detect：卡方 p=0.0001（检测到 LSB 嵌入），
            RS 分析估算嵌入率 42%，右下区域存在熵值异常
         -> img_lsb_extract：从 RGB LSB 中提取了 847 字节
         -> crypto_detect：提取的数据为 Base64 编码
         -> crypto_decode：解码结果为 "FLAG{hidden_in_plain_sight_2024}"
         -> img_known_tools：签名匹配 OpenStego

         "该图像包含使用 OpenStego 嵌入的 LSB 隐写术。
          卡方检验确认所有三个 RGB 通道中均存在 LSB 替换，
          嵌入率为 42%。隐藏载荷使用 Base64 编码，
          解码后得到 flag：
          FLAG{hidden_in_plain_sight_2024}"
```

---

## 有何不同

大多数隐写术工具都是单一用途的实用程序。steganography-mcp 赋予你的 AI 智能体**同时跨所有隐写术技术进行推理**的能力。

<table>
<thead>
<tr>
<th></th>
<th>传统方法</th>
<th>steganography-mcp</th>
</tr>
</thead>
<tbody>
<tr>
<td><b>接口</b></td>
<td>10+ 个 CLI 工具，5+ 种语言，网页界面</td>
<td>MCP &mdash; AI 智能体以对话方式调用工具</td>
</tr>
<tr>
<td><b>覆盖范围</b></td>
<td>一次只能用一种技术</td>
<td>17 大类别，128 个工具并行运行</td>
</tr>
<tr>
<td><b>图像分析</b></td>
<td>zsteg（Ruby）、stegsolve（Java）、自定义脚本</td>
<td>智能体同时运行卡方检验、RS 分析、SPA、熵图、直方图、位平面提取、元数据和工具签名检测</td>
</tr>
<tr>
<td><b>JPEG 取证</b></td>
<td>stegdetect（已停止维护）、手动 DCT 检查</td>
<td>智能体分析 DCT 直方图、双重压缩、量化表、EXIF 深度分析、缩略图比较、注释字段</td>
</tr>
<tr>
<td><b>音频隐写</b></td>
<td>Audacity + 手动 LSB 脚本</td>
<td>智能体执行 LSB 卡方检验、频谱分析、静音区域 LSB 检查、回声隐藏检测、元数据提取</td>
</tr>
<tr>
<td><b>文本隐写</b></td>
<td>在线工具、手动检查</td>
<td>智能体检测零宽字符、空白编码、不可见 Unicode、同形字、首字母隐藏 &mdash; 并可嵌入/提取零宽字符消息</td>
</tr>
<tr>
<td><b>依赖</b></td>
<td>Ruby、Java、Perl、Python、C、网页工具</td>
<td><code>npx -y steganography-mcp</code> &mdash; 4 个依赖，纯 TypeScript</td>
</tr>
<tr>
<td><b>API 密钥</b></td>
<td>不适用（但工具链分散）</td>
<td>零。100% 离线，无外部调用</td>
</tr>
<tr>
<td><b>输出</b></td>
<td>原始文本、图像、手动关联</td>
<td>结构化 JSON &mdash; AI 自动关联发现结果</td>
</tr>
</tbody>
</table>

---

## 快速开始

### 方式一：npx（无需安装）

```bash
npx -y steganography-mcp
```

全部 128 个工具即刻可用。无需 API 密钥。无需配置。100% 离线运行。

### 方式二：bunx（更快）

```bash
bunx steganography-mcp
```

### 方式三：克隆仓库

```bash
git clone https://github.com/badchars/steganography-mcp.git
cd steganography-mcp
bun install
```

### 连接到你的 AI 智能体

<details open>
<summary><b>Claude Code</b></summary>

```bash
# 使用 npx
claude mcp add steganography -- npx -y steganography-mcp

# 使用本地克隆
claude mcp add steganography -- bun run /path/to/steganography-mcp/src/index.ts
```

</details>

<details>
<summary><b>Claude Desktop</b></summary>

添加到 `~/Library/Application Support/Claude/claude_desktop_config.json`：

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
<summary><b>Cursor / Windsurf / 其他 MCP 客户端</b></summary>

相同的 JSON 配置格式。将命令指向 `npx -y steganography-mcp` 或你的本地安装路径。

</details>

### 开始分析

```
你："检查这张图片是否有隐藏数据"
```

就这么简单。智能体会自动运行卡方分析、RS 分析、熵图、元数据提取、附加数据检测和工具签名扫描。

---

## AI 能做什么

### CTF 挑战求解器

```
你："解决这道 CTF 隐写术挑战 — 图片在 challenge.png"

智能体：-> img_detect：卡方隐写分析检测到 LSB 嵌入
          （p=0.00012），RS 分析估算嵌入率 38%，
          区块 (12,4)-(15,8) 存在熵值异常
       -> img_lsb_extract：从 RGB 通道 LSB 中提取了 1,247 字节
       -> crypto_detect：数据匹配 Base64 模式（置信度：0.95）
       -> crypto_decode："Q1RGe3N0M2cwX21hc3Rlcn0=" -> "CTF{st3g0_master}"
       -> img_known_tools：在 PNG 块中检测到 OpenStego 签名

       "找到 flag：CTF{st3g0_master}
        该图像使用了由 OpenStego 嵌入的 LSB 隐写术。
        载荷以 Base64 编码存储在 RGB 最低有效位中，
        嵌入率为 38%。"
```

### 数字取证调查

```
你："分析 suspect.png 和 suspect.wav 是否存在隐蔽通信"

智能体：-> img_detect：未检测到 LSB 隐写，但发现附加数据
          （PNG IEND 标记后有 12,847 字节）
       -> file_identify：附加数据以 ZIP 签名（PK）开头
       -> img_metadata：PNG tEXt 块包含异常键 "comm"，
          值为 Base64 编码
       -> audio_detect：WAV 文件存在 LSB 卡方异常（p=0.003）
       -> audio_silence：检测到 3 个具有活跃 LSB 的静音段
       -> audio_lsb_extract：提取了 2,048 字节隐藏数据

       "两个文件都包含隐藏数据：
        1. suspect.png 在 PNG EOF 标记之后附加了一个 ZIP 存档，
           元数据中还有 Base64 编码的消息
        2. suspect.wav 包含 LSB 隐写术，特别集中在静音段 —
           这是故意隐藏的强力指标。
        建议提取 ZIP 并分析 WAV 载荷。"
```

### 零宽字符检测

```
你："这封邮件看起来正常，但可能包含隐藏文本"

智能体：-> text_detect：在可见字符之间检测到 847 个零宽字符
       -> text_zwc_detect：发现 ZWSP（342）、ZWNJ（505），
          分布在全文 127 个位置
       -> text_zwc_extract：二进制解码结果为 "EXFIL-ROUTE-7"
       -> text_invisible_scan：在头部区域发现 3 个额外的
          不可见 Unicode 字符（U+2060、U+FEFF）

       "该邮件包含用零宽字符编码的隐藏消息：'EXFIL-ROUTE-7'。
        847 个不可见字符分散在可见文本中，使用 ZWSP/ZWNJ
        二进制编码。此外，在头部发现了 3 个 Word Joiner 和
        BOM 字符 — 可能是元数据残留。"
```

### JPEG 取证分析

```
你："这张 JPEG 图片是原图还是被篡改过？"

智能体：-> jpeg_structure：解析出 14 个标记，正常 JFIF 结构
       -> jpeg_double_compression：检测到双重压缩 —
          块效应评分 0.73，量化异常比率 0.81
       -> jpeg_quantization：质量约 75（亮度），但残余模式
          表明原始质量约 92
       -> jpeg_exif_deep：EXIF 显示 "iPhone 14 Pro"，但软件
          字段显示 "Adobe Photoshop 25.0"
       -> jpeg_thumbnail_compare：缩略图尺寸与主图像不匹配
          （缩略图：4032x3024，主图像：2048x1536）

       "这张 JPEG 已被篡改。证据如下：
        1. 检测到双重压缩 — 图像被解码后以更低质量重新编码
           （原始约 92，当前约 75）
        2. EXIF 声称是 iPhone 14 Pro 拍摄，但软件字段暴露了
           Photoshop 编辑痕迹
        3. 缩略图来自原始 4032x3024 拍摄，但主图像被缩放至
           2048x1536
        三项发现独立证实了拍摄后的修改行为。"
```

---

## 工具参考（128 个工具）

### 类别概览

| 类别 | 工具数 | 描述 |
|------|--------|------|
| [图像隐写分析](#-图像隐写分析14) | 14 | LSB 检测、卡方检验、RS 分析、熵图、位平面、直方图、元数据、工具签名 |
| [JPEG 分析](#-jpeg-分析7) | 7 | DCT 直方图、双重压缩、量化表、EXIF 深度分析、缩略图取证、注释分析 |
| [音频隐写分析](#-音频隐写分析7) | 7 | WAV LSB 检测、频谱分析、静音区域分析、回声隐藏、元数据提取 |
| [文本与 Unicode](#-文本与-unicode10) | 10 | 零宽字符、空白编码、不可见 Unicode、同形字、首字母隐藏、Unicode 分析 |
| [文件取证](#-文件取证10) | 10 | 魔术字节、多格式文件检测、嵌入文件、附加数据、熵值、十六进制转储、字符串、文件头 |
| [文档分析](#-文档分析5) | 5 | PDF 隐藏内容、PDF 元数据、PDF 流、HTML 隐藏内容、XML 元数据 |
| [编码与密码](#-编码与密码7) | 7 | 编码检测、多格式解码器、频率分析、熵值、XOR 暴力破解、哈希识别、密码模式 |
| 高级 JPEG | 7 | F5、JSteg、OutGuess、PVD 检测、滑动窗口卡方检验、裁剪重校准隐写分析、工具兼容性 |
| 视频隐写术 | 8 | AVI 帧 LSB、帧间分析、帧比较、元数据、结构、EOF 数据 |
| GIF 隐写术 | 8 | 调色板 LSB、LZW 子块熵、注释扩展、应用扩展、帧分析 |
| 网络隐写术 | 8 | PCAP 隐蔽通道、IP/TCP 头分析、ICMP 载荷、DNS 隧道、HTTP 头、时序分析 |
| MP3 隐写术 | 7 | ID3 隐藏数据、帧分析、填充操纵、采样分析、元数据、结构 |
| 扩频分析 | 5 | DFT 幅度谱、自相关、水印检测、噪声底分析、Patchwork 检测 |
| BPCS 分析 | 5 | 位平面复杂度分割、复杂度映射、阈值分析、数据提取、容量估算 |
| 压缩包隐写术 | 7 | ZIP 松弛空间、额外字段、注释、多格式文件检测、结构分析、元数据 |
| 创建与嵌入 | 7 | EOF 注入、元数据注入、空白编码、空密码、多格式文件创建、注释注入、调色板嵌入 |
| QR 码隐写术 | 6 | QR 隐写检测、结构分析、ECC 容量、模块分析、数据提取、比较 |

---

<details open>
<summary><h3>图像隐写分析（14）</h3></summary>

| 工具 | 描述 |
|------|------|
| `img_detect` | 自动检测图像中的隐写术。运行卡方检验、RS 分析、熵值、元数据、附加数据和工具签名检查。返回完整的 JSON 报告 |
| `img_lsb_detect` | 统计型 LSB 隐写术检测。对每个颜色通道独立运行卡方检验和样本对分析 |
| `img_lsb_extract` | 从图像 LSB 中提取隐藏数据。从指定通道和位平面提取比特，尝试 UTF-8 解码，并显示十六进制转储 |
| `img_lsb_embed` | 使用 LSB 隐写术将消息嵌入图像。读取 PNG 文件，将消息嵌入最低有效位，并写入新的 PNG 文件 |
| `img_bitplane` | 提取并可视化图像通道的特定位平面。显示尺寸、1 位百分比和 ASCII 艺术预览 |
| `img_chi_square` | 对每个颜色通道独立进行卡方隐写分析攻击。通过测试相邻像素值对是否均等化来检测 LSB 替换 |
| `img_rs_analysis` | 使用 Fridrich-Goljan-Du 方法的 RS（正则-奇异）隐写分析。分析像素组以估算每个通道的 LSB 嵌入率 |
| `img_histogram` | 生成带有异常检测的像素值直方图。检测指示 LSB 隐写术的值对（PoV）异常 |
| `img_entropy_map` | 图像的逐块熵值分析。将图像分割成块并计算每块的香农熵，标记高熵区域 |
| `img_metadata` | 图像的深度元数据提取。PNG：文本块、块列表、IHDR 信息。JPEG：EXIF、注释、量化表、标记列表 |
| `img_appended_data` | 检测并提取图像 EOF 标记之后附加的数据。检查 PNG IEND、JPEG EOI 或 BMP 文件大小边界之后的隐藏数据 |
| `img_compare` | 两张图像的逐像素比较。报告相同/不同像素数量、最大差异以及受影响的通道 |
| `img_channel_analysis` | R、G、B 和 A 通道的独立统计分析。报告均值、标准差、熵值、最小值、最大值和唯一值数量 |
| `img_known_tools` | 扫描图像文件字节以匹配已知隐写术工具签名。与 OpenStego、Steghide、JSteg、F5 等工具的模式数据库进行比对 |

</details>

<details>
<summary><h3>JPEG 分析（7）</h3></summary>

| 工具 | 描述 |
|------|------|
| `jpeg_structure` | 解析 JPEG 标记/段落及其偏移量和大小。显示内部结构，包括所有标记、位置和段落长度 |
| `jpeg_dct_histogram` | 用于隐写术检测的 DCT 系数分布分析。分析 Y 通道像素值分布和 SOS 熵数据，以检测 JSteg、F5 和 OutGuess 造成的异常 |
| `jpeg_double_compression` | 检测 JPEG 双重压缩伪影。识别特征性块效应和量化表异常 &mdash; 图像篡改或隐写嵌入的常见指标 |
| `jpeg_quantization` | 量化表分析与质量估算。以 8x8 网格格式显示所有量化表并估算 JPEG 质量因子 |
| `jpeg_exif_deep` | 深度 EXIF 分析，包括 GPS 坐标、时间戳、软件信息、缩略图、制造商备注和所有 IFD 条目。标记取证相关字段 |
| `jpeg_thumbnail_compare` | 将 EXIF 缩略图与 JPEG 主图像进行比较。尺寸或内容不匹配表示拍摄后有修改 &mdash; 常见的取证痕迹 |
| `jpeg_comment` | 提取并分析 JPEG COM（注释）标记。检查隐藏数据模式、异常大的注释和高熵内容 |

</details>

<details>
<summary><h3>音频隐写分析（7）</h3></summary>

| 工具 | 描述 |
|------|------|
| `audio_detect` | 自动检测 WAV 文件中的音频隐写术。运行 LSB 卡方检验、熵值分析、元数据检查，并检测附加数据 |
| `audio_lsb_detect` | PCM 采样 LSB 统计分析。对按值对分组的 LSB 执行卡方检验，以检测 LSB 替换隐写术 |
| `audio_lsb_extract` | 从音频采样中提取 LSB 数据。读取每个 PCM 采样的最低有效位并尝试解码隐藏数据 |
| `audio_spectrum` | WAV 音频中隐藏信号的频谱分析。分析采样值分布、过零率、每块 RMS 能量，并检测异常静音段 |
| `audio_metadata` | 从 WAV 文件中提取元数据，包括 RIFF INFO 块、格式详情和所有块信息 |
| `audio_silence` | 分析 WAV 音频中静音段的隐藏数据。找到接近零采样的区域并检查其 LSB &mdash; 具有活跃 LSB 的静音段是强力隐写指标 |
| `audio_echo_detect` | 通过自相关分析进行回声隐藏检测。计算常见回声延迟处的归一化自相关。规律性回声模式表明存在隐写回声隐藏 |

</details>

<details>
<summary><h3>文本与 Unicode（10）</h3></summary>

| 工具 | 描述 |
|------|------|
| `text_detect` | 自动检测文本隐写术。检查零宽字符、空白编码、不可见 Unicode、同形字和异常模式 |
| `text_zwc_detect` | 检测文本中的零宽字符（ZWSP、ZWNJ、ZWJ、BOM）。报告位置、数量和潜在编码消息长度 |
| `text_zwc_extract` | 解码零宽字符编码的消息。提取零宽字符并进行二进制解码：ZWSP=0，ZWNJ=1（尝试两种极性） |
| `text_zwc_embed` | 使用零宽字符将秘密消息嵌入封面文本。将消息编码为二进制并将比特映射为 ZWSP(0)/ZWNJ(1) |
| `text_whitespace_detect` | 检测文本中的空白编码。检查每行末尾的空白模式，其中空格=0、制表符=1 可能编码二进制数据 |
| `text_whitespace_extract` | 从文本中提取空白编码的消息。读取每行末尾的空白并解码空格=0/制表符=1 的二进制编码 |
| `text_invisible_scan` | 扫描文本中所有不可见的 Unicode 字符。将每个字符与完整的不可见字符数据库进行比对，报告位置和名称 |
| `text_homoglyph` | 检测文本中的 Unicode 同形字替换。识别视觉上类似 ASCII 字母的非 ASCII 字符（如西里尔字母 a 与拉丁字母 a） |
| `text_unicode_analysis` | 完整的 Unicode 字符分布分析。按脚本块对所有字符进行分类，执行熵值分析，并检测可疑的脚本混合 |
| `text_acrostic` | 检测隐藏在文本各行中的首字母、首词、末字母、末词或第 n 个字符的模式（离合诗消息） |

</details>

<details>
<summary><h3>文件取证（10）</h3></summary>

| 工具 | 描述 |
|------|------|
| `file_identify` | 通过魔术字节识别文件类型。读取文件头并与已知文件签名的综合数据库进行匹配。检查扩展名不匹配 |
| `file_polyglot` | 检测同时可作为两种或多种格式有效的多格式文件。检查不同偏移处的多个有效文件签名（PDF+ZIP、PNG+PDF 等） |
| `file_embedded` | 扫描二进制文件中的嵌入文件，类似于 binwalk。在每个偏移处搜索已知魔术字节签名以发现隐藏或附加的文件 |
| `file_appended` | 检测文件格式特定 EOF 标记之后附加的数据。支持 PNG (IEND)、JPEG (FFD9)、BMP、ZIP (EOCD) 和 PDF (%%EOF) |
| `file_entropy` | 逐段熵值分析。计算每块和总体的香农熵，标记异常的高熵段 |
| `file_entropy_visual` | 文件的 ASCII 熵值可视化。渲染基于文本的条形图，显示文件各部分的熵值级别，用于视觉异常检测 |
| `file_strings` | 从二进制文件中提取可打印和 Unicode 字符串。扫描可打印字符序列并报告文件偏移。支持 ASCII、UTF-8、UTF-16 |
| `file_hex` | 带 ASCII 侧栏的十六进制转储。传统的十六进制编辑器格式，包含偏移地址、十六进制字节和可打印 ASCII 表示 |
| `file_header` | 已知格式的深度文件头和结构分析。解析 PNG IHDR、JPEG SOF、BMP 信息头、ZIP 本地文件头和 PDF 版本/元数据 |
| `file_compare` | 两个文件的二进制差异比较。逐字节比较并报告差异偏移、相同百分比，以及用于隐写分析的仅 LSB 差异检测 |

</details>

<details>
<summary><h3>文档分析（5）</h3></summary>

| 工具 | 描述 |
|------|------|
| `doc_pdf_hidden` | PDF 隐藏内容检测。扫描 JavaScript、自动操作、OpenAction、隐藏注释、不可见文本、嵌入文件和其他隐蔽内容 |
| `doc_pdf_metadata` | PDF 元数据提取。解析 /Info 字典和 XMP 元数据块，用于取证归因和文档溯源分析 |
| `doc_pdf_streams` | PDF 流分析。定位所有 stream/endstream 块，尝试 zlib 解压缩，并报告大小和熵值以发现隐藏数据 |
| `doc_html_hidden` | HTML 隐藏内容检测。扫描注释、display:none 元素、data-* 属性、隐藏输入、base64 内容、零尺寸元素和不可见文本 |
| `doc_xml_metadata` | XML 和 Office 文档元数据提取。解析 Dublin Core、Microsoft Office 属性、处理指令和其他元数据字段 |

</details>

<details>
<summary><h3>编码与密码（7）</h3></summary>

| 工具 | 描述 |
|------|------|
| `crypto_detect` | 自动检测输入字符串的编码类型。针对所有已知模式进行测试（Base64、十六进制、二进制、摩尔斯、URL 编码、HTML 实体等），按置信度排序返回匹配结果 |
| `crypto_decode` | 多格式解码器，支持 Base64、十六进制、二进制、十进制、八进制、URL 编码、ROT13、Base32、摩尔斯电码和 HTML 实体。自动模式会先检测编码 |
| `crypto_frequency` | 用于密码分析的字符频率分析。统计字符出现次数，与标准英语频率（ETAOINSHRDLU）进行比较，并计算重合指数 |
| `crypto_entropy` | 字符串的香农熵计算与分类。计算字符级和字节级熵值，分类从重复数据到加密/随机数据 |
| `crypto_xor` | 单字节和多字节密钥的 XOR 暴力破解。尝试所有 256 个单字节密钥并按英语文本概率评分。使用重合指数估算多字节密钥长度 |
| `crypto_hash_id` | 哈希类型识别。根据长度和格式与已知哈希模式进行匹配（MD5、SHA-1、SHA-256、SHA-512、bcrypt、CRC32、NTLM 等） |
| `crypto_patterns` | 已知密码和编码模式检测。分析文本中的凯撒密码、替换密码、维吉尼亚密码、栅栏密码、Atbash 和反转文本 |

</details>

---

## CLI 用法

```bash
# 显示帮助
npx -y steganography-mcp --help

# 列出所有 128 个工具及其描述
npx -y steganography-mcp --list

# 检测图像中的隐写术
npx -y steganography-mcp --tool img_detect '{"file_path":"challenge.png"}'

# 从 LSB 中提取隐藏消息
npx -y steganography-mcp --tool img_lsb_extract '{"file_path":"stego.png"}'

# 卡方隐写分析
npx -y steganography-mcp --tool img_chi_square '{"file_path":"suspect.png"}'

# RS 分析（Fridrich-Goljan-Du 方法）
npx -y steganography-mcp --tool img_rs_analysis '{"file_path":"suspect.png"}'

# JPEG 双重压缩检测
npx -y steganography-mcp --tool jpeg_double_compression '{"file_path":"photo.jpg"}'

# 深度 EXIF 分析
npx -y steganography-mcp --tool jpeg_exif_deep '{"file_path":"photo.jpg"}'

# 音频隐写术检测
npx -y steganography-mcp --tool audio_detect '{"file_path":"message.wav"}'

# 检测零宽字符编码
npx -y steganography-mcp --tool text_zwc_detect '{"text":"suspicious text here"}'

# 使用零宽字符嵌入隐藏消息
npx -y steganography-mcp --tool text_zwc_embed '{"text":"cover text","message":"secret"}'

# 识别文件类型和检测多格式文件
npx -y steganography-mcp --tool file_polyglot '{"file_path":"suspicious.pdf"}'

# 扫描嵌入文件（类似 binwalk）
npx -y steganography-mcp --tool file_embedded '{"file_path":"mystery.bin"}'

# 熵值可视化
npx -y steganography-mcp --tool file_entropy_visual '{"file_path":"data.bin"}'

# 自动检测编码
npx -y steganography-mcp --tool crypto_detect '{"input":"aGVsbG8gd29ybGQ="}'

# XOR 暴力破解
npx -y steganography-mcp --tool crypto_xor '{"input":"4f5243484e"}'

# 检测密码模式
npx -y steganography-mcp --tool crypto_patterns '{"input":"Gur dhvpx oebja sbk"}'

# 使用 Bun（启动更快）
bunx steganography-mcp --tool img_detect '{"file_path":"image.png"}'
```

---

## 应用场景

### CTF 竞赛
解决夺旗竞赛中的隐写术挑战。AI 智能体可以系统性地应用所有检测技术 &mdash; LSB 分析、元数据检查、附加数据、编码检测和密码识别 &mdash; 在图像、音频文件、文档和文本中寻找隐藏的 flag。

### 数字取证
在取证调查中检测隐蔽通信通道。使用统计隐写分析（卡方检验、RS 分析）分析可疑文件中的隐藏数据，检查 EOF 标记后附加的数据，扫描嵌入文件，识别隐写术工具签名。

### 安全研究
分析隐写术工具和技术。逐像素比较原始图像和隐写图像，研究 JPEG 隐写中的 DCT 系数分布，测量嵌入造成的熵值变化，逆向工程编码方案。

### 教育
学习隐写术技术的工作原理。嵌入和提取 LSB 消息，使用零宽字符编码文本，可视化位平面和熵图，使用十六进制转储分析文件结构，使用频率分析研究密码模式。

### 事件响应
在事件响应过程中，检查文档和图像中的隐藏数据外泄通道。扫描 PDF 中的隐藏 JavaScript 和嵌入文件，检测邮件中的零宽字符编码，识别多格式文件，分析可疑编码。

---

## 架构

```
src/
  index.ts                    # CLI 入口（--help、--list、--tool、stdio 服务器）
  protocol/
    mcp-server.ts             # MCP 服务器设置（stdio 传输）
    tools.ts                  # 工具注册表 — 所有 128 个工具在此组装
  types/
    index.ts                  # 共享类型（ToolDef、ToolContext、ToolResult）
  utils/
    binary.ts                 # 二进制文件读取、十六进制转储、格式检测
    stats.ts                  # 香农熵、卡方检验、字节频率、DFT、自相关、BPCS 复杂度、Patchwork 检测
    cache.ts                  # TTL 缓存
    png-parser.ts             # 纯 TS PNG 解析器（IHDR、块、像素数据）
    jpeg-parser.ts            # 纯 TS JPEG 解析器（标记、EXIF、量化）
    wav-parser.ts             # 纯 TS WAV 解析器（RIFF 块、PCM 采样）
    bmp-parser.ts             # 纯 TS BMP 解析器（文件头、像素数据）
    avi-parser.ts             # 纯 TS AVI 解析器（帧、结构）
    gif-parser.ts             # 纯 TS GIF 解析器（调色板、帧、扩展）
    pcap-parser.ts            # 纯 TS PCAP 解析器（数据包、头部）
    mp3-parser.ts             # 纯 TS MP3 解析器（帧、ID3、采样）
    zip-parser.ts             # 纯 TS ZIP 解析器（结构、松弛空间）
  image/                      # 图像隐写分析工具（14）
  jpeg/                       # JPEG 分析工具（7）
  audio/                      # 音频隐写分析工具（7）
  text/                       # 文本与 Unicode 工具（10）
  file/                       # 文件取证工具（10）
  document/                   # 文档分析工具（5）
  crypto/                     # 编码与密码工具（7）
  jpegadv/                    # 高级 JPEG 工具（7）
  video/                      # 视频隐写术工具（8）
  gif/                        # GIF 隐写术工具（8）
  network/                    # 网络隐写术工具（8）
  mp3/                        # MP3 隐写术工具（7）
  spread/                     # 扩频分析工具（5）
  bpcs/                       # BPCS 分析工具（5）
  archive/                    # 压缩包隐写术工具（7）
  create/                     # 创建与嵌入工具（7）
  qrcode/                     # QR 码隐写术工具（6）
  data/
    encoding-patterns.ts      # 编码正则模式 + 解码器
    magic-bytes.ts            # 文件签名数据库（100+ 种格式）
    stego-signatures.ts       # 已知隐写术工具签名
    unicode-invisible.ts      # 不可见 Unicode 字符数据库
```

**设计决策：**

- **4 个依赖，仅此而已** &mdash; `@modelcontextprotocol/sdk` 用于 MCP 协议，`zod` 用于输入验证，`pngjs` 用于 PNG 像素访问，`jpeg-js` 用于 JPEG 解码。没有臃肿的依赖树。没有原生模块。没有 C 绑定。没有 Python。没有 Java。
- **100% 离线** &mdash; 所有工具完全在本地运行。无 HTTP 请求。无 API 调用。无遥测。无云依赖。你的文件永远不会离开你的机器。
- **纯 TypeScript 统计分析** &mdash; 卡方检验、RS 分析（Fridrich-Goljan-Du）、样本对分析、香农熵、重合指数和频率分析均以纯 TypeScript 实现。无外部数学库。
- **自定义格式解析器** &mdash; PNG 块、JPEG 标记/EXIF/量化表、WAV RIFF 块和 BMP 文件头均使用 `utils/` 解析器以零外部依赖进行解析。这使得通用库无法提供的格式特定深度分析成为可能。
- **17 个提供者，1 个服务器** &mdash; 每个分析类别都是独立的模块。AI 智能体根据调查上下文选择使用哪些工具。
- **统一的 ToolDef 模式** &mdash; 每个工具都遵循相同的 `{ name, description, schema, execute }` 模式。添加新工具只需在相应模块中创建一个对象。
- **每个字段都有 Zod 验证** &mdash; 每个 schema 字段都有 `.describe()` 为 AI 智能体提供上下文。无效输入在执行前被捕获，并提供清晰的错误消息。

---

## MCP 安全套件

| 项目 | 领域 | 工具数 |
|------|------|--------|
| [hackbrowser-mcp](https://github.com/badchars/hackbrowser-mcp) | 基于浏览器的安全测试 | 39 |
| [cloud-audit-mcp](https://github.com/badchars/cloud-audit-mcp) | 云安全（AWS/Azure/GCP） | 38 |
| [github-security-mcp](https://github.com/badchars/github-security-mcp) | GitHub 安全态势 | 39 |
| [cve-mcp](https://github.com/badchars/cve-mcp) | 漏洞情报 | 23 |
| [osint-mcp-server](https://github.com/badchars/osint-mcp-server) | OSINT 与侦察 | 37 |
| [darknet-mcp-server](https://github.com/badchars/darknet-mcp-server) | 暗网与威胁情报 | 66 |
| [dns-security-mcp](https://github.com/badchars/dns-security-mcp) | DNS 安全情报 | 103 |
| **steganography-mcp** | **隐写术分析** | **128** |

---

## 贡献

欢迎贡献。请参阅 [CONTRIBUTING.md](../../CONTRIBUTING.md) 了解指南。

---

<p align="center">
<b>仅限授权的安全研究和教育用途。</b><br>
在对不属于你的文件执行隐写术分析之前，请务必确保已获得适当授权。
</p>

<p align="center">
  <a href="../../LICENSE">MIT 许可证</a> &bull; 由 <a href="https://orhanyildirim.us">Orhan Yildirim</a> 构建 &bull; <a href="mailto:contact@orhanyildirim.us">contact@orhanyildirim.us</a>
</p>
