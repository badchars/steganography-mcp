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
  <strong>Polski</strong> |
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

<h3 align="center">Najbardziej wszechstronny zestaw narzedzi do analizy steganografii dla agentow AI.</h3>

<p align="center">
  Detekcja LSB, steganaliza chi-kwadrat, analiza RS, forensyka DCT, steganografia audio, kodowanie zero-width w tekscie, forensyka plikow, detekcja poliglotow, identyfikacja kodowania, steganografia wideo, analiza GIF, steganografia sieciowa, analiza MP3, spread spectrum, BPCS, steganografia archiwow, steganografia kodow QR &mdash; wszystko w jednym serwerze MCP.<br>
  <b>128 narzedzi. 17 kategorii. 4 zaleznosci. 100% offline.</b> Zero kluczy API. Kazde narzedzie dziala lokalnie.
</p>

<br>

<p align="center">
  <a href="#problem">Problem</a> &bull;
  <a href="#czym-sie-rozni">Czym sie rozni</a> &bull;
  <a href="#szybki-start">Szybki start</a> &bull;
  <a href="#co-potrafi-agent-ai">Co potrafi agent AI</a> &bull;
  <a href="#dokumentacja-narzedzi-128-narzedzi">Narzedzia (128)</a> &bull;
  <a href="#uzycie-cli">Uzycie CLI</a> &bull;
  <a href="#architektura">Architektura</a> &bull;
  <a href="../../CONTRIBUTING.md">Wspoltworz</a>
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

## Problem

Steganografia to sztuka ukrywania danych na widoku &mdash; wewnatrz obrazow, plikow audio, dokumentow, a nawet tekstu Unicode. Jest wykorzystywana w zawodach CTF, sledztwach cyfrowych, ukrytych kanalach komunikacji i payloadach malware. Jej wykrycie wymaga polaczenia analizy statystycznej, parsowania specyficznego dla formatu, pomiaru entropii i wiedzy domenowej.

```
Tradycyjny przeplyw pracy analizy steganografii:
  detekcja stego w obrazie      ->  zsteg + stegsolve (2 narzedzia, Ruby + Java)
  analiza chi-kwadrat           ->  niestandardowy skrypt Python
  analiza RS                    ->  niestandardowy kod MATLAB/Python
  forensyka JPEG DCT            ->  stegdetect (porzucone narzedzie C z 2004)
  ekstrakcja danych LSB         ->  zsteg + steghide + openstego (3 narzedzia)
  steganografia audio           ->  Audacity recznie + niestandardowe skrypty
  detekcja zero-width w tekscie ->  narzedzia webowe + reczna inspekcja
  forensyka plikow / binwalk    ->  binwalk + foremost + xxd (3 narzedzia)
  metadane EXIF                 ->  exiftool (zaleznosc Perl)
  detekcja kodowania            ->  CyberChef web UI + reczne zgadywanie
  ─────────────────────────────────
  Razem: 10+ narzedzi, 5+ jezykow, godziny recznej korelacji
```

**steganography-mcp** daje Twojemu agentowi AI 128 narzedzi w 17 kategoriach poprzez [Model Context Protocol](https://modelcontextprotocol.io). Agent przeprowadza steganalze obrazow, forensyke JPEG, zaawansowana detekcje JPEG, analize audio, detekcje steganografii tekstowej, forensyke plikow, analize dokumentow, identyfikacje kodowania, steganografie wideo, analize GIF, steganografie sieciowa, analize MP3, detekcje spread spectrum, analize BPCS, steganografie archiwow, tworzenie i osadzanie oraz steganografie kodow QR &mdash; wszystko w jednej rozmowie, wszystko dzialajace 100% lokalnie bez zaleznosci od uslug zewnetrznych.

```
Z steganography-mcp:
  Ty: "Przeanalizuj ten obraz z wyzwania CTF pod katem ukrytych danych"

  Agent: -> img_detect: Chi-kwadrat p=0,0001 (wykryto osadzenie LSB),
            analiza RS szacuje 42% stopien osadzenia, anomalia entropii
            w dolnym prawym kwadrancie
         -> img_lsb_extract: Wyodrebniono 847 bajtow z LSB RGB
         -> crypto_detect: Wyodrebnione dane sa zakodowane w Base64
         -> crypto_decode: Zdekodowano na "FLAG{hidden_in_plain_sight_2024}"
         -> img_known_tools: Dopasowanie sygnatury dla OpenStego

         "Obraz zawiera steganografie LSB osadzona za pomoca OpenStego.
          Test chi-kwadrat potwierdza zastepowanie LSB we wszystkich
          trzech kanalach RGB ze stopniem osadzenia 42%. Ukryty
          payload jest zakodowany w Base64 i dekoduje sie do flagi:
          FLAG{hidden_in_plain_sight_2024}"
```

---

## Czym sie rozni

Wiekszsc narzedzi steganograficznych to narzeadzia jednofunkcyjne. steganography-mcp daje Twojemu agentowi AI mozliwosc **rozumowania na temat wszystkich technik steganograficznych jednoczesnie**.

<table>
<thead>
<tr>
<th></th>
<th>Tradycyjne podejscie</th>
<th>steganography-mcp</th>
</tr>
</thead>
<tbody>
<tr>
<td><b>Interfejs</b></td>
<td>10+ narzedzi CLI, 5+ jezykow, interfejsy webowe</td>
<td>MCP &mdash; agent AI wywoluje narzedzia konwersacyjnie</td>
</tr>
<tr>
<td><b>Pokrycie</b></td>
<td>Jedna technika na raz</td>
<td>17 kategorii, 128 narzedzi rownolegle</td>
</tr>
<tr>
<td><b>Analiza obrazu</b></td>
<td>zsteg (Ruby), stegsolve (Java), niestandardowe skrypty</td>
<td>Agent uruchamia chi-kwadrat, analize RS, SPA, mape entropii, histogram, ekstrakcje plaszczyzn bitowych, metadane i detekcje sygnatur narzedzi &mdash; wszystko naraz</td>
</tr>
<tr>
<td><b>Forensyka JPEG</b></td>
<td>stegdetect (porzucony), reczna inspekcja DCT</td>
<td>Agent analizuje histogram DCT, podwojna kompresje, tabele kwantyzacji, gleobka analize EXIF, porownanie miniatur, pola komentarzy</td>
</tr>
<tr>
<td><b>Stego audio</b></td>
<td>Audacity + reczne skrypty LSB</td>
<td>Agent wykonuje LSB chi-kwadrat, analize widma, sprawdzanie LSB w cichych sekcjach, detekcje ukrywania echa, ekstrakcje metadanych</td>
</tr>
<tr>
<td><b>Stego tekstu</b></td>
<td>Narzedzia webowe, reczna inspekcja</td>
<td>Agent wykrywa znaki zero-width, kodowanie bialych znakow, niewidzialny Unicode, homoglify, akrostych &mdash; i moze osadzac/wyodrebniac wiadomosci ZWC</td>
</tr>
<tr>
<td><b>Zaleznosci</b></td>
<td>Ruby, Java, Perl, Python, C, narzedzia webowe</td>
<td><code>npx -y steganography-mcp</code> &mdash; 4 zaleznosci, czysty TypeScript</td>
</tr>
<tr>
<td><b>Klucze API</b></td>
<td>Nie dotyczy (ale pofragmentowany lancuch narzedzi)</td>
<td>Zero. 100% offline, brak zewnetrznych wywolan</td>
</tr>
<tr>
<td><b>Wyjscie</b></td>
<td>Surowy tekst, obrazy, reczna korelacja</td>
<td>Strukturalny JSON &mdash; AI koreluje wyniki automatycznie</td>
</tr>
</tbody>
</table>

---

## Szybki start

### Opcja 1: npx (bez instalacji)

```bash
npx -y steganography-mcp
```

Wszystkie 128 narzedzi dziala natychmiast. Bez kluczy API. Bez konfiguracji. 100% offline.

### Opcja 2: bunx (szybciej)

```bash
bunx steganography-mcp
```

### Opcja 3: Klonowanie

```bash
git clone https://github.com/badchars/steganography-mcp.git
cd steganography-mcp
bun install
```

### Polacz ze swoim agentem AI

<details open>
<summary><b>Claude Code</b></summary>

```bash
# Z npx
claude mcp add steganography -- npx -y steganography-mcp

# Z lokalnym klonem
claude mcp add steganography -- bun run /sciezka/do/steganography-mcp/src/index.ts
```

</details>

<details>
<summary><b>Claude Desktop</b></summary>

Dodaj do `~/Library/Application Support/Claude/claude_desktop_config.json`:

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
<summary><b>Cursor / Windsurf / inne klienty MCP</b></summary>

Ten sam format konfiguracji JSON. Wskazuj komende na `npx -y steganography-mcp` lub sciezke lokalnej instalacji.

</details>

### Zacznij analizowac

```
Ty: "Sprawdz ten obraz pod katem ukrytych danych"
```

To wszystko. Agent uruchamia analize chi-kwadrat, analize RS, mapowanie entropii, ekstrakcje metadanych, detekcje dolaczonych danych i skanowanie sygnatur narzedzi &mdash; automatycznie.

---

## Co potrafi agent AI

### Rozwiazywanie wyzwan CTF

```
Ty: "Rozwiaz to wyzwanie steganograficzne CTF — obraz to challenge.png"

Agent: -> img_detect: Steganaliza chi-kwadrat wykrywa osadzenie LSB
          (p=0,00012), analiza RS szacuje 38% stopien osadzenia,
          anomalia entropii przy blokach (12,4)-(15,8)
       -> img_lsb_extract: Wyodrebniono 1 247 bajtow z LSB kanalu RGB
       -> crypto_detect: Dane pasuja do wzorca Base64 (pewnosc: 0,95)
       -> crypto_decode: "Q1RGe3N0M2cwX21hc3Rlcn0=" -> "CTF{st3g0_master}"
       -> img_known_tools: Sygnatura OpenStego wykryta w chunkach PNG

       "Znaleziono flage: CTF{st3g0_master}
        Obraz uzywa steganografii LSB osadzonej przez OpenStego.
        Payload byl zakodowany w Base64 w najmniej znaczacych
        bitach RGB ze stopniem osadzenia 38%."
```

### Sledztwo cyfrowe

```
Ty: "Przeanalizuj suspect.png i suspect.wav pod katem ukrytej komunikacji"

Agent: -> img_detect: Nie wykryto stego LSB, ale znaleziono dolaczone dane
          (12 847 bajtow po znaczniku PNG IEND)
       -> file_identify: Dolaczone dane zaczynaja sie sygnatura ZIP (PK)
       -> img_metadata: Chunk PNG tEXt zawiera nietypowy klucz "comm"
          z wartoscia Base64
       -> audio_detect: Plik WAV ma anomalie chi-kwadrat LSB (p=0,003)
       -> audio_silence: Wykryto 3 ciche sekcje z aktywnymi LSB
       -> audio_lsb_extract: Wyodrebniono 2 048 bajtow ukrytych danych

       "Oba pliki zawieraja ukryte dane:
        1. suspect.png ma archiwum ZIP dolaczone po znaczniku EOF PNG,
           plus zakodowana w Base64 wiadomosc w metadanych
        2. suspect.wav zawiera steganografie LSB, szczegolnie w
           cichych sekcjach — silny wskaznik celowego ukrywania.
        Zalecam wyodrebnienie ZIP-a i analize payloadu WAV."
```

### Detekcja tekstu zero-width

```
Ty: "Ten e-mail wyglada normalnie, ale moze zawierac ukryty tekst"

Agent: -> text_detect: Wykryto 847 znakow zero-width miedzy
          widocznymi znakami
       -> text_zwc_detect: ZWSP (342), ZWNJ (505) znalezione w 127
          pozycjach w calym tekscie
       -> text_zwc_extract: Dekodowanie binarne daje "EXFIL-ROUTE-7"
       -> text_invisible_scan: 3 dodatkowe niewidoczne znaki Unicode
          (U+2060, U+FEFF) znalezione w sekcji naglowka

       "E-mail zawiera ukryta wiadomosc zakodowana znakami zero-width:
        'EXFIL-ROUTE-7'. 847 niewidocznych znakow jest rozproszonych
        w calym widocznym tekscie przy uzyciu kodowania binarnego
        ZWSP/ZWNJ. Dodatkowo 3 znaki Word Joiner i BOM zostaly
        znalezione w naglowku — prawdopodobnie artefakty metadanych."
```

### Analiza forensyczna JPEG

```
Ty: "Czy ten obraz JPEG jest autentyczny, czy zostal zmanipulowany?"

Agent: -> jpeg_structure: 14 znacznikow sparsowanych, normalna struktura JFIF
       -> jpeg_double_compression: Wykryto podwojna kompresje —
          wynik artefaktow blokowych 0,73, wspolczynnik anomalii kwantyzacji 0,81
       -> jpeg_quantization: Jakosc ~75 (luminancja), ale wzorce
          rezydualne sugeruja oryginalna jakosc ~92
       -> jpeg_exif_deep: EXIF mowi "iPhone 14 Pro" ale pole Software
          mowi "Adobe Photoshop 25.0"
       -> jpeg_thumbnail_compare: Wymiary miniatury NIE pasuja
          do glownego obrazu (miniatura: 4032x3024, glowny: 2048x1536)

       "Ten JPEG zostal zmanipulowany. Dowody:
        1. Wykryto podwojna kompresje — obraz zostal zdekodowany i
           ponownie zakodowany z nizsza jakoscia (oryginal ~92, obecna ~75)
        2. EXIF twierdzi iPhone 14 Pro, ale pole software ujawnia
           edycje w Photoshopie
        3. Miniatura pochodzi z oryginalnego zdjecia 4032x3024, ale
           glowny obraz zostal zmieniony do 2048x1536
        Wszystkie trzy wyniki niezaleznie potwierdzaja modyfikacje
        po wykonaniu zdjecia."
```

---

## Dokumentacja narzedzi (128 narzedzi)

### Przeglad kategorii

| Kategoria | Narzedzia | Opis |
|-----------|-----------|------|
| [Steganaliza obrazu](#-steganaliza-obrazu-14) | 14 | Detekcja LSB, chi-kwadrat, analiza RS, mapowanie entropii, plaszczyzny bitowe, histogram, metadane, sygnatury narzedzi |
| [Analiza JPEG](#-analiza-jpeg-7) | 7 | Histogram DCT, podwojna kompresja, tabele kwantyzacji, gleboki EXIF, forensyka miniatur, analiza komentarzy |
| [Steganaliza audio](#-steganaliza-audio-7) | 7 | Detekcja WAV LSB, analiza widma, analiza cichych sekcji, detekcja ukrywania echa, ekstrakcja metadanych |
| [Tekst i Unicode](#-tekst--unicode-10) | 10 | Znaki zero-width, kodowanie bialych znakow, niewidoczny Unicode, homoglify, akrostychy, analiza Unicode |
| [Forensyka plikow](#-forensyka-plikow-10) | 10 | Magiczne bajty, detekcja poliglotow, osadzone pliki, dolaczone dane, entropia, hex dump, lancuchy znakow, naglowki |
| [Analiza dokumentow](#-analiza-dokumentow-5) | 5 | Ukryte tresci PDF, metadane PDF, strumienie PDF, ukryte tresci HTML, metadane XML |
| [Kodowanie i krypto](#-kodowanie--krypto-7) | 7 | Detekcja kodowania, dekoder wieloformatowy, analiza czestotliwosci, entropia, brute-force XOR, identyfikacja hashy, wzorce szyfrow |
| [Zaawansowany JPEG](#-zaawansowany-jpeg-7) | 7 | F5, JSteg, OutGuess, detekcja PVD, przesuwne okno chi-kwadrat, steganaliza crop-rekalibracji, kompatybilnosc narzedzi |
| [Steganografia wideo](#-steganografia-wideo-8) | 8 | AVI frame LSB, analiza miedzy-klatkami, porownanie klatek, metadane, struktura, dane EOF |
| [Steganografia GIF](#-steganografia-gif-8) | 8 | Paleta LSB, entropia sub-blokow LZW, rozszerzenia komentarzy, rozszerzenia aplikacji, analiza klatek |
| [Steganografia sieciowa](#-steganografia-sieciowa-8) | 8 | Ukryte kanaly PCAP, analiza naglowkow IP/TCP, payloady ICMP, tunelowanie DNS, naglowki HTTP, timing |
| [Steganografia MP3](#-steganografia-mp3-7) | 7 | Ukryte dane ID3, analiza ramek, manipulacja paddingiem, analiza probek, metadane, struktura |
| [Spread Spectrum](#-spread-spectrum-5) | 5 | Widmo amplitudowe DFT, autokorelacja, detekcja znakow wodnych, analiza poziomu szumu, detekcja patchwork |
| [Analiza BPCS](#-analiza-bpcs-5) | 5 | Segmentacja zlozonosci plaszczyzn bitowych, mapowanie zlozonosci, analiza progu, ekstrakcja danych, estymacja pojemnosci |
| [Steganografia archiwow](#-steganografia-archiwow-7) | 7 | Wolne przestrzenie ZIP, dodatkowe pola, komentarze, detekcja poliglotow, analiza struktury, metadane |
| [Tworzenie i osadzanie](#-tworzenie-i-osadzanie-7) | 7 | Iniekcja EOF, iniekcja metadanych, kodowanie bialymi znakami, szyfr zerowy, tworzenie poliglotow, iniekcja komentarzy, osadzanie w palecie |
| [Steganografia kodow QR](#-steganografia-kodow-qr-6) | 6 | Detekcja stego QR, analiza struktury, pojemnosc ECC, analiza modulow, ekstrakcja danych, porownanie |

---

<details open>
<summary><h3>Steganaliza obrazu (14)</h3></summary>

| Narzedzie | Opis |
|-----------|------|
| `img_detect` | Automatyczna detekcja steganografii w obrazie. Uruchamia chi-kwadrat, analize RS, entropie, metadane, dolaczone dane i sprawdzanie sygnatur narzedzi. Zwraca kompleksowy raport JSON |
| `img_lsb_detect` | Statystyczna detekcja steganografii LSB. Uruchamia chi-kwadrat i analize par probek na kazdym kanale koloru niezaleznie |
| `img_lsb_extract` | Wyodrebnij ukryte dane z LSB obrazu. Wydobywa bity z okreslonych kanalow i plaszczyzny bitowej, probuje dekodowania UTF-8 i wyswietla hex dump |
| `img_lsb_embed` | Osadz wiadomosc w obrazie za pomoca steganografii LSB. Czyta plik PNG, osadza wiadomosc w najmniej znaczacych bitach i zapisuje nowy plik PNG |
| `img_bitplane` | Wyodrebnij i wizualizuj okreslona plaszczyzne bitowa z kanalu obrazu. Wyswietla wymiary, procent bitow 1 i podglad w ASCII art |
| `img_chi_square` | Atak steganalizy chi-kwadrat na kazdy kanal koloru niezaleznie. Wykrywa zastepowanie LSB testujac czy sasiednie pary wartosci pikseli sa wyrownane |
| `img_rs_analysis` | Steganaliza RS (Regular-Singular) metoda Fridrich-Goljan-Du. Analizuje grupy pikseli w celu oszacowania stopnia osadzenia LSB na kanal |
| `img_histogram` | Generuj histogram wartosci pikseli z detekcja anomalii. Wykrywa anomalie Pairs-of-Values (PoV) wskazujace na steganografie LSB |
| `img_entropy_map` | Analiza entropii obrazu po blokach. Dzieli obraz na bloki i oblicza entropie Shannona na blok, flagujac regiony o wysokiej entropii |
| `img_metadata` | Gleboka ekstrakcja metadanych z obrazu. Dla PNG: chunki tekstowe, lista chunkow, informacje IHDR. Dla JPEG: EXIF, komentarze, tabele kwantyzacji, lista znacznikow |
| `img_appended_data` | Wykryj i wyodrebnij dane dolaczone po znaczniku EOF obrazu. Sprawdza ukryte dane po PNG IEND, JPEG EOI lub granicy rozmiaru pliku BMP |
| `img_compare` | Porownanie piksel po pikselu dwoch obrazow. Raportuje liczbe identycznych/roznych pikseli, maksymalna roznice i ktore kanaly sa dotknete |
| `img_channel_analysis` | Analiza statystyczna per kanal dla kanalow R, G, B i A. Raportuje srednia, odchylenie standardowe, entropie, min, max i liczbe unikalnych wartosci |
| `img_known_tools` | Skanuj bajty pliku obrazu pod katem znanych sygnatur narzedzi steganograficznych. Sprawdza baze wzorcow z OpenStego, Steghide, JSteg, F5 i innych |

</details>

<details>
<summary><h3>Analiza JPEG (7)</h3></summary>

| Narzedzie | Opis |
|-----------|------|
| `jpeg_structure` | Parsuj znaczniki/segmenty JPEG z offsetami i rozmiarami. Wyswietla wewnetrzna strukture w tym wszystkie znaczniki, pozycje i dlugosci segmentow |
| `jpeg_dct_histogram` | Analiza rozkladu wspolczynnikow DCT do detekcji steganografii. Analizuje rozklad wartosci pikseli kanalu Y i dane entropii SOS w celu wykrycia anomalii spowodowanych przez JSteg, F5 i OutGuess |
| `jpeg_double_compression` | Wykryj artefakty podwojnej kompresji JPEG. Identyfikuje charakterystyczne artefakty blokowe i anomalie tabel kwantyzacji &mdash; czesty wskaznik manipulacji obrazu lub osadzenia stego |
| `jpeg_quantization` | Analiza tabel kwantyzacji z szacowaniem jakosci. Wyswietla wszystkie tabele kwantyzacji w formacie siatki 8x8 i szacuje wspolczynnik jakosci JPEG |
| `jpeg_exif_deep` | Gleboka analiza EXIF w tym wspolrzedne GPS, znaczniki czasu, informacje o oprogramowaniu, miniatury, notatki producenta i wszystkie wpisy IFD. Flaguje forensycznie interesujace pola |
| `jpeg_thumbnail_compare` | Porownaj miniature EXIF z glownym obrazem JPEG. Niezgodnosc wymiarow lub tresci wskazuje na modyfikacje po wykonaniu zdjecia &mdash; czesty artefakt forensyczny |
| `jpeg_comment` | Wyodrebnij i analizuj znaczniki JPEG COM (komentarz). Sprawdza wzorce ukrytych danych, niezwykle duze komentarze i tresc o wysokiej entropii |

</details>

<details>
<summary><h3>Steganaliza audio (7)</h3></summary>

| Narzedzie | Opis |
|-----------|------|
| `audio_detect` | Automatyczna detekcja steganografii audio w pliku WAV. Uruchamia LSB chi-kwadrat, analize entropii, inspekcje metadanych i sprawdza dolaczone dane |
| `audio_lsb_detect` | Analiza statystyczna LSB probek PCM. Wykonuje test chi-kwadrat na LSB pogrupowanych wg par wartosci w celu detekcji steganografii zastepowania LSB |
| `audio_lsb_extract` | Wyodrebnij dane LSB z probek audio. Czyta najmniej znaczacy bit kazdej probki PCM i probuje zdekodowac ukryte dane |
| `audio_spectrum` | Analiza widmowa ukrytych sygnalow w audio WAV. Analizuje rozklad wartosci probek, czestotliwosc przejsc przez zero, energie RMS na blok i wykrywa anomalne ciche sekcje |
| `audio_metadata` | Wyodrebnij metadane z pliku WAV w tym chunki RIFF INFO, szczegoly formatu i wszystkie informacje o chunkach |
| `audio_silence` | Analizuj ciche sekcje audio WAV pod katem ukrytych danych. Znajduje regiony probek bliskich zeru i sprawdza ich LSB &mdash; ciche sekcje z aktywnymi LSB sa silnym wskaznikiem stego |
| `audio_echo_detect` | Detekcja ukrywania echa przez analize autokorelacji. Oblicza znormalizowana autokorelacje przy typowych opoznieniach echa. Regularne wzorce echa wskazuja na steganograficzne ukrywanie echa |

</details>

<details>
<summary><h3>Tekst & Unicode (10)</h3></summary>

| Narzedzie | Opis |
|-----------|------|
| `text_detect` | Automatyczna detekcja steganografii tekstowej. Sprawdza znaki zero-width, kodowanie bialych znakow, niewidoczny Unicode, homoglify i nietypowe wzorce |
| `text_zwc_detect` | Wykryj znaki zero-width (ZWSP, ZWNJ, ZWJ, BOM) w tekscie. Raportuje pozycje, liczby i potencjalna dlugosc zakodowanej wiadomosci |
| `text_zwc_extract` | Dekoduj wiadomosc zakodowana znakami zero-width. Wyodrenia znaki ZWC i dekoduje binarnie: ZWSP=0, ZWNJ=1 (probuje obu polaryzacji) |
| `text_zwc_embed` | Osadz tajna wiadomosc w tekscie maskujacym za pomoca znakow zero-width. Koduje wiadomosc do postaci binarnej i mapuje bity na ZWSP(0)/ZWNJ(1) |
| `text_whitespace_detect` | Wykryj kodowanie bialymi znakami w tekscie. Sprawdza kazda linie pod katem koncowych wzorcow bialych znakow, gdzie spacja=0 i tab=1 moga kodowac dane binarne |
| `text_whitespace_extract` | Wyodrebnij wiadomosc zakodowana bialymi znakami z tekstu. Czyta koncowe biale znaki z kazdej linii i dekoduje kodowanie binarne spacja=0/tab=1 |
| `text_invisible_scan` | Skanuj tekst pod katem WSZYSTKICH niewidocznych znakow Unicode. Sprawdza kazdy znak w pelnej bazie niewidocznych znakow i raportuje pozycje oraz nazwy |
| `text_homoglyph` | Wykryj substytucje homoglifow Unicode w tekscie. Identyfikuje znaki nie-ASCII, ktore wizualnie przypominaja litery ASCII (cyrylickie a vs. lacinskie a itp.) |
| `text_unicode_analysis` | Pelna analiza rozkladu znakow Unicode. Kategoryzuje wszystkie znaki wg blokow pisma, wykonuje analize entropii i wykrywa podejrzane mieszanie pism |
| `text_acrostic` | Wykryj wzorce pierwsza-litera, pierwsze-slowo, ostatnia-litera, ostatnie-slowo lub n-ty-znak (wiadomosci akrostychowe) ukryte w liniach tekstu |

</details>

<details>
<summary><h3>Forensyka plikow (10)</h3></summary>

| Narzedzie | Opis |
|-----------|------|
| `file_identify` | Identyfikacja typu pliku przez magiczne bajty. Czyta naglowek pliku i porownuje z obszerna baza znanych sygnatur plikow. Sprawdza niezgodnosc rozszerzenia |
| `file_polyglot` | Wykryj pliki poliglotowe poprawne jako dwa lub wiecej formatow jednoczesnie. Sprawdza wiele poprawnych sygnatur plikow przy roznych offsetach (PDF+ZIP, PNG+PDF itp.) |
| `file_embedded` | Skanuj w poszukiwaniu osadzonych plikow wewnatrz pliku binarnego, podobnie do binwalk. Szuka znanych sygnatur magicznych bajtow przy kazdym offsecie w celu odkrycia ukrytych lub dolaczonych plikow |
| `file_appended` | Wykryj dane dolaczone po znaczniku EOF specyficznym dla formatu pliku. Obsluguje PNG (IEND), JPEG (FFD9), BMP, ZIP (EOCD) i PDF (%%EOF) |
| `file_entropy` | Analiza entropii sekcja po sekcji. Oblicza entropie Shannona na blok i calosciowo, flagujac anomalne sekcje o wysokiej entropii |
| `file_entropy_visual` | Wizualizacja entropii ASCII pliku. Renderuje tekstowy wykres slupkowy pokazujacy poziomy entropii w calym pliku do wizualnej detekcji anomalii |
| `file_strings` | Wyodrebnij drukowalne i Unicode lancuchy znakow z plikow binarnych. Skanuje ciagi drukowalnych znakow i raportuje je z offsetami pliku. Obsluguje ASCII, UTF-8, UTF-16 |
| `file_hex` | Hex dump z panelem bocznym ASCII. Tradycyjny format edytora hex z adresami offsetow, bajtami hex i drukowalna reprezentacja ASCII |
| `file_header` | Gleboka analiza naglowka i struktury dla znanych formatow. Parsuje PNG IHDR, JPEG SOF, naglowek info BMP, lokalne naglowki plikow ZIP i wersje/metadane PDF |
| `file_compare` | Binarny diff miedzy dwoma plikami. Porownanie bajt po bajcie raportujace roznice z offsetami, procent identycznych i roznice tylko w LSB do analizy stego |

</details>

<details>
<summary><h3>Analiza dokumentow (5)</h3></summary>

| Narzedzie | Opis |
|-----------|------|
| `doc_pdf_hidden` | Detekcja ukrytej tresci PDF. Skanuje JavaScript, akcje automatyczne, OpenAction, ukryte adnotacje, niewidoczny tekst, osadzone pliki i inna ukryta tresc |
| `doc_pdf_metadata` | Ekstrakcja metadanych PDF. Parsuje slownik /Info i bloki metadanych XMP do forensycznej atrybucji i analizy pochodzenia dokumentu |
| `doc_pdf_streams` | Analiza strumieni PDF. Lokalizuje wszystkie bloki stream/endstream, probuje dekompresji zlib i raportuje rozmiary oraz entropie w celu znalezienia ukrytych danych |
| `doc_html_hidden` | Detekcja ukrytej tresci HTML. Skanuje komentarze, elementy display:none, atrybuty data-*, ukryte inputy, tresc base64, elementy o zerowym rozmiarze i niewidoczny tekst |
| `doc_xml_metadata` | Ekstrakcja metadanych XML i dokumentow Office. Parsuje Dublin Core, wlasciwosci Microsoft Office, instrukcje przetwarzania i inne pola metadanych |

</details>

<details>
<summary><h3>Kodowanie & Krypto (7)</h3></summary>

| Narzedzie | Opis |
|-----------|------|
| `crypto_detect` | Automatyczna detekcja typu kodowania lancucha wejsciowego. Testuje wobec wszystkich znanych wzorcow (Base64, hex, binarny, morse, kodowanie URL, encje HTML itp.) i zwraca dopasowania posortowane wg pewnosci |
| `crypto_decode` | Dekoder wieloformatowy obslugujacy Base64, hex, binarny, dziesietny, osemkowy, kodowanie URL, ROT13, Base32, kod Morse'a i encje HTML. Tryb automatyczny najpierw wykrywa kodowanie |
| `crypto_frequency` | Analiza czestotliwosci znakow do kryptoanalizy. Zlicza wystapienia znakow, porownuje ze standardowa czestotliwoscia angielska (ETAOINSHRDLU) i oblicza Index of Coincidence |
| `crypto_entropy` | Obliczanie i klasyfikacja entropii Shannona dla lancuchow. Oblicza entropie na poziomie znakow i bajtow, klasyfikujac w kategorie od danych powtarzajacych sie do zaszyfrowanych/losowych |
| `crypto_xor` | Brute-force klucza XOR dla kluczy jedno- i wielobajtowych. Testuje wszystkie 256 kluczy jednobajtowych i ocenia wg prawdopodobienstwa tekstu angielskiego. Uzywa IC do szacowania dlugosci klucza wielobajtowego |
| `crypto_hash_id` | Identyfikacja typu hasha. Dopasowuje wejscie do znanych wzorcow hashy wg dlugosci i formatu (MD5, SHA-1, SHA-256, SHA-512, bcrypt, CRC32, NTLM itp.) |
| `crypto_patterns` | Detekcja znanych wzorcow szyfrow i kodowan. Analizuje tekst pod katem szyfru Cezara, szyfru podstawieniowego, Vigenere'a, rail fence transpozycji, Atbash i odwroconego tekstu |

</details>

---

## Uzycie CLI

```bash
# Pokaz pomoc
npx -y steganography-mcp --help

# Wylistuj wszystkie 128 narzedzi z opisami
npx -y steganography-mcp --list

# Wykryj steganografie w obrazie
npx -y steganography-mcp --tool img_detect '{"file_path":"challenge.png"}'

# Wyodrebnij ukryta wiadomosc z LSB
npx -y steganography-mcp --tool img_lsb_extract '{"file_path":"stego.png"}'

# Steganaliza chi-kwadrat
npx -y steganography-mcp --tool img_chi_square '{"file_path":"suspect.png"}'

# Analiza RS (metoda Fridrich-Goljan-Du)
npx -y steganography-mcp --tool img_rs_analysis '{"file_path":"suspect.png"}'

# Detekcja podwojnej kompresji JPEG
npx -y steganography-mcp --tool jpeg_double_compression '{"file_path":"photo.jpg"}'

# Gleboka analiza EXIF
npx -y steganography-mcp --tool jpeg_exif_deep '{"file_path":"photo.jpg"}'

# Detekcja steganografii audio
npx -y steganography-mcp --tool audio_detect '{"file_path":"message.wav"}'

# Wykryj kodowanie znakami zero-width
npx -y steganography-mcp --tool text_zwc_detect '{"text":"podejrzany tekst tutaj"}'

# Osadz ukryta wiadomosc znakami zero-width
npx -y steganography-mcp --tool text_zwc_embed '{"text":"tekst maskujacy","message":"tajemnica"}'

# Zidentyfikuj typ pliku i wykryj poligloty
npx -y steganography-mcp --tool file_polyglot '{"file_path":"suspicious.pdf"}'

# Skanuj w poszukiwaniu osadzonych plikow (styl binwalk)
npx -y steganography-mcp --tool file_embedded '{"file_path":"mystery.bin"}'

# Wizualizacja entropii
npx -y steganography-mcp --tool file_entropy_visual '{"file_path":"data.bin"}'

# Automatyczna detekcja kodowania
npx -y steganography-mcp --tool crypto_detect '{"input":"aGVsbG8gd29ybGQ="}'

# Brute-force XOR
npx -y steganography-mcp --tool crypto_xor '{"input":"4f5243484e"}'

# Wykryj wzorce szyfrow
npx -y steganography-mcp --tool crypto_patterns '{"input":"Gur dhvpx oebja sbk"}'

# Z Bun (szybszy start)
bunx steganography-mcp --tool img_detect '{"file_path":"image.png"}'
```

---

## Przypadki uzycia

### Wyzwania CTF
Rozwiazuj wyzwania steganograficzne w zawodach capture-the-flag. Agent AI moze systematycznie stosowac wszystkie techniki detekcji &mdash; analize LSB, inspekcje metadanych, dolaczone dane, detekcje kodowania i identyfikacje szyfrow &mdash; aby znalezc ukryte flagi w obrazach, plikach audio, dokumentach i tekscie.

### Forensyka cyfrowa
Wykrywaj ukryte kanaly komunikacji w sledztwach forensycznych. Analizuj podejrzane pliki pod katem ukrytych danych za pomoca steganalzy statystycznej (chi-kwadrat, analiza RS), sprawdzaj dane dolaczone po znacznikach EOF, skanuj w poszukiwaniu osadzonych plikow i identyfikuj sygnatury narzedzi steganograficznych.

### Badania bezpieczenstwa
Analizuj narzedzia i techniki steganograficzne. Porownuj oryginalne i stego-obrazy piksel po pikselu, badaj rozklady wspolczynnikow DCT w stego JPEG, mierz zmiany entropii z osadzania i analizuj wstecznie schematy kodowania.

### Edukacja
Naucz sie jak dzialaja techniki steganograficzne. Osadzaj i wyodrebniaj wiadomosci LSB, koduj tekst znakami zero-width, wizualizuj plaszczyzny bitowe i mapy entropii, analizuj struktury plikow hex dumpami i badaj wzorce szyfrow analiza czestotliwosci.

### Reakcja na incydenty
Podczas reakcji na incydenty sprawdzaj dokumenty i obrazy pod katem ukrytych kanalow eksfiltracji. Skanuj PDF-y pod katem ukrytego JavaScript i osadzonych plikow, wykrywaj kodowanie znakami zero-width w e-mailach, identyfikuj pliki poliglotowe i analizuj podejrzane kodowania.

---

## Architektura

```
src/
  index.ts                    # Punkt wejscia CLI (--help, --list, --tool, serwer stdio)
  protocol/
    mcp-server.ts             # Konfiguracja serwera MCP (transport stdio)
    tools.ts                  # Rejestr narzedzi — wszystkie 128 narzedzi zebranych tutaj
  types/
    index.ts                  # Typy wspoldzielone (ToolDef, ToolContext, ToolResult)
  utils/
    binary.ts                 # Odczyt plikow binarnych, hex dump, detekcja formatu
    stats.ts                  # Entropia Shannona, chi-kwadrat, czestotliwosc bajtow
    cache.ts                  # Cache TTL
    png-parser.ts             # Czysty parser PNG w TS (IHDR, chunki, dane pikseli)
    jpeg-parser.ts            # Czysty parser JPEG w TS (znaczniki, EXIF, kwantyzacja)
    wav-parser.ts             # Czysty parser WAV w TS (chunki RIFF, probki PCM)
    bmp-parser.ts             # Czysty parser BMP w TS (naglowek, dane pikseli)
    avi-parser.ts             # Czysty parser AVI w TS (klatki, naglowki)
    gif-parser.ts             # Czysty parser GIF w TS (paleta, bloki LZW)
    pcap-parser.ts            # Czysty parser PCAP w TS (pakiety, naglowki)
    mp3-parser.ts             # Czysty parser MP3 w TS (ramki, tagi ID3)
    zip-parser.ts             # Czysty parser ZIP w TS (lokalne naglowki, central directory)
  image/                      # Narzedzia steganalizy obrazu (14)
  jpeg/                       # Narzedzia analizy JPEG (7)
  jpegadv/                    # Zaawansowane narzedzia JPEG (7)
  audio/                      # Narzedzia steganalizy audio (7)
  text/                       # Narzedzia tekstu i Unicode (10)
  file/                       # Narzedzia forensyki plikow (10)
  document/                   # Narzedzia analizy dokumentow (5)
  crypto/                     # Narzedzia kodowania i krypto (7)
  video/                      # Narzedzia steganografii wideo (8)
  gif/                        # Narzedzia steganografii GIF (8)
  network/                    # Narzedzia steganografii sieciowej (8)
  mp3/                        # Narzedzia steganografii MP3 (7)
  spread/                     # Narzedzia Spread Spectrum (5)
  bpcs/                       # Narzedzia analizy BPCS (5)
  archive/                    # Narzedzia steganografii archiwow (7)
  create/                     # Narzedzia tworzenia i osadzania (7)
  qrcode/                     # Narzedzia steganografii kodow QR (6)
  data/
    encoding-patterns.ts      # Wzorce regex kodowan + dekodery
    magic-bytes.ts            # Baza sygnatur plikow (100+ formatow)
    stego-signatures.ts       # Znane sygnatury narzedzi steganograficznych
    unicode-invisible.ts      # Baza niewidocznych znakow Unicode
```

**Decyzje projektowe:**

- **4 zaleznosci, nic wiecej** &mdash; `@modelcontextprotocol/sdk` dla protokolu MCP, `zod` do walidacji wejscia, `pngjs` do dostepu do pikseli PNG, `jpeg-js` do dekodowania JPEG. Zadnego rozrosnieetgo drzewa zaleznosci. Zadnych natywnych modulow. Zadnych wizan C. Zadnego Pythona. Zadnej Javy.
- **100% offline** &mdash; Kazde narzedzie dziala calkowicie lokalnie. Zadnych zapytan HTTP. Zadnych wywolan API. Zadnej telemetrii. Zadnych zaleznosci chmurowych. Twoje pliki nigdy nie opuszczaja Twojej maszyny.
- **Czysta analiza statystyczna w TypeScript** &mdash; Test chi-kwadrat, analiza RS (Fridrich-Goljan-Du), Sample Pair Analysis, entropia Shannona, Index of Coincidence i analiza czestotliwosci sa zaimplementowane w czystym TypeScript. Zadnych zewnetrznych bibliotek matematycznych.
- **Niestandardowe parsery formatow** &mdash; Chunki PNG, znaczniki JPEG/EXIF/tabele kwantyzacji, chunki RIFF WAV i naglowki BMP sa parsowane bez zewnetrznych zaleznosci przez parsery `utils/`. Umozliwia to gleboka analize specyficzna dla formatu, ktorej biblioteki ogolnego przeznaczenia nie moga zapewnic.
- **17 dostawcow, 1 serwer** &mdash; Kazda kategoria analizy jest niezaleznym modulem. Agent AI wybiera jakie narzedzia uzyc na podstawie kontekstu sledztwa.
- **Czysty wzorzec ToolDef** &mdash; Kazde narzedzie stosuje ten sam wzorzec `{ name, description, schema, execute }`. Dodanie nowego narzedzia to jeden obiekt w odpowiednim module.
- **Walidacja Zod na kazdym polu** &mdash; Kazde pole schematu ma `.describe()` dla kontekstu agenta AI. Nieprawidlowe wejscia sa wychwytywane przed wykonaniem z jasnymi komunikatami bledow.

---

## Czesc pakietu MCP Security Suite

| Projekt | Domena | Narzedzia |
|---|---|---|
| [hackbrowser-mcp](https://github.com/badchars/hackbrowser-mcp) | Testowanie bezpieczenstwa przegladarki | 39 narzedzi |
| [cloud-audit-mcp](https://github.com/badchars/cloud-audit-mcp) | Bezpieczenstwo chmury (AWS/Azure/GCP) | 38 narzedzi |
| [github-security-mcp](https://github.com/badchars/github-security-mcp) | Postawa bezpieczenstwa GitHub | 39 narzedzi |
| [cve-mcp](https://github.com/badchars/cve-mcp) | Analiza podatnosci | 23 narzedzi |
| [osint-mcp-server](https://github.com/badchars/osint-mcp-server) | OSINT i rekonesans | 37 narzedzi |
| [darknet-mcp-server](https://github.com/badchars/darknet-mcp-server) | Dark web i analiza zagrozen | 66 narzedzi |
| [dns-security-mcp](https://github.com/badchars/dns-security-mcp) | Bezpieczenstwo DNS | 103 narzedzi |
| **steganography-mcp** | **Analiza steganografii** | **128 narzedzi** |

---

## Wspoltworzenie

Wspoltworzenie jest mile widziane. Zobacz [CONTRIBUTING.md](../../CONTRIBUTING.md) po wytyczne.

---

<p align="center">
<b>Wylacznie do autoryzowanych badan bezpieczenstwa i celow edukacyjnych.</b><br>
Zawsze upewnij sie, ze posiadasz odpowiednie upowaznienie przed przeprowadzeniem analizy steganograficznej na plikach, ktorych nie jestes wlascicielem.
</p>

<p align="center">
  <a href="../../LICENSE">Licencja MIT</a> &bull; Stworzone przez <a href="https://orhanyildirim.us">Orhan Yildirim</a> &bull; <a href="mailto:contact@orhanyildirim.us">contact@orhanyildirim.us</a>
</p>
