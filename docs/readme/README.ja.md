<p align="center">
  <a href="../../README.md">English</a> |
  <a href="README.zh.md">中文</a> |
  <a href="README.zh-TW.md">繁體中文</a> |
  <a href="README.ko.md">한국어</a> |
  <strong>日本語</strong> |
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

<h3 align="center">AIエージェント向けの最も包括的なステガノグラフィ分析ツールキット。</h3>

<p align="center">
  LSB検出、カイ二乗ステガナリシス、RS分析、DCTフォレンジック、オーディオステガノグラフィ、ゼロ幅テキストエンコーディング、ファイルフォレンジック、ポリグロット検出、エンコーディング識別、ビデオ & GIFステガノグラフィ、ネットワーク秘密チャネル、MP3分析、BPCS & スペクトル拡散、アーカイブステガノグラフィ、QRコードステガノグラフィ、作成 & 埋め込み &mdash; 単一のMCPサーバーに統合。<br>
  <b>128ツール。17カテゴリ。4依存関係。100%オフライン。</b>APIキー不要。すべてのツールがローカルで実行されます。
</p>

<br>

<p align="center">
  <a href="#課題">課題</a> &bull;
  <a href="#何が違うのか">何が違うのか</a> &bull;
  <a href="#クイックスタート">クイックスタート</a> &bull;
  <a href="#aiにできること">AIにできること</a> &bull;
  <a href="#ツールリファレンス128ツール">ツール (128)</a> &bull;
  <a href="#cli-の使い方">CLI の使い方</a> &bull;
  <a href="#アーキテクチャ">アーキテクチャ</a> &bull;
  <a href="../../CONTRIBUTING.md">コントリビュートガイド</a>
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

## 課題

ステガノグラフィは、データを見えないように隠す技術です &mdash; 画像、音声ファイル、ドキュメント、さらにはUnicodeテキストの中に。CTF競技、デジタルフォレンジック調査、秘密通信チャネル、マルウェアペイロードで使用されています。その検出には、統計分析、フォーマット固有のパース、エントロピー測定、ドメイン専門知識の組み合わせが必要です。

```
従来のステガノグラフィ分析ワークフロー：
  画像ステゴ検出              ->  zsteg + stegsolve（2ツール、Ruby + Java）
  カイ二乗分析                ->  カスタムPythonスクリプト
  RS分析                      ->  カスタムMATLAB/Pythonコード
  JPEG DCTフォレンジック       ->  stegdetect（2004年に放棄されたCツール）
  LSBデータ抽出               ->  zsteg + steghide + openstego（3ツール）
  オーディオステガノグラフィ   ->  Audacity手動操作 + カスタムスクリプト
  ゼロ幅文字検出              ->  Webベースツール + 手動検査
  ファイルフォレンジック       ->  binwalk + foremost + xxd（3ツール）
  EXIFメタデータ              ->  exiftool（Perl依存）
  エンコーディング検出        ->  CyberChef Web UI + 手動推測
  ─────────────────────────────────
  合計：10以上のツール、5以上の言語、数時間の手動相関分析
```

**steganography-mcp**は、[Model Context Protocol](https://modelcontextprotocol.io)を通じてAIエージェントに17カテゴリにわたる128ツールを提供します。エージェントは画像ステガナリシス、JPEGフォレンジック、オーディオ分析、テキストステガノグラフィ検出、ファイルフォレンジック、ドキュメント分析、エンコーディング識別、ビデオ & GIFステガノグラフィ、ネットワーク秘密チャネル、MP3分析、BPCS & スペクトル拡散分析、アーカイブステガノグラフィ、QRコードステガノグラフィ、作成 & 埋め込みを実行します &mdash; すべて1つの会話の中で、100%ローカルで、外部サービスへの依存なく動作します。

```
steganography-mcpの場合：
  あなた：「このCTFチャレンジ画像に隠されたデータがないか分析して」

  エージェント：-> img_detect：カイ二乗 p=0.0001（LSB埋め込みを検出）、
                   RS分析が埋め込み率42%と推定、右下領域に
                   エントロピー異常
               -> img_lsb_extract：RGB LSBから847バイトを抽出
               -> crypto_detect：抽出データはBase64エンコーディング
               -> crypto_decode：デコード結果 "FLAG{hidden_in_plain_sight_2024}"
               -> img_known_tools：OpenStegoのシグネチャに一致

               「この画像にはOpenStegoで埋め込まれたLSBステガノグラフィ
                が含まれています。カイ二乗検定が3つのRGBチャネル
                すべてでLSB置換を確認し、埋め込み率は42%です。
                隠されたペイロードはBase64でエンコードされており、
                デコードするとフラグになります：
                FLAG{hidden_in_plain_sight_2024}」
```

---

## 何が違うのか

ほとんどのステガノグラフィツールは単一用途のユーティリティです。steganography-mcpはAIエージェントに**すべてのステガノグラフィ技術を同時に横断的に推論する**能力を与えます。

<table>
<thead>
<tr>
<th></th>
<th>従来のアプローチ</th>
<th>steganography-mcp</th>
</tr>
</thead>
<tbody>
<tr>
<td><b>インターフェース</b></td>
<td>10以上のCLIツール、5以上の言語、Web UI</td>
<td>MCP &mdash; AIエージェントが対話形式でツールを呼び出し</td>
</tr>
<tr>
<td><b>カバレッジ</b></td>
<td>一度に1つの技術のみ</td>
<td>17カテゴリ、128ツールの並列実行</td>
</tr>
<tr>
<td><b>画像分析</b></td>
<td>zsteg（Ruby）、stegsolve（Java）、カスタムスクリプト</td>
<td>エージェントがカイ二乗、RS分析、SPA、エントロピーマップ、ヒストグラム、ビットプレーン抽出、メタデータ、ツールシグネチャ検出を一括実行</td>
</tr>
<tr>
<td><b>JPEGフォレンジック</b></td>
<td>stegdetect（放棄済み）、手動DCT検査</td>
<td>エージェントがDCTヒストグラム、二重圧縮、量子化テーブル、EXIF深層分析、サムネイル比較、コメントフィールドを分析</td>
</tr>
<tr>
<td><b>オーディオステゴ</b></td>
<td>Audacity + 手動LSBスクリプト</td>
<td>エージェントがLSBカイ二乗、スペクトル分析、無音区間LSBチェック、エコー隠蔽検出、メタデータ抽出を実行</td>
</tr>
<tr>
<td><b>テキストステゴ</b></td>
<td>Webベースツール、手動検査</td>
<td>エージェントがゼロ幅文字、空白エンコーディング、不可視Unicode、ホモグリフ、アクロスティックを検出 &mdash; さらにZWCメッセージの埋め込み・抽出が可能</td>
</tr>
<tr>
<td><b>依存関係</b></td>
<td>Ruby、Java、Perl、Python、C、Webツール</td>
<td><code>npx -y steganography-mcp</code> &mdash; 4依存関係、純粋なTypeScript</td>
</tr>
<tr>
<td><b>APIキー</b></td>
<td>該当なし（ただしツールチェーンが分散）</td>
<td>ゼロ。100%オフライン、外部呼び出しなし</td>
</tr>
<tr>
<td><b>出力</b></td>
<td>生テキスト、画像、手動相関分析</td>
<td>構造化JSON &mdash; AIが自動的に発見事項を相関分析</td>
</tr>
</tbody>
</table>

---

## クイックスタート

### オプション1：npx（インストール不要）

```bash
npx -y steganography-mcp
```

128ツールすべてが即座に利用可能。APIキー不要。設定不要。100%オフライン。

### オプション2：bunx（より高速）

```bash
bunx steganography-mcp
```

### オプション3：クローン

```bash
git clone https://github.com/badchars/steganography-mcp.git
cd steganography-mcp
bun install
```

### AIエージェントに接続

<details open>
<summary><b>Claude Code</b></summary>

```bash
# npxを使用
claude mcp add steganography -- npx -y steganography-mcp

# ローカルクローンを使用
claude mcp add steganography -- bun run /path/to/steganography-mcp/src/index.ts
```

</details>

<details>
<summary><b>Claude Desktop</b></summary>

`~/Library/Application Support/Claude/claude_desktop_config.json` に追加：

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
<summary><b>Cursor / Windsurf / その他のMCPクライアント</b></summary>

同じJSON設定形式です。コマンドを `npx -y steganography-mcp` またはローカルインストールパスに指定してください。

</details>

### 分析を開始

```
あなた：「この画像に隠されたデータがないか確認して」
```

これだけです。エージェントがカイ二乗分析、RS分析、エントロピーマッピング、メタデータ抽出、付加データ検出、ツールシグネチャスキャンを自動的に実行します。

---

## AIにできること

### CTFチャレンジソルバー

```
あなた：「このCTFステガノグラフィチャレンジを解いて — 画像はchallenge.pngにある」

エージェント：-> img_detect：カイ二乗ステガナリシスがLSB埋め込みを検出
                 （p=0.00012）、RS分析が埋め込み率38%と推定、
                 ブロック(12,4)-(15,8)にエントロピー異常
              -> img_lsb_extract：RGBチャネルLSBから1,247バイト抽出
              -> crypto_detect：Base64パターンに一致（信頼度：0.95）
              -> crypto_decode："Q1RGe3N0M2cwX21hc3Rlcn0=" -> "CTF{st3g0_master}"
              -> img_known_tools：PNGチャンクでOpenStegoシグネチャを検出

              「フラグを発見しました：CTF{st3g0_master}
               この画像にはOpenStegoで埋め込まれたLSBステガノグラフィ
               が使用されています。ペイロードはRGB最下位ビットに
               Base64でエンコードされており、埋め込み率は38%です。」
```

### デジタルフォレンジック調査

```
あなた：「suspect.pngとsuspect.wavに秘密通信がないか分析して」

エージェント：-> img_detect：LSBステゴは検出されず、ただし付加データを発見
                 （PNG IENDマーカー後に12,847バイト）
              -> file_identify：付加データがZIPシグネチャ（PK）で開始
              -> img_metadata：PNG tEXtチャンクに異常なキー "comm"を含む、
                 値はBase64エンコーディング
              -> audio_detect：WAVファイルにLSBカイ二乗異常（p=0.003）
              -> audio_silence：アクティブなLSBを持つ無音区間を3つ検出
              -> audio_lsb_extract：2,048バイトの隠しデータを抽出

              「両ファイルに隠しデータが含まれています：
               1. suspect.pngにはPNG EOFマーカー後にZIPアーカイブが
                  付加されており、メタデータにBase64エンコードされた
                  メッセージもあります
               2. suspect.wavにはLSBステガノグラフィが含まれており、
                  特に無音区間に集中しています — 意図的な隠蔽の
                  強力な指標です。
               ZIPの抽出とWAVペイロードの分析をお勧めします。」
```

### ゼロ幅文字検出

```
あなた：「このメールは正常に見えるけど、隠されたテキストがあるかもしれない」

エージェント：-> text_detect：可視文字間に847個のゼロ幅文字を検出
              -> text_zwc_detect：ZWSP（342）、ZWNJ（505）がテキスト
                 全体の127箇所で発見
              -> text_zwc_extract：バイナリデコード結果 "EXFIL-ROUTE-7"
              -> text_invisible_scan：ヘッダーセクションに3つの追加
                 不可視Unicode文字（U+2060、U+FEFF）を発見

              「このメールにはゼロ幅文字でエンコードされた隠しメッセージ
               が含まれています：'EXFIL-ROUTE-7'。847個の不可視文字が
               可視テキスト全体に分散しており、ZWSP/ZWNJバイナリ
               エンコーディングを使用しています。さらにヘッダーに
               3つのWord JoinerとBOM文字が見つかりました — メタデータ
               の残留物と考えられます。」
```

### JPEGフォレンジック分析

```
あなた：「このJPEG画像は本物？それとも改ざんされている？」

エージェント：-> jpeg_structure：14マーカーをパース、正常なJFIF構造
              -> jpeg_double_compression：二重圧縮を検出 —
                 ブロッキングアーティファクトスコア0.73、
                 量子化異常率0.81
              -> jpeg_quantization：品質約75（輝度）、ただし残留パターンが
                 元の品質約92を示唆
              -> jpeg_exif_deep：EXIFに "iPhone 14 Pro" と表示、ただし
                 ソフトウェアフィールドに "Adobe Photoshop 25.0"
              -> jpeg_thumbnail_compare：サムネイルサイズがメイン画像と
                 不一致（サムネイル：4032x3024、メイン：2048x1536）

              「このJPEGは改ざんされています。証拠：
               1. 二重圧縮を検出 — 画像がデコードされ、より低い
                  品質で再エンコード（元の約92、現在の約75）
               2. EXIFはiPhone 14 Proを主張していますが、ソフトウェア
                  フィールドがPhotoshopの編集を暴露
               3. サムネイルは元の4032x3024の撮影からのものですが、
                  メイン画像は2048x1536にリサイズ
               3つの発見がそれぞれ独立して撮影後の改変を
               確認しています。」
```

---

## ツールリファレンス（128ツール）

### カテゴリ概要

| カテゴリ | ツール数 | 説明 |
|----------|----------|------|
| [画像ステガナリシス](#-画像ステガナリシス14) | 14 | LSB検出、カイ二乗、RS分析、エントロピーマップ、ビットプレーン、ヒストグラム、メタデータ、ツールシグネチャ |
| [JPEG分析](#-jpeg分析7) | 7 | DCTヒストグラム、二重圧縮、量子化テーブル、EXIF深層分析、サムネイルフォレンジック、コメント分析 |
| [オーディオステガナリシス](#-オーディオステガナリシス7) | 7 | WAV LSB検出、スペクトル分析、無音区間分析、エコー隠蔽、メタデータ抽出 |
| [テキスト & Unicode](#-テキスト--unicode10) | 10 | ゼロ幅文字、空白エンコーディング、不可視Unicode、ホモグリフ、アクロスティック、Unicode分析 |
| [ファイルフォレンジック](#-ファイルフォレンジック10) | 10 | マジックバイト、ポリグロット検出、埋め込みファイル、付加データ、エントロピー、ヘックスダンプ、文字列、ヘッダー |
| [ドキュメント分析](#-ドキュメント分析5) | 5 | PDF隠しコンテンツ、PDFメタデータ、PDFストリーム、HTML隠しコンテンツ、XMLメタデータ |
| [エンコーディング & 暗号](#-エンコーディング--暗号7) | 7 | エンコーディング検出、マルチフォーマットデコーダー、頻度分析、エントロピー、XORブルートフォース、ハッシュ識別、暗号パターン |
| 高度なJPEG | 7 | F5、JSteg、OutGuess、PVD検出、スライディングウィンドウカイ二乗、クロップ再キャリブレーションステガナリシス、ツール互換性 |
| ビデオステガノグラフィ | 8 | AVIフレームLSB、インターフレーム分析、フレーム比較、メタデータ、構造、EOFデータ |
| GIFステガノグラフィ | 8 | パレットLSB、LZWサブブロックエントロピー、コメント拡張、アプリケーション拡張、フレーム分析 |
| ネットワークステガノグラフィ | 8 | PCAPコバートチャネル、IP/TCPヘッダー分析、ICMPペイロード、DNSトンネリング、HTTPヘッダー、タイミング |
| MP3ステガノグラフィ | 7 | ID3隠しデータ、フレーム分析、パディング操作、サンプル分析、メタデータ、構造 |
| スペクトル拡散 | 5 | DFTマグニチュードスペクトル、自己相関、透かし検出、ノイズフロア分析、パッチワーク検出 |
| BPCS分析 | 5 | ビットプレーン複雑度セグメンテーション、複雑度マッピング、閾値分析、データ抽出、容量推定 |
| アーカイブステガノグラフィ | 7 | ZIPスラックスペース、拡張フィールド、コメント、ポリグロット検出、構造分析、メタデータ |
| 作成 & 埋め込み | 7 | EOFインジェクション、メタデータインジェクション、空白エンコーディング、ヌル暗号、ポリグロット作成、コメントインジェクション、パレット埋め込み |
| QRコードステガノグラフィ | 6 | QRステゴ検出、構造分析、ECC容量、モジュール分析、データ抽出、比較 |

---

<details open>
<summary><h3>画像ステガナリシス（14）</h3></summary>

| ツール | 説明 |
|--------|------|
| `img_detect` | 画像のステガノグラフィ自動検出。カイ二乗、RS分析、エントロピー、メタデータ、付加データ、ツールシグネチャチェックを実行し、包括的なJSONレポートを返却 |
| `img_lsb_detect` | 統計的LSBステガノグラフィ検出。各カラーチャネルに対して独立にカイ二乗およびサンプルペア分析を実行 |
| `img_lsb_extract` | 画像LSBから隠しデータを抽出。指定チャネルとビットプレーンからビットを抽出し、UTF-8デコードを試行し、ヘックスダンプを表示 |
| `img_lsb_embed` | LSBステガノグラフィを使用して画像にメッセージを埋め込み。PNGファイルを読み取り、最下位ビットにメッセージを埋め込み、新しいPNGファイルに書き出し |
| `img_bitplane` | 画像チャネルの特定ビットプレーンの抽出と可視化。寸法、1ビット割合、ASCIIアートプレビューを表示 |
| `img_chi_square` | 各カラーチャネルに対する独立したカイ二乗ステガナリシス攻撃。隣接ピクセル値ペアの均等化をテストしてLSB置換を検出 |
| `img_rs_analysis` | Fridrich-Goljan-Du法を使用したRS（Regular-Singular）ステガナリシス。ピクセルグループを分析してチャネルごとのLSB埋め込み率を推定 |
| `img_histogram` | 異常検出機能付きピクセル値ヒストグラム生成。LSBステガノグラフィを示す値ペア（PoV）異常を検出 |
| `img_entropy_map` | 画像のブロック単位エントロピー分析。画像をブロックに分割し、ブロックごとのShannon エントロピーを計算して高エントロピー領域をフラグ付け |
| `img_metadata` | 画像の深層メタデータ抽出。PNG：テキストチャンク、チャンクリスト、IHDR情報。JPEG：EXIF、コメント、量子化テーブル、マーカーリスト |
| `img_appended_data` | 画像EOFマーカー後に付加されたデータの検出と抽出。PNG IEND、JPEG EOI、BMPファイルサイズ境界後の隠しデータを確認 |
| `img_compare` | 2つの画像のピクセル単位比較。同一/異なるピクセル数、最大差分、影響を受けるチャネルを報告 |
| `img_channel_analysis` | R、G、B、Aチャネルの独立統計分析。平均、標準偏差、エントロピー、最小値、最大値、ユニーク値数を報告 |
| `img_known_tools` | 画像ファイルバイトをスキャンして既知のステガノグラフィツールシグネチャとマッチング。OpenStego、Steghide、JSteg、F5などのパターンデータベースと照合 |

</details>

<details>
<summary><h3>JPEG分析（7）</h3></summary>

| ツール | 説明 |
|--------|------|
| `jpeg_structure` | JPEGマーカー/セグメントをオフセットとサイズ付きでパース。すべてのマーカー、位置、セグメント長を含む内部構造を表示 |
| `jpeg_dct_histogram` | ステガノグラフィ検出のためのDCT係数分布分析。Yチャネルピクセル値分布とSOSエントロピーデータを分析し、JSteg、F5、OutGuessによる異常を検出 |
| `jpeg_double_compression` | JPEG二重圧縮アーティファクトの検出。特徴的なブロッキングアーティファクトと量子化テーブル異常を識別 &mdash; 画像改ざんまたはステゴ埋め込みの一般的な指標 |
| `jpeg_quantization` | 量子化テーブル分析と品質推定。すべての量子化テーブルを8x8グリッド形式で表示し、JPEG品質ファクターを推定 |
| `jpeg_exif_deep` | GPS座標、タイムスタンプ、ソフトウェア情報、サムネイル、メーカーノート、すべてのIFDエントリを含む深層EXIF分析。フォレンジック的に興味深いフィールドをフラグ付け |
| `jpeg_thumbnail_compare` | EXIFサムネイルとJPEGメイン画像の比較。サイズまたはコンテンツの不一致は撮影後の改変を示す &mdash; 一般的なフォレンジック痕跡 |
| `jpeg_comment` | JPEG COM（コメント）マーカーの抽出と分析。隠しデータパターン、異常に大きなコメント、高エントロピーコンテンツを確認 |

</details>

<details>
<summary><h3>オーディオステガナリシス（7）</h3></summary>

| ツール | 説明 |
|--------|------|
| `audio_detect` | WAVファイルのオーディオステガノグラフィ自動検出。LSBカイ二乗、エントロピー分析、メタデータ検査、付加データチェックを実行 |
| `audio_lsb_detect` | PCMサンプルLSB統計分析。値ペア別にグループ化されたLSBに対してカイ二乗検定を実行し、LSB置換ステガノグラフィを検出 |
| `audio_lsb_extract` | オーディオサンプルからLSBデータを抽出。各PCMサンプルの最下位ビットを読み取り、隠しデータのデコードを試行 |
| `audio_spectrum` | WAVオーディオの隠し信号のスペクトル分析。サンプル値分布、ゼロクロッシングレート、ブロックごとのRMSエネルギーを分析し、異常な静音セクションを検出 |
| `audio_metadata` | RIFF INFOチャンク、フォーマット詳細、すべてのチャンク情報を含むWAVファイルメタデータの抽出 |
| `audio_silence` | WAVオーディオの無音区間の隠しデータ分析。ほぼゼロのサンプル領域を見つけてLSBを検査 &mdash; アクティブなLSBを持つ無音区間はステゴの強力な指標 |
| `audio_echo_detect` | 自己相関分析によるエコー隠蔽検出。一般的なエコー遅延で正規化自己相関を計算。規則的なエコーパターンはステガノグラフィのエコー隠蔽を示す |

</details>

<details>
<summary><h3>テキスト & Unicode（10）</h3></summary>

| ツール | 説明 |
|--------|------|
| `text_detect` | テキストステガノグラフィの自動検出。ゼロ幅文字、空白エンコーディング、不可視Unicode、ホモグリフ、異常パターンを確認 |
| `text_zwc_detect` | テキスト中のゼロ幅文字（ZWSP、ZWNJ、ZWJ、BOM）を検出。位置、カウント、潜在的なエンコードメッセージ長を報告 |
| `text_zwc_extract` | ゼロ幅文字でエンコードされたメッセージをデコード。ZWC文字を抽出しバイナリデコード：ZWSP=0、ZWNJ=1（両極性を試行） |
| `text_zwc_embed` | ゼロ幅文字を使用してカバーテキストに秘密メッセージを埋め込み。メッセージをバイナリにエンコードしビットをZWSP(0)/ZWNJ(1)にマッピング |
| `text_whitespace_detect` | テキストの空白エンコーディングを検出。各行の末尾空白パターンを検査し、スペース=0、タブ=1がバイナリデータをエンコードしている可能性を確認 |
| `text_whitespace_extract` | テキストから空白エンコードメッセージを抽出。各行の末尾空白を読み取り、スペース=0/タブ=1のバイナリエンコーディングをデコード |
| `text_invisible_scan` | テキスト中のすべての不可視Unicode文字をスキャン。完全な不可視文字データベースと各文字を照合し、位置と名前を報告 |
| `text_homoglyph` | テキスト中のUnicodeホモグリフ置換を検出。ASCII文字と視覚的に類似する非ASCII文字を識別（キリル文字aとラテン文字aなど） |
| `text_unicode_analysis` | 完全なUnicode文字分布分析。すべての文字をスクリプトブロック別に分類し、エントロピー分析を実行し、疑わしいスクリプト混在を検出 |
| `text_acrostic` | テキスト各行に隠された頭文字、頭語、末尾文字、末尾語、n番目の文字のパターン（アクロスティックメッセージ）を検出 |

</details>

<details>
<summary><h3>ファイルフォレンジック（10）</h3></summary>

| ツール | 説明 |
|--------|------|
| `file_identify` | マジックバイトによるファイルタイプ識別。ファイルヘッダーを読み取り、既知のファイルシグネチャの包括的データベースと照合。拡張子不一致を確認 |
| `file_polyglot` | 2つ以上のフォーマットとして同時に有効なポリグロットファイルの検出。異なるオフセットで複数の有効なファイルシグネチャを確認（PDF+ZIP、PNG+PDFなど） |
| `file_embedded` | バイナリ内の埋め込みファイルをスキャン（binwalkに類似）。すべてのオフセットで既知のマジックバイトシグネチャを検索し、隠されたまたは付加されたファイルを発見 |
| `file_appended` | ファイルフォーマット固有のEOFマーカー後に付加されたデータを検出。PNG (IEND)、JPEG (FFD9)、BMP、ZIP (EOCD)、PDF (%%EOF)をサポート |
| `file_entropy` | セクション単位のエントロピー分析。ブロックごとおよび全体のShannon エントロピーを計算し、異常に高いエントロピーセクションをフラグ付け |
| `file_entropy_visual` | ファイルのASCIIエントロピー可視化。ファイル全体のエントロピーレベルをテキストベースの棒グラフでレンダリングし、視覚的な異常検出に使用 |
| `file_strings` | バイナリファイルから印字可能文字列とUnicode文字列を抽出。印字可能文字のシーケンスをスキャンし、ファイルオフセット付きで報告。ASCII、UTF-8、UTF-16をサポート |
| `file_hex` | ASCIIサイドバー付きヘックスダンプ。オフセットアドレス、ヘックスバイト、印字可能ASCII表現を含む従来のヘックスエディタ形式 |
| `file_header` | 既知フォーマットの深層ヘッダーおよび構造分析。PNG IHDR、JPEG SOF、BMP情報ヘッダー、ZIPローカルファイルヘッダー、PDFバージョン/メタデータをパース |
| `file_compare` | 2つのファイルのバイナリ差分比較。バイト単位の比較で差分オフセット、同一割合、ステゴ分析用のLSBのみの差分検出を報告 |

</details>

<details>
<summary><h3>ドキュメント分析（5）</h3></summary>

| ツール | 説明 |
|--------|------|
| `doc_pdf_hidden` | PDF隠しコンテンツの検出。JavaScript、自動アクション、OpenAction、隠し注釈、不可視テキスト、埋め込みファイル、その他の秘匿コンテンツをスキャン |
| `doc_pdf_metadata` | PDFメタデータ抽出。/Info辞書とXMPメタデータブロックをパースし、フォレンジック帰属とドキュメント出所分析に使用 |
| `doc_pdf_streams` | PDFストリーム分析。すべてのstream/endstreamブロックを特定し、zlib解凍を試行し、サイズとエントロピーを報告して隠しデータを発見 |
| `doc_html_hidden` | HTML隠しコンテンツの検出。コメント、display:none要素、data-*属性、hiddenインプット、base64コンテンツ、ゼロサイズ要素、不可視テキストをスキャン |
| `doc_xml_metadata` | XMLおよびOfficeドキュメントのメタデータ抽出。Dublin Core、Microsoft Officeプロパティ、処理命令、その他のメタデータフィールドをパース |

</details>

<details>
<summary><h3>エンコーディング & 暗号（7）</h3></summary>

| ツール | 説明 |
|--------|------|
| `crypto_detect` | 入力文字列のエンコーディングタイプを自動検出。すべての既知パターン（Base64、hex、binary、morse、URLエンコーディング、HTMLエンティティなど）に対してテストし、信頼度順にマッチ結果を返却 |
| `crypto_decode` | Base64、hex、binary、decimal、octal、URLエンコーディング、ROT13、Base32、モールス信号、HTMLエンティティをサポートするマルチフォーマットデコーダー。自動モードではエンコーディングを先に検出 |
| `crypto_frequency` | 暗号解析のための文字頻度分析。文字出現回数をカウントし、標準的な英語頻度（ETAOINSHRDLU）と比較し、一致指数を計算 |
| `crypto_entropy` | 文字列のShannon エントロピー計算と分類。文字レベルとバイトレベルのエントロピーを計算し、反復データから暗号化/ランダムデータまでの分類 |
| `crypto_xor` | シングルバイトおよびマルチバイトキーのXORブルートフォース。256のシングルバイトキーをすべて試行し、英語テキスト確率でスコアリング。一致指数を使用してマルチバイトキー長を推定 |
| `crypto_hash_id` | ハッシュタイプ識別。長さとフォーマットで既知のハッシュパターンとマッチング（MD5、SHA-1、SHA-256、SHA-512、bcrypt、CRC32、NTLMなど） |
| `crypto_patterns` | 既知の暗号およびエンコーディングパターンの検出。テキスト中のシーザー暗号、換字式暗号、ヴィジュネル暗号、レールフェンス暗号、Atbash、逆転テキストを分析 |

</details>

---

## CLI の使い方

```bash
# ヘルプを表示
npx -y steganography-mcp --help

# 128ツール全リストと説明を表示
npx -y steganography-mcp --list

# 画像のステガノグラフィを検出
npx -y steganography-mcp --tool img_detect '{"file_path":"challenge.png"}'

# LSBから隠しメッセージを抽出
npx -y steganography-mcp --tool img_lsb_extract '{"file_path":"stego.png"}'

# カイ二乗ステガナリシス
npx -y steganography-mcp --tool img_chi_square '{"file_path":"suspect.png"}'

# RS分析（Fridrich-Goljan-Du法）
npx -y steganography-mcp --tool img_rs_analysis '{"file_path":"suspect.png"}'

# JPEG二重圧縮検出
npx -y steganography-mcp --tool jpeg_double_compression '{"file_path":"photo.jpg"}'

# 深層EXIF分析
npx -y steganography-mcp --tool jpeg_exif_deep '{"file_path":"photo.jpg"}'

# オーディオステガノグラフィ検出
npx -y steganography-mcp --tool audio_detect '{"file_path":"message.wav"}'

# ゼロ幅文字エンコーディングを検出
npx -y steganography-mcp --tool text_zwc_detect '{"text":"suspicious text here"}'

# ゼロ幅文字で隠しメッセージを埋め込み
npx -y steganography-mcp --tool text_zwc_embed '{"text":"cover text","message":"secret"}'

# ファイルタイプ識別とポリグロット検出
npx -y steganography-mcp --tool file_polyglot '{"file_path":"suspicious.pdf"}'

# 埋め込みファイルをスキャン（binwalkスタイル）
npx -y steganography-mcp --tool file_embedded '{"file_path":"mystery.bin"}'

# エントロピー可視化
npx -y steganography-mcp --tool file_entropy_visual '{"file_path":"data.bin"}'

# エンコーディング自動検出
npx -y steganography-mcp --tool crypto_detect '{"input":"aGVsbG8gd29ybGQ="}'

# XORブルートフォース
npx -y steganography-mcp --tool crypto_xor '{"input":"4f5243484e"}'

# 暗号パターン検出
npx -y steganography-mcp --tool crypto_patterns '{"input":"Gur dhvpx oebja sbk"}'

# Bunを使用（起動が高速）
bunx steganography-mcp --tool img_detect '{"file_path":"image.png"}'
```

---

## ユースケース

### CTF競技
キャプチャー・ザ・フラッグ競技でステガノグラフィチャレンジを解決。AIエージェントがすべての検出技術を体系的に適用します &mdash; LSB分析、メタデータ検査、付加データ、エンコーディング検出、暗号識別 &mdash; 画像、音声ファイル、ドキュメント、テキストに隠されたフラグを発見します。

### デジタルフォレンジック
フォレンジック調査で秘密通信チャネルを検出。統計的ステガナリシス（カイ二乗、RS分析）で疑わしいファイルの隠しデータを分析し、EOFマーカー後の付加データを確認し、埋め込みファイルをスキャンし、ステガノグラフィツールシグネチャを識別します。

### セキュリティリサーチ
ステガノグラフィツールと技術の分析。オリジナル画像とステゴ画像のピクセル単位比較、JPEGステゴのDCT係数分布の研究、埋め込みによるエントロピー変化の測定、エンコーディングスキームのリバースエンジニアリング。

### 教育
ステガノグラフィ技術の仕組みを学習。LSBメッセージの埋め込みと抽出、ゼロ幅文字でのテキストエンコード、ビットプレーンとエントロピーマップの可視化、ヘックスダンプでのファイル構造分析、頻度分析での暗号パターン研究。

### インシデント対応
インシデント対応時に、ドキュメントと画像の中の隠れたデータ持ち出しチャネルを確認。PDFの隠しJavaScriptと埋め込みファイルのスキャン、メールのゼロ幅文字エンコーディング検出、ポリグロットファイルの識別、疑わしいエンコーディングの分析。

---

## アーキテクチャ

```
src/
  index.ts                    # CLIエントリポイント（--help、--list、--tool、stdioサーバー）
  protocol/
    mcp-server.ts             # MCPサーバーセットアップ（stdioトランスポート）
    tools.ts                  # ツールレジストリ — 全128ツールをここで組み立て
  types/
    index.ts                  # 共有型（ToolDef、ToolContext、ToolResult）
  utils/
    binary.ts                 # バイナリファイル読み取り、ヘックスダンプ、フォーマット検出
    stats.ts                  # Shannonエントロピー、カイ二乗、バイト頻度、DFT、自己相関、BPCS複雑度、パッチワークテスト
    cache.ts                  # TTLキャッシュ
    png-parser.ts             # 純粋TS PNGパーサー（IHDR、チャンク、ピクセルデータ）
    jpeg-parser.ts            # 純粋TS JPEGパーサー（マーカー、EXIF、量子化）
    wav-parser.ts             # 純粋TS WAVパーサー（RIFFチャンク、PCMサンプル）
    bmp-parser.ts             # 純粋TS BMPパーサー（ヘッダー、ピクセルデータ）
    avi-parser.ts             # 純粋TS AVIパーサー（フレーム、構造）
    gif-parser.ts             # 純粋TS GIFパーサー（パレット、フレーム、拡張）
    pcap-parser.ts            # 純粋TS PCAPパーサー（パケット、ヘッダー）
    mp3-parser.ts             # 純粋TS MP3パーサー（フレーム、ID3、サンプル）
    zip-parser.ts             # 純粋TS ZIPパーサー（構造、スラックスペース）
  image/                      # 画像ステガナリシスツール（14）
  jpeg/                       # JPEG分析ツール（7）
  audio/                      # オーディオステガナリシスツール（7）
  text/                       # テキスト & Unicodeツール（10）
  file/                       # ファイルフォレンジックツール（10）
  document/                   # ドキュメント分析ツール（5）
  crypto/                     # エンコーディング & 暗号ツール（7）
  jpegadv/                    # 高度なJPEG（7）
  video/                      # ビデオステガノグラフィ（8）
  gif/                        # GIFステガノグラフィ（8）
  network/                    # ネットワークステガノグラフィ（8）
  mp3/                        # MP3ステガノグラフィ（7）
  spread/                     # スペクトル拡散（5）
  bpcs/                       # BPCS分析（5）
  archive/                    # アーカイブステガノグラフィ（7）
  create/                     # 作成 & 埋め込み（7）
  qrcode/                     # QRコードステガノグラフィ（6）
  data/
    encoding-patterns.ts      # エンコーディング正規表現パターン + デコーダー
    magic-bytes.ts            # ファイルシグネチャデータベース（100+フォーマット）
    stego-signatures.ts       # 既知ステガノグラフィツールシグネチャ
    unicode-invisible.ts      # 不可視Unicode文字データベース
```

**設計方針：**

- **4依存関係、それだけ** &mdash; MCPプロトコル用の`@modelcontextprotocol/sdk`、入力バリデーション用の`zod`、PNGピクセルアクセス用の`pngjs`、JPEGデコード用の`jpeg-js`。肥大化した依存関係ツリーなし。ネイティブモジュールなし。Cバインディングなし。Pythonなし。Javaなし。
- **100%オフライン** &mdash; すべてのツールが完全にローカルで実行。HTTPリクエストなし。API呼び出しなし。テレメトリなし。クラウド依存なし。ファイルがマシンから出ることは決してありません。
- **純粋TypeScript統計分析** &mdash; カイ二乗検定、RS分析（Fridrich-Goljan-Du）、サンプルペア分析、Shannonエントロピー、一致指数、頻度分析がすべて純粋TypeScriptで実装。外部数学ライブラリなし。
- **カスタムフォーマットパーサー** &mdash; PNGチャンク、JPEGマーカー/EXIF/量子化テーブル、WAV RIFFチャンク、BMPヘッダーが`utils/`パーサーを使用して外部依存関係なしでパース。これにより、汎用ライブラリでは提供できないフォーマット固有の深層分析が可能になります。
- **17プロバイダー、1サーバー** &mdash; 各分析カテゴリが独立モジュール。AIエージェントが調査コンテキストに基づいて使用するツールを選択します。
- **統一されたToolDefパターン** &mdash; すべてのツールが同じ `{ name, description, schema, execute }` パターンに従います。新しいツールの追加は、適切なモジュールに1つのオブジェクトを作成するだけです。
- **すべてのフィールドにZodバリデーション** &mdash; すべてのスキーマフィールドにAIエージェントのコンテキスト用の`.describe()`があります。無効な入力は実行前に明確なエラーメッセージで捕捉されます。

---

## MCPセキュリティスイート

| プロジェクト | ドメイン | ツール数 |
|------------|----------|----------|
| [hackbrowser-mcp](https://github.com/badchars/hackbrowser-mcp) | ブラウザベースのセキュリティテスト | 39 |
| [cloud-audit-mcp](https://github.com/badchars/cloud-audit-mcp) | クラウドセキュリティ（AWS/Azure/GCP） | 38 |
| [github-security-mcp](https://github.com/badchars/github-security-mcp) | GitHubセキュリティポスチャー | 39 |
| [cve-mcp](https://github.com/badchars/cve-mcp) | 脆弱性インテリジェンス | 23 |
| [osint-mcp-server](https://github.com/badchars/osint-mcp-server) | OSINT & 偵察 | 37 |
| [darknet-mcp-server](https://github.com/badchars/darknet-mcp-server) | ダークウェブ & 脅威インテリジェンス | 66 |
| [dns-security-mcp](https://github.com/badchars/dns-security-mcp) | DNSセキュリティインテリジェンス | 103 |
| **steganography-mcp** | **ステガノグラフィ分析** | **128** |

---

## コントリビュート

コントリビューションを歓迎します。ガイドラインは[CONTRIBUTING.md](../../CONTRIBUTING.md)をご覧ください。

---

<p align="center">
<b>認可されたセキュリティリサーチおよび教育目的のみに使用してください。</b><br>
所有していないファイルに対してステガノグラフィ分析を行う前に、必ず適切な認可を得てください。
</p>

<p align="center">
  <a href="../../LICENSE">MITライセンス</a> &bull; <a href="https://orhanyildirim.us">Orhan Yildirim</a> 制作 &bull; <a href="mailto:contact@orhanyildirim.us">contact@orhanyildirim.us</a>
</p>
