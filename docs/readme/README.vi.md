<p align="center">
  <a href="../../README.md">English</a> |
  <a href="README.zh.md">中文</a> |
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
  <strong>Tiếng Việt</strong>
</p>

<div align="center">
  <br>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="../banner-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="../banner-light.svg">
    <img alt="steganography-mcp" src="../banner-dark.svg" width="830">
  </picture>
</div>

<h3 align="center">Bộ công cụ phân tích giấu tin toàn diện nhất dành cho AI agent.</h3>

<p align="center">
  Phát hiện LSB, phân tích thống kê chi-square, phân tích RS, pháp y DCT, giấu tin trong âm thanh, mã hóa văn bản ký tự không rộng, pháp y tệp, phát hiện tệp đa định dạng, nhận dạng mã hóa &mdash; tất cả hợp nhất trong một MCP server duy nhất.<br>
  <b>60 công cụ. 7 danh mục. 4 phụ thuộc. 100% ngoại tuyến.</b> Không cần API key. Mọi công cụ chạy trên máy cục bộ.
</p>

<br>

<p align="center">
  <a href="#vấn-đề">Vấn Đề</a> &bull;
  <a href="#điểm-khác-biệt">Điểm Khác Biệt</a> &bull;
  <a href="#bắt-đầu-nhanh">Bắt Đầu Nhanh</a> &bull;
  <a href="#ai-có-thể-làm-gì">AI Có Thể Làm Gì</a> &bull;
  <a href="#tham-chiếu-công-cụ-60-công-cụ">Công Cụ (60)</a> &bull;
  <a href="#sử-dụng-cli">Sử Dụng CLI</a> &bull;
  <a href="#kiến-trúc">Kiến Trúc</a> &bull;
  <a href="../../CONTRIBUTING.md">Đóng Góp</a>
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

## Vấn Đề

Giấu tin (steganography) là nghệ thuật ẩn giấu dữ liệu ngay trước mắt &mdash; bên trong hình ảnh, tệp âm thanh, tài liệu, và thậm chí cả văn bản Unicode. Kỹ thuật này được sử dụng trong các cuộc thi CTF, điều tra pháp y kỹ thuật số, kênh liên lạc bí mật và mã độc. Việc phát hiện đòi hỏi sự kết hợp của phân tích thống kê, phân tích cú pháp theo định dạng, đo lường entropy và kiến thức chuyên môn.

```
Quy trình phân tích giấu tin truyền thống:
  phát hiện giấu tin trong ảnh     ->  zsteg + stegsolve (2 công cụ, Ruby + Java)
  phân tích chi-square              ->  script Python tùy chỉnh
  phân tích RS                      ->  mã MATLAB/Python tùy chỉnh
  pháp y JPEG DCT                   ->  stegdetect (công cụ C bỏ hoang từ 2004)
  trích xuất dữ liệu LSB            ->  zsteg + steghide + openstego (3 công cụ)
  giấu tin trong âm thanh           ->  Audacity thủ công + scripts
  phát hiện ký tự không rộng        ->  công cụ web + kiểm tra thủ công
  pháp y tệp / binwalk              ->  binwalk + foremost + xxd (3 công cụ)
  siêu dữ liệu EXIF                ->  exiftool (phụ thuộc Perl)
  phát hiện mã hóa                  ->  CyberChef web UI + đoán thủ công
  ─────────────────────────────────
  Tổng: 10+ công cụ, 5+ ngôn ngữ, hàng giờ tương quan thủ công
```

**steganography-mcp** cung cấp cho AI agent của bạn 60 công cụ thuộc 7 danh mục thông qua [Model Context Protocol](https://modelcontextprotocol.io). Agent thực hiện phân tích giấu tin hình ảnh, pháp y JPEG, phân tích âm thanh, phát hiện giấu tin văn bản, pháp y tệp, phân tích tài liệu và nhận dạng mã hóa &mdash; tất cả trong một cuộc hội thoại duy nhất, chạy 100% cục bộ mà không phụ thuộc vào bất kỳ dịch vụ bên ngoài nào.

```
Với steganography-mcp:
  Bạn: "Phân tích hình ảnh thử thách CTF này để tìm dữ liệu ẩn"

  Agent: -> img_detect: Chi-square p=0.0001 (phát hiện nhúng LSB),
            phân tích RS ước tính tỷ lệ nhúng 42%, bất thường entropy
            ở góc phần tư dưới-phải
         -> img_lsb_extract: Trích xuất 847 bytes từ RGB LSBs
         -> crypto_detect: Dữ liệu trích xuất được mã hóa Base64
         -> crypto_decode: Giải mã thành "FLAG{hidden_in_plain_sight_2024}"
         -> img_known_tools: Phát hiện chữ ký OpenStego

         "Hình ảnh chứa giấu tin LSB được nhúng bằng OpenStego.
          Kiểm tra chi-square xác nhận thay thế LSB trên cả ba kênh
          RGB với tỷ lệ nhúng 42%. Payload ẩn được mã hóa Base64
          và giải mã thành cờ:
          FLAG{hidden_in_plain_sight_2024}"
```

---

## Điểm Khác Biệt

Hầu hết các công cụ giấu tin là tiện ích đơn lẻ. steganography-mcp cho phép AI agent của bạn **suy luận đồng thời trên tất cả các kỹ thuật giấu tin**.

<table>
<thead>
<tr>
<th></th>
<th>Cách tiếp cận truyền thống</th>
<th>steganography-mcp</th>
</tr>
</thead>
<tbody>
<tr>
<td><b>Giao diện</b></td>
<td>10+ công cụ CLI, 5+ ngôn ngữ, web UIs</td>
<td>MCP &mdash; AI agent gọi công cụ theo hội thoại</td>
</tr>
<tr>
<td><b>Phạm vi</b></td>
<td>Một kỹ thuật mỗi lần</td>
<td>7 danh mục, 60 công cụ song song</td>
</tr>
<tr>
<td><b>Phân tích hình ảnh</b></td>
<td>zsteg (Ruby), stegsolve (Java), scripts tùy chỉnh</td>
<td>Agent chạy chi-square, phân tích RS, SPA, bản đồ entropy, histogram, trích xuất bit plane, siêu dữ liệu và phát hiện chữ ký công cụ &mdash; tất cả cùng lúc</td>
</tr>
<tr>
<td><b>Pháp y JPEG</b></td>
<td>stegdetect (bỏ hoang), kiểm tra DCT thủ công</td>
<td>Agent phân tích histogram DCT, nén kép, bảng lượng tử hóa, phân tích EXIF chuyên sâu, so sánh ảnh thu nhỏ, trường bình luận</td>
</tr>
<tr>
<td><b>Giấu tin âm thanh</b></td>
<td>Audacity + scripts LSB thủ công</td>
<td>Agent thực hiện LSB chi-square, phân tích phổ, kiểm tra LSB vùng im lặng, phát hiện ẩn giấu bằng tiếng vọng, trích xuất siêu dữ liệu</td>
</tr>
<tr>
<td><b>Giấu tin văn bản</b></td>
<td>Công cụ web, kiểm tra thủ công</td>
<td>Agent phát hiện ký tự không rộng, mã hóa khoảng trắng, Unicode vô hình, homoglyph, acrostic &mdash; và có thể nhúng/trích xuất tin nhắn ZWC</td>
</tr>
<tr>
<td><b>Phụ thuộc</b></td>
<td>Ruby, Java, Perl, Python, C, công cụ web</td>
<td><code>npx -y steganography-mcp</code> &mdash; 4 phụ thuộc, TypeScript thuần</td>
</tr>
<tr>
<td><b>API keys</b></td>
<td>N/A (nhưng chuỗi công cụ phân mảnh)</td>
<td>Không cần. 100% ngoại tuyến, không có lệnh gọi bên ngoài</td>
</tr>
<tr>
<td><b>Đầu ra</b></td>
<td>Văn bản thô, hình ảnh, tương quan thủ công</td>
<td>JSON có cấu trúc &mdash; AI tự động tương quan kết quả</td>
</tr>
</tbody>
</table>

---

## Bắt Đầu Nhanh

### Tùy chọn 1: npx (không cần cài đặt)

```bash
npx -y steganography-mcp
```

Tất cả 60 công cụ hoạt động ngay lập tức. Không cần API key. Không cần cấu hình. 100% ngoại tuyến.

### Tùy chọn 2: bunx (nhanh hơn)

```bash
bunx steganography-mcp
```

### Tùy chọn 3: Clone

```bash
git clone https://github.com/badchars/steganography-mcp.git
cd steganography-mcp
bun install
```

### Kết nối với AI agent của bạn

<details open>
<summary><b>Claude Code</b></summary>

```bash
# Với npx
claude mcp add steganography -- npx -y steganography-mcp

# Với bản clone cục bộ
claude mcp add steganography -- bun run /path/to/steganography-mcp/src/index.ts
```

</details>

<details>
<summary><b>Claude Desktop</b></summary>

Thêm vào `~/Library/Application Support/Claude/claude_desktop_config.json`:

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
<summary><b>Cursor / Windsurf / các MCP client khác</b></summary>

Cùng định dạng cấu hình JSON. Trỏ lệnh đến `npx -y steganography-mcp` hoặc đường dẫn cài đặt cục bộ của bạn.

</details>

### Bắt đầu phân tích

```
Bạn: "Kiểm tra hình ảnh này xem có dữ liệu ẩn không"
```

Chỉ vậy thôi. Agent tự động chạy phân tích chi-square, phân tích RS, bản đồ entropy, trích xuất siêu dữ liệu, phát hiện dữ liệu đính kèm và quét chữ ký công cụ.

---

## AI Có Thể Làm Gì

### Giải Thử Thách CTF

```
Bạn: "Giải thử thách giấu tin CTF này — hình ảnh ở challenge.png"

Agent: -> img_detect: Phân tích chi-square phát hiện nhúng LSB
          (p=0.00012), phân tích RS ước tính tỷ lệ nhúng 38%,
          bất thường entropy tại blocks (12,4)-(15,8)
       -> img_lsb_extract: Trích xuất 1.247 bytes từ LSBs kênh RGB
       -> crypto_detect: Dữ liệu khớp mẫu Base64 (độ tin cậy: 0.95)
       -> crypto_decode: "Q1RGe3N0M2cwX21hc3Rlcn0=" -> "CTF{st3g0_master}"
       -> img_known_tools: Phát hiện chữ ký OpenStego trong PNG chunks

       "Tìm thấy cờ: CTF{st3g0_master}
        Hình ảnh sử dụng giấu tin LSB được nhúng bởi OpenStego.
        Payload được mã hóa Base64 trong các bit có ý nghĩa thấp nhất
        RGB với tỷ lệ nhúng 38%."
```

### Điều Tra Pháp Y Kỹ Thuật Số

```
Bạn: "Phân tích suspect.png và suspect.wav để tìm liên lạc bí mật"

Agent: -> img_detect: Không phát hiện giấu tin LSB, nhưng tìm thấy dữ liệu
          đính kèm (12.847 bytes sau điểm đánh dấu PNG IEND)
       -> file_identify: Dữ liệu đính kèm bắt đầu bằng chữ ký ZIP (PK)
       -> img_metadata: PNG tEXt chunk chứa khóa bất thường "comm"
          với giá trị Base64
       -> audio_detect: Tệp WAV có bất thường LSB chi-square (p=0.003)
       -> audio_silence: Phát hiện 3 vùng im lặng có LSBs hoạt động
       -> audio_lsb_extract: Trích xuất 2.048 bytes dữ liệu ẩn

       "Cả hai tệp đều chứa dữ liệu ẩn:
        1. suspect.png có tệp ZIP đính kèm sau điểm đánh dấu EOF
           của PNG, cộng thêm tin nhắn mã hóa Base64 trong siêu dữ liệu
        2. suspect.wav chứa giấu tin LSB, cụ thể ở các vùng im lặng
           — dấu hiệu mạnh cho thấy ẩn giấu có chủ đích.
        Khuyến nghị trích xuất ZIP và phân tích payload WAV."
```

### Phát Hiện Văn Bản Ký Tự Không Rộng

```
Bạn: "Email này trông bình thường nhưng có thể chứa văn bản ẩn"

Agent: -> text_detect: Phát hiện 847 ký tự không rộng giữa các
          ký tự nhìn thấy được
       -> text_zwc_detect: ZWSP (342), ZWNJ (505) tìm thấy tại 127
          vị trí xuyên suốt văn bản
       -> text_zwc_extract: Giải mã nhị phân cho ra "EXFIL-ROUTE-7"
       -> text_invisible_scan: 3 ký tự Unicode vô hình bổ sung
          (U+2060, U+FEFF) tìm thấy trong phần tiêu đề

       "Email chứa tin nhắn ẩn được mã hóa bằng ký tự không rộng:
        'EXFIL-ROUTE-7'. 847 ký tự vô hình được phân tán xuyên suốt
        văn bản nhìn thấy được bằng mã hóa nhị phân ZWSP/ZWNJ. Ngoài
        ra, 3 ký tự Word Joiner và BOM được tìm thấy trong tiêu đề
        — có thể là phần dư siêu dữ liệu."
```

### Phân Tích Pháp Y JPEG

```
Bạn: "Hình JPEG này là ảnh gốc hay đã bị can thiệp?"

Agent: -> jpeg_structure: Phân tích 14 điểm đánh dấu, cấu trúc JFIF bình thường
       -> jpeg_double_compression: Phát hiện nén kép —
          điểm artifact blocking 0.73, tỷ lệ bất thường lượng tử hóa 0.81
       -> jpeg_quantization: Chất lượng ~75 (độ sáng), nhưng các mẫu
          dư cho thấy chất lượng gốc ~92
       -> jpeg_exif_deep: EXIF ghi "iPhone 14 Pro" nhưng trường Software
          ghi "Adobe Photoshop 25.0"
       -> jpeg_thumbnail_compare: Kích thước ảnh thu nhỏ KHÔNG khớp
          ảnh chính (thu nhỏ: 4032x3024, chính: 2048x1536)

       "JPEG này đã bị can thiệp. Bằng chứng:
        1. Phát hiện nén kép — hình ảnh đã được giải mã và mã hóa
           lại với chất lượng thấp hơn (gốc ~92, hiện tại ~75)
        2. EXIF khai báo iPhone 14 Pro nhưng trường phần mềm tiết lộ
           chỉnh sửa Photoshop
        3. Ảnh thu nhỏ từ bản chụp gốc 4032x3024 nhưng ảnh chính
           đã được thay đổi kích thước thành 2048x1536
        Cả ba phát hiện đều độc lập xác nhận sự sửa đổi sau khi chụp."
```

---

## Tham Chiếu Công Cụ (60 công cụ)

### Tổng Quan Danh Mục

| Danh mục | Công cụ | Mô tả |
|----------|-------|-------------|
| [Phân tích giấu tin hình ảnh](#-phân-tích-giấu-tin-hình-ảnh-14) | 14 | Phát hiện LSB, chi-square, phân tích RS, bản đồ entropy, bit planes, histogram, siêu dữ liệu, chữ ký công cụ |
| [Phân tích JPEG](#-phân-tích-jpeg-7) | 7 | Histogram DCT, nén kép, bảng lượng tử hóa, EXIF chuyên sâu, pháp y ảnh thu nhỏ, phân tích bình luận |
| [Phân tích giấu tin âm thanh](#-phân-tích-giấu-tin-âm-thanh-7) | 7 | Phát hiện WAV LSB, phân tích phổ, phân tích vùng im lặng, phát hiện ẩn tiếng vọng, trích xuất siêu dữ liệu |
| [Văn bản & Unicode](#-văn-bản--unicode-10) | 10 | Ký tự không rộng, mã hóa khoảng trắng, Unicode vô hình, homoglyph, acrostic, phân tích Unicode |
| [Pháp y tệp](#-pháp-y-tệp-10) | 10 | Magic bytes, phát hiện đa định dạng, tệp nhúng, dữ liệu đính kèm, entropy, hex dump, strings, headers |
| [Phân tích tài liệu](#-phân-tích-tài-liệu-5) | 5 | Nội dung ẩn PDF, siêu dữ liệu PDF, luồng PDF, nội dung ẩn HTML, siêu dữ liệu XML |
| [Mã hóa & Mật mã](#-mã-hóa--mật-mã-7) | 7 | Phát hiện mã hóa, giải mã đa định dạng, phân tích tần suất, entropy, XOR brute-force, nhận dạng hash, mẫu mật mã |

---

<details open>
<summary><h3>Phân Tích Giấu Tin Hình Ảnh (14)</h3></summary>

| Công cụ | Mô tả |
|------|-------------|
| `img_detect` | Tự động phát hiện giấu tin trong hình ảnh. Chạy kiểm tra chi-square, phân tích RS, entropy, siêu dữ liệu, dữ liệu đính kèm và chữ ký công cụ. Trả về báo cáo JSON toàn diện |
| `img_lsb_detect` | Phát hiện giấu tin LSB bằng thống kê. Chạy phân tích chi-square và cặp mẫu trên từng kênh màu độc lập |
| `img_lsb_extract` | Trích xuất dữ liệu ẩn từ LSBs hình ảnh. Trích xuất bits từ các kênh và bit plane chỉ định, thử giải mã UTF-8 và hiển thị hex dump |
| `img_lsb_embed` | Nhúng tin nhắn vào hình ảnh bằng giấu tin LSB. Đọc tệp PNG, nhúng tin nhắn vào các bit có ý nghĩa thấp nhất và ghi tệp PNG mới |
| `img_bitplane` | Trích xuất và trực quan hóa bit plane cụ thể từ kênh hình ảnh. Hiển thị kích thước, phần trăm bit-1 và bản xem trước ASCII art |
| `img_chi_square` | Tấn công phân tích chi-square trên từng kênh màu độc lập. Phát hiện thay thế LSB bằng cách kiểm tra xem các cặp giá trị pixel liền kề có bị cân bằng hay không |
| `img_rs_analysis` | Phân tích RS (Regular-Singular) theo phương pháp Fridrich-Goljan-Du. Phân tích nhóm pixel để ước tính tỷ lệ nhúng LSB theo kênh |
| `img_histogram` | Tạo histogram giá trị pixel với phát hiện bất thường. Phát hiện bất thường Cặp Giá Trị (PoV) cho thấy giấu tin LSB |
| `img_entropy_map` | Phân tích entropy theo block hình ảnh. Chia hình ảnh thành các block và tính entropy Shannon theo block, đánh dấu vùng entropy cao |
| `img_metadata` | Trích xuất siêu dữ liệu chuyên sâu từ hình ảnh. Với PNG: text chunks, danh sách chunks, thông tin IHDR. Với JPEG: EXIF, bình luận, bảng lượng tử hóa, danh sách điểm đánh dấu |
| `img_appended_data` | Phát hiện và trích xuất dữ liệu đính kèm sau điểm đánh dấu EOF hình ảnh. Kiểm tra dữ liệu ẩn sau PNG IEND, JPEG EOI hoặc ranh giới kích thước BMP |
| `img_compare` | So sánh hai hình ảnh pixel-theo-pixel. Báo cáo số pixel giống/khác, chênh lệch tối đa và kênh nào bị ảnh hưởng |
| `img_channel_analysis` | Phân tích thống kê theo kênh cho R, G, B và A. Báo cáo trung bình, độ lệch chuẩn, entropy, min, max và số giá trị duy nhất |
| `img_known_tools` | Quét bytes tệp hình ảnh để tìm chữ ký công cụ giấu tin đã biết. Kiểm tra cơ sở dữ liệu mẫu từ OpenStego, Steghide, JSteg, F5 và các công cụ khác |

</details>

<details>
<summary><h3>Phân Tích JPEG (7)</h3></summary>

| Công cụ | Mô tả |
|------|-------------|
| `jpeg_structure` | Phân tích điểm đánh dấu/phân đoạn JPEG với offset và kích thước. Hiển thị cấu trúc bên trong bao gồm tất cả điểm đánh dấu, vị trí và độ dài phân đoạn |
| `jpeg_dct_histogram` | Phân tích phân bổ hệ số DCT để phát hiện giấu tin. Phân tích phân bổ giá trị pixel kênh Y và dữ liệu entropy SOS để phát hiện bất thường do JSteg, F5 và OutGuess gây ra |
| `jpeg_double_compression` | Phát hiện artifact nén kép JPEG. Nhận dạng artifact blocking đặc trưng và bất thường bảng lượng tử hóa &mdash; chỉ báo phổ biến của việc can thiệp hình ảnh hoặc nhúng giấu tin |
| `jpeg_quantization` | Phân tích bảng lượng tử hóa với ước tính chất lượng. Hiển thị tất cả bảng lượng tử hóa dạng lưới 8x8 và ước tính hệ số chất lượng JPEG |
| `jpeg_exif_deep` | Phân tích EXIF chuyên sâu bao gồm tọa độ GPS, dấu thời gian, thông tin phần mềm, ảnh thu nhỏ, ghi chú nhà sản xuất và tất cả mục IFD. Đánh dấu trường có ý nghĩa pháp y |
| `jpeg_thumbnail_compare` | So sánh ảnh thu nhỏ EXIF với ảnh JPEG chính. Sai lệch kích thước hoặc nội dung cho thấy sửa đổi sau khi chụp &mdash; artifact pháp y phổ biến |
| `jpeg_comment` | Trích xuất và phân tích điểm đánh dấu bình luận JPEG COM. Kiểm tra mẫu dữ liệu ẩn, bình luận lớn bất thường và nội dung entropy cao |

</details>

<details>
<summary><h3>Phân Tích Giấu Tin Âm Thanh (7)</h3></summary>

| Công cụ | Mô tả |
|------|-------------|
| `audio_detect` | Tự động phát hiện giấu tin âm thanh trong tệp WAV. Chạy LSB chi-square, phân tích entropy, kiểm tra siêu dữ liệu và kiểm tra dữ liệu đính kèm |
| `audio_lsb_detect` | Phân tích thống kê LSB mẫu PCM. Thực hiện kiểm tra chi-square trên LSBs nhóm theo cặp giá trị để phát hiện giấu tin thay thế LSB |
| `audio_lsb_extract` | Trích xuất dữ liệu LSB từ mẫu âm thanh. Đọc bit có ý nghĩa thấp nhất của mỗi mẫu PCM và thử giải mã dữ liệu ẩn |
| `audio_spectrum` | Phân tích phổ để tìm tín hiệu ẩn trong âm thanh WAV. Phân tích phân bổ giá trị mẫu, tỷ lệ vượt qua số không, năng lượng RMS theo block và phát hiện vùng yên tĩnh bất thường |
| `audio_metadata` | Trích xuất siêu dữ liệu từ tệp WAV bao gồm các chunk RIFF INFO, chi tiết định dạng và tất cả thông tin chunk |
| `audio_silence` | Phân tích vùng im lặng trong âm thanh WAV để tìm dữ liệu ẩn. Tìm vùng mẫu gần bằng không và kiểm tra LSBs của chúng &mdash; vùng im lặng có LSBs hoạt động là chỉ báo giấu tin mạnh |
| `audio_echo_detect` | Phát hiện ẩn giấu bằng tiếng vọng qua phân tích tự tương quan. Tính tự tương quan chuẩn hóa tại các độ trễ tiếng vọng phổ biến. Mẫu tiếng vọng đều đặn cho thấy ẩn giấu giấu tin bằng tiếng vọng |

</details>

<details>
<summary><h3>Văn Bản & Unicode (10)</h3></summary>

| Công cụ | Mô tả |
|------|-------------|
| `text_detect` | Tự động phát hiện giấu tin văn bản. Kiểm tra ký tự không rộng, mã hóa khoảng trắng, Unicode vô hình, homoglyph và các mẫu bất thường |
| `text_zwc_detect` | Phát hiện ký tự không rộng (ZWSP, ZWNJ, ZWJ, BOM) trong văn bản. Báo cáo vị trí, số lượng và độ dài tin nhắn mã hóa tiềm năng |
| `text_zwc_extract` | Giải mã tin nhắn mã hóa bằng ký tự không rộng. Trích xuất ký tự ZWC và giải mã nhị phân: ZWSP=0, ZWNJ=1 (thử cả hai cực tính) |
| `text_zwc_embed` | Nhúng tin nhắn bí mật vào văn bản che bằng ký tự không rộng. Mã hóa tin nhắn thành nhị phân và ánh xạ bits thành ZWSP(0)/ZWNJ(1) |
| `text_whitespace_detect` | Phát hiện mã hóa khoảng trắng trong văn bản. Kiểm tra từng dòng để tìm mẫu khoảng trắng ở cuối trong đó space=0 và tab=1 có thể mã hóa dữ liệu nhị phân |
| `text_whitespace_extract` | Trích xuất tin nhắn mã hóa khoảng trắng từ văn bản. Đọc khoảng trắng cuối mỗi dòng và giải mã mã hóa nhị phân space=0/tab=1 |
| `text_invisible_scan` | Quét văn bản tìm TẤT CẢ ký tự Unicode vô hình. Kiểm tra mỗi ký tự với cơ sở dữ liệu ký tự vô hình đầy đủ và báo cáo vị trí và tên |
| `text_homoglyph` | Phát hiện thay thế homoglyph Unicode trong văn bản. Nhận dạng ký tự phi-ASCII trông giống ký tự ASCII (chữ a Cyrillic so với chữ a Latin, v.v.) |
| `text_unicode_analysis` | Phân tích phân bổ ký tự Unicode đầy đủ. Phân loại tất cả ký tự theo khối script, thực hiện phân tích entropy và phát hiện trộn script đáng ngờ |
| `text_acrostic` | Phát hiện mẫu chữ cái đầu, từ đầu, chữ cái cuối, từ cuối hoặc ký tự thứ n (tin nhắn acrostic) ẩn trong các dòng văn bản |

</details>

<details>
<summary><h3>Pháp Y Tệp (10)</h3></summary>

| Công cụ | Mô tả |
|------|-------------|
| `file_identify` | Nhận dạng loại tệp qua magic bytes. Đọc header tệp và đối chiếu với cơ sở dữ liệu toàn diện các chữ ký tệp đã biết. Kiểm tra sai lệch phần mở rộng |
| `file_polyglot` | Phát hiện tệp đa định dạng hợp lệ ở hai hoặc nhiều định dạng cùng lúc. Kiểm tra nhiều chữ ký tệp hợp lệ tại các offset khác nhau (PDF+ZIP, PNG+PDF, v.v.) |
| `file_embedded` | Quét tìm tệp nhúng bên trong tệp nhị phân, tương tự binwalk. Tìm kiếm chữ ký magic byte đã biết tại mọi offset để phát hiện tệp ẩn hoặc đính kèm |
| `file_appended` | Phát hiện dữ liệu đính kèm sau điểm đánh dấu EOF riêng theo định dạng. Hỗ trợ PNG (IEND), JPEG (FFD9), BMP, ZIP (EOCD) và PDF (%%EOF) |
| `file_entropy` | Phân tích entropy theo phân đoạn. Tính entropy Shannon theo block và tổng thể, đánh dấu các phân đoạn entropy cao bất thường |
| `file_entropy_visual` | Trực quan hóa entropy ASCII của tệp. Vẽ biểu đồ thanh dạng văn bản hiển thị mức entropy xuyên suốt tệp để phát hiện bất thường bằng mắt |
| `file_strings` | Trích xuất chuỗi in được và Unicode từ tệp nhị phân. Quét tìm chuỗi ký tự in được và báo cáo cùng offset tệp. Hỗ trợ ASCII, UTF-8, UTF-16 |
| `file_hex` | Hex dump với thanh bên ASCII. Định dạng hex editor truyền thống với địa chỉ offset, hex bytes và biểu diễn ASCII in được |
| `file_header` | Phân tích header và cấu trúc chuyên sâu cho các định dạng đã biết. Phân tích PNG IHDR, JPEG SOF, BMP info header, ZIP local file headers và PDF version/siêu dữ liệu |
| `file_compare` | So sánh nhị phân hai tệp. So sánh byte-theo-byte báo cáo chênh lệch với offset, phần trăm giống nhau và phát hiện chênh lệch chỉ LSB cho phân tích giấu tin |

</details>

<details>
<summary><h3>Phân Tích Tài Liệu (5)</h3></summary>

| Công cụ | Mô tả |
|------|-------------|
| `doc_pdf_hidden` | Phát hiện nội dung PDF ẩn. Quét tìm JavaScript, hành động tự động, OpenAction, chú thích ẩn, văn bản vô hình, tệp nhúng và nội dung bí mật khác |
| `doc_pdf_metadata` | Trích xuất siêu dữ liệu PDF. Phân tích từ điển /Info và khối siêu dữ liệu XMP để phân tích nguồn gốc tài liệu và truy nguyên pháp y |
| `doc_pdf_streams` | Phân tích luồng PDF. Định vị tất cả khối stream/endstream, thử giải nén zlib và báo cáo kích thước cùng entropy để tìm dữ liệu ẩn |
| `doc_html_hidden` | Phát hiện nội dung HTML ẩn. Quét tìm bình luận, phần tử display:none, thuộc tính data-*, input ẩn, nội dung base64, phần tử kích thước bằng không và văn bản vô hình |
| `doc_xml_metadata` | Trích xuất siêu dữ liệu XML và tài liệu Office. Phân tích Dublin Core, thuộc tính Microsoft Office, chỉ thị xử lý và các trường siêu dữ liệu khác |

</details>

<details>
<summary><h3>Mã Hóa & Mật Mã (7)</h3></summary>

| Công cụ | Mô tả |
|------|-------------|
| `crypto_detect` | Tự động phát hiện loại mã hóa của chuỗi đầu vào. Thử đối chiếu với tất cả mẫu đã biết (Base64, hex, nhị phân, morse, URL encoding, HTML entities, v.v.) và trả về kết quả sắp xếp theo độ tin cậy |
| `crypto_decode` | Bộ giải mã đa định dạng hỗ trợ Base64, hex, nhị phân, thập phân, bát phân, URL encoding, ROT13, Base32, mã Morse và HTML entities. Chế độ tự động phát hiện mã hóa trước |
| `crypto_frequency` | Phân tích tần suất ký tự cho phân tích mật mã. Đếm lần xuất hiện ký tự, so sánh với tần suất tiếng Anh chuẩn (ETAOINSHRDLU) và tính Chỉ số Trùng khớp |
| `crypto_entropy` | Tính toán và phân loại entropy Shannon cho chuỗi. Tính entropy cấp ký tự và byte, phân loại từ dữ liệu lặp lại đến mã hóa/ngẫu nhiên |
| `crypto_xor` | Brute-force khóa XOR cho khóa đơn-byte và đa-byte. Thử tất cả 256 khóa đơn-byte và chấm điểm theo xác suất văn bản tiếng Anh. Sử dụng IC để ước tính độ dài khóa đa-byte |
| `crypto_hash_id` | Nhận dạng loại hash. Đối chiếu đầu vào với các mẫu hash đã biết theo độ dài và định dạng (MD5, SHA-1, SHA-256, SHA-512, bcrypt, CRC32, NTLM, v.v.) |
| `crypto_patterns` | Phát hiện mẫu mật mã và mã hóa đã biết. Phân tích văn bản tìm mật mã Caesar, mật mã thay thế, Vigenere, chuyển vị rail fence, Atbash và văn bản đảo ngược |

</details>

---

## Sử Dụng CLI

```bash
# Hiển thị trợ giúp
npx -y steganography-mcp --help

# Liệt kê tất cả 60 công cụ với mô tả
npx -y steganography-mcp --list

# Phát hiện giấu tin trong hình ảnh
npx -y steganography-mcp --tool img_detect '{"file_path":"challenge.png"}'

# Trích xuất tin nhắn ẩn từ LSBs
npx -y steganography-mcp --tool img_lsb_extract '{"file_path":"stego.png"}'

# Phân tích chi-square
npx -y steganography-mcp --tool img_chi_square '{"file_path":"suspect.png"}'

# Phân tích RS (phương pháp Fridrich-Goljan-Du)
npx -y steganography-mcp --tool img_rs_analysis '{"file_path":"suspect.png"}'

# Phát hiện nén kép JPEG
npx -y steganography-mcp --tool jpeg_double_compression '{"file_path":"photo.jpg"}'

# Phân tích EXIF chuyên sâu
npx -y steganography-mcp --tool jpeg_exif_deep '{"file_path":"photo.jpg"}'

# Phát hiện giấu tin âm thanh
npx -y steganography-mcp --tool audio_detect '{"file_path":"message.wav"}'

# Phát hiện mã hóa ký tự không rộng
npx -y steganography-mcp --tool text_zwc_detect '{"text":"suspicious text here"}'

# Nhúng tin nhắn ẩn bằng ký tự không rộng
npx -y steganography-mcp --tool text_zwc_embed '{"text":"cover text","message":"secret"}'

# Nhận dạng loại tệp và phát hiện đa định dạng
npx -y steganography-mcp --tool file_polyglot '{"file_path":"suspicious.pdf"}'

# Quét tìm tệp nhúng (kiểu binwalk)
npx -y steganography-mcp --tool file_embedded '{"file_path":"mystery.bin"}'

# Trực quan hóa entropy
npx -y steganography-mcp --tool file_entropy_visual '{"file_path":"data.bin"}'

# Tự động phát hiện mã hóa
npx -y steganography-mcp --tool crypto_detect '{"input":"aGVsbG8gd29ybGQ="}'

# XOR brute-force
npx -y steganography-mcp --tool crypto_xor '{"input":"4f5243484e"}'

# Phát hiện mẫu mật mã
npx -y steganography-mcp --tool crypto_patterns '{"input":"Gur dhvpx oebja sbk"}'

# Sử dụng Bun (khởi động nhanh hơn)
bunx steganography-mcp --tool img_detect '{"file_path":"image.png"}'
```

---

## Trường Hợp Sử Dụng

### Thử Thách CTF
Giải các thử thách giấu tin trong cuộc thi capture-the-flag. AI agent có thể áp dụng có hệ thống tất cả kỹ thuật phát hiện &mdash; phân tích LSB, kiểm tra siêu dữ liệu, dữ liệu đính kèm, phát hiện mã hóa và nhận dạng mật mã &mdash; để tìm cờ ẩn trong hình ảnh, tệp âm thanh, tài liệu và văn bản.

### Pháp Y Kỹ Thuật Số
Phát hiện kênh liên lạc bí mật trong điều tra pháp y. Phân tích tệp đáng ngờ để tìm dữ liệu ẩn bằng phân tích giấu tin thống kê (chi-square, phân tích RS), kiểm tra dữ liệu đính kèm sau điểm đánh dấu EOF, quét tìm tệp nhúng và nhận dạng chữ ký công cụ giấu tin.

### Nghiên Cứu Bảo Mật
Phân tích công cụ và kỹ thuật giấu tin. So sánh ảnh gốc và ảnh giấu tin pixel-theo-pixel, nghiên cứu phân bổ hệ số DCT trong giấu tin JPEG, đo lường thay đổi entropy do nhúng và dịch ngược các sơ đồ mã hóa.

### Giáo Dục
Tìm hiểu cách hoạt động của các kỹ thuật giấu tin. Nhúng và trích xuất tin nhắn LSB, mã hóa văn bản bằng ký tự không rộng, trực quan hóa bit planes và bản đồ entropy, phân tích cấu trúc tệp bằng hex dumps và nghiên cứu mẫu mật mã bằng phân tích tần suất.

### Ứng Phó Sự Cố
Trong quá trình ứng phó sự cố, kiểm tra tài liệu và hình ảnh để tìm kênh lọc dữ liệu ẩn. Quét PDF tìm JavaScript ẩn và tệp nhúng, phát hiện mã hóa ký tự không rộng trong email, nhận dạng tệp đa định dạng và phân tích các mã hóa đáng ngờ.

---

## Kiến Trúc

```
src/
  index.ts                    # Điểm vào CLI (--help, --list, --tool, stdio server)
  protocol/
    mcp-server.ts             # Thiết lập MCP server (truyền tải stdio)
    tools.ts                  # Sổ đăng ký công cụ — tất cả 60 công cụ được tập hợp tại đây
  types/
    index.ts                  # Kiểu dùng chung (ToolDef, ToolContext, ToolResult)
  utils/
    binary.ts                 # Đọc tệp nhị phân, hex dump, phát hiện định dạng
    stats.ts                  # Entropy Shannon, chi-square, tần suất byte
    cache.ts                  # Bộ nhớ đệm TTL
    png-parser.ts             # Trình phân tích PNG thuần TS (IHDR, chunks, dữ liệu pixel)
    jpeg-parser.ts            # Trình phân tích JPEG thuần TS (markers, EXIF, lượng tử hóa)
    wav-parser.ts             # Trình phân tích WAV thuần TS (chunks RIFF, mẫu PCM)
    bmp-parser.ts             # Trình phân tích BMP thuần TS (header, dữ liệu pixel)
  image/                      # Công cụ Phân tích giấu tin hình ảnh (14)
  jpeg/                       # Công cụ Phân tích JPEG (7)
  audio/                      # Công cụ Phân tích giấu tin âm thanh (7)
  text/                       # Công cụ Văn bản & Unicode (10)
  file/                       # Công cụ Pháp y tệp (10)
  document/                   # Công cụ Phân tích tài liệu (5)
  crypto/                     # Công cụ Mã hóa & Mật mã (7)
  data/
    encoding-patterns.ts      # Mẫu regex mã hóa + bộ giải mã
    magic-bytes.ts            # Cơ sở dữ liệu chữ ký tệp (100+ định dạng)
    stego-signatures.ts       # Chữ ký công cụ giấu tin đã biết
    unicode-invisible.ts      # Cơ sở dữ liệu ký tự Unicode vô hình
```

**Quyết định thiết kế:**

- **4 phụ thuộc, không gì khác** &mdash; `@modelcontextprotocol/sdk` cho giao thức MCP, `zod` cho xác thực đầu vào, `pngjs` cho truy cập pixel PNG, `jpeg-js` cho giải mã JPEG. Không có cây phụ thuộc cồng kềnh. Không có native modules. Không có C bindings. Không có Python. Không có Java.
- **100% ngoại tuyến** &mdash; Mọi công cụ chạy hoàn toàn cục bộ. Không có HTTP requests. Không có API calls. Không có telemetry. Không phụ thuộc cloud. Tệp của bạn không bao giờ rời khỏi máy.
- **Phân tích thống kê TypeScript thuần** &mdash; Kiểm tra chi-square, phân tích RS (Fridrich-Goljan-Du), Phân tích Cặp Mẫu, entropy Shannon, Chỉ số Trùng khớp và phân tích tần suất đều được triển khai bằng TypeScript thuần. Không có thư viện toán học bên ngoài.
- **Trình phân tích định dạng tùy chỉnh** &mdash; PNG chunks, JPEG markers/EXIF/bảng lượng tử hóa, WAV RIFF chunks và BMP headers được phân tích không phụ thuộc bên ngoài bằng các trình phân tích `utils/`. Điều này cho phép phân tích chuyên sâu theo định dạng mà các thư viện đa năng không thể cung cấp.
- **7 nhà cung cấp, 1 server** &mdash; Mỗi danh mục phân tích là một module độc lập. AI agent chọn công cụ nào sử dụng dựa trên ngữ cảnh điều tra.
- **Mẫu ToolDef sạch** &mdash; Mỗi công cụ tuân theo cùng mẫu `{ name, description, schema, execute }`. Thêm công cụ mới chỉ là một object trong module tương ứng.
- **Xác thực Zod trên mọi trường** &mdash; Mỗi trường schema có `.describe()` cho ngữ cảnh AI agent. Đầu vào không hợp lệ được phát hiện trước khi thực thi với thông báo lỗi rõ ràng.

---

## Một Phần Của Bộ Bảo Mật MCP

| Dự án | Lĩnh vực | Công cụ |
|---|---|---|
| [hackbrowser-mcp](https://github.com/badchars/hackbrowser-mcp) | Kiểm thử bảo mật qua trình duyệt | 39 công cụ |
| [cloud-audit-mcp](https://github.com/badchars/cloud-audit-mcp) | Bảo mật đám mây (AWS/Azure/GCP) | 38 công cụ |
| [github-security-mcp](https://github.com/badchars/github-security-mcp) | Bảo mật GitHub | 39 công cụ |
| [cve-mcp](https://github.com/badchars/cve-mcp) | Thông tin lỗ hổng bảo mật | 23 công cụ |
| [osint-mcp-server](https://github.com/badchars/osint-mcp-server) | OSINT & trinh sát | 37 công cụ |
| [darknet-mcp-server](https://github.com/badchars/darknet-mcp-server) | Dark web & thông tin mối đe dọa | 66 công cụ |
| [dns-security-mcp](https://github.com/badchars/dns-security-mcp) | Bảo mật DNS | 103 công cụ |
| **steganography-mcp** | **Phân tích giấu tin** | **60 công cụ** |

---

## Đóng Góp

Chúng tôi hoan nghênh mọi đóng góp. Xem [CONTRIBUTING.md](../../CONTRIBUTING.md) để biết hướng dẫn.

---

<p align="center">
<b>Chỉ dành cho nghiên cứu bảo mật được ủy quyền và mục đích giáo dục.</b><br>
Luôn đảm bảo bạn có sự ủy quyền phù hợp trước khi thực hiện phân tích giấu tin trên các tệp không thuộc sở hữu của bạn.
</p>

<p align="center">
  <a href="../../LICENSE">MIT License</a> &bull; Built by <a href="https://orhanyildirim.us">Orhan Yildirim</a> &bull; <a href="mailto:contact@orhanyildirim.us">contact@orhanyildirim.us</a>
</p>
