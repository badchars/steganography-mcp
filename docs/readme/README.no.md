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
  <strong>Norsk</strong> |
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

<h3 align="center">Det mest omfattende verktøysettet for steganografianalyse for AI-agenter.</h3>

<p align="center">
  LSB-deteksjon, kji-kvadrat steganalyse, RS-analyse, DCT-forensikk, lydsteganografi, zero-width tekstkoding, filforensikk, polyglotdeteksjon, kodingsidentifikasjon &mdash; samlet i én MCP-server.<br>
  <b>60 verktøy. 7 kategorier. 4 avhengigheter. 100% offline.</b> Ingen API-nøkler påkrevd. Alle verktøy kjører lokalt.
</p>

<br>

<p align="center">
  <a href="#problemet">Problemet</a> &bull;
  <a href="#hva-gjør-det-annerledes">Hva gjør det annerledes</a> &bull;
  <a href="#hurtigstart">Hurtigstart</a> &bull;
  <a href="#hva-ai-agenten-kan-gjøre">Hva AI-agenten kan gjøre</a> &bull;
  <a href="#verktøyreferanse-60-verktøy">Verktøy (60)</a> &bull;
  <a href="#cli-bruk">CLI-bruk</a> &bull;
  <a href="#arkitektur">Arkitektur</a> &bull;
  <a href="../../CONTRIBUTING.md">Bidra</a>
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

## Problemet

Steganografi er kunsten å skjule data i det åpenbare &mdash; inne i bilder, lydfiler, dokumenter og til og med Unicode-tekst. Det brukes i CTF-konkurranser, digitale etterforskninger, skjulte kommunikasjonskanaler og skadevare-payloads. Å oppdage det krever en kombinasjon av statistisk analyse, formatspesifikk parsing, entropimåling og domeneekspertise.

```
Tradisjonell steganografianalyse-arbeidsflyt:
  detekter bildestego           ->  zsteg + stegsolve (2 verktøy, Ruby + Java)
  kji-kvadrat analyse           ->  egendefinert Python-skript
  RS-analyse                    ->  egendefinert MATLAB/Python-kode
  JPEG DCT-forensikk            ->  stegdetect (forlatt C-verktøy fra 2004)
  trekk ut LSB-data             ->  zsteg + steghide + openstego (3 verktøy)
  lydsteganografi               ->  Audacity manuelt + egendefinerte skript
  zero-width tekstdeteksjon     ->  nettbaserte verktøy + manuell inspeksjon
  filforensikk / binwalk        ->  binwalk + foremost + xxd (3 verktøy)
  EXIF-metadata                 ->  exiftool (Perl-avhengighet)
  kodingsdeteksjon              ->  CyberChef web UI + manuell gjetting
  ─────────────────────────────────
  Totalt: 10+ verktøy, 5+ språk, timer med manuell korrelasjon
```

**steganography-mcp** gir AI-agenten din 60 verktøy på tvers av 7 kategorier via [Model Context Protocol](https://modelcontextprotocol.io). Agenten utfører bildesteganalyse, JPEG-forensikk, lydanalyse, tekststeganografideteksjon, filforensikk, dokumentanalyse og kodingsidentifikasjon &mdash; alt i én samtale, alt kjørende 100% lokalt uten avhengigheter til eksterne tjenester.

```
Med steganography-mcp:
  Du: "Analyser dette CTF-utfordringsbildet for skjulte data"

  Agent: -> img_detect: Kji-kvadrat p=0,0001 (LSB-innstøping detektert),
            RS-analyse estimerer 42% innstøpingsrate, entropianomali
            i nedre høyre kvadrant
         -> img_lsb_extract: Trukket ut 847 bytes fra RGB LSB-er
         -> crypto_detect: Uttrukne data er Base64-kodet
         -> crypto_decode: Dekodet til "FLAG{hidden_in_plain_sight_2024}"
         -> img_known_tools: Signaturtreff for OpenStego

         "Bildet inneholder LSB-steganografi innstøpt med OpenStego.
          Kji-kvadrat-testen bekrefter LSB-erstatning i alle tre RGB-
          kanaler med 42% innstøpingsrate. Den skjulte payloaden er
          Base64-kodet og dekodes til flagget:
          FLAG{hidden_in_plain_sight_2024}"
```

---

## Hva gjør det annerledes

De fleste steganografiverktøy er enkeltformålsverktøy. steganography-mcp gir AI-agenten din muligheten til å **resonnere på tvers av alle steganografiteknikker samtidig**.

<table>
<thead>
<tr>
<th></th>
<th>Tradisjonell tilnærming</th>
<th>steganography-mcp</th>
</tr>
</thead>
<tbody>
<tr>
<td><b>Grensesnitt</b></td>
<td>10+ CLI-verktøy, 5+ språk, web-UIer</td>
<td>MCP &mdash; AI-agenten kaller verktøy i samtaleformat</td>
</tr>
<tr>
<td><b>Dekning</b></td>
<td>Én teknikk om gangen</td>
<td>7 kategorier, 60 verktøy parallelt</td>
</tr>
<tr>
<td><b>Bildeanalyse</b></td>
<td>zsteg (Ruby), stegsolve (Java), egendefinerte skript</td>
<td>Agenten kjører kji-kvadrat, RS-analyse, SPA, entropikart, histogram, bitplan-utvinning, metadata og verktøysignaturdeteksjon &mdash; alt på én gang</td>
</tr>
<tr>
<td><b>JPEG-forensikk</b></td>
<td>stegdetect (forlatt), manuell DCT-inspeksjon</td>
<td>Agenten analyserer DCT-histogram, dobbel kompresjon, kvantiseringstabeller, EXIF-dybdeanalyse, miniatyrbildesammenligning, kommentarfelt</td>
</tr>
<tr>
<td><b>Lydstego</b></td>
<td>Audacity + manuelle LSB-skript</td>
<td>Agenten utfører LSB kji-kvadrat, spektrumanalyse, stilleseksjon LSB-sjekk, ekkoskjulingsdeteksjon, metadatautvinning</td>
</tr>
<tr>
<td><b>Tekststego</b></td>
<td>Nettbaserte verktøy, manuell inspeksjon</td>
<td>Agenten detekterer zero-width tegn, mellomromskoding, usynlig Unicode, homoglyfer, akrostikker &mdash; og kan innstøpe/trekke ut ZWC-meldinger</td>
</tr>
<tr>
<td><b>Avhengigheter</b></td>
<td>Ruby, Java, Perl, Python, C, webverktøy</td>
<td><code>npx -y steganography-mcp</code> &mdash; 4 avhengigheter, ren TypeScript</td>
</tr>
<tr>
<td><b>API-nøkler</b></td>
<td>Ikke relevant (men fragmentert verktøykjede)</td>
<td>Null. 100% offline, ingen eksterne kall</td>
</tr>
<tr>
<td><b>Output</b></td>
<td>Rå tekst, bilder, manuell korrelasjon</td>
<td>Strukturert JSON &mdash; AI korrelerer funn automatisk</td>
</tr>
</tbody>
</table>

---

## Hurtigstart

### Alternativ 1: npx (ingen installasjon)

```bash
npx -y steganography-mcp
```

Alle 60 verktøy fungerer umiddelbart. Ingen API-nøkler. Ingen konfigurasjon. 100% offline.

### Alternativ 2: bunx (raskere)

```bash
bunx steganography-mcp
```

### Alternativ 3: Klon

```bash
git clone https://github.com/badchars/steganography-mcp.git
cd steganography-mcp
bun install
```

### Koble til AI-agenten din

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

Legg til i `~/Library/Application Support/Claude/claude_desktop_config.json`:

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

Samme JSON-konfigurasjonsformat. Pek kommandoen til `npx -y steganography-mcp` eller din lokale installasjonsbane.

</details>

### Begynn å analysere

```
Du: "Sjekk dette bildet for skjulte data"
```

Det er alt. Agenten kjører kji-kvadrat analyse, RS-analyse, entropikartlegging, metadatautvinning, vedlagt datadeteksjon og verktøysignaturskanning &mdash; automatisk.

---

## Hva AI-agenten kan gjøre

### CTF-utfordringsløser

```
Du: "Løs denne CTF-steganografiutfordringen — bildet er challenge.png"

Agent: -> img_detect: Kji-kvadrat steganalyse detekterer LSB-innstøping
          (p=0,00012), RS-analyse estimerer 38% innstøpingsrate,
          entropianomali ved blokker (12,4)-(15,8)
       -> img_lsb_extract: Trukket ut 1 247 bytes fra RGB-kanal LSB-er
       -> crypto_detect: Data matcher Base64-mønster (konfidens: 0,95)
       -> crypto_decode: "Q1RGe3N0M2cwX21hc3Rlcn0=" -> "CTF{st3g0_master}"
       -> img_known_tools: OpenStego-signatur detektert i PNG-chunks

       "Fant flagget: CTF{st3g0_master}
        Bildet bruker LSB-steganografi innstøpt av OpenStego.
        Payloaden var Base64-kodet i RGB-ens minst signifikante
        bits med en 38% innstøpingsrate."
```

### Digital etterforskning

```
Du: "Analyser suspect.png og suspect.wav for skjult kommunikasjon"

Agent: -> img_detect: Ingen LSB-stego detektert, men vedlagte data funnet
          (12 847 bytes etter PNG IEND-markøren)
       -> file_identify: Vedlagte data begynner med ZIP-signatur (PK)
       -> img_metadata: PNG tEXt-chunk inneholder uvanlig nøkkel "comm"
          med Base64-verdi
       -> audio_detect: WAV-fil har LSB kji-kvadrat anomali (p=0,003)
       -> audio_silence: 3 stille seksjoner med aktive LSB-er detektert
       -> audio_lsb_extract: Trukket ut 2 048 bytes skjulte data

       "Begge filer inneholder skjulte data:
        1. suspect.png har et ZIP-arkiv vedlagt etter PNG EOF-
           markøren, pluss en Base64-kodet melding i metadata
        2. suspect.wav inneholder LSB-steganografi, spesifikt i
           stille seksjoner — en sterk indikator på bevisst skjuling.
        Anbefaler å trekke ut ZIP-en og analysere WAV-payloaden."
```

### Zero-width tekstdeteksjon

```
Du: "Denne e-posten ser normal ut, men kan ha skjult tekst"

Agent: -> text_detect: 847 zero-width tegn detektert mellom
          synlige tegn
       -> text_zwc_detect: ZWSP (342), ZWNJ (505) funnet ved 127
          posisjoner gjennom teksten
       -> text_zwc_extract: Binær dekoding gir "EXFIL-ROUTE-7"
       -> text_invisible_scan: 3 ytterligere usynlige Unicode-tegn
          (U+2060, U+FEFF) funnet i header-seksjonen

       "E-posten inneholder en skjult melding kodet med zero-width
        tegn: 'EXFIL-ROUTE-7'. 847 usynlige tegn er spredt
        utover hele den synlige teksten ved bruk av ZWSP/ZWNJ binær
        koding. I tillegg ble 3 Word Joiner- og BOM-tegn
        funnet i headeren — sannsynligvis metadataartefakter."
```

### JPEG forensisk analyse

```
Du: "Er dette JPEG-bildet autentisk, eller har det blitt manipulert?"

Agent: -> jpeg_structure: 14 markører parset, normal JFIF-struktur
       -> jpeg_double_compression: Dobbel kompresjon DETEKTERT —
          blokkartefaktscore 0,73, kvantiseringsanomaliforhold 0,81
       -> jpeg_quantization: Kvalitet ~75 (luminans), men residuale
          mønstre antyder original var kvalitet ~92
       -> jpeg_exif_deep: EXIF sier "iPhone 14 Pro" men Software-
          feltet sier "Adobe Photoshop 25.0"
       -> jpeg_thumbnail_compare: Miniatyrbildedimensjoner samsvarer IKKE
          med hovedbildet (miniatyrbilde: 4032x3024, hoved: 2048x1536)

       "Denne JPEG-en har blitt manipulert. Bevis:
        1. Dobbel kompresjon detektert — bildet ble dekodet og
           rekodet med lavere kvalitet (original ~92, nåværende ~75)
        2. EXIF hevder iPhone 14 Pro, men software-feltet avslører
           Photoshop-redigering
        3. Miniatyrbildet er fra den opprinnelige 4032x3024-opptaket,
           men hovedbildet ble endret til 2048x1536
        Alle tre funnene bekrefter uavhengig modifikasjon etter opptak."
```

---

## Verktøyreferanse (60 verktøy)

### Kategorioversikt

| Kategori | Verktøy | Beskrivelse |
|----------|---------|-------------|
| [Bildesteganalyse](#-bildesteganalyse-14) | 14 | LSB-deteksjon, kji-kvadrat, RS-analyse, entropikartlegging, bitplaner, histogram, metadata, verktøysignaturer |
| [JPEG-analyse](#-jpeg-analyse-7) | 7 | DCT-histogram, dobbel kompresjon, kvantiseringstabeller, dyp EXIF, miniatyrbildeforensikk, kommentaranalyse |
| [Lydsteganalyse](#-lydsteganalyse-7) | 7 | WAV LSB-deteksjon, spektrumanalyse, stilleseksjonsanalyse, ekkoskjulingsdeteksjon, metadatautvinning |
| [Tekst & Unicode](#-tekst--unicode-10) | 10 | Zero-width tegn, mellomromskoding, usynlig Unicode, homoglyfer, akrostikker, Unicode-analyse |
| [Filforensikk](#-filforensikk-10) | 10 | Magiske bytes, polyglotdeteksjon, innstøpte filer, vedlagte data, entropi, hex-dump, strenger, headere |
| [Dokumentanalyse](#-dokumentanalyse-5) | 5 | PDF skjult innhold, PDF-metadata, PDF-strømmer, HTML skjult innhold, XML-metadata |
| [Koding & Krypto](#-koding--krypto-7) | 7 | Kodingsdeteksjon, multiformatdekoder, frekvensanalyse, entropi, XOR brute-force, hash-ID, krypteringsmønstre |

---

<details open>
<summary><h3>Bildesteganalyse (14)</h3></summary>

| Verktøy | Beskrivelse |
|---------|-------------|
| `img_detect` | Autodetekter steganografi i et bilde. Kjører kji-kvadrat, RS-analyse, entropi, metadata, vedlagte data og verktøysignatursjekker. Returnerer en omfattende JSON-rapport |
| `img_lsb_detect` | Statistisk LSB-steganografideteksjon. Kjører kji-kvadrat og sample pair-analyse på hver fargekanal uavhengig |
| `img_lsb_extract` | Trekk ut skjulte data fra bilde-LSB-er. Henter bits fra spesifiserte kanaler og bitplan, forsøker UTF-8-dekoding og viser hex-dump |
| `img_lsb_embed` | Innstøp en melding i et bilde med LSB-steganografi. Leser en PNG-fil, innstøper meldingen i de minst signifikante bitene og skriver en ny PNG-fil |
| `img_bitplane` | Trekk ut og visualiser et spesifikt bitplan fra en bildekanal. Viser dimensjoner, prosentandel av 1-bits og en ASCII-art forhåndsvisning |
| `img_chi_square` | Kji-kvadrat steganalyseangrep på hver fargekanal uavhengig. Detekterer LSB-erstatning ved å teste om tilstøtende pikselverdier er utjevnet |
| `img_rs_analysis` | RS (Regular-Singular) steganalyse med Fridrich-Goljan-Du-metoden. Analyserer pikselgrupper for å estimere LSB-innstøpingsrate per kanal |
| `img_histogram` | Generer et pikselverdi-histogram med anomalideteksjon. Detekterer Pairs-of-Values (PoV) anomalier som indikerer LSB-steganografi |
| `img_entropy_map` | Blokkvis entropianalyse av et bilde. Deler bildet inn i blokker og beregner Shannon-entropi per blokk, flagger høyentropiregioner |
| `img_metadata` | Dyp metadatautvinning fra et bilde. For PNG: tekstchunks, chunkliste, IHDR-info. For JPEG: EXIF, kommentarer, kvantiseringstabeller, markørliste |
| `img_appended_data` | Detekter og trekk ut data vedlagt etter bildets EOF-markør. Sjekker for skjulte data etter PNG IEND, JPEG EOI eller BMP-filstørrelsesgrense |
| `img_compare` | Piksel-for-piksel sammenligning av to bilder. Rapporterer identiske/forskjellige pikseltall, maksdifferanse og hvilke kanaler som er berørt |
| `img_channel_analysis` | Per-kanal statistisk analyse for R, G, B og A-kanaler. Rapporterer gjennomsnitt, standardavvik, entropi, min, maks og antall unike verdier |
| `img_known_tools` | Skann bildefilbytes for kjente steganografiverktøysignaturer. Sjekker mot en database av mønstre fra OpenStego, Steghide, JSteg, F5 og andre |

</details>

<details>
<summary><h3>JPEG-analyse (7)</h3></summary>

| Verktøy | Beskrivelse |
|---------|-------------|
| `jpeg_structure` | Parse JPEG-markører/segmenter med offsets og størrelser. Viser intern struktur inkludert alle markører, posisjoner og segmentlengder |
| `jpeg_dct_histogram` | DCT-koeffisientfordelingsanalyse for steganografideteksjon. Analyserer Y-kanal pikselverdidistribusjon og SOS-entropidata for å detektere anomalier forårsaket av JSteg, F5 og OutGuess |
| `jpeg_double_compression` | Detekter dobbel JPEG-kompresjonsartefakter. Identifiserer karakteristiske blokkartefakter og kvantiseringstabelanomalier &mdash; en vanlig indikator på bildemanipulering eller stego-innstøping |
| `jpeg_quantization` | Kvantiseringstabellanalyse med kvalitetsestimering. Viser alle kvantiseringstabeller i 8x8 rutenettformat og estimerer JPEG-kvalitetsfaktoren |
| `jpeg_exif_deep` | Dyp EXIF-analyse inkludert GPS-koordinater, tidsstempler, programvareinfo, miniatyrbilder, produsennotater og alle IFD-oppføringer. Flagger forensisk interessante felt |
| `jpeg_thumbnail_compare` | Sammenlign EXIF-miniatyrbilde med hoved-JPEG-bildet. Dimensjons- eller innholdsavvik indikerer modifikasjon etter opptak &mdash; en vanlig forensisk artefakt |
| `jpeg_comment` | Trekk ut og analyser JPEG COM (kommentar) markører. Sjekker for skjulte datamønstre, uvanlig store kommentarer og høyentropiinnhold |

</details>

<details>
<summary><h3>Lydsteganalyse (7)</h3></summary>

| Verktøy | Beskrivelse |
|---------|-------------|
| `audio_detect` | Autodetekter lydsteganografi i en WAV-fil. Kjører LSB kji-kvadrat, entropianalyse, metadatainspeksjon og sjekker for vedlagte data |
| `audio_lsb_detect` | PCM-sample LSB statistisk analyse. Utfører kji-kvadrat test på LSB-er gruppert etter verdipar for å detektere LSB-erstatningssteganografi |
| `audio_lsb_extract` | Trekk ut LSB-data fra lydsampler. Leser den minst signifikante biten fra hver PCM-sample og forsøker å dekode skjulte data |
| `audio_spectrum` | Spektralanalyse for skjulte signaler i WAV-lyd. Analyserer sampleverdidistribusjon, nullkryssingsrate, RMS-energi per blokk og detekterer anomale stille seksjoner |
| `audio_metadata` | Trekk ut metadata fra en WAV-fil inkludert RIFF INFO-chunks, formatdetaljer og all chunkinformasjon |
| `audio_silence` | Analyser stille seksjoner i WAV-lyd for skjulte data. Finner nær-null sampleregioner og sjekker deres LSB-er &mdash; stille seksjoner med aktive LSB-er er en sterk stego-indikator |
| `audio_echo_detect` | Ekkoskjulingsdeteksjon via autokorrelasjonsanalyse. Beregner normalisert autokorrelasjon ved vanlige ekkoforsinkelser. Regelmessige ekkomønstre indikerer steganografisk ekkoskjuling |

</details>

<details>
<summary><h3>Tekst & Unicode (10)</h3></summary>

| Verktøy | Beskrivelse |
|---------|-------------|
| `text_detect` | Autodetekter tekststeganografi. Sjekker for zero-width tegn, mellomromskoding, usynlig Unicode, homoglyfer og uvanlige mønstre |
| `text_zwc_detect` | Detekter zero-width tegn (ZWSP, ZWNJ, ZWJ, BOM) i tekst. Rapporterer posisjoner, antall og potensiell kodet meldingslengde |
| `text_zwc_extract` | Dekod en zero-width tegnkodet melding. Trekker ut ZWC-tegn og dekoder binært: ZWSP=0, ZWNJ=1 (forsøker begge polariteter) |
| `text_zwc_embed` | Innstøp en hemmelig melding i dekktekst med zero-width tegn. Koder meldingen til binær og mapper bits til ZWSP(0)/ZWNJ(1) |
| `text_whitespace_detect` | Detekter mellomromskoding i tekst. Sjekker hver linje for etterfølgende mellomromsmønstre der mellomrom=0 og tab=1 kan kode binære data |
| `text_whitespace_extract` | Trekk ut en mellomromskodet melding fra tekst. Leser etterfølgende mellomrom fra hver linje og dekoder mellomrom=0/tab=1 binær koding |
| `text_invisible_scan` | Skann tekst for ALLE usynlige Unicode-tegn. Sjekker hvert tegn mot den komplette usynlige tegndatabasen og rapporterer posisjoner og navn |
| `text_homoglyph` | Detekter Unicode homoglyfsubstitusjoner i tekst. Identifiserer ikke-ASCII tegn som visuelt ligner ASCII-bokstaver (kyrillisk a vs. latinsk a, osv.) |
| `text_unicode_analysis` | Full Unicode-tegnfordelingsanalyse. Kategoriserer alle tegn etter skriptblokk, utfører entropianalyse og detekterer mistenkelig skriptblanding |
| `text_acrostic` | Detekter første-bokstav, første-ord, siste-bokstav, siste-ord eller n-te-tegn mønstre (akrostiske meldinger) skjult på tvers av tekstlinjer |

</details>

<details>
<summary><h3>Filforensikk (10)</h3></summary>

| Verktøy | Beskrivelse |
|---------|-------------|
| `file_identify` | Filtypeidentifikasjon via magiske bytes. Leser filheaderen og matcher mot en omfattende database av kjente filsignaturer. Sjekker for filetternavn-misforhold |
| `file_polyglot` | Detekter polyglotfiler som er gyldige som to eller flere formater samtidig. Sjekker for flere gyldige filsignaturer ved forskjellige offsets (PDF+ZIP, PNG+PDF, osv.) |
| `file_embedded` | Skann etter innstøpte filer i en binærfil, lignende binwalk. Søker etter kjente magiske bytesignaturer ved hvert offset for å oppdage skjulte eller vedlagte filer |
| `file_appended` | Detekter data vedlagt etter en fils formatspesifikke EOF-markør. Støtter PNG (IEND), JPEG (FFD9), BMP, ZIP (EOCD) og PDF (%%EOF) |
| `file_entropy` | Seksjonsvis entropianalyse. Beregner Shannon-entropi per blokk og samlet, flagger anomale høyentropisekvenser |
| `file_entropy_visual` | ASCII entropivisualisering av en fil. Rendrer et tekstbasert søylediagram som viser entropinivåer over filen for visuell anomalideteksjon |
| `file_strings` | Trekk ut utskriftbare og Unicode-strenger fra binære filer. Skanner etter sekvenser av utskriftbare tegn og rapporterer dem med filoffsets. Støtter ASCII, UTF-8, UTF-16 |
| `file_hex` | Hex-dump med ASCII sidepanelvisning. Tradisjonelt hex-editorformat med offsetadresser, hexbytes og utskriftbar ASCII-representasjon |
| `file_header` | Dyp header- og strukturanalyse for kjente formater. Parser PNG IHDR, JPEG SOF, BMP info-header, ZIP lokale filheadere og PDF versjon/metadata |
| `file_compare` | Binær diff mellom to filer. Byte-for-byte sammenligning som rapporterer forskjeller med offsets, prosentandel identiske og LSB-kun forskjeller for stego-analyse |

</details>

<details>
<summary><h3>Dokumentanalyse (5)</h3></summary>

| Verktøy | Beskrivelse |
|---------|-------------|
| `doc_pdf_hidden` | Skjult PDF-innholdsdeteksjon. Skanner for JavaScript, autohandlinger, OpenAction, skjulte merknader, usynlig tekst, innstøpte filer og annet skjult innhold |
| `doc_pdf_metadata` | PDF-metadatautvinning. Parser /Info-ordboken og XMP-metadatablokker for forensisk tilskrivning og dokumentproveniens-analyse |
| `doc_pdf_streams` | PDF-strømanalyse. Lokaliserer alle stream/endstream-blokker, forsøker zlib-dekompresjon og rapporterer størrelser og entropi for å finne skjulte data |
| `doc_html_hidden` | Skjult HTML-innholdsdeteksjon. Skanner for kommentarer, display:none elementer, data-* attributter, skjulte inputs, base64-innhold, nullstørrelses elementer og usynlig tekst |
| `doc_xml_metadata` | XML og Office-dokumentmetadatautvinning. Parser Dublin Core, Microsoft Office-egenskaper, prosesseringsinstruksjoner og andre metadatafelt |

</details>

<details>
<summary><h3>Koding & Krypto (7)</h3></summary>

| Verktøy | Beskrivelse |
|---------|-------------|
| `crypto_detect` | Autodetekter kodingstype av en inputstreng. Tester mot alle kjente mønstre (Base64, hex, binær, morse, URL-koding, HTML-entiteter, osv.) og returnerer treff sortert etter konfidens |
| `crypto_decode` | Multiformatdekoder som støtter Base64, hex, binær, desimal, oktal, URL-koding, ROT13, Base32, Morsekode og HTML-entiteter. Automodus detekterer koding først |
| `crypto_frequency` | Tegnfrekvensanalyse for kryptoanalyse. Teller tegnforekomster, sammenligner med standard engelsk frekvens (ETAOINSHRDLU) og beregner Index of Coincidence |
| `crypto_entropy` | Shannon entropi-beregning og klassifisering for strenger. Beregner tegn- og bytenivåentropi, klassifiserer i kategorier fra gjentatte data til kryptert/tilfeldig |
| `crypto_xor` | XOR-nøkkel brute-force for enkeltbyte og flerbyte nøkler. Prøver alle 256 enkeltbytenøkler og scorer etter sannsynlighet for engelsk tekst. Bruker IC for estimering av flerbyte nøkkellengde |
| `crypto_hash_id` | Hash-typeidentifikasjon. Matcher input mot kjente hashmønstre etter lengde og format (MD5, SHA-1, SHA-256, SHA-512, bcrypt, CRC32, NTLM, osv.) |
| `crypto_patterns` | Kjent krypterings- og kodningsmønsterdeteksjon. Analyserer tekst for Cæsar-kryptering, substitusjonskryptering, Vigenère, rail fence transposisjon, Atbash og reversert tekst |

</details>

---

## CLI-bruk

```bash
# Vis hjelp
npx -y steganography-mcp --help

# List alle 60 verktøy med beskrivelser
npx -y steganography-mcp --list

# Detekter steganografi i et bilde
npx -y steganography-mcp --tool img_detect '{"file_path":"challenge.png"}'

# Trekk ut skjult melding fra LSB-er
npx -y steganography-mcp --tool img_lsb_extract '{"file_path":"stego.png"}'

# Kji-kvadrat steganalyse
npx -y steganography-mcp --tool img_chi_square '{"file_path":"suspect.png"}'

# RS-analyse (Fridrich-Goljan-Du-metoden)
npx -y steganography-mcp --tool img_rs_analysis '{"file_path":"suspect.png"}'

# JPEG dobbel kompresjon deteksjon
npx -y steganography-mcp --tool jpeg_double_compression '{"file_path":"photo.jpg"}'

# Dyp EXIF-analyse
npx -y steganography-mcp --tool jpeg_exif_deep '{"file_path":"photo.jpg"}'

# Lydsteganografideteksjon
npx -y steganography-mcp --tool audio_detect '{"file_path":"message.wav"}'

# Detekter zero-width tegnkoding
npx -y steganography-mcp --tool text_zwc_detect '{"text":"mistenkelig tekst her"}'

# Innstøp en skjult melding med zero-width tegn
npx -y steganography-mcp --tool text_zwc_embed '{"text":"dekktekst","message":"hemmelighet"}'

# Identifiser filtype og detekter polygloter
npx -y steganography-mcp --tool file_polyglot '{"file_path":"suspicious.pdf"}'

# Skann etter innstøpte filer (binwalk-stil)
npx -y steganography-mcp --tool file_embedded '{"file_path":"mystery.bin"}'

# Entropivisualisering
npx -y steganography-mcp --tool file_entropy_visual '{"file_path":"data.bin"}'

# Autodetekter koding
npx -y steganography-mcp --tool crypto_detect '{"input":"aGVsbG8gd29ybGQ="}'

# XOR brute-force
npx -y steganography-mcp --tool crypto_xor '{"input":"4f5243484e"}'

# Detekter krypteringsmønstre
npx -y steganography-mcp --tool crypto_patterns '{"input":"Gur dhvpx oebja sbk"}'

# Med Bun (raskere oppstart)
bunx steganography-mcp --tool img_detect '{"file_path":"image.png"}'
```

---

## Bruksområder

### CTF-utfordringer
Løs steganografiutfordringer i capture-the-flag konkurranser. AI-agenten kan systematisk bruke alle deteksjonsteknikker &mdash; LSB-analyse, metadatainspeksjon, vedlagte data, kodingsdeteksjon og krypteringsidentifikasjon &mdash; for å finne skjulte flagg i bilder, lydfiler, dokumenter og tekst.

### Digital etterforskning
Detekter skjulte kommunikasjonskanaler i forensiske undersøkelser. Analyser mistenkelige filer for skjulte data med statistisk steganalyse (kji-kvadrat, RS-analyse), sjekk for data vedlagt etter EOF-markører, skann etter innstøpte filer og identifiser steganografiverktøysignaturer.

### Sikkerhetsforskning
Analyser steganografiverktøy og -teknikker. Sammenlign originale og stego-bilder piksel for piksel, studer DCT-koeffisientfordelinger i JPEG-stego, mål entropiendringer fra innstøping og reverse-engineer kodingsskjemaer.

### Utdanning
Lær hvordan steganografiteknikker fungerer. Innstøp og trekk ut LSB-meldinger, kod tekst med zero-width tegn, visualiser bitplaner og entropikart, analyser filstrukturer med hex-dumps og studer krypteringsmønstre med frekvensanalyse.

### Hendelsesrespons
Under hendelsesrespons kan du sjekke dokumenter og bilder for skjulte eksfiltrasjonskanaler. Skann PDF-er for skjult JavaScript og innstøpte filer, detekter zero-width tegnkoding i e-poster, identifiser polyglotfiler og analyser mistenkelige kodinger.

---

## Arkitektur

```
src/
  index.ts                    # CLI-inngangspunkt (--help, --list, --tool, stdio-server)
  protocol/
    mcp-server.ts             # MCP-serveroppsett (stdio transport)
    tools.ts                  # Verktøyregister — alle 60 verktøy samlet her
  types/
    index.ts                  # Delte typer (ToolDef, ToolContext, ToolResult)
  utils/
    binary.ts                 # Binær fillesing, hex-dump, formatdeteksjon
    stats.ts                  # Shannon-entropi, kji-kvadrat, bytefrekvens
    cache.ts                  # TTL-cache
    png-parser.ts             # Ren TS PNG-parser (IHDR, chunks, pikseldata)
    jpeg-parser.ts            # Ren TS JPEG-parser (markører, EXIF, kvantisering)
    wav-parser.ts             # Ren TS WAV-parser (RIFF-chunks, PCM-sampler)
    bmp-parser.ts             # Ren TS BMP-parser (header, pikseldata)
  image/                      # Bildesteganalyseverktøy (14)
  jpeg/                       # JPEG-analyseverktøy (7)
  audio/                      # Lydsteganalyseverktøy (7)
  text/                       # Tekst & Unicode-verktøy (10)
  file/                       # Filforensikkverktøy (10)
  document/                   # Dokumentanalyseverktøy (5)
  crypto/                     # Koding & Kryptoverktøy (7)
  data/
    encoding-patterns.ts      # Kodings-regexmønstre + dekodere
    magic-bytes.ts            # Filsignaturdatabase (100+ formater)
    stego-signatures.ts       # Kjente steganografiverktøysignaturer
    unicode-invisible.ts      # Usynlig Unicode-tegndatabase
```

**Designbeslutninger:**

- **4 avhengigheter, ingenting annet** &mdash; `@modelcontextprotocol/sdk` for MCP-protokollen, `zod` for inputvalidering, `pngjs` for PNG-pikseltilgang, `jpeg-js` for JPEG-dekoding. Ikke noe oppblåst avhengighetstre. Ingen native moduler. Ingen C-bindinger. Ingen Python. Ingen Java.
- **100% offline** &mdash; Alle verktøy kjører helt lokalt. Ingen HTTP-forespørsler. Ingen API-kall. Ingen telemetri. Ingen sky-avhengigheter. Filene dine forlater aldri maskinen din.
- **Ren TypeScript statistisk analyse** &mdash; Kji-kvadrat test, RS-analyse (Fridrich-Goljan-Du), Sample Pair Analysis, Shannon-entropi, Index of Coincidence og frekvensanalyse er alle implementert i ren TypeScript. Ingen eksterne matematikkbiblioteker.
- **Egendefinerte formatparsere** &mdash; PNG-chunks, JPEG-markører/EXIF/kvantiseringstabeller, WAV RIFF-chunks og BMP-headere parses med null eksterne avhengigheter via `utils/`-parserne. Dette muliggjør dyp formatspesifikk analyse som generelle biblioteker ikke kan tilby.
- **7 leverandører, 1 server** &mdash; Hver analysekategori er en uavhengig modul. AI-agenten velger hvilke verktøy som skal brukes basert på undersøkelseskonteksten.
- **Rent ToolDef-mønster** &mdash; Hvert verktøy følger det samme `{ name, description, schema, execute }`-mønsteret. Å legge til et nytt verktøy er ett enkelt objekt i den relevante modulen.
- **Zod-validering på hvert felt** &mdash; Hvert skjemafelt har `.describe()` for AI-agentkontekst. Ugyldige inputs fanges før utførelse med klare feilmeldinger.

---

## Del av MCP Security Suite

| Prosjekt | Domene | Verktøy |
|---|---|---|
| [hackbrowser-mcp](https://github.com/badchars/hackbrowser-mcp) | Nettleserbasert sikkerhetstesting | 39 verktøy |
| [cloud-audit-mcp](https://github.com/badchars/cloud-audit-mcp) | Sky-sikkerhet (AWS/Azure/GCP) | 38 verktøy |
| [github-security-mcp](https://github.com/badchars/github-security-mcp) | GitHub sikkerhetsposisjon | 39 verktøy |
| [cve-mcp](https://github.com/badchars/cve-mcp) | Sårbarhetsintelligens | 23 verktøy |
| [osint-mcp-server](https://github.com/badchars/osint-mcp-server) | OSINT & rekognosering | 37 verktøy |
| [darknet-mcp-server](https://github.com/badchars/darknet-mcp-server) | Dark web & trusselintelligens | 66 verktøy |
| [dns-security-mcp](https://github.com/badchars/dns-security-mcp) | DNS-sikkerhetsintelligens | 103 verktøy |
| **steganography-mcp** | **Steganografianalyse** | **60 verktøy** |

---

## Bidra

Bidrag er velkomne. Se [CONTRIBUTING.md](../../CONTRIBUTING.md) for retningslinjer.

---

<p align="center">
<b>Kun for autorisert sikkerhetsforskning og utdanningsformål.</b><br>
Sørg alltid for at du har riktig autorisasjon før du utfører steganografianalyse på filer du ikke eier.
</p>

<p align="center">
  <a href="../../LICENSE">MIT Lisens</a> &bull; Bygget av <a href="https://orhanyildirim.us">Orhan Yildirim</a> &bull; <a href="mailto:contact@orhanyildirim.us">contact@orhanyildirim.us</a>
</p>
