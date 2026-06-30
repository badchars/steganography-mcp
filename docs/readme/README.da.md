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
  <strong>Dansk</strong> |
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

<h3 align="center">Det mest omfattende steganografianalyseværktøj til AI-agenter.</h3>

<p align="center">
  LSB-detektion, chi-kvadrat steganalyse, RS-analyse, DCT-forensik, lydsteganografi, zero-width tekstkodning, filforensik, polyglotdetektion, kodningsidentifikation, videosteganografi, GIF-analyse, netværkssteganografi, MP3-analyse, spread spectrum, BPCS, arkivsteganografi, QR-kodesteganografi &mdash; samlet i én MCP-server.<br>
  <b>128 værktøjer. 17 kategorier. 4 afhængigheder. 100% offline.</b> Ingen API-nøgler påkrævet. Alle værktøjer kører lokalt.
</p>

<br>

<p align="center">
  <a href="#problemet">Problemet</a> &bull;
  <a href="#hvad-gør-det-anderledes">Hvad gør det anderledes</a> &bull;
  <a href="#hurtig-start">Hurtig start</a> &bull;
  <a href="#hvad-ai-agenten-kan-gøre">Hvad AI-agenten kan gøre</a> &bull;
  <a href="#værktøjsreference-128-værktøjer">Værktøjer (128)</a> &bull;
  <a href="#cli-brug">CLI-brug</a> &bull;
  <a href="#arkitektur">Arkitektur</a> &bull;
  <a href="../../CONTRIBUTING.md">Bidrag</a>
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

## Problemet

Steganografi er kunsten at skjule data i det åbenlyse &mdash; inde i billeder, lydfiler, dokumenter og endda Unicode-tekst. Det bruges i CTF-konkurrencer, digitale efterforskninger, skjulte kommunikationskanaler og malware-payloads. At opdage det kræver en kombination af statistisk analyse, formatspecifik parsing, entropimåling og domæneekspertise.

```
Traditionel steganografianalyse-arbejdsgang:
  detektér billedstego          ->  zsteg + stegsolve (2 værktøjer, Ruby + Java)
  chi-kvadrat analyse           ->  brugerdefineret Python-script
  RS-analyse                    ->  brugerdefineret MATLAB/Python-kode
  JPEG DCT-forensik             ->  stegdetect (forladt C-værktøj fra 2004)
  udtræk LSB-data               ->  zsteg + steghide + openstego (3 værktøjer)
  lydsteganografi               ->  Audacity manuelt + brugerdefinerede scripts
  zero-width tekstdetektion     ->  webbaserede værktøjer + manuel inspektion
  filforensik / binwalk         ->  binwalk + foremost + xxd (3 værktøjer)
  EXIF-metadata                 ->  exiftool (Perl-afhængighed)
  kodningsdetektion             ->  CyberChef web UI + manuelt gætværk
  ─────────────────────────────────
  Total: 10+ værktøjer, 5+ sprog, timer af manuel korrelation
```

**steganography-mcp** giver din AI-agent 128 værktøjer på tværs af 17 kategorier via [Model Context Protocol](https://modelcontextprotocol.io). Agenten udfører billedsteganalyse, JPEG-forensik, avanceret JPEG-detektion, lydanalyse, tekststeganografidetektion, filforensik, dokumentanalyse, kodningsidentifikation, videosteganografi, GIF-analyse, netværkssteganografi, MP3-analyse, spread spectrum-detektion, BPCS-analyse, arkivsteganografi, skabelse og indlejring samt QR-kodesteganografi &mdash; alt sammen i én samtale, alt kørende 100% lokalt uden afhængigheder af eksterne tjenester.

```
Med steganography-mcp:
  Dig: "Analysér dette CTF-udfordringsbillede for skjulte data"

  Agent: -> img_detect: Chi-kvadrat p=0,0001 (LSB-indlejring detekteret),
            RS-analyse estimerer 42% indlejringsrate, entropianomali
            i nedre højre kvadrant
         -> img_lsb_extract: Udtrak 847 bytes fra RGB LSB'er
         -> crypto_detect: Udtrukne data er Base64-kodet
         -> crypto_decode: Afkodet til "FLAG{hidden_in_plain_sight_2024}"
         -> img_known_tools: Signaturtræf for OpenStego

         "Billedet indeholder LSB-steganografi indlejret med OpenStego.
          Chi-kvadrat-testen bekræfter LSB-erstatning i alle tre RGB-
          kanaler med 42% indlejringsrate. Den skjulte payload er
          Base64-kodet og afkodes til flaget:
          FLAG{hidden_in_plain_sight_2024}"
```

---

## Hvad gør det anderledes

De fleste steganografiværktøjer er enkeltformålsredskaber. steganography-mcp giver din AI-agent evnen til at **ræsonnere på tværs af alle steganografiteknikker samtidigt**.

<table>
<thead>
<tr>
<th></th>
<th>Traditionel tilgang</th>
<th>steganography-mcp</th>
</tr>
</thead>
<tbody>
<tr>
<td><b>Grænseflade</b></td>
<td>10+ CLI-værktøjer, 5+ sprog, web-UIs</td>
<td>MCP &mdash; AI-agenten kalder værktøjer i samtaleformat</td>
</tr>
<tr>
<td><b>Dækning</b></td>
<td>Én teknik ad gangen</td>
<td>17 kategorier, 128 værktøjer parallelt</td>
</tr>
<tr>
<td><b>Billedanalyse</b></td>
<td>zsteg (Ruby), stegsolve (Java), brugerdefinerede scripts</td>
<td>Agenten kører chi-kvadrat, RS-analyse, SPA, entropikort, histogram, bitplaneudtræk, metadata og værktøjssignaturdetektion &mdash; alt på én gang</td>
</tr>
<tr>
<td><b>JPEG-forensik</b></td>
<td>stegdetect (forladt), manuel DCT-inspektion</td>
<td>Agenten analyserer DCT-histogram, dobbelt kompression, kvantiseringstabeller, EXIF-dybdeanalyse, miniaturebilledsammenligning, kommentarfelter</td>
</tr>
<tr>
<td><b>Lydstego</b></td>
<td>Audacity + manuelle LSB-scripts</td>
<td>Agenten udfører LSB chi-kvadrat, spektrumanalyse, stille-sektion LSB-tjek, ekko-skjuledetektion, metadataudtræk</td>
</tr>
<tr>
<td><b>Tekststego</b></td>
<td>Webbaserede værktøjer, manuel inspektion</td>
<td>Agenten detekterer zero-width tegn, mellemrumskodning, usynlig Unicode, homoglyffer, akrostikker &mdash; og kan indlejre/udtrække ZWC-beskeder</td>
</tr>
<tr>
<td><b>Afhængigheder</b></td>
<td>Ruby, Java, Perl, Python, C, webværktøjer</td>
<td><code>npx -y steganography-mcp</code> &mdash; 4 afhængigheder, ren TypeScript</td>
</tr>
<tr>
<td><b>API-nøgler</b></td>
<td>Ikke relevant (men fragmenteret værktøjskæde)</td>
<td>Nul. 100% offline, ingen eksterne kald</td>
</tr>
<tr>
<td><b>Output</b></td>
<td>Rå tekst, billeder, manuel korrelation</td>
<td>Struktureret JSON &mdash; AI korrelerer fund automatisk</td>
</tr>
</tbody>
</table>

---

## Hurtig start

### Mulighed 1: npx (ingen installation)

```bash
npx -y steganography-mcp
```

Alle 128 værktøjer virker med det samme. Ingen API-nøgler. Ingen konfiguration. 100% offline.

### Mulighed 2: bunx (hurtigere)

```bash
bunx steganography-mcp
```

### Mulighed 3: Klon

```bash
git clone https://github.com/badchars/steganography-mcp.git
cd steganography-mcp
bun install
```

### Forbind til din AI-agent

<details open>
<summary><b>Claude Code</b></summary>

```bash
# Med npx
claude mcp add steganography -- npx -y steganography-mcp

# Med lokal klon
claude mcp add steganography -- bun run /sti/til/steganography-mcp/src/index.ts
```

</details>

<details>
<summary><b>Claude Desktop</b></summary>

Tilføj til `~/Library/Application Support/Claude/claude_desktop_config.json`:

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
<summary><b>Cursor / Windsurf / andre MCP-klienter</b></summary>

Samme JSON-konfigurationsformat. Peg kommandoen til `npx -y steganography-mcp` eller din lokale installationssti.

</details>

### Begynd at analysere

```
Dig: "Tjek dette billede for skjulte data"
```

Det er alt. Agenten kører chi-kvadrat analyse, RS-analyse, entropikortlægning, metadataudtræk, vedhæftet datadetektion og værktøjssignaturscanning &mdash; automatisk.

---

## Hvad AI-agenten kan gøre

### CTF-udfordringsløser

```
Dig: "Løs denne CTF-steganografiudfordring — billedet er challenge.png"

Agent: -> img_detect: Chi-kvadrat steganalyse detekterer LSB-indlejring
          (p=0,00012), RS-analyse estimerer 38% indlejringsrate,
          entropianomali ved blokke (12,4)-(15,8)
       -> img_lsb_extract: Udtrak 1.247 bytes fra RGB-kanal LSB'er
       -> crypto_detect: Data matcher Base64-mønster (konfidens: 0,95)
       -> crypto_decode: "Q1RGe3N0M2cwX21hc3Rlcn0=" -> "CTF{st3g0_master}"
       -> img_known_tools: OpenStego-signatur detekteret i PNG-chunks

       "Fandt flaget: CTF{st3g0_master}
        Billedet bruger LSB-steganografi indlejret af OpenStego.
        Payloaden var Base64-kodet i RGB'ens mindst signifikante
        bits med en 38% indlejringsrate."
```

### Digital efterforskning

```
Dig: "Analysér suspect.png og suspect.wav for skjult kommunikation"

Agent: -> img_detect: Ingen LSB-stego detekteret, men vedhæftede data fundet
          (12.847 bytes efter PNG IEND-markøren)
       -> file_identify: Vedhæftede data begynder med ZIP-signatur (PK)
       -> img_metadata: PNG tEXt-chunk indeholder usædvanlig nøgle "comm"
          med Base64-værdi
       -> audio_detect: WAV-fil har LSB chi-kvadrat anomali (p=0,003)
       -> audio_silence: 3 stille sektioner med aktive LSB'er detekteret
       -> audio_lsb_extract: Udtrak 2.048 bytes skjulte data

       "Begge filer indeholder skjulte data:
        1. suspect.png har et ZIP-arkiv vedhæftet efter PNG EOF-
           markøren, plus en Base64-kodet besked i metadata
        2. suspect.wav indeholder LSB-steganografi, specifikt i
           stille sektioner — en stærk indikator for bevidst skjulning.
        Anbefaler at udtrække ZIP'en og analysere WAV-payloaden."
```

### Zero-width tekstdetektion

```
Dig: "Denne e-mail ser normal ud, men kan have skjult tekst"

Agent: -> text_detect: 847 zero-width tegn detekteret mellem
          synlige tegn
       -> text_zwc_detect: ZWSP (342), ZWNJ (505) fundet ved 127
          positioner i hele teksten
       -> text_zwc_extract: Binær afkodning giver "EXFIL-ROUTE-7"
       -> text_invisible_scan: 3 yderligere usynlige Unicode-tegn
          (U+2060, U+FEFF) fundet i header-sektionen

       "E-mailen indeholder en skjult besked kodet med zero-width
        tegn: 'EXFIL-ROUTE-7'. 847 usynlige tegn er spredt
        ud i hele den synlige tekst ved brug af ZWSP/ZWNJ binær
        kodning. Derudover blev 3 Word Joiner- og BOM-tegn
        fundet i headeren — sandsynligvis metadataartefakter."
```

### JPEG forensisk analyse

```
Dig: "Er dette JPEG-billede autentisk, eller er det blevet manipuleret?"

Agent: -> jpeg_structure: 14 markører parset, normal JFIF-struktur
       -> jpeg_double_compression: Dobbelt kompression DETEKTERET —
          blokartefaktscore 0,73, kvantiseringsanomaliforhold 0,81
       -> jpeg_quantization: Kvalitet ~75 (luminans), men residuale
          mønstre antyder original var kvalitet ~92
       -> jpeg_exif_deep: EXIF siger "iPhone 14 Pro" men Software-
          feltet siger "Adobe Photoshop 25.0"
       -> jpeg_thumbnail_compare: Miniaturebilleddimensioner matcher IKKE
          hovedbilledet (miniature: 4032x3024, hoved: 2048x1536)

       "Dette JPEG er blevet manipuleret. Beviser:
        1. Dobbelt kompression detekteret — billedet blev afkodet og
           genkodet med lavere kvalitet (original ~92, nuværende ~75)
        2. EXIF hævder iPhone 14 Pro men software-feltet afslører
           Photoshop-redigering
        3. Miniaturebilledet er fra den originale 4032x3024-optagelse,
           men hovedbilledet blev ændret til 2048x1536
        Alle tre fund bekræfter uafhængigt modifikation efter optagelse."
```

---

## Værktøjsreference (128 værktøjer)

### Kategorioversigt

| Kategori | Værktøjer | Beskrivelse |
|----------|-----------|-------------|
| [Billedsteganalyse](#-billedsteganalyse-14) | 14 | LSB-detektion, chi-kvadrat, RS-analyse, entropikortlægning, bitplaner, histogram, metadata, værktøjssignaturer |
| [JPEG-analyse](#-jpeg-analyse-7) | 7 | DCT-histogram, dobbelt kompression, kvantiseringstabeller, dyb EXIF, miniaturebilledforensik, kommentaranalyse |
| [Lydsteganalyse](#-lydsteganalyse-7) | 7 | WAV LSB-detektion, spektrumanalyse, stille-sektionsanalyse, ekko-skjuledetektion, metadataudtræk |
| [Tekst & Unicode](#-tekst--unicode-10) | 10 | Zero-width tegn, mellemrumskodning, usynlig Unicode, homoglyffer, akrostikker, Unicode-analyse |
| [Filforensik](#-filforensik-10) | 10 | Magiske bytes, polyglotdetektion, indlejrede filer, vedhæftede data, entropi, hex-dump, strenge, headere |
| [Dokumentanalyse](#-dokumentanalyse-5) | 5 | PDF skjult indhold, PDF-metadata, PDF-streams, HTML skjult indhold, XML-metadata |
| [Kodning & Krypto](#-kodning--krypto-7) | 7 | Kodningsdetektion, multiformatafkoder, frekvensanalyse, entropi, XOR brute-force, hash-ID, krypteringsmønstre |
| [Avanceret JPEG](#-avanceret-jpeg-7) | 7 | F5, JSteg, OutGuess, PVD-detektion, glidende vindue chi-kvadrat, crop-rekalibrerings steganalyse, værktøjskompatibilitet |
| [Videosteganografi](#-videosteganografi-8) | 8 | AVI-frame LSB, inter-frame analyse, framesammenligning, metadata, struktur, EOF-data |
| [GIF-steganografi](#-gif-steganografi-8) | 8 | Palette-LSB, LZW sub-blok entropi, kommentar-extensions, applikation-extensions, frameanalyse |
| [Netværkssteganografi](#-netværkssteganografi-8) | 8 | PCAP skjulte kanaler, IP/TCP-headeranalyse, ICMP-payloads, DNS-tunneling, HTTP-headere, timing |
| [MP3-steganografi](#-mp3-steganografi-7) | 7 | ID3 skjulte data, frameanalyse, padding-manipulation, sampleanalyse, metadata, struktur |
| [Spread Spectrum](#-spread-spectrum-5) | 5 | DFT magnitudespektrum, autokorrelation, vandmærkedetektion, støjgulvsanalyse, patchwork-detektion |
| [BPCS-analyse](#-bpcs-analyse-5) | 5 | Bitplan-kompleksitetssegmentering, kompleksitetskortlægning, tærskelanalyse, dataudtræk, kapacitetsestimering |
| [Arkivsteganografi](#-arkivsteganografi-7) | 7 | ZIP slack-pladser, ekstrafelter, kommentarer, polyglotdetektion, strukturanalyse, metadata |
| [Skab & Indlejr](#-skab--indlejr-7) | 7 | EOF-injektion, metadata-injektion, mellemrumskodning, null-chiffer, polyglotskabelse, kommentarinjektion, paletteindlejring |
| [QR-kodesteganografi](#-qr-kodesteganografi-6) | 6 | QR stego-detektion, strukturanalyse, ECC-kapacitet, modulanalyse, dataudtræk, sammenligning |

---

<details open>
<summary><h3>Billedsteganalyse (14)</h3></summary>

| Værktøj | Beskrivelse |
|---------|-------------|
| `img_detect` | Autodetektér steganografi i et billede. Kører chi-kvadrat, RS-analyse, entropi, metadata, vedhæftede data og værktøjssignaturtjek. Returnerer en omfattende JSON-rapport |
| `img_lsb_detect` | Statistisk LSB-steganografidetektion. Kører chi-kvadrat og sample pair-analyse på hver farvekanal uafhængigt |
| `img_lsb_extract` | Udtræk skjulte data fra billede-LSB'er. Udtrækker bits fra specificerede kanaler og bitplan, forsøger UTF-8-afkodning og viser hex-dump |
| `img_lsb_embed` | Indlejr en besked i et billede med LSB-steganografi. Læser en PNG-fil, indlejrer beskeden i de mindst signifikante bits og skriver en ny PNG-fil |
| `img_bitplane` | Udtræk og visualisér et specifikt bitplan fra en billedkanal. Viser dimensioner, procentdel af 1-bits og en ASCII-art forhåndsvisning |
| `img_chi_square` | Chi-kvadrat steganalyseangreb på hver farvekanal uafhængigt. Detekterer LSB-erstatning ved at teste om tilstødende pixelværdipar er udlignede |
| `img_rs_analysis` | RS (Regular-Singular) steganalyse med Fridrich-Goljan-Du metoden. Analyserer pixelgrupper for at estimere LSB-indlejringsrate per kanal |
| `img_histogram` | Generér et pixelværdi-histogram med anomalidetektion. Detekterer Pairs-of-Values (PoV) anomalier der indikerer LSB-steganografi |
| `img_entropy_map` | Blokvis entropianalyse af et billede. Opdeler billedet i blokke og beregner Shannon-entropi per blok, markerer højentropiregioner |
| `img_metadata` | Dyb metadataudtræk fra et billede. For PNG: tekstchunks, chunkliste, IHDR-info. For JPEG: EXIF, kommentarer, kvantiseringstabeller, markørliste |
| `img_appended_data` | Detektér og udtræk data vedhæftet efter billedets EOF-markør. Tjekker for skjulte data efter PNG IEND, JPEG EOI eller BMP-filstørrelsesgrænse |
| `img_compare` | Pixel-for-pixel sammenligning af to billeder. Rapporterer identiske/forskellige pixeltal, maksdifference og hvilke kanaler der er påvirket |
| `img_channel_analysis` | Per-kanal statistisk analyse for R, G, B og A-kanaler. Rapporterer gennemsnit, standardafvigelse, entropi, min, max og antal unikke værdier |
| `img_known_tools` | Scan billedfilbytes for kendte steganografiværktøjssignaturer. Tjekker mod en database af mønstre fra OpenStego, Steghide, JSteg, F5 og andre |

</details>

<details>
<summary><h3>JPEG-analyse (7)</h3></summary>

| Værktøj | Beskrivelse |
|---------|-------------|
| `jpeg_structure` | Parse JPEG-markører/segmenter med offsets og størrelser. Viser intern struktur inklusiv alle markører, positioner og segmentlængder |
| `jpeg_dct_histogram` | DCT-koefficientfordelingsanalyse til steganografidetektion. Analyserer Y-kanal pixelværdifordeling og SOS-entropidata for at detektere anomalier forårsaget af JSteg, F5 og OutGuess |
| `jpeg_double_compression` | Detektér dobbelt JPEG-kompressionsartefakter. Identificerer karakteristiske blokartefakter og kvantiseringstabelanomalier &mdash; en almindelig indikator for billedmanipulation eller stego-indlejring |
| `jpeg_quantization` | Kvantiseringstabelanalyse med kvalitetsestimering. Viser alle kvantiseringstabeller i 8x8 gitterformat og estimerer JPEG-kvalitetsfaktoren |
| `jpeg_exif_deep` | Dyb EXIF-analyse inklusiv GPS-koordinater, tidsstempler, softwareinfo, miniaturebilleder, producent-noter og alle IFD-indgange. Markerer forensisk interessante felter |
| `jpeg_thumbnail_compare` | Sammenlign EXIF-miniaturebillede med hoved-JPEG-billedet. Dimensions- eller indholdsuoverensstemmelse indikerer modifikation efter optagelse &mdash; en almindelig forensisk artefakt |
| `jpeg_comment` | Udtræk og analysér JPEG COM (kommentar) markører. Tjekker for skjulte datamønstre, usædvanligt store kommentarer og højentropiindhold |

</details>

<details>
<summary><h3>Lydsteganalyse (7)</h3></summary>

| Værktøj | Beskrivelse |
|---------|-------------|
| `audio_detect` | Autodetektér lydsteganografi i en WAV-fil. Kører LSB chi-kvadrat, entropianalyse, metadatainspektion og tjekker for vedhæftede data |
| `audio_lsb_detect` | PCM-sample LSB statistisk analyse. Udfører chi-kvadrat test på LSB'er grupperet efter værdipar for at detektere LSB-erstatningssteganografi |
| `audio_lsb_extract` | Udtræk LSB-data fra lydsamples. Læser den mindst signifikante bit fra hver PCM-sample og forsøger at afkode skjulte data |
| `audio_spectrum` | Spektralanalyse for skjulte signaler i WAV-lyd. Analyserer sampleværdifordeling, nulkrydsningshastighed, RMS-energi per blok og detekterer anomale stille sektioner |
| `audio_metadata` | Udtræk metadata fra en WAV-fil inklusiv RIFF INFO-chunks, formatdetaljer og al chunkinformation |
| `audio_silence` | Analysér stille sektioner i WAV-lyd for skjulte data. Finder nær-nul sampleregioner og tjekker deres LSB'er &mdash; stille sektioner med aktive LSB'er er en stærk stego-indikator |
| `audio_echo_detect` | Ekko-skjuledetektion via autokorrelationsanalyse. Beregner normaliseret autokorrelation ved almindelige ekkoforsinkelser. Regelmæssige ekkomønstre indikerer steganografisk ekko-skjuling |

</details>

<details>
<summary><h3>Tekst & Unicode (10)</h3></summary>

| Værktøj | Beskrivelse |
|---------|-------------|
| `text_detect` | Autodetektér tekststeganografi. Tjekker for zero-width tegn, mellemrumskodning, usynlig Unicode, homoglyffer og usædvanlige mønstre |
| `text_zwc_detect` | Detektér zero-width tegn (ZWSP, ZWNJ, ZWJ, BOM) i tekst. Rapporterer positioner, antal og potentiel kodet beskedlængde |
| `text_zwc_extract` | Afkod en zero-width tegnkodet besked. Udtrækker ZWC-tegn og afkoder binært: ZWSP=0, ZWNJ=1 (forsøger begge polariteter) |
| `text_zwc_embed` | Indlejr en hemmelig besked i dæktekst med zero-width tegn. Koder beskeden til binær og mapper bits til ZWSP(0)/ZWNJ(1) |
| `text_whitespace_detect` | Detektér mellemrumskodning i tekst. Tjekker hver linje for efterfølgende mellemrumsmønstre hvor mellemrum=0 og tab=1 kan kode binære data |
| `text_whitespace_extract` | Udtræk en mellemrumskodet besked fra tekst. Læser efterfølgende mellemrum fra hver linje og afkoder mellemrum=0/tab=1 binær kodning |
| `text_invisible_scan` | Scan tekst for ALLE usynlige Unicode-tegn. Tjekker hvert tegn mod den komplette usynlige tegndatabase og rapporterer positioner og navne |
| `text_homoglyph` | Detektér Unicode homoglyfsubstitutioner i tekst. Identificerer ikke-ASCII tegn der visuelt ligner ASCII-bogstaver (kyrillisk a vs. latinsk a, osv.) |
| `text_unicode_analysis` | Fuld Unicode-tegnfordelingsanalyse. Kategoriserer alle tegn efter scriptblok, udfører entropianalyse og detekterer mistænkelig scriptblanding |
| `text_acrostic` | Detektér første-bogstav, første-ord, sidste-bogstav, sidste-ord eller n'te-tegn mønstre (akrostiske beskeder) skjult på tværs af tekstlinjer |

</details>

<details>
<summary><h3>Filforensik (10)</h3></summary>

| Værktøj | Beskrivelse |
|---------|-------------|
| `file_identify` | Filtypeidentifikation via magiske bytes. Læser filheaderen og matcher mod en omfattende database af kendte filsignaturer. Tjekker for filtypenavneuoverensstemmelse |
| `file_polyglot` | Detektér polyglotfiler gyldige som to eller flere formater samtidigt. Tjekker for flere gyldige filsignaturer ved forskellige offsets (PDF+ZIP, PNG+PDF, osv.) |
| `file_embedded` | Scan for indlejrede filer i en binærfil, lignende binwalk. Søger efter kendte magiske bytesignaturer ved hvert offset for at opdage skjulte eller vedhæftede filer |
| `file_appended` | Detektér data vedhæftet efter en fils formatspecifikke EOF-markør. Understøtter PNG (IEND), JPEG (FFD9), BMP, ZIP (EOCD) og PDF (%%EOF) |
| `file_entropy` | Sektionsvis entropianalyse. Beregner Shannon-entropi per blok og samlet, markerer anomale højentropisekvenser |
| `file_entropy_visual` | ASCII entropivisualisering af en fil. Renderer et tekstbaseret søjlediagram der viser entropiniveauer over filen for visuel anomalidetektion |
| `file_strings` | Udtræk printbare og Unicode-strenge fra binære filer. Scanner for sekvenser af printbare tegn og rapporterer dem med filoffsets. Understøtter ASCII, UTF-8, UTF-16 |
| `file_hex` | Hex-dump med ASCII sidepanelvisning. Traditionelt hex-editorformat med offsetadresser, hexbytes og printbar ASCII-repræsentation |
| `file_header` | Dyb header- og strukturanalyse for kendte formater. Parser PNG IHDR, JPEG SOF, BMP info-header, ZIP lokale filheadere og PDF version/metadata |
| `file_compare` | Binær diff mellem to filer. Byte-for-byte sammenligning der rapporterer forskelle med offsets, procentdel identiske og LSB-kun forskelle til stego-analyse |

</details>

<details>
<summary><h3>Dokumentanalyse (5)</h3></summary>

| Værktøj | Beskrivelse |
|---------|-------------|
| `doc_pdf_hidden` | Skjult PDF-indholdsdetektion. Scanner for JavaScript, autohandlinger, OpenAction, skjulte annotationer, usynlig tekst, indlejrede filer og andet skjult indhold |
| `doc_pdf_metadata` | PDF-metadataudtræk. Parser /Info-ordbogen og XMP-metadatablokke til forensisk tilskrivning og dokumentproveniens-analyse |
| `doc_pdf_streams` | PDF-streamanalyse. Lokaliserer alle stream/endstream-blokke, forsøger zlib-dekompression og rapporterer størrelser og entropi til at finde skjulte data |
| `doc_html_hidden` | Skjult HTML-indholdsdetektion. Scanner for kommentarer, display:none elementer, data-* attributter, skjulte inputs, base64-indhold, nul-størrelses elementer og usynlig tekst |
| `doc_xml_metadata` | XML og Office-dokumentmetadataudtræk. Parser Dublin Core, Microsoft Office-egenskaber, processerings-instruktioner og andre metadatafelter |

</details>

<details>
<summary><h3>Kodning & Krypto (7)</h3></summary>

| Værktøj | Beskrivelse |
|---------|-------------|
| `crypto_detect` | Autodetektér kodningstype af en inputstreng. Tester mod alle kendte mønstre (Base64, hex, binær, morse, URL-kodning, HTML-entiteter, osv.) og returnerer træf sorteret efter konfidens |
| `crypto_decode` | Multiformatafkoder der understøtter Base64, hex, binær, decimal, oktal, URL-kodning, ROT13, Base32, Morsekode og HTML-entiteter. Autotilstand detekterer kodning først |
| `crypto_frequency` | Tegnfrekvensanalyse til kryptoanalyse. Tæller tegnforekomster, sammenligner med standard engelsk frekvens (ETAOINSHRDLU) og beregner Index of Coincidence |
| `crypto_entropy` | Shannon entropi-beregning og klassifikation for strenge. Beregner tegn- og byteniveauentropi, klassificerer i kategorier fra gentagne data til krypteret/tilfældig |
| `crypto_xor` | XOR-nøgle brute-force for enkelt-byte og multi-byte nøgler. Prøver alle 256 enkelt-byte nøgler og scorer efter sandsynlighed for engelsk tekst. Bruger IC til estimering af multi-byte nøglelængde |
| `crypto_hash_id` | Hash-typeidentifikation. Matcher input mod kendte hashmønstre efter længde og format (MD5, SHA-1, SHA-256, SHA-512, bcrypt, CRC32, NTLM, osv.) |
| `crypto_patterns` | Kendt krypterings- og kodningsmønsterdetektion. Analyserer tekst for Cæsar-kryptering, substitutionskryptering, Vigenère, rail fence transposition, Atbash og omvendt tekst |

</details>

---

## CLI-brug

```bash
# Vis hjælp
npx -y steganography-mcp --help

# List alle 128 værktøjer med beskrivelser
npx -y steganography-mcp --list

# Detektér steganografi i et billede
npx -y steganography-mcp --tool img_detect '{"file_path":"challenge.png"}'

# Udtræk skjult besked fra LSB'er
npx -y steganography-mcp --tool img_lsb_extract '{"file_path":"stego.png"}'

# Chi-kvadrat steganalyse
npx -y steganography-mcp --tool img_chi_square '{"file_path":"suspect.png"}'

# RS-analyse (Fridrich-Goljan-Du metoden)
npx -y steganography-mcp --tool img_rs_analysis '{"file_path":"suspect.png"}'

# JPEG dobbelt kompression detektion
npx -y steganography-mcp --tool jpeg_double_compression '{"file_path":"photo.jpg"}'

# Dyb EXIF-analyse
npx -y steganography-mcp --tool jpeg_exif_deep '{"file_path":"photo.jpg"}'

# Lydsteganografidetektion
npx -y steganography-mcp --tool audio_detect '{"file_path":"message.wav"}'

# Detektér zero-width tegnkodning
npx -y steganography-mcp --tool text_zwc_detect '{"text":"mistænkelig tekst her"}'

# Indlejr en skjult besked med zero-width tegn
npx -y steganography-mcp --tool text_zwc_embed '{"text":"dæktekst","message":"hemmelighed"}'

# Identificér filtype og detektér polygloter
npx -y steganography-mcp --tool file_polyglot '{"file_path":"suspicious.pdf"}'

# Scan for indlejrede filer (binwalk-stil)
npx -y steganography-mcp --tool file_embedded '{"file_path":"mystery.bin"}'

# Entropivisualisering
npx -y steganography-mcp --tool file_entropy_visual '{"file_path":"data.bin"}'

# Autodetektér kodning
npx -y steganography-mcp --tool crypto_detect '{"input":"aGVsbG8gd29ybGQ="}'

# XOR brute-force
npx -y steganography-mcp --tool crypto_xor '{"input":"4f5243484e"}'

# Detektér krypteringsmønstre
npx -y steganography-mcp --tool crypto_patterns '{"input":"Gur dhvpx oebja sbk"}'

# Med Bun (hurtigere opstart)
bunx steganography-mcp --tool img_detect '{"file_path":"image.png"}'
```

---

## Anvendelsesområder

### CTF-udfordringer
Løs steganografiudfordringer i capture-the-flag konkurrencer. AI-agenten kan systematisk anvende alle detektionsteknikker &mdash; LSB-analyse, metadatainspektion, vedhæftede data, kodningsdetektion og krypteringsidentifikation &mdash; til at finde skjulte flag i billeder, lydfiler, dokumenter og tekst.

### Digital efterforskning
Detektér skjulte kommunikationskanaler i forensiske undersøgelser. Analysér mistænkelige filer for skjulte data med statistisk steganalyse (chi-kvadrat, RS-analyse), tjek for data vedhæftet efter EOF-markører, scan for indlejrede filer og identificér steganografiværktøjssignaturer.

### Sikkerhedsforskning
Analysér steganografiværktøjer og -teknikker. Sammenlign originale og stego-billeder pixel for pixel, studér DCT-koefficientfordelinger i JPEG-stego, mål entropiændringer fra indlejring og reverse-engineer kodningsskemaer.

### Uddannelse
Lær hvordan steganografiteknikker fungerer. Indlejr og udtræk LSB-beskeder, kod tekst med zero-width tegn, visualisér bitplaner og entropikort, analysér filstrukturer med hex-dumps og studér krypteringsmønstre med frekvensanalyse.

### Hændelsesrespons
Under hændelsesrespons kan du tjekke dokumenter og billeder for skjulte eksfiltreringskanaler. Scan PDF'er for skjult JavaScript og indlejrede filer, detektér zero-width tegnkodning i e-mails, identificér polyglotfiler og analysér mistænkelige kodninger.

---

## Arkitektur

```
src/
  index.ts                    # CLI-indgangspunkt (--help, --list, --tool, stdio-server)
  protocol/
    mcp-server.ts             # MCP-serveropsætning (stdio transport)
    tools.ts                  # Værktøjsregister — alle 128 værktøjer samlet her
  types/
    index.ts                  # Delte typer (ToolDef, ToolContext, ToolResult)
  utils/
    binary.ts                 # Binær fillæsning, hex-dump, formatdetektion
    stats.ts                  # Shannon-entropi, chi-kvadrat, bytefrekvens
    cache.ts                  # TTL-cache
    png-parser.ts             # Ren TS PNG-parser (IHDR, chunks, pixeldata)
    jpeg-parser.ts            # Ren TS JPEG-parser (markører, EXIF, kvantisering)
    wav-parser.ts             # Ren TS WAV-parser (RIFF-chunks, PCM-samples)
    bmp-parser.ts             # Ren TS BMP-parser (header, pixeldata)
    avi-parser.ts             # Ren TS AVI-parser (frames, headere)
    gif-parser.ts             # Ren TS GIF-parser (palette, LZW-blokke)
    pcap-parser.ts            # Ren TS PCAP-parser (pakker, headere)
    mp3-parser.ts             # Ren TS MP3-parser (frames, ID3-tags)
    zip-parser.ts             # Ren TS ZIP-parser (lokale headere, central directory)
  image/                      # Billedsteganalyseværktøjer (14)
  jpeg/                       # JPEG-analyseværktøjer (7)
  jpegadv/                    # Avancerede JPEG-værktøjer (7)
  audio/                      # Lydsteganalyseværktøjer (7)
  text/                       # Tekst & Unicode-værktøjer (10)
  file/                       # Filforensikværktøjer (10)
  document/                   # Dokumentanalyseværktøjer (5)
  crypto/                     # Kodning & Kryptoværktøjer (7)
  video/                      # Videosteganografiværktøjer (8)
  gif/                        # GIF-steganografiværktøjer (8)
  network/                    # Netværkssteganografiværktøjer (8)
  mp3/                        # MP3-steganografiværktøjer (7)
  spread/                     # Spread Spectrum-værktøjer (5)
  bpcs/                       # BPCS-analyseværktøjer (5)
  archive/                    # Arkivsteganografiværktøjer (7)
  create/                     # Skab & Indlejr-værktøjer (7)
  qrcode/                     # QR-kodesteganografiværktøjer (6)
  data/
    encoding-patterns.ts      # Kodnings-regexmønstre + afkodere
    magic-bytes.ts            # Filsignaturdatabase (100+ formater)
    stego-signatures.ts       # Kendte steganografiværktøjssignaturer
    unicode-invisible.ts      # Usynlig Unicode-tegndatabase
```

**Designbeslutninger:**

- **4 afhængigheder, intet andet** &mdash; `@modelcontextprotocol/sdk` til MCP-protokollen, `zod` til inputvalidering, `pngjs` til PNG-pixeladgang, `jpeg-js` til JPEG-afkodning. Intet oppustet afhængighedstræ. Ingen native moduler. Ingen C-bindings. Ingen Python. Ingen Java.
- **100% offline** &mdash; Alle værktøjer kører helt lokalt. Ingen HTTP-forespørgsler. Ingen API-kald. Ingen telemetri. Ingen cloud-afhængigheder. Dine filer forlader aldrig din maskine.
- **Ren TypeScript statistisk analyse** &mdash; Chi-kvadrat test, RS-analyse (Fridrich-Goljan-Du), Sample Pair Analysis, Shannon-entropi, Index of Coincidence og frekvensanalyse er alle implementeret i ren TypeScript. Ingen eksterne matematikbiblioteker.
- **Brugerdefinerede formatparsere** &mdash; PNG-chunks, JPEG-markører/EXIF/kvantiseringstabeller, WAV RIFF-chunks og BMP-headere parses med nul eksterne afhængigheder via `utils/`-parserne. Dette muliggør dyb formatspecifik analyse som generelle biblioteker ikke kan levere.
- **17 udbydere, 1 server** &mdash; Hver analysekategori er et uafhængigt modul. AI-agenten vælger hvilke værktøjer der skal bruges baseret på undersøgelseskonteksten.
- **Rent ToolDef-mønster** &mdash; Hvert værktøj følger det samme `{ name, description, schema, execute }`-mønster. At tilføje et nyt værktøj er ét enkelt objekt i det relevante modul.
- **Zod-validering på hvert felt** &mdash; Hvert skemafelt har `.describe()` til AI-agentkontekst. Ugyldige inputs fanges før udførelse med klare fejlmeddelelser.

---

## Del af MCP Security Suite

| Projekt | Domæne | Værktøjer |
|---|---|---|
| [hackbrowser-mcp](https://github.com/badchars/hackbrowser-mcp) | Browserbaseret sikkerhedstest | 39 værktøjer |
| [cloud-audit-mcp](https://github.com/badchars/cloud-audit-mcp) | Cloud-sikkerhed (AWS/Azure/GCP) | 38 værktøjer |
| [github-security-mcp](https://github.com/badchars/github-security-mcp) | GitHub sikkerhedsposition | 39 værktøjer |
| [cve-mcp](https://github.com/badchars/cve-mcp) | Sårbarhedsintelligens | 23 værktøjer |
| [osint-mcp-server](https://github.com/badchars/osint-mcp-server) | OSINT & rekognoscering | 37 værktøjer |
| [darknet-mcp-server](https://github.com/badchars/darknet-mcp-server) | Dark web & trusselsintelligens | 66 værktøjer |
| [dns-security-mcp](https://github.com/badchars/dns-security-mcp) | DNS-sikkerhedsintelligens | 103 værktøjer |
| **steganography-mcp** | **Steganografianalyse** | **128 værktøjer** |

---

## Bidrag

Bidrag er velkomne. Se [CONTRIBUTING.md](../../CONTRIBUTING.md) for retningslinjer.

---

<p align="center">
<b>Kun til autoriseret sikkerhedsforskning og uddannelsesformål.</b><br>
Sørg altid for at du har korrekt autorisation, før du udfører steganografianalyse på filer du ikke ejer.
</p>

<p align="center">
  <a href="../../LICENSE">MIT Licens</a> &bull; Bygget af <a href="https://orhanyildirim.us">Orhan Yildirim</a> &bull; <a href="mailto:contact@orhanyildirim.us">contact@orhanyildirim.us</a>
</p>
