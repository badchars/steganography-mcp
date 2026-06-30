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
  <strong>Bosanski</strong> |
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

<h3 align="center">Najsveobuhvatniji alat za steganografsku analizu namijenjen AI agentima.</h3>

<p align="center">
  LSB detekcija, hi-kvadrat steganaliza, RS analiza, DCT forenzika, audio steganografija, kodiranje nultom sirinom teksta, forenzika datoteka, detekcija poliglota, identifikacija kodiranja, napredna JPEG analiza, video i GIF steganaliza, mrezna steganografija, MP3 analiza, spektar rasirenog spektra, BPCS analiza, steganografija arhiva, kreiranje i ugradnja, QR kod steganaliza &mdash; objedinjeno u jednom MCP serveru.<br>
  <b>128 alata. 17 kategorija. 4 zavisnosti. 100% offline.</b> Nula API kljuceva. Svaki alat radi lokalno.
</p>

<br>

<p align="center">
  <a href="#problem">Problem</a> &bull;
  <a href="#po-cemu-se-razlikuje">Po cemu se razlikuje</a> &bull;
  <a href="#brzi-pocetak">Brzi pocetak</a> &bull;
  <a href="#sta-ai-moze-uraditi">Sta AI moze uraditi</a> &bull;
  <a href="#referenca-alata-128-alata">Alati (128)</a> &bull;
  <a href="#koristenje-iz-komandne-linije">Komandna linija</a> &bull;
  <a href="#arhitektura">Arhitektura</a> &bull;
  <a href="../../CONTRIBUTING.md">Doprinos</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/steganography-mcp"><img src="https://img.shields.io/npm/v/steganography-mcp.svg" alt="npm verzija"></a>
  <a href="https://www.npmjs.com/package/steganography-mcp"><img src="https://img.shields.io/npm/dm/steganography-mcp" alt="npm preuzimanja"></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="Licenca MIT"></a>
  <img src="https://img.shields.io/badge/node-%3E%3D18-brightgreen" alt="Node >= 18">
  <img src="https://img.shields.io/badge/MCP-Compatible-blueviolet" alt="MCP kompatibilan">
  <img src="https://img.shields.io/badge/tools-128-cyan" alt="128 alata">
  <img src="https://img.shields.io/badge/API_keys-Zero-green" alt="Nula API kljuceva">
  <img src="https://img.shields.io/badge/TypeScript-strict-3178c6" alt="TypeScript strict">
  <a href="https://github.com/badchars/steganography-mcp"><img src="https://img.shields.io/github/stars/badchars/steganography-mcp" alt="GitHub zvjezdice"></a>
</p>

---

## Problem

Steganografija je vjestina skrivanja podataka na vidljivom mjestu &mdash; unutar slika, audio datoteka, dokumenata, pa cak i Unicode teksta. Koristi se u CTF takmicenjima, istragama digitalne forenzike, tajnim komunikacionim kanalima i malware payloadima. Njena detekcija zahtijeva kombinaciju statisticke analize, parsiranja specificnog za format, mjerenja entropije i strucnog znanja.

```
Tradicionalni tok rada steganografske analize:
  detekcija stego u slici       ->  zsteg + stegsolve (2 alata, Ruby + Java)
  hi-kvadrat analiza             ->  prilagodjena Python skripta
  RS analiza                     ->  prilagodjen MATLAB/Python kod
  JPEG DCT forenzika             ->  stegdetect (napusten C alat iz 2004.)
  ekstrakcija LSB podataka       ->  zsteg + steghide + openstego (3 alata)
  audio steganografija           ->  Audacity rucno + prilagodjene skripte
  detekcija nulte sirine teksta  ->  web alati + rucna inspekcija
  forenzika datoteka / binwalk   ->  binwalk + foremost + xxd (3 alata)
  EXIF metapodaci                ->  exiftool (Perl zavisnost)
  detekcija kodiranja            ->  CyberChef web UI + rucno pogadjanje
  ─────────────────────────────────
  Ukupno: 10+ alata, 5+ jezika, sati rucne korelacije
```

**steganography-mcp** daje vasem AI agentu 128 alata u 17 kategorija putem [Model Context Protocola](https://modelcontextprotocol.io). Agent izvodi steganalizu slika, JPEG forenziku, audio analizu, detekciju tekstualne steganografije, forenziku datoteka, analizu dokumenata, identifikaciju kodiranja, naprednu JPEG analizu, video i GIF steganalizu, mreznu steganografiju, MP3 analizu, analizu rasirenog spektra, BPCS analizu, steganografiju arhiva, kreiranje i ugradnju podataka i QR kod steganalizu &mdash; sve u jednom razgovoru, sve radi 100% lokalno bez ikakve zavisnosti od vanjskih servisa.

```
Sa steganography-mcp:
  Vi: "Analiziraj ovu CTF sliku za skrivene podatke"

  Agent: -> img_detect: Hi-kvadrat p=0.0001 (LSB ugradnja detektovana),
            RS analiza procjenjuje 42% stopu ugradnje, anomalija entropije
            u donjem desnom kvadrantu
         -> img_lsb_extract: Ekstraktovano 847 bajtova iz RGB LSB-ova
         -> crypto_detect: Ekstraktovani podaci su Base64-kodirani
         -> crypto_decode: Dekodirano u "FLAG{hidden_in_plain_sight_2024}"
         -> img_known_tools: Podudaranje potpisa za OpenStego

         "Slika sadrzi LSB steganografiju ugradjenu sa OpenStego.
          Hi-kvadrat test potvrdjuje LSB zamjenu u sva tri RGB
          kanala sa 42% stopom ugradnje. Skriveni payload je
          Base64-kodiran i dekodira se u zastavu:
          FLAG{hidden_in_plain_sight_2024}"
```

---

## Po cemu se razlikuje

Vecina steganografskih alata su jednonamjenski. steganography-mcp daje vasem AI agentu sposobnost da **razlaze sve steganografske tehnike istovremeno**.

<table>
<thead>
<tr>
<th></th>
<th>Tradicionalni pristup</th>
<th>steganography-mcp</th>
</tr>
</thead>
<tbody>
<tr>
<td><b>Interfejs</b></td>
<td>10+ CLI alata, 5+ jezika, web interfejsi</td>
<td>MCP &mdash; AI agent poziva alate konverzacijski</td>
</tr>
<tr>
<td><b>Pokrivenost</b></td>
<td>Jedna tehnika u isto vrijeme</td>
<td>17 kategorija, 128 alata paralelno</td>
</tr>
<tr>
<td><b>Analiza slika</b></td>
<td>zsteg (Ruby), stegsolve (Java), prilagodjene skripte</td>
<td>Agent pokrece hi-kvadrat, RS analizu, SPA, mapu entropije, histogram, ekstrakciju bit ravni, metapodatke i detekciju potpisa alata &mdash; sve odjednom</td>
</tr>
<tr>
<td><b>JPEG forenzika</b></td>
<td>stegdetect (napusten), rucna DCT inspekcija</td>
<td>Agent analizira DCT histogram, dvostruku kompresiju, tablice kvantizacije, duboku EXIF analizu, poredjenje minijatura, komentare</td>
</tr>
<tr>
<td><b>Audio stego</b></td>
<td>Audacity + rucne LSB skripte</td>
<td>Agent izvodi LSB hi-kvadrat, spektralnu analizu, provjeru LSB-a u tisim sekcijama, detekciju eho skrivanja, ekstrakciju metapodataka</td>
</tr>
<tr>
<td><b>Tekstualni stego</b></td>
<td>Web alati, rucna inspekcija</td>
<td>Agent detektuje znakove nulte sirine, kodiranje razmacima, nevidljivi Unicode, homoglife, akrostihove &mdash; i moze ugraditi/ekstraktovati ZWC poruke</td>
</tr>
<tr>
<td><b>Zavisnosti</b></td>
<td>Ruby, Java, Perl, Python, C, web alati</td>
<td><code>npx -y steganography-mcp</code> &mdash; 4 zavisnosti, cisti TypeScript</td>
</tr>
<tr>
<td><b>API kljucevi</b></td>
<td>N/A (ali fragmentiran lanac alata)</td>
<td>Nula. 100% offline, bez vanjskih poziva</td>
</tr>
<tr>
<td><b>Izlaz</b></td>
<td>Sirov tekst, slike, rucna korelacija</td>
<td>Strukturirani JSON &mdash; AI automatski korelira nalaze</td>
</tr>
</tbody>
</table>

---

## Brzi pocetak

### Opcija 1: npx (bez instalacije)

```bash
npx -y steganography-mcp
```

Svih 128 alata radi odmah. Bez API kljuceva. Bez konfiguracije. 100% offline.

### Opcija 2: bunx (brze)

```bash
bunx steganography-mcp
```

### Opcija 3: Kloniranje

```bash
git clone https://github.com/badchars/steganography-mcp.git
cd steganography-mcp
bun install
```

### Povezivanje sa AI agentom

<details open>
<summary><b>Claude Code</b></summary>

```bash
# Sa npx
claude mcp add steganography -- npx -y steganography-mcp

# Sa lokalnim klonom
claude mcp add steganography -- bun run /path/to/steganography-mcp/src/index.ts
```

</details>

<details>
<summary><b>Claude Desktop</b></summary>

Dodajte u `~/Library/Application Support/Claude/claude_desktop_config.json`:

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
<summary><b>Cursor / Windsurf / ostali MCP klijenti</b></summary>

Isti JSON konfiguracijski format. Usmjerite komandu na `npx -y steganography-mcp` ili putanju vase lokalne instalacije.

</details>

### Pocnite analizirati

```
Vi: "Provjeri ovu sliku za skrivene podatke"
```

To je sve. Agent pokrece hi-kvadrat analizu, RS analizu, mapiranje entropije, ekstrakciju metapodataka, detekciju dodatih podataka i skeniranje potpisa alata &mdash; automatski.

---

## Sta AI moze uraditi

### Rjesavac CTF izazova

```
Vi: "Rijesi ovaj CTF steganografski izazov — slika je na challenge.png"

Agent: -> img_detect: Hi-kvadrat steganaliza detektuje LSB ugradnju
          (p=0.00012), RS analiza procjenjuje 38% stopu ugradnje,
          anomalija entropije na blokovima (12,4)-(15,8)
       -> img_lsb_extract: Ekstraktovano 1.247 bajtova iz LSB-ova RGB kanala
       -> crypto_detect: Podaci odgovaraju Base64 obrascu (pouzdanost: 0.95)
       -> crypto_decode: "Q1RGe3N0M2cwX21hc3Rlcn0=" -> "CTF{st3g0_master}"
       -> img_known_tools: Detektovan potpis OpenStego u PNG chunkovima

       "Pronadjena zastava: CTF{st3g0_master}
        Slika koristi LSB steganografiju ugradjenu sa OpenStego.
        Payload je bio Base64-kodiran u najmanje znacajnim bitovima
        RGB kanala sa 38% stopom ugradnje."
```

### Istraga digitalne forenzike

```
Vi: "Analiziraj suspect.png i suspect.wav za tajnu komunikaciju"

Agent: -> img_detect: LSB stego nije detektovan, ali su pronadjeni dodati podaci
          (12.847 bajtova nakon PNG IEND markera)
       -> file_identify: Dodati podaci pocinju sa ZIP potpisom (PK)
       -> img_metadata: PNG tEXt chunk sadrzi neobican kljuc "comm"
          sa Base64 vrijednoscu
       -> audio_detect: WAV datoteka ima LSB hi-kvadrat anomaliju (p=0.003)
       -> audio_silence: 3 tihe sekcije sa aktivnim LSB-ovima detektovane
       -> audio_lsb_extract: Ekstraktovano 2.048 bajtova skrivenih podataka

       "Obje datoteke sadrze skrivene podatke:
        1. suspect.png ima ZIP arhivu dodatu nakon PNG EOF markera,
           plus Base64-kodiranu poruku u metapodacima
        2. suspect.wav sadrzi LSB steganografiju, posebno u tihim
           sekcijama — jak indikator namjernog skrivanja.
        Preporucuje se ekstrakcija ZIP-a i analiza WAV payloada."
```

### Detekcija teksta nulte sirine

```
Vi: "Ovaj email izgleda normalno ali mozda ima skriveni tekst"

Agent: -> text_detect: 847 znakova nulte sirine detektovano izmedju
          vidljivih znakova
       -> text_zwc_detect: ZWSP (342), ZWNJ (505) pronadjeno na 127
          pozicija kroz tekst
       -> text_zwc_extract: Binarno dekodiranje daje "EXFIL-ROUTE-7"
       -> text_invisible_scan: 3 dodatna nevidljiva Unicode znaka
          (U+2060, U+FEFF) pronadjena u zaglavlju

       "Email sadrzi skrivenu poruku kodiranu znakovima nulte sirine:
        'EXFIL-ROUTE-7'. 847 nevidljivih znakova je rasporedeno kroz
        vidljivi tekst koristeci ZWSP/ZWNJ binarno kodiranje. Dodatno,
        3 Word Joiner i BOM znaka su pronadjeni u zaglavlju —
        vjerovatno artefakti metapodataka."
```

### JPEG forenzicka analiza

```
Vi: "Da li je ova JPEG slika autenticna ili je mijenjana?"

Agent: -> jpeg_structure: 14 markera parsirano, normalna JFIF struktura
       -> jpeg_double_compression: Dvostruka kompresija DETEKTOVANA —
          skor artefakata blokova 0.73, omjer anomalije kvantizacije 0.81
       -> jpeg_quantization: Kvalitet ~75 (luminanca), ali rezidualni
          obrasci sugerisu da je original bio kvalitet ~92
       -> jpeg_exif_deep: EXIF kaze "iPhone 14 Pro" ali polje Software
          kaze "Adobe Photoshop 25.0"
       -> jpeg_thumbnail_compare: Dimenzije minijature se NE podudaraju
          sa glavnom slikom (minijatura: 4032x3024, glavna: 2048x1536)

       "Ovaj JPEG je mijenjan. Dokazi:
        1. Detektovana dvostruka kompresija — slika je dekodirana i
           ponovo kodirana manjim kvalitetom (original ~92, trenutni ~75)
        2. EXIF tvrdi iPhone 14 Pro ali polje softvera otkriva
           Photoshop uredjivanje
        3. Minijatura je iz originalnog snimka 4032x3024 ali je
           glavna slika promijenjena na 2048x1536
        Sva tri nalaza nezavisno potvrduju modifikaciju nakon snimanja."
```

---

## Referenca alata (128 alata)

### Pregled kategorija

| Kategorija | Alati | Opis |
|----------|-------|-------------|
| [Steganaliza slika](#-steganaliza-slika-14) | 14 | LSB detekcija, hi-kvadrat, RS analiza, mapiranje entropije, bit ravni, histogram, metapodaci, potpisi alata |
| [JPEG analiza](#-jpeg-analiza-7) | 7 | DCT histogram, dvostruka kompresija, tablice kvantizacije, duboki EXIF, forenzika minijatura, analiza komentara |
| [Audio steganaliza](#-audio-steganaliza-7) | 7 | WAV LSB detekcija, spektralna analiza, analiza tihih regija, eho skrivanje, ekstrakcija metapodataka |
| [Tekst i Unicode](#-tekst--unicode-10) | 10 | Znakovi nulte sirine, kodiranje razmacima, nevidljivi Unicode, homoglifi, akrostihovi, Unicode analiza |
| [Forenzika datoteka](#-forenzika-datoteka-10) | 10 | Magic bajtovi, detekcija poliglota, ugradjene datoteke, dodati podaci, entropija, hex dump, stringovi, zaglavlja |
| [Analiza dokumenata](#-analiza-dokumenata-5) | 5 | Skriveni PDF sadrzaj, PDF metapodaci, PDF streamovi, skriveni HTML sadrzaj, XML metapodaci |
| [Kodiranje i kripto](#-kodiranje--kripto-7) | 7 | Detekcija kodiranja, multi-format dekoder, frekvencijska analiza, entropija, XOR brute-force, identifikacija hasha, obrasci sifri |
| [Napredna JPEG analiza](#-napredna-jpeg-analiza-7) | 7 | F5, JSteg, OutGuess, PVD detekcija, klizni prozor hi-kvadrat, crop-rekalibracija steganaliza, kompatibilnost alata |
| [Video steganografija](#-video-steganografija-8) | 8 | AVI frame LSB, inter-frame analiza, poredjenje okvira, metapodaci, struktura, EOF podaci |
| [GIF steganografija](#-gif-steganografija-8) | 8 | Paleta LSB, LZW sub-blok entropija, komentarsko prosirenje, aplikacijsko prosirenje, analiza okvira |
| [Mrezna steganografija](#-mrezna-steganografija-8) | 8 | PCAP skriveni kanali, IP/TCP analiza zaglavlja, ICMP payloadi, DNS tuneliranje, HTTP zaglavlja, tajming |
| [MP3 steganografija](#-mp3-steganografija-7) | 7 | ID3 skriveni podaci, analiza okvira, manipulacija paddinga, analiza uzoraka, metapodaci, struktura |
| [Rasireni spektar](#-rasireni-spektar-5) | 5 | DFT spektar magnitude, autokorelacija, detekcija vodenog ziga, analiza razine suma, patchwork detekcija |
| [BPCS analiza](#-bpcs-analiza-5) | 5 | Segmentacija kompleksnosti bit-ravni, mapiranje kompleksnosti, analiza praga, ekstrakcija podataka, procjena kapaciteta |
| [Steganografija arhiva](#-steganografija-arhiva-7) | 7 | ZIP prazan prostor, dodatna polja, komentari, detekcija poliglota, analiza strukture, metapodaci |
| [Kreiranje i ugradnja](#-kreiranje-i-ugradnja-7) | 7 | EOF injekcija, injekcija metapodataka, kodiranje razmacima, nulta sifra, kreiranje poliglota, injekcija komentara, ugradnja u paletu |
| [QR kod steganografija](#-qr-kod-steganografija-6) | 6 | QR stego detekcija, analiza strukture, ECC kapacitet, analiza modula, ekstrakcija podataka, poredjenje |

---

<details open>
<summary><h3>Steganaliza slika (14)</h3></summary>

| Alat | Opis |
|------|-------------|
| `img_detect` | Automatska detekcija steganografije u slici. Pokrece hi-kvadrat, RS analizu, entropiju, metapodatke, dodate podatke i provjere potpisa alata. Vraca sveobuhvatan JSON izvjestaj |
| `img_lsb_detect` | Statisticka LSB steganografska detekcija. Pokrece hi-kvadrat i analizu parova uzoraka na svakom kanalu boja nezavisno |
| `img_lsb_extract` | Ekstrakcija skrivenih podataka iz LSB-ova slike. Ekstraktuje bitove iz navedenih kanala i bit ravni, pokusava UTF-8 dekodiranje i prikazuje hex dump |
| `img_lsb_embed` | Ugradnja poruke u sliku koristeci LSB steganografiju. Cita PNG datoteku, ugradjuje poruku u najmanje znacajne bitove i zapisuje novu PNG datoteku |
| `img_bitplane` | Ekstrakcija i vizualizacija odredjene bit ravni iz kanala slike. Prikazuje dimenzije, procenat 1-bitova i ASCII art pregled |
| `img_chi_square` | Hi-kvadrat steganaliticki napad na svaki kanal boja nezavisno. Detektuje LSB zamjenu testiranjem da li su parovi susjednih vrijednosti piksela izjednaceni |
| `img_rs_analysis` | RS (Regularni-Singularni) steganaliza koristeci Fridrich-Goljan-Du metod. Analizira grupe piksela za procjenu stope LSB ugradnje po kanalu |
| `img_histogram` | Generisanje histograma vrijednosti piksela sa detekcijom anomalija. Detektuje anomalije Parova-Vrijednosti (PoV) koje ukazuju na LSB steganografiju |
| `img_entropy_map` | Analiza entropije po blokovima slike. Dijeli sliku na blokove i racuna Shannon entropiju po bloku, oznacavajuci regije visoke entropije |
| `img_metadata` | Duboka ekstrakcija metapodataka iz slike. Za PNG: tekstualni chunkovi, lista chunkova, IHDR info. Za JPEG: EXIF, komentari, tablice kvantizacije, lista markera |
| `img_appended_data` | Detekcija i ekstrakcija podataka dodanih nakon EOF markera slike. Provjerava skrivene podatke nakon PNG IEND, JPEG EOI ili granice velicine BMP datoteke |
| `img_compare` | Poredjenje dva slike piksel po piksel. Izvjestava o identicnim/razlicitim pikselima, maksimalnoj razlici i koji kanali su pogodeni |
| `img_channel_analysis` | Statisticka analiza po kanalu za R, G, B i A kanale. Izvjestava o srednjoj vrijednosti, standardnoj devijaciji, entropiji, min, max i broju jedinstvenih vrijednosti |
| `img_known_tools` | Skeniranje bajtova slike za poznate potpise steganografskih alata. Provjerava bazu podataka obrazaca od OpenStego, Steghide, JSteg, F5 i drugih |

</details>

<details>
<summary><h3>JPEG analiza (7)</h3></summary>

| Alat | Opis |
|------|-------------|
| `jpeg_structure` | Parsiranje JPEG markera/segmenata sa offsetima i velicinama. Prikazuje internu strukturu ukljucujuci sve markere, pozicije i duzine segmenata |
| `jpeg_dct_histogram` | Analiza distribucije DCT koeficijenata za detekciju steganografije. Analizira distribuciju vrijednosti piksela Y-kanala i SOS entropijske podatke za detekciju anomalija uzrokovanih od JSteg, F5 i OutGuess |
| `jpeg_double_compression` | Detekcija artefakata dvostruke JPEG kompresije. Identificira karakteristicne artefakte blokova i anomalije tablica kvantizacije &mdash; cest indikator mijenjanja slike ili stego ugradnje |
| `jpeg_quantization` | Analiza tablica kvantizacije sa procjenom kvaliteta. Prikazuje sve tablice kvantizacije u 8x8 formatu mreze i procjenjuje JPEG faktor kvaliteta |
| `jpeg_exif_deep` | Duboka EXIF analiza ukljucujuci GPS koordinate, vremenske oznake, informacije o softveru, minijature, biljeske proizvodjaca i sve IFD unose. Oznacava forenzicki interesantna polja |
| `jpeg_thumbnail_compare` | Poredjenje EXIF minijature sa glavnom JPEG slikom. Nepodudaranje dimenzija ili sadrzaja ukazuje na modifikaciju nakon snimanja &mdash; cest forenzicki artefakt |
| `jpeg_comment` | Ekstrakcija i analiza JPEG COM (komentar) markera. Provjerava obrasce skrivenih podataka, neuobicajeno velike komentare i sadrzaj visoke entropije |

</details>

<details>
<summary><h3>Audio steganaliza (7)</h3></summary>

| Alat | Opis |
|------|-------------|
| `audio_detect` | Automatska detekcija audio steganografije u WAV datoteci. Pokrece LSB hi-kvadrat, analizu entropije, inspekciju metapodataka i provjeru dodatih podataka |
| `audio_lsb_detect` | Statisticka analiza LSB-ova PCM uzoraka. Izvodi hi-kvadrat test na LSB-ovima grupisanim po parovima vrijednosti za detekciju LSB zamjenske steganografije |
| `audio_lsb_extract` | Ekstrakcija LSB podataka iz audio uzoraka. Cita najmanje znacajan bit svakog PCM uzorka i pokusava dekodirati skrivene podatke |
| `audio_spectrum` | Spektralna analiza za skrivene signale u WAV audiju. Analizira distribuciju vrijednosti uzoraka, stopu prelaska nule, RMS energiju po bloku i detektuje anomalne tihe sekcije |
| `audio_metadata` | Ekstrakcija metapodataka iz WAV datoteke ukljucujuci RIFF INFO chunkove, detalje formata i sve informacije o chunkovima |
| `audio_silence` | Analiza tihih sekcija u WAV audiju za skrivene podatke. Pronalazi regije sa uzorcima blizu nule i provjerava njihove LSB-ove &mdash; tihe sekcije sa aktivnim LSB-ovima su jak stego indikator |
| `audio_echo_detect` | Detekcija eho skrivanja putem autokorelacijske analize. Racuna normaliziranu autokorelaciju na uobicajenim eho kasnjenjima. Regularni eho obrasci ukazuju na steganografsko eho skrivanje |

</details>

<details>
<summary><h3>Tekst & Unicode (10)</h3></summary>

| Alat | Opis |
|------|-------------|
| `text_detect` | Automatska detekcija tekstualne steganografije. Provjerava znakove nulte sirine, kodiranje razmacima, nevidljivi Unicode, homoglife i neobicne obrasce |
| `text_zwc_detect` | Detekcija znakova nulte sirine (ZWSP, ZWNJ, ZWJ, BOM) u tekstu. Izvjestava o pozicijama, brojcima i potencijalnoj duzini kodirane poruke |
| `text_zwc_extract` | Dekodiranje poruke kodirane znakovima nulte sirine. Ekstraktuje ZWC znakove i dekodira binarno: ZWSP=0, ZWNJ=1 (pokusava oba polariteta) |
| `text_zwc_embed` | Ugradnja tajne poruke u tekst pokrice koristeci znakove nulte sirine. Kodira poruku u binarno i mapira bitove na ZWSP(0)/ZWNJ(1) |
| `text_whitespace_detect` | Detekcija kodiranja razmacima u tekstu. Provjerava svaki red za obrasce zavrsnog razmaka gdje razmak=0 i tab=1 mogu kodirati binarne podatke |
| `text_whitespace_extract` | Ekstrakcija poruke kodirane razmacima iz teksta. Cita zavrsni razmak iz svakog reda i dekodira razmak=0/tab=1 binarno kodiranje |
| `text_invisible_scan` | Skeniranje teksta za SVE nevidljive Unicode znakove. Provjerava svaki znak prema kompletnoj bazi nevidljivih znakova i izvjestava o pozicijama i imenima |
| `text_homoglyph` | Detekcija Unicode homoglifskih supstitucija u tekstu. Identificira non-ASCII znakove koji vizuelno lice na ASCII slova (cirilicno a vs latinicno a, itd.) |
| `text_unicode_analysis` | Kompletna analiza distribucije Unicode znakova. Kategorizira sve znakove po skript bloku, vrsi analizu entropije i detektuje sumnjivo mijesanje skriptova |
| `text_acrostic` | Detekcija obrazaca prvog slova, prve rijeci, zadnjeg slova, zadnje rijeci ili n-tog znaka (akrostih poruka) skrivenih kroz redove teksta |

</details>

<details>
<summary><h3>Forenzika datoteka (10)</h3></summary>

| Alat | Opis |
|------|-------------|
| `file_identify` | Identifikacija tipa datoteke putem magic bajtova. Cita zaglavlje datoteke i poredji sa sveobuhvatnom bazom poznatih potpisa datoteka. Provjerava nepodudaranje ekstenzije |
| `file_polyglot` | Detekcija poliglot datoteka validnih kao dva ili vise formata istovremeno. Provjerava visestruke validne potpise datoteka na razlicitim offsetima (PDF+ZIP, PNG+PDF, itd.) |
| `file_embedded` | Skeniranje ugradjenih datoteka unutar binarnog fajla, slicno binwalku. Pretrazuje poznate magic bajt potpise na svakom offsetu za otkrivanje skrivenih ili dodanih datoteka |
| `file_appended` | Detekcija podataka dodanih nakon EOF markera specificnog za format. Podrzava PNG (IEND), JPEG (FFD9), BMP, ZIP (EOCD) i PDF (%%EOF) |
| `file_entropy` | Analiza entropije po sekcijama. Racuna Shannon entropiju po bloku i ukupnu, oznacavajuci anomalne sekcije visoke entropije |
| `file_entropy_visual` | ASCII vizualizacija entropije datoteke. Prikazuje tekstualni bar grafikon koji pokazuje nivoe entropije kroz datoteku za vizualnu detekciju anomalija |
| `file_strings` | Ekstrakcija printabilnih i Unicode stringova iz binarnih datoteka. Skenira tokove printabilnih znakova i izvjestava sa file offsetima. Podrzava ASCII, UTF-8, UTF-16 |
| `file_hex` | Hex dump sa ASCII bocnom trakom. Tradicionalni format hex editora sa adresama offseta, hex bajtovima i printabilnom ASCII reprezentacijom |
| `file_header` | Duboka analiza zaglavlja i strukture za poznate formate. Parsira PNG IHDR, JPEG SOF, BMP info zaglavlje, ZIP zaglavlja lokalnih datoteka i PDF verziju/metapodatke |
| `file_compare` | Binarni diff izmedju dvije datoteke. Poredjenje bajt po bajt sa izvjestavanjem razlika sa offsetima, procentom identicnosti i detekcijom razlika samo u LSB-ovima za stego analizu |

</details>

<details>
<summary><h3>Analiza dokumenata (5)</h3></summary>

| Alat | Opis |
|------|-------------|
| `doc_pdf_hidden` | Detekcija skrivenog PDF sadrzaja. Skenira JavaScript, auto-akcije, OpenAction, skrivene anotacije, nevidljivi tekst, ugradjene datoteke i drugi tajni sadrzaj |
| `doc_pdf_metadata` | Ekstrakcija PDF metapodataka. Parsira /Info rjecnik i XMP blokove metapodataka za forenzicku atribuciju i analizu porijekla dokumenta |
| `doc_pdf_streams` | Analiza PDF streamova. Locira sve stream/endstream blokove, pokusava zlib dekompresiju i izvjestava o velicinama i entropiji za pronalazenje skrivenih podataka |
| `doc_html_hidden` | Detekcija skrivenog HTML sadrzaja. Skenira komentare, display:none elemente, data-* atribute, skrivene inpute, base64 sadrzaj, elemente nulte velicine i nevidljivi tekst |
| `doc_xml_metadata` | Ekstrakcija XML i Office metapodataka iz dokumenata. Parsira Dublin Core, Microsoft Office svojstva, instrukcije za procesiranje i druga polja metapodataka |

</details>

<details>
<summary><h3>Kodiranje & kripto (7)</h3></summary>

| Alat | Opis |
|------|-------------|
| `crypto_detect` | Automatska detekcija tipa kodiranja ulaznog stringa. Testira protiv svih poznatih obrazaca (Base64, hex, binarno, morse, URL kodiranje, HTML entiteti, itd.) i vraca podudaranja sortirana po pouzdanosti |
| `crypto_decode` | Multi-format dekoder koji podrzava Base64, hex, binarno, decimalno, oktalno, URL kodiranje, ROT13, Base32, Morse kod i HTML entitete. Auto mod detektuje kodiranje prvi |
| `crypto_frequency` | Analiza frekvencije znakova za kriptoanalizu. Broji pojavljivanja znakova, poredi sa standardnom engleskom frekvencijom (ETAOINSHRDLU) i racuna Indeks Podudarnosti |
| `crypto_entropy` | Shannon entropijski proracun i klasifikacija za stringove. Racuna entropiju na nivou znakova i bajtova, klasifikujuci u kategorije od ponovljenih podataka do enkriptovanih/nasumicnih |
| `crypto_xor` | XOR brute-force za jednobajtne i visebajtne kljuceve. Pokusava svih 256 jednobajtnih kljuceva i boduje po vjerovatnosti engleskog teksta. Koristi IC za procjenu duzine visebajtnog kljuca |
| `crypto_hash_id` | Identifikacija tipa hasha. Poredji ulaz sa poznatim obrascima hashova po duzini i formatu (MD5, SHA-1, SHA-256, SHA-512, bcrypt, CRC32, NTLM, itd.) |
| `crypto_patterns` | Detekcija poznatih obrazaca sifri i kodiranja. Analizira tekst za Cezarovu sifru, supstitucijsku sifru, Vigenere, rail fence transpoziciju, Atbash i obrnuti tekst |

</details>

---

## Koristenje iz komandne linije

```bash
# Prikaz pomoci
npx -y steganography-mcp --help

# Lista svih 128 alata sa opisima
npx -y steganography-mcp --list

# Detekcija steganografije u slici
npx -y steganography-mcp --tool img_detect '{"file_path":"challenge.png"}'

# Ekstrakcija skrivene poruke iz LSB-ova
npx -y steganography-mcp --tool img_lsb_extract '{"file_path":"stego.png"}'

# Hi-kvadrat steganaliza
npx -y steganography-mcp --tool img_chi_square '{"file_path":"suspect.png"}'

# RS analiza (Fridrich-Goljan-Du metod)
npx -y steganography-mcp --tool img_rs_analysis '{"file_path":"suspect.png"}'

# JPEG detekcija dvostruke kompresije
npx -y steganography-mcp --tool jpeg_double_compression '{"file_path":"photo.jpg"}'

# Duboka EXIF analiza
npx -y steganography-mcp --tool jpeg_exif_deep '{"file_path":"photo.jpg"}'

# Detekcija audio steganografije
npx -y steganography-mcp --tool audio_detect '{"file_path":"message.wav"}'

# Detekcija kodiranja znakovima nulte sirine
npx -y steganography-mcp --tool text_zwc_detect '{"text":"sumnjivi tekst ovdje"}'

# Ugradnja skrivene poruke sa znakovima nulte sirine
npx -y steganography-mcp --tool text_zwc_embed '{"text":"tekst pokrice","message":"tajna"}'

# Identifikacija tipa datoteke i detekcija poliglota
npx -y steganography-mcp --tool file_polyglot '{"file_path":"sumnjiv.pdf"}'

# Skeniranje ugradjenih datoteka (binwalk-stil)
npx -y steganography-mcp --tool file_embedded '{"file_path":"misterija.bin"}'

# Vizualizacija entropije
npx -y steganography-mcp --tool file_entropy_visual '{"file_path":"podaci.bin"}'

# Automatska detekcija kodiranja
npx -y steganography-mcp --tool crypto_detect '{"input":"aGVsbG8gd29ybGQ="}'

# XOR brute-force
npx -y steganography-mcp --tool crypto_xor '{"input":"4f5243484e"}'

# Detekcija obrazaca sifri
npx -y steganography-mcp --tool crypto_patterns '{"input":"Gur dhvpx oebja sbk"}'

# Koristenje Buna (brze pokretanje)
bunx steganography-mcp --tool img_detect '{"file_path":"image.png"}'
```

---

## Primjeri koristenja

### CTF izazovi
Rijesavajte steganografske izazove u takmicenjima za hvatanje zastave. AI agent moze sistematski primijeniti sve tehnike detekcije &mdash; LSB analizu, inspekciju metapodataka, dodate podatke, detekciju kodiranja i identifikaciju sifri &mdash; za pronalazenje skrivenih zastava u slikama, audio datotekama, dokumentima i tekstu.

### Digitalna forenzika
Detektujte tajne komunikacione kanale u forenzickim istragama. Analizirajte sumnjive datoteke za skrivene podatke koristeci statisticku steganalizu (hi-kvadrat, RS analiza), provjerite podatke dodate nakon EOF markera, skenirajte ugradjene datoteke i identificirajte potpise steganografskih alata.

### Sigurnosno istrazivanje
Analizirajte steganografske alate i tehnike. Uporedite originalne i stego slike piksel po piksel, proucavajte distribucije DCT koeficijenata u JPEG stegu, mjerite promjene entropije od ugradnje i reverzni inzenjering sema kodiranja.

### Edukacija
Naucite kako steganografske tehnike funkcionisu. Ugradjujte i ekstraktujte LSB poruke, kodirajte tekst sa znakovima nulte sirine, vizualizirajte bit ravni i mape entropije, analizirajte strukture datoteka sa hex dumpovima i proucavajte obrasce sifri sa frekvencijskom analizom.

### Odgovor na incidente
Tokom odgovora na incidente, provjerite dokumente i slike za skrivene kanale eksfiltracije. Skenirajte PDF-ove za skriveni JavaScript i ugradjene datoteke, detektujte kodiranje nulte sirine u emailovima, identificirajte poliglot datoteke i analizirajte sumnjiva kodiranja.

---

## Arhitektura

```
src/
  index.ts                    # CLI ulazna tacka (--help, --list, --tool, stdio server)
  protocol/
    mcp-server.ts             # Postavka MCP servera (stdio transport)
    tools.ts                  # Registar alata — svih 128 alata okupljeno ovdje
  types/
    index.ts                  # Dijeljeni tipovi (ToolDef, ToolContext, ToolResult)
  utils/
    binary.ts                 # Citanje binarnih datoteka, hex dump, detekcija formata
    stats.ts                  # Shannon entropija, hi-kvadrat, frekvencija bajtova
    cache.ts                  # TTL kes
    png-parser.ts             # Cisti TS PNG parser (IHDR, chunkovi, podaci piksela)
    jpeg-parser.ts            # Cisti TS JPEG parser (markeri, EXIF, kvantizacija)
    wav-parser.ts             # Cisti TS WAV parser (RIFF chunkovi, PCM uzorci)
    bmp-parser.ts             # Cisti TS BMP parser (zaglavlje, podaci piksela)
    avi-parser.ts             # Cisti TS AVI parser (okviri, zaglavlja)
    gif-parser.ts             # Cisti TS GIF parser (paleta, okviri, prosirenja)
    pcap-parser.ts            # Cisti TS PCAP parser (paketi, zaglavlja)
    mp3-parser.ts             # Cisti TS MP3 parser (okviri, ID3 tagovi)
    zip-parser.ts             # Cisti TS ZIP parser (zaglavlja, unosi)
  image/                      # Alati za steganalizu slika (14)
  jpeg/                       # Alati za JPEG analizu (7)
  audio/                      # Alati za audio steganalizu (7)
  text/                       # Alati za tekst i Unicode (10)
  file/                       # Alati za forenziku datoteka (10)
  document/                   # Alati za analizu dokumenata (5)
  crypto/                     # Alati za kodiranje i kripto (7)
  jpegadv/                    # Alati za naprednu JPEG analizu (7)
  video/                      # Alati za video steganografiju (8)
  gif/                        # Alati za GIF steganografiju (8)
  network/                    # Alati za mreznu steganografiju (8)
  mp3/                        # Alati za MP3 steganografiju (7)
  spread/                     # Alati za rasireni spektar (5)
  bpcs/                       # Alati za BPCS analizu (5)
  archive/                    # Alati za steganografiju arhiva (7)
  create/                     # Alati za kreiranje i ugradnju (7)
  qrcode/                     # Alati za QR kod steganografiju (6)
  data/
    encoding-patterns.ts      # Obrasci kodiranja regex + dekoderi
    magic-bytes.ts            # Baza potpisa datoteka (100+ formata)
    stego-signatures.ts       # Poznati potpisi steganografskih alata
    unicode-invisible.ts      # Baza nevidljivih Unicode znakova
```

**Dizajnerske odluke:**

- **4 zavisnosti, nista vise** &mdash; `@modelcontextprotocol/sdk` za MCP protokol, `zod` za validaciju ulaza, `pngjs` za pristup PNG pikselima, `jpeg-js` za JPEG dekodiranje. Nema napuhanog stabla zavisnosti. Nema nativnih modula. Nema C bindinga. Nema Pythona. Nema Jave.
- **100% offline** &mdash; Svaki alat radi potpuno lokalno. Bez HTTP zahtjeva. Bez API poziva. Bez telemetrije. Bez cloud zavisnosti. Vasi fajlovi nikada ne napustaju vasu masinu.
- **Cista TypeScript statisticka analiza** &mdash; Hi-kvadrat test, RS analiza (Fridrich-Goljan-Du), Analiza parova uzoraka, Shannon entropija, Indeks podudarnosti i frekvencijska analiza su sve implementirani u cistom TypeScriptu. Bez vanjskih matematickih biblioteka.
- **Prilagodjeni parseri formata** &mdash; PNG chunkovi, JPEG markeri/EXIF/tablice kvantizacije, WAV RIFF chunkovi i BMP zaglavlja se parsiraju sa nula vanjskih zavisnosti koristeci `utils/` parsere. Ovo omogucava duboku analizu specificnu za format koju biblioteke opste namjene ne mogu pruziti.
- **17 provajdera, 1 server** &mdash; Svaka kategorija analize je nezavisan modul. AI agent bira koje alate koristi na osnovu konteksta istrage.
- **Cist ToolDef obrazac** &mdash; Svaki alat prati isti `{ name, description, schema, execute }` obrazac. Dodavanje novog alata je jedan objekat u odgovarajucem modulu.
- **Zod validacija na svakom polju** &mdash; Svako polje seme ima `.describe()` za kontekst AI agenta. Nevazeci unosi se hvataju prije izvrsavanja sa jasnim porukama o greskama.

---

## Dio MCP Security Suite

| Projekat | Domena | Alati |
|---|---|---|
| [hackbrowser-mcp](https://github.com/badchars/hackbrowser-mcp) | Sigurnosno testiranje bazirano na pregledniku | 39 alata |
| [cloud-audit-mcp](https://github.com/badchars/cloud-audit-mcp) | Cloud sigurnost (AWS/Azure/GCP) | 38 alata |
| [github-security-mcp](https://github.com/badchars/github-security-mcp) | GitHub sigurnosna postura | 39 alata |
| [cve-mcp](https://github.com/badchars/cve-mcp) | Obavjestajne informacije o ranjivostima | 23 alata |
| [osint-mcp-server](https://github.com/badchars/osint-mcp-server) | OSINT i izvidjanje | 37 alata |
| [darknet-mcp-server](https://github.com/badchars/darknet-mcp-server) | Tamni web i obavjestajne informacije o prijetnjama | 66 alata |
| [dns-security-mcp](https://github.com/badchars/dns-security-mcp) | DNS sigurnosna inteligencija | 103 alata |
| **steganography-mcp** | **Steganografska analiza** | **128 alata** |

---

## Doprinos

Doprinosi su dobrodosli. Pogledajte [CONTRIBUTING.md](../../CONTRIBUTING.md) za smjernice.

---

<p align="center">
<b>Samo za ovlastena sigurnosna istrazivanja i obrazovne svrhe.</b><br>
Uvijek se uvjerite da imate odgovarajuce ovlastenje prije izvrsavanja steganografske analize na datotekama koje ne posjedujete.
</p>

<p align="center">
  <a href="../../LICENSE">MIT licenca</a> &bull; Napravio <a href="https://orhanyildirim.us">Orhan Yildirim</a> &bull; <a href="mailto:contact@orhanyildirim.us">contact@orhanyildirim.us</a>
</p>
