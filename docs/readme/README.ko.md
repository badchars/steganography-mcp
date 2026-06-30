<p align="center">
  <a href="../../README.md">English</a> |
  <a href="README.zh.md">中文</a> |
  <a href="README.zh-TW.md">繁體中文</a> |
  <strong>한국어</strong> |
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

<h3 align="center">AI 에이전트를 위한 가장 포괄적인 스테가노그래피 분석 툴킷.</h3>

<p align="center">
  LSB 탐지, 카이제곱 스테그분석, RS 분석, DCT 포렌식, 오디오 스테가노그래피, 제로 너비 텍스트 인코딩, 파일 포렌식, 폴리글롯 탐지, 인코딩 식별, 비디오 & GIF 스테고, 네트워크 은닉 채널, MP3 분석, BPCS & 확산 스펙트럼, 아카이브 스테고, QR 코드 스테고, 생성 & 임베딩 &mdash; 하나의 MCP 서버로 통합.<br>
  <b>128개 도구. 17개 카테고리. 4개 의존성. 100% 오프라인.</b> API 키 불필요. 모든 도구가 로컬에서 실행됩니다.
</p>

<br>

<p align="center">
  <a href="#문제점">문제점</a> &bull;
  <a href="#무엇이-다른가">무엇이 다른가</a> &bull;
  <a href="#빠른-시작">빠른 시작</a> &bull;
  <a href="#ai가-할-수-있는-것">AI가 할 수 있는 것</a> &bull;
  <a href="#도구-레퍼런스128개-도구">도구 (128)</a> &bull;
  <a href="#cli-사용법">CLI 사용법</a> &bull;
  <a href="#아키텍처">아키텍처</a> &bull;
  <a href="../../CONTRIBUTING.md">기여 가이드</a>
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

## 문제점

스테가노그래피는 데이터를 겉으로 드러나지 않게 숨기는 기술입니다 &mdash; 이미지, 오디오 파일, 문서, 심지어 Unicode 텍스트 안에 숨깁니다. CTF 대회, 디지털 포렌식 조사, 은닉 통신 채널, 악성코드 페이로드에 사용됩니다. 이를 탐지하려면 통계 분석, 포맷별 파싱, 엔트로피 측정, 도메인 전문 지식의 조합이 필요합니다.

```
기존 스테가노그래피 분석 워크플로우:
  이미지 스테고 탐지          ->  zsteg + stegsolve (2개 도구, Ruby + Java)
  카이제곱 분석               ->  커스텀 Python 스크립트
  RS 분석                     ->  커스텀 MATLAB/Python 코드
  JPEG DCT 포렌식             ->  stegdetect (2004년 이후 방치된 C 도구)
  LSB 데이터 추출             ->  zsteg + steghide + openstego (3개 도구)
  오디오 스테가노그래피       ->  Audacity 수동 작업 + 커스텀 스크립트
  제로 너비 텍스트 탐지       ->  웹 기반 도구 + 수동 검사
  파일 포렌식 / binwalk       ->  binwalk + foremost + xxd (3개 도구)
  EXIF 메타데이터             ->  exiftool (Perl 의존성)
  인코딩 탐지                 ->  CyberChef 웹 UI + 수동 추측
  ─────────────────────────────────
  합계: 10개 이상 도구, 5개 이상 언어, 수 시간의 수동 상관 분석
```

**steganography-mcp**는 [Model Context Protocol](https://modelcontextprotocol.io)을 통해 AI 에이전트에게 17개 카테고리에 걸친 128개 도구를 제공합니다. 에이전트는 이미지 스테그분석, JPEG 포렌식, 오디오 분석, 텍스트 스테가노그래피 탐지, 파일 포렌식, 문서 분석, 인코딩 식별, 비디오 & GIF 스테고, 네트워크 은닉 채널, MP3 분석, BPCS & 확산 스펙트럼 분석, 아카이브 스테고, QR 코드 스테고, 생성 & 임베딩을 수행합니다 &mdash; 모두 하나의 대화에서, 100% 로컬로, 외부 서비스에 대한 의존성 없이 실행됩니다.

```
steganography-mcp 사용 시:
  사용자: "이 CTF 챌린지 이미지에서 숨겨진 데이터를 분석해 줘"

  에이전트: -> img_detect: 카이제곱 p=0.0001 (LSB 임베딩 탐지),
               RS 분석이 42% 임베딩률 추정, 우하단 영역에
               엔트로피 이상 발견
            -> img_lsb_extract: RGB LSB에서 847바이트 추출
            -> crypto_detect: 추출 데이터가 Base64 인코딩
            -> crypto_decode: 디코딩 결과 "FLAG{hidden_in_plain_sight_2024}"
            -> img_known_tools: OpenStego 시그니처 매칭

            "이미지에 OpenStego로 임베딩된 LSB 스테가노그래피가
             포함되어 있습니다. 카이제곱 검정이 세 RGB 채널 모두에서
             LSB 대체를 확인했으며 임베딩률은 42%입니다. 숨겨진
             페이로드는 Base64로 인코딩되어 있으며 디코딩하면
             다음 플래그가 됩니다:
             FLAG{hidden_in_plain_sight_2024}"
```

---

## 무엇이 다른가

대부분의 스테가노그래피 도구는 단일 목적 유틸리티입니다. steganography-mcp는 AI 에이전트에게 **모든 스테가노그래피 기법을 동시에 추론**할 수 있는 능력을 부여합니다.

<table>
<thead>
<tr>
<th></th>
<th>기존 접근 방식</th>
<th>steganography-mcp</th>
</tr>
</thead>
<tbody>
<tr>
<td><b>인터페이스</b></td>
<td>10개 이상 CLI 도구, 5개 이상 언어, 웹 UI</td>
<td>MCP &mdash; AI 에이전트가 대화형으로 도구 호출</td>
</tr>
<tr>
<td><b>커버리지</b></td>
<td>한 번에 하나의 기법만</td>
<td>17개 카테고리, 128개 도구 병렬 실행</td>
</tr>
<tr>
<td><b>이미지 분석</b></td>
<td>zsteg (Ruby), stegsolve (Java), 커스텀 스크립트</td>
<td>에이전트가 카이제곱, RS 분석, SPA, 엔트로피 맵, 히스토그램, 비트 플레인 추출, 메타데이터, 도구 시그니처 탐지를 한꺼번에 실행</td>
</tr>
<tr>
<td><b>JPEG 포렌식</b></td>
<td>stegdetect (방치됨), 수동 DCT 검사</td>
<td>에이전트가 DCT 히스토그램, 이중 압축, 양자화 테이블, EXIF 심층 분석, 썸네일 비교, 코멘트 필드 분석</td>
</tr>
<tr>
<td><b>오디오 스테고</b></td>
<td>Audacity + 수동 LSB 스크립트</td>
<td>에이전트가 LSB 카이제곱, 스펙트럼 분석, 무음 구간 LSB 검사, 에코 은닉 탐지, 메타데이터 추출 수행</td>
</tr>
<tr>
<td><b>텍스트 스테고</b></td>
<td>웹 기반 도구, 수동 검사</td>
<td>에이전트가 제로 너비 문자, 공백 인코딩, 비가시 Unicode, 호모글리프, 두문자 탐지 &mdash; 그리고 ZWC 메시지 임베딩/추출 가능</td>
</tr>
<tr>
<td><b>의존성</b></td>
<td>Ruby, Java, Perl, Python, C, 웹 도구</td>
<td><code>npx -y steganography-mcp</code> &mdash; 4개 의존성, 순수 TypeScript</td>
</tr>
<tr>
<td><b>API 키</b></td>
<td>해당 없음 (하지만 분산된 도구 체인)</td>
<td>제로. 100% 오프라인, 외부 호출 없음</td>
</tr>
<tr>
<td><b>출력</b></td>
<td>원시 텍스트, 이미지, 수동 상관 분석</td>
<td>구조화된 JSON &mdash; AI가 발견 사항을 자동 상관 분석</td>
</tr>
</tbody>
</table>

---

## 빠른 시작

### 옵션 1: npx (설치 불필요)

```bash
npx -y steganography-mcp
```

128개 도구 모두 즉시 사용 가능. API 키 불필요. 설정 불필요. 100% 오프라인.

### 옵션 2: bunx (더 빠름)

```bash
bunx steganography-mcp
```

### 옵션 3: 클론

```bash
git clone https://github.com/badchars/steganography-mcp.git
cd steganography-mcp
bun install
```

### AI 에이전트에 연결

<details open>
<summary><b>Claude Code</b></summary>

```bash
# npx 사용
claude mcp add steganography -- npx -y steganography-mcp

# 로컬 클론 사용
claude mcp add steganography -- bun run /path/to/steganography-mcp/src/index.ts
```

</details>

<details>
<summary><b>Claude Desktop</b></summary>

`~/Library/Application Support/Claude/claude_desktop_config.json`에 추가:

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
<summary><b>Cursor / Windsurf / 기타 MCP 클라이언트</b></summary>

동일한 JSON 설정 형식입니다. 명령어를 `npx -y steganography-mcp` 또는 로컬 설치 경로로 지정하세요.

</details>

### 분석 시작

```
사용자: "이 이미지에 숨겨진 데이터가 있는지 확인해 줘"
```

이것으로 끝입니다. 에이전트가 카이제곱 분석, RS 분석, 엔트로피 매핑, 메타데이터 추출, 부가 데이터 탐지, 도구 시그니처 스캐닝을 자동으로 수행합니다.

---

## AI가 할 수 있는 것

### CTF 챌린지 솔버

```
사용자: "이 CTF 스테가노그래피 챌린지를 풀어 줘 — 이미지는 challenge.png에 있어"

에이전트: -> img_detect: 카이제곱 스테그분석이 LSB 임베딩 탐지
             (p=0.00012), RS 분석이 38% 임베딩률 추정,
             블록 (12,4)-(15,8)에서 엔트로피 이상 발견
          -> img_lsb_extract: RGB 채널 LSB에서 1,247바이트 추출
          -> crypto_detect: Base64 패턴 매칭 (신뢰도: 0.95)
          -> crypto_decode: "Q1RGe3N0M2cwX21hc3Rlcn0=" -> "CTF{st3g0_master}"
          -> img_known_tools: PNG 청크에서 OpenStego 시그니처 탐지

          "플래그를 찾았습니다: CTF{st3g0_master}
           이미지에 OpenStego로 임베딩된 LSB 스테가노그래피가
           사용되었습니다. 페이로드는 RGB 최하위 비트에
           Base64로 인코딩되어 있으며 임베딩률은 38%입니다."
```

### 디지털 포렌식 조사

```
사용자: "suspect.png와 suspect.wav에 은닉 통신이 있는지 분석해 줘"

에이전트: -> img_detect: LSB 스테고 미탐지, 하지만 부가 데이터 발견
             (PNG IEND 마커 뒤에 12,847바이트)
          -> file_identify: 부가 데이터가 ZIP 시그니처(PK)로 시작
          -> img_metadata: PNG tEXt 청크에 비정상 키 "comm" 포함,
             값이 Base64 인코딩
          -> audio_detect: WAV 파일에 LSB 카이제곱 이상 (p=0.003)
          -> audio_silence: 활성 LSB가 있는 무음 구간 3개 탐지
          -> audio_lsb_extract: 2,048바이트의 숨겨진 데이터 추출

          "두 파일 모두 숨겨진 데이터를 포함하고 있습니다:
           1. suspect.png에는 PNG EOF 마커 뒤에 ZIP 아카이브가
              추가되어 있으며, 메타데이터에 Base64 인코딩된
              메시지가 있습니다
           2. suspect.wav에는 LSB 스테가노그래피가 포함되어 있으며,
              특히 무음 구간에 집중되어 있습니다 — 의도적 은닉의
              강력한 지표입니다.
           ZIP 추출 및 WAV 페이로드 분석을 권장합니다."
```

### 제로 너비 텍스트 탐지

```
사용자: "이 이메일은 정상으로 보이지만 숨겨진 텍스트가 있을 수 있어"

에이전트: -> text_detect: 가시 문자 사이에서 847개의 제로 너비
             문자 탐지
          -> text_zwc_detect: ZWSP (342), ZWNJ (505)가 텍스트
             전체 127개 위치에서 발견
          -> text_zwc_extract: 바이너리 디코딩 결과 "EXFIL-ROUTE-7"
          -> text_invisible_scan: 헤더 섹션에서 3개의 추가 비가시
             Unicode 문자 (U+2060, U+FEFF) 발견

          "이메일에 제로 너비 문자로 인코딩된 숨겨진 메시지가
           포함되어 있습니다: 'EXFIL-ROUTE-7'. 847개의 비가시
           문자가 가시 텍스트 전체에 분산되어 ZWSP/ZWNJ 바이너리
           인코딩을 사용합니다. 추가로 헤더에서 3개의 Word Joiner
           와 BOM 문자가 발견되었습니다 — 메타데이터 잔여물로
           추정됩니다."
```

### JPEG 포렌식 분석

```
사용자: "이 JPEG 이미지가 원본인지 아니면 변조되었는지 확인해 줘"

에이전트: -> jpeg_structure: 14개 마커 파싱, 정상 JFIF 구조
          -> jpeg_double_compression: 이중 압축 탐지 —
             블록킹 아티팩트 점수 0.73, 양자화 이상 비율 0.81
          -> jpeg_quantization: 품질 약 75 (휘도), 하지만 잔여
             패턴이 원본 품질 약 92를 시사
          -> jpeg_exif_deep: EXIF에 "iPhone 14 Pro" 표시,
             하지만 소프트웨어 필드에 "Adobe Photoshop 25.0"
          -> jpeg_thumbnail_compare: 썸네일 크기가 메인 이미지와
             불일치 (썸네일: 4032x3024, 메인: 2048x1536)

          "이 JPEG는 변조되었습니다. 증거:
           1. 이중 압축 탐지 — 이미지가 디코딩 후 더 낮은
              품질로 재인코딩됨 (원본 약 92, 현재 약 75)
           2. EXIF가 iPhone 14 Pro를 주장하지만 소프트웨어
              필드가 Photoshop 편집을 드러냄
           3. 썸네일이 원본 4032x3024 촬영본이지만 메인
              이미지는 2048x1536으로 리사이즈됨
           세 가지 발견 사항이 독립적으로 촬영 후 수정을
           확인합니다."
```

---

## 도구 레퍼런스 (128개 도구)

### 카테고리 개요

| 카테고리 | 도구 수 | 설명 |
|----------|---------|------|
| [이미지 스테그분석](#-이미지-스테그분석-14) | 14 | LSB 탐지, 카이제곱, RS 분석, 엔트로피 맵, 비트 플레인, 히스토그램, 메타데이터, 도구 시그니처 |
| [JPEG 분석](#-jpeg-분석-7) | 7 | DCT 히스토그램, 이중 압축, 양자화 테이블, EXIF 심층 분석, 썸네일 포렌식, 코멘트 분석 |
| [오디오 스테그분석](#-오디오-스테그분석-7) | 7 | WAV LSB 탐지, 스펙트럼 분석, 무음 구간 분석, 에코 은닉, 메타데이터 추출 |
| [텍스트 & Unicode](#-텍스트--unicode-10) | 10 | 제로 너비 문자, 공백 인코딩, 비가시 Unicode, 호모글리프, 두문자, Unicode 분석 |
| [파일 포렌식](#-파일-포렌식-10) | 10 | 매직 바이트, 폴리글롯 탐지, 임베디드 파일, 부가 데이터, 엔트로피, 헥스 덤프, 문자열, 헤더 |
| [문서 분석](#-문서-분석-5) | 5 | PDF 숨겨진 콘텐츠, PDF 메타데이터, PDF 스트림, HTML 숨겨진 콘텐츠, XML 메타데이터 |
| [인코딩 & 암호](#-인코딩--암호-7) | 7 | 인코딩 탐지, 다중 포맷 디코더, 빈도 분석, 엔트로피, XOR 브루트포스, 해시 식별, 암호 패턴 |
| 고급 JPEG | 7 | F5, JSteg, OutGuess, PVD 탐지, 슬라이딩 윈도우 카이제곱, 크롭-재보정 스테그분석, 도구 호환성 |
| 비디오 스테가노그래피 | 8 | AVI 프레임 LSB, 인터프레임 분석, 프레임 비교, 메타데이터, 구조, EOF 데이터 |
| GIF 스테가노그래피 | 8 | 팔레트 LSB, LZW 서브블록 엔트로피, 코멘트 확장, 애플리케이션 확장, 프레임 분석 |
| 네트워크 스테가노그래피 | 8 | PCAP 은닉 채널, IP/TCP 헤더 분석, ICMP 페이로드, DNS 터널링, HTTP 헤더, 타이밍 |
| MP3 스테가노그래피 | 7 | ID3 숨겨진 데이터, 프레임 분석, 패딩 조작, 샘플 분석, 메타데이터, 구조 |
| 확산 스펙트럼 | 5 | DFT 크기 스펙트럼, 자기상관, 워터마크 탐지, 노이즈 플로어 분석, 패치워크 탐지 |
| BPCS 분석 | 5 | 비트 플레인 복잡도 분할, 복잡도 매핑, 임계값 분석, 데이터 추출, 용량 추정 |
| 아카이브 스테가노그래피 | 7 | ZIP 슬랙 공간, 추가 필드, 코멘트, 폴리글롯 탐지, 구조 분석, 메타데이터 |
| 생성 & 임베딩 | 7 | EOF 주입, 메타데이터 주입, 공백 인코딩, 널 사이퍼, 폴리글롯 생성, 코멘트 주입, 팔레트 임베딩 |
| QR 코드 스테가노그래피 | 6 | QR 스테고 탐지, 구조 분석, ECC 용량, 모듈 분석, 데이터 추출, 비교 |

---

<details open>
<summary><h3>이미지 스테그분석 (14)</h3></summary>

| 도구 | 설명 |
|------|------|
| `img_detect` | 이미지에서 스테가노그래피 자동 탐지. 카이제곱, RS 분석, 엔트로피, 메타데이터, 부가 데이터, 도구 시그니처 검사를 실행하고 종합 JSON 보고서 반환 |
| `img_lsb_detect` | 통계적 LSB 스테가노그래피 탐지. 각 색상 채널에 대해 독립적으로 카이제곱 및 샘플 쌍 분석 실행 |
| `img_lsb_extract` | 이미지 LSB에서 숨겨진 데이터 추출. 지정된 채널과 비트 플레인에서 비트를 추출하고 UTF-8 디코드를 시도하며 헥스 덤프 표시 |
| `img_lsb_embed` | LSB 스테가노그래피를 사용하여 이미지에 메시지 임베딩. PNG 파일을 읽고 최하위 비트에 메시지를 임베딩한 후 새 PNG 파일 작성 |
| `img_bitplane` | 이미지 채널의 특정 비트 플레인 추출 및 시각화. 크기, 1비트 백분율, ASCII 아트 미리보기 표시 |
| `img_chi_square` | 각 색상 채널에 대한 독립적 카이제곱 스테그분석 공격. 인접 픽셀 값 쌍의 균등화 여부를 테스트하여 LSB 대체 탐지 |
| `img_rs_analysis` | Fridrich-Goljan-Du 방법을 사용한 RS (정규-특이) 스테그분석. 픽셀 그룹을 분석하여 채널별 LSB 임베딩률 추정 |
| `img_histogram` | 이상 탐지 기능이 있는 픽셀 값 히스토그램 생성. LSB 스테가노그래피를 나타내는 값 쌍(PoV) 이상 탐지 |
| `img_entropy_map` | 이미지의 블록별 엔트로피 분석. 이미지를 블록으로 분할하고 블록별 Shannon 엔트로피를 계산하여 고엔트로피 영역 표시 |
| `img_metadata` | 이미지의 심층 메타데이터 추출. PNG: 텍스트 청크, 청크 목록, IHDR 정보. JPEG: EXIF, 코멘트, 양자화 테이블, 마커 목록 |
| `img_appended_data` | 이미지 EOF 마커 뒤에 추가된 데이터 탐지 및 추출. PNG IEND, JPEG EOI, BMP 파일 크기 경계 뒤의 숨겨진 데이터 확인 |
| `img_compare` | 두 이미지의 픽셀 단위 비교. 동일/상이 픽셀 수, 최대 차이, 영향받는 채널 보고 |
| `img_channel_analysis` | R, G, B, A 채널의 독립 통계 분석. 평균, 표준편차, 엔트로피, 최솟값, 최댓값, 고유 값 수 보고 |
| `img_known_tools` | 이미지 파일 바이트를 스캔하여 알려진 스테가노그래피 도구 시그니처 매칭. OpenStego, Steghide, JSteg, F5 등의 패턴 데이터베이스와 비교 |

</details>

<details>
<summary><h3>JPEG 분석 (7)</h3></summary>

| 도구 | 설명 |
|------|------|
| `jpeg_structure` | JPEG 마커/세그먼트의 오프셋과 크기를 파싱. 모든 마커, 위치, 세그먼트 길이를 포함한 내부 구조 표시 |
| `jpeg_dct_histogram` | 스테가노그래피 탐지를 위한 DCT 계수 분포 분석. Y채널 픽셀 값 분포와 SOS 엔트로피 데이터를 분석하여 JSteg, F5, OutGuess로 인한 이상 탐지 |
| `jpeg_double_compression` | JPEG 이중 압축 아티팩트 탐지. 특징적인 블록킹 아티팩트와 양자화 테이블 이상 식별 &mdash; 이미지 변조 또는 스테고 임베딩의 일반적 지표 |
| `jpeg_quantization` | 양자화 테이블 분석 및 품질 추정. 모든 양자화 테이블을 8x8 그리드 형식으로 표시하고 JPEG 품질 팩터 추정 |
| `jpeg_exif_deep` | GPS 좌표, 타임스탬프, 소프트웨어 정보, 썸네일, 메이커 노트, 모든 IFD 항목을 포함한 심층 EXIF 분석. 포렌식적으로 흥미로운 필드 표시 |
| `jpeg_thumbnail_compare` | EXIF 썸네일과 JPEG 메인 이미지 비교. 크기 또는 콘텐츠 불일치는 촬영 후 수정을 나타냄 &mdash; 일반적인 포렌식 흔적 |
| `jpeg_comment` | JPEG COM (코멘트) 마커 추출 및 분석. 숨겨진 데이터 패턴, 비정상적으로 큰 코멘트, 고엔트로피 콘텐츠 확인 |

</details>

<details>
<summary><h3>오디오 스테그분석 (7)</h3></summary>

| 도구 | 설명 |
|------|------|
| `audio_detect` | WAV 파일에서 오디오 스테가노그래피 자동 탐지. LSB 카이제곱, 엔트로피 분석, 메타데이터 검사, 부가 데이터 확인 실행 |
| `audio_lsb_detect` | PCM 샘플 LSB 통계 분석. 값 쌍별 LSB에 대한 카이제곱 검정을 수행하여 LSB 대체 스테가노그래피 탐지 |
| `audio_lsb_extract` | 오디오 샘플에서 LSB 데이터 추출. 각 PCM 샘플의 최하위 비트를 읽고 숨겨진 데이터 디코드 시도 |
| `audio_spectrum` | WAV 오디오에서 숨겨진 신호의 스펙트럼 분석. 샘플 값 분포, 영교차율, 블록별 RMS 에너지 분석, 비정상 무음 구간 탐지 |
| `audio_metadata` | RIFF INFO 청크, 포맷 세부사항, 모든 청크 정보를 포함한 WAV 파일 메타데이터 추출 |
| `audio_silence` | WAV 오디오 무음 구간의 숨겨진 데이터 분석. 거의 0인 샘플 영역을 찾고 LSB를 검사 &mdash; 활성 LSB가 있는 무음 구간은 강력한 스테고 지표 |
| `audio_echo_detect` | 자기상관 분석을 통한 에코 은닉 탐지. 일반적인 에코 지연에서 정규화된 자기상관 계산. 규칙적인 에코 패턴은 스테가노그래피 에코 은닉을 나타냄 |

</details>

<details>
<summary><h3>텍스트 & Unicode (10)</h3></summary>

| 도구 | 설명 |
|------|------|
| `text_detect` | 텍스트 스테가노그래피 자동 탐지. 제로 너비 문자, 공백 인코딩, 비가시 Unicode, 호모글리프, 비정상 패턴 확인 |
| `text_zwc_detect` | 텍스트에서 제로 너비 문자 (ZWSP, ZWNJ, ZWJ, BOM) 탐지. 위치, 개수, 잠재적 인코딩 메시지 길이 보고 |
| `text_zwc_extract` | 제로 너비 문자로 인코딩된 메시지 디코드. ZWC 문자를 추출하고 바이너리 디코드: ZWSP=0, ZWNJ=1 (양 극성 모두 시도) |
| `text_zwc_embed` | 제로 너비 문자를 사용하여 커버 텍스트에 비밀 메시지 임베딩. 메시지를 바이너리로 인코딩하고 비트를 ZWSP(0)/ZWNJ(1)로 매핑 |
| `text_whitespace_detect` | 텍스트에서 공백 인코딩 탐지. 각 줄의 후행 공백 패턴을 검사하며 공백=0, 탭=1이 바이너리 데이터를 인코딩할 수 있음 |
| `text_whitespace_extract` | 텍스트에서 공백 인코딩 메시지 추출. 각 줄의 후행 공백을 읽고 공백=0/탭=1 바이너리 인코딩 디코드 |
| `text_invisible_scan` | 텍스트에서 모든 비가시 Unicode 문자 스캔. 전체 비가시 문자 데이터베이스와 각 문자를 비교하고 위치와 이름 보고 |
| `text_homoglyph` | 텍스트에서 Unicode 호모글리프 대체 탐지. ASCII 문자와 시각적으로 유사한 비ASCII 문자 식별 (키릴 문자 a vs 라틴 문자 a 등) |
| `text_unicode_analysis` | 전체 Unicode 문자 분포 분석. 모든 문자를 스크립트 블록별로 분류, 엔트로피 분석 수행, 의심스러운 스크립트 혼합 탐지 |
| `text_acrostic` | 텍스트 줄에 걸쳐 숨겨진 첫 글자, 첫 단어, 마지막 글자, 마지막 단어, n번째 문자 패턴 (두문자 메시지) 탐지 |

</details>

<details>
<summary><h3>파일 포렌식 (10)</h3></summary>

| 도구 | 설명 |
|------|------|
| `file_identify` | 매직 바이트를 통한 파일 유형 식별. 파일 헤더를 읽고 알려진 파일 시그니처의 종합 데이터베이스와 매칭. 확장자 불일치 확인 |
| `file_polyglot` | 두 가지 이상의 포맷으로 동시에 유효한 폴리글롯 파일 탐지. 서로 다른 오프셋에서 다중 유효 파일 시그니처 확인 (PDF+ZIP, PNG+PDF 등) |
| `file_embedded` | 바이너리 내 임베디드 파일 스캔, binwalk와 유사. 모든 오프셋에서 알려진 매직 바이트 시그니처를 검색하여 숨겨진 또는 추가된 파일 발견 |
| `file_appended` | 파일 포맷별 EOF 마커 뒤에 추가된 데이터 탐지. PNG (IEND), JPEG (FFD9), BMP, ZIP (EOCD), PDF (%%EOF) 지원 |
| `file_entropy` | 섹션별 엔트로피 분석. 블록별 및 전체 Shannon 엔트로피를 계산하고 비정상적으로 높은 엔트로피 섹션 표시 |
| `file_entropy_visual` | 파일의 ASCII 엔트로피 시각화. 파일 전체의 엔트로피 수준을 텍스트 기반 막대 차트로 렌더링하여 시각적 이상 탐지 |
| `file_strings` | 바이너리 파일에서 출력 가능한 문자열과 Unicode 문자열 추출. 출력 가능한 문자 시퀀스를 스캔하고 파일 오프셋과 함께 보고. ASCII, UTF-8, UTF-16 지원 |
| `file_hex` | ASCII 사이드바가 있는 헥스 덤프. 오프셋 주소, 헥스 바이트, 출력 가능한 ASCII 표현을 포함한 전통적인 헥스 에디터 형식 |
| `file_header` | 알려진 포맷의 심층 헤더 및 구조 분석. PNG IHDR, JPEG SOF, BMP 정보 헤더, ZIP 로컬 파일 헤더, PDF 버전/메타데이터 파싱 |
| `file_compare` | 두 파일의 바이너리 차이 비교. 바이트 단위 비교로 차이 오프셋, 동일 백분율, 스테고 분석을 위한 LSB 전용 차이 탐지 보고 |

</details>

<details>
<summary><h3>문서 분석 (5)</h3></summary>

| 도구 | 설명 |
|------|------|
| `doc_pdf_hidden` | PDF 숨겨진 콘텐츠 탐지. JavaScript, 자동 액션, OpenAction, 숨겨진 주석, 보이지 않는 텍스트, 임베디드 파일, 기타 은닉 콘텐츠 스캔 |
| `doc_pdf_metadata` | PDF 메타데이터 추출. /Info 사전과 XMP 메타데이터 블록을 파싱하여 포렌식 귀속 및 문서 출처 분석 |
| `doc_pdf_streams` | PDF 스트림 분석. 모든 stream/endstream 블록을 찾고 zlib 압축 해제를 시도하며 크기와 엔트로피를 보고하여 숨겨진 데이터 발견 |
| `doc_html_hidden` | HTML 숨겨진 콘텐츠 탐지. 주석, display:none 요소, data-* 속성, 숨겨진 입력, base64 콘텐츠, 크기 0 요소, 보이지 않는 텍스트 스캔 |
| `doc_xml_metadata` | XML 및 Office 문서 메타데이터 추출. Dublin Core, Microsoft Office 속성, 처리 지시, 기타 메타데이터 필드 파싱 |

</details>

<details>
<summary><h3>인코딩 & 암호 (7)</h3></summary>

| 도구 | 설명 |
|------|------|
| `crypto_detect` | 입력 문자열의 인코딩 유형 자동 탐지. 모든 알려진 패턴 (Base64, hex, binary, morse, URL 인코딩, HTML 엔티티 등)에 대해 테스트하고 신뢰도 순으로 매칭 결과 반환 |
| `crypto_decode` | Base64, hex, binary, decimal, octal, URL 인코딩, ROT13, Base32, 모스 부호, HTML 엔티티를 지원하는 다중 포맷 디코더. 자동 모드에서 인코딩을 먼저 탐지 |
| `crypto_frequency` | 암호 분석을 위한 문자 빈도 분석. 문자 출현 횟수를 세고 표준 영어 빈도 (ETAOINSHRDLU)와 비교하며 일치 지수 계산 |
| `crypto_entropy` | 문자열의 Shannon 엔트로피 계산 및 분류. 문자 수준과 바이트 수준 엔트로피를 계산하고 반복 데이터에서 암호화/랜덤 데이터까지 분류 |
| `crypto_xor` | 단일 바이트 및 다중 바이트 키의 XOR 브루트포스. 256개 단일 바이트 키를 모두 시도하고 영어 텍스트 확률로 점수 매김. 일치 지수를 사용하여 다중 바이트 키 길이 추정 |
| `crypto_hash_id` | 해시 유형 식별. 길이와 형식으로 알려진 해시 패턴과 매칭 (MD5, SHA-1, SHA-256, SHA-512, bcrypt, CRC32, NTLM 등) |
| `crypto_patterns` | 알려진 암호 및 인코딩 패턴 탐지. 텍스트에서 시저 암호, 치환 암호, 비즈네르 암호, 레일 펜스 전치, Atbash, 역전 텍스트 분석 |

</details>

---

## CLI 사용법

```bash
# 도움말 표시
npx -y steganography-mcp --help

# 128개 도구 전체 목록과 설명 표시
npx -y steganography-mcp --list

# 이미지에서 스테가노그래피 탐지
npx -y steganography-mcp --tool img_detect '{"file_path":"challenge.png"}'

# LSB에서 숨겨진 메시지 추출
npx -y steganography-mcp --tool img_lsb_extract '{"file_path":"stego.png"}'

# 카이제곱 스테그분석
npx -y steganography-mcp --tool img_chi_square '{"file_path":"suspect.png"}'

# RS 분석 (Fridrich-Goljan-Du 방법)
npx -y steganography-mcp --tool img_rs_analysis '{"file_path":"suspect.png"}'

# JPEG 이중 압축 탐지
npx -y steganography-mcp --tool jpeg_double_compression '{"file_path":"photo.jpg"}'

# 심층 EXIF 분석
npx -y steganography-mcp --tool jpeg_exif_deep '{"file_path":"photo.jpg"}'

# 오디오 스테가노그래피 탐지
npx -y steganography-mcp --tool audio_detect '{"file_path":"message.wav"}'

# 제로 너비 문자 인코딩 탐지
npx -y steganography-mcp --tool text_zwc_detect '{"text":"suspicious text here"}'

# 제로 너비 문자로 숨겨진 메시지 임베딩
npx -y steganography-mcp --tool text_zwc_embed '{"text":"cover text","message":"secret"}'

# 파일 유형 식별 및 폴리글롯 탐지
npx -y steganography-mcp --tool file_polyglot '{"file_path":"suspicious.pdf"}'

# 임베디드 파일 스캔 (binwalk 스타일)
npx -y steganography-mcp --tool file_embedded '{"file_path":"mystery.bin"}'

# 엔트로피 시각화
npx -y steganography-mcp --tool file_entropy_visual '{"file_path":"data.bin"}'

# 인코딩 자동 탐지
npx -y steganography-mcp --tool crypto_detect '{"input":"aGVsbG8gd29ybGQ="}'

# XOR 브루트포스
npx -y steganography-mcp --tool crypto_xor '{"input":"4f5243484e"}'

# 암호 패턴 탐지
npx -y steganography-mcp --tool crypto_patterns '{"input":"Gur dhvpx oebja sbk"}'

# Bun 사용 (더 빠른 시작)
bunx steganography-mcp --tool img_detect '{"file_path":"image.png"}'
```

---

## 활용 사례

### CTF 대회
캡처 더 플래그 대회에서 스테가노그래피 챌린지 풀기. AI 에이전트가 모든 탐지 기법을 체계적으로 적용합니다 &mdash; LSB 분석, 메타데이터 검사, 부가 데이터, 인코딩 탐지, 암호 식별 &mdash; 이미지, 오디오 파일, 문서, 텍스트에서 숨겨진 플래그를 찾습니다.

### 디지털 포렌식
포렌식 조사에서 은닉 통신 채널 탐지. 통계적 스테그분석 (카이제곱, RS 분석)으로 의심 파일의 숨겨진 데이터 분석, EOF 마커 뒤 부가 데이터 확인, 임베디드 파일 스캔, 스테가노그래피 도구 시그니처 식별.

### 보안 연구
스테가노그래피 도구와 기법 분석. 원본 이미지와 스테고 이미지의 픽셀 단위 비교, JPEG 스테고의 DCT 계수 분포 연구, 임베딩으로 인한 엔트로피 변화 측정, 인코딩 체계 역공학.

### 교육
스테가노그래피 기법의 작동 원리 학습. LSB 메시지 임베딩 및 추출, 제로 너비 문자로 텍스트 인코딩, 비트 플레인과 엔트로피 맵 시각화, 헥스 덤프로 파일 구조 분석, 빈도 분석으로 암호 패턴 연구.

### 사고 대응
사고 대응 시 문서와 이미지에서 숨겨진 데이터 유출 채널 확인. PDF에서 숨겨진 JavaScript와 임베디드 파일 스캔, 이메일에서 제로 너비 문자 인코딩 탐지, 폴리글롯 파일 식별, 의심스러운 인코딩 분석.

---

## 아키텍처

```
src/
  index.ts                    # CLI 진입점 (--help, --list, --tool, stdio 서버)
  protocol/
    mcp-server.ts             # MCP 서버 설정 (stdio 전송)
    tools.ts                  # 도구 레지스트리 — 128개 도구 전체가 여기서 조립
  types/
    index.ts                  # 공유 타입 (ToolDef, ToolContext, ToolResult)
  utils/
    binary.ts                 # 바이너리 파일 읽기, 헥스 덤프, 포맷 감지
    stats.ts                  # Shannon 엔트로피, 카이제곱, 바이트 빈도, DFT, 자기상관, BPCS 복잡도, 패치워크 테스트
    cache.ts                  # TTL 캐시
    png-parser.ts             # 순수 TS PNG 파서 (IHDR, 청크, 픽셀 데이터)
    jpeg-parser.ts            # 순수 TS JPEG 파서 (마커, EXIF, 양자화)
    wav-parser.ts             # 순수 TS WAV 파서 (RIFF 청크, PCM 샘플)
    bmp-parser.ts             # 순수 TS BMP 파서 (헤더, 픽셀 데이터)
    avi-parser.ts             # 순수 TS AVI 파서 (프레임, 구조)
    gif-parser.ts             # 순수 TS GIF 파서 (팔레트, 프레임, 확장)
    pcap-parser.ts            # 순수 TS PCAP 파서 (패킷, 헤더)
    mp3-parser.ts             # 순수 TS MP3 파서 (프레임, ID3, 샘플)
    zip-parser.ts             # 순수 TS ZIP 파서 (구조, 슬랙 공간)
  image/                      # 이미지 스테그분석 도구 (14)
  jpeg/                       # JPEG 분석 도구 (7)
  audio/                      # 오디오 스테그분석 도구 (7)
  text/                       # 텍스트 & Unicode 도구 (10)
  file/                       # 파일 포렌식 도구 (10)
  document/                   # 문서 분석 도구 (5)
  crypto/                     # 인코딩 & 암호 도구 (7)
  jpegadv/                    # 고급 JPEG (7)
  video/                      # 비디오 스테가노그래피 (8)
  gif/                        # GIF 스테가노그래피 (8)
  network/                    # 네트워크 스테가노그래피 (8)
  mp3/                        # MP3 스테가노그래피 (7)
  spread/                     # 확산 스펙트럼 (5)
  bpcs/                       # BPCS 분석 (5)
  archive/                    # 아카이브 스테가노그래피 (7)
  create/                     # 생성 & 임베딩 (7)
  qrcode/                     # QR 코드 스테가노그래피 (6)
  data/
    encoding-patterns.ts      # 인코딩 정규식 패턴 + 디코더
    magic-bytes.ts            # 파일 시그니처 데이터베이스 (100+ 포맷)
    stego-signatures.ts       # 알려진 스테가노그래피 도구 시그니처
    unicode-invisible.ts      # 비가시 Unicode 문자 데이터베이스
```

**설계 결정:**

- **4개 의존성, 그 이상 없음** &mdash; MCP 프로토콜용 `@modelcontextprotocol/sdk`, 입력 검증용 `zod`, PNG 픽셀 접근용 `pngjs`, JPEG 디코딩용 `jpeg-js`. 비대한 의존성 트리 없음. 네이티브 모듈 없음. C 바인딩 없음. Python 없음. Java 없음.
- **100% 오프라인** &mdash; 모든 도구가 완전히 로컬에서 실행. HTTP 요청 없음. API 호출 없음. 텔레메트리 없음. 클라우드 의존성 없음. 파일이 절대로 기기를 떠나지 않습니다.
- **순수 TypeScript 통계 분석** &mdash; 카이제곱 검정, RS 분석 (Fridrich-Goljan-Du), 샘플 쌍 분석, Shannon 엔트로피, 일치 지수, 빈도 분석이 모두 순수 TypeScript로 구현. 외부 수학 라이브러리 없음.
- **커스텀 포맷 파서** &mdash; PNG 청크, JPEG 마커/EXIF/양자화 테이블, WAV RIFF 청크, BMP 헤더가 `utils/` 파서를 사용하여 외부 의존성 없이 파싱. 이를 통해 범용 라이브러리가 제공할 수 없는 포맷별 심층 분석이 가능합니다.
- **17개 프로바이더, 1개 서버** &mdash; 각 분석 카테고리가 독립 모듈. AI 에이전트가 조사 컨텍스트에 따라 사용할 도구를 선택합니다.
- **일관된 ToolDef 패턴** &mdash; 모든 도구가 동일한 `{ name, description, schema, execute }` 패턴을 따름. 새 도구 추가는 해당 모듈에 하나의 객체를 만드는 것으로 완료됩니다.
- **모든 필드에 Zod 검증** &mdash; 모든 스키마 필드에 `.describe()`가 있어 AI 에이전트에 컨텍스트 제공. 잘못된 입력은 실행 전에 명확한 에러 메시지와 함께 포착됩니다.

---

## MCP 보안 스위트

| 프로젝트 | 도메인 | 도구 수 |
|----------|--------|---------|
| [hackbrowser-mcp](https://github.com/badchars/hackbrowser-mcp) | 브라우저 기반 보안 테스트 | 39 |
| [cloud-audit-mcp](https://github.com/badchars/cloud-audit-mcp) | 클라우드 보안 (AWS/Azure/GCP) | 38 |
| [github-security-mcp](https://github.com/badchars/github-security-mcp) | GitHub 보안 태세 | 39 |
| [cve-mcp](https://github.com/badchars/cve-mcp) | 취약점 인텔리전스 | 23 |
| [osint-mcp-server](https://github.com/badchars/osint-mcp-server) | OSINT & 정찰 | 37 |
| [darknet-mcp-server](https://github.com/badchars/darknet-mcp-server) | 다크웹 & 위협 인텔리전스 | 66 |
| [dns-security-mcp](https://github.com/badchars/dns-security-mcp) | DNS 보안 인텔리전스 | 103 |
| **steganography-mcp** | **스테가노그래피 분석** | **128** |

---

## 기여

기여를 환영합니다. 가이드라인은 [CONTRIBUTING.md](../../CONTRIBUTING.md)를 참조하세요.

---

<p align="center">
<b>허가된 보안 연구 및 교육 목적으로만 사용하세요.</b><br>
소유하지 않은 파일에 대해 스테가노그래피 분석을 수행하기 전에 반드시 적절한 허가를 받으세요.
</p>

<p align="center">
  <a href="../../LICENSE">MIT 라이선스</a> &bull; <a href="https://orhanyildirim.us">Orhan Yildirim</a> 제작 &bull; <a href="mailto:contact@orhanyildirim.us">contact@orhanyildirim.us</a>
</p>
