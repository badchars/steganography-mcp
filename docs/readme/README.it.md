<p align="center">
  <a href="../../README.md">English</a> |
  <a href="README.zh.md">中文</a> |
  <a href="README.zh-TW.md">繁體中文</a> |
  <a href="README.ko.md">한국어</a> |
  <a href="README.ja.md">日本語</a> |
  <a href="README.de.md">Deutsch</a> |
  <a href="README.es.md">Español</a> |
  <a href="README.fr.md">Français</a> |
  <strong>Italiano</strong> |
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

<h3 align="center">Il toolkit di analisi steganografica pi&ugrave; completo per agenti IA.</h3>

<p align="center">
  Rilevamento LSB, steganalisi chi-quadrato, analisi RS, forensica DCT, steganografia audio, codifica di testo con caratteri a larghezza zero, forensica dei file, rilevamento poliglotta, identificazione della codifica &mdash; unificati in un unico server MCP.<br>
  <b>60 strumenti. 7 categorie. 4 dipendenze. 100 % offline.</b> Nessuna chiave API necessaria. Ogni strumento viene eseguito localmente.
</p>

<br>

<p align="center">
  <a href="#il-problema">Il problema</a> &bull;
  <a href="#cosa-lo-rende-diverso">Cosa lo rende diverso</a> &bull;
  <a href="#avvio-rapido">Avvio rapido</a> &bull;
  <a href="#cosa-pu&ograve;-fare-lia">Cosa pu&ograve; fare l'IA</a> &bull;
  <a href="#riferimento-strumenti-60-strumenti">Strumenti (60)</a> &bull;
  <a href="#utilizzo-cli">Utilizzo CLI</a> &bull;
  <a href="#architettura">Architettura</a> &bull;
  <a href="../../CONTRIBUTING.md">Contribuire</a>
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

## Il problema

La steganografia &egrave; l'arte di nascondere dati in bella vista &mdash; all'interno di immagini, file audio, documenti e persino testo Unicode. Viene utilizzata nelle competizioni CTF, nelle indagini forensi digitali, nei canali di comunicazione clandestini e nei payload di malware. Il suo rilevamento richiede una combinazione di analisi statistica, parsing specifico per formato, misurazione dell'entropia e competenze specialistiche.

```
Flusso di lavoro tradizionale di analisi steganografica:
  rilevare stego nelle immagini   ->  zsteg + stegsolve (2 strumenti, Ruby + Java)
  analisi chi-quadrato            ->  script Python personalizzato
  analisi RS                      ->  codice MATLAB/Python personalizzato
  forensica JPEG DCT              ->  stegdetect (strumento C abbandonato del 2004)
  estrarre dati LSB               ->  zsteg + steghide + openstego (3 strumenti)
  steganografia audio             ->  Audacity manuale + script personalizzati
  rilevamento testo larg. zero    ->  strumenti web + ispezione manuale
  forensica file / binwalk        ->  binwalk + foremost + xxd (3 strumenti)
  metadati EXIF                   ->  exiftool (dipendenza Perl)
  rilevamento codifica            ->  CyberChef web UI + tentativi manuali
  ─────────────────────────────────
  Totale: 10+ strumenti, 5+ linguaggi, ore di correlazione manuale
```

**steganography-mcp** fornisce al vostro agente IA 60 strumenti in 7 categorie tramite il [Model Context Protocol](https://modelcontextprotocol.io). L'agente esegue steganalisi delle immagini, forensica JPEG, analisi audio, rilevamento di steganografia testuale, forensica dei file, analisi di documenti e identificazione della codifica &mdash; tutto in una singola conversazione, tutto eseguito al 100 % in locale senza alcuna dipendenza da servizi esterni.

```
Con steganography-mcp:
  Tu: "Analizza questa immagine della sfida CTF per trovare dati nascosti"

  Agente: -> img_detect: Chi-quadrato p=0,0001 (incorporamento LSB rilevato),
             l'analisi RS stima un tasso di incorporamento del 42 %, anomalia
             di entropia nel quadrante inferiore destro
          -> img_lsb_extract: 847 byte estratti dagli LSB RGB
          -> crypto_detect: I dati estratti sono codificati in Base64
          -> crypto_decode: Decodificato in "FLAG{hidden_in_plain_sight_2024}"
          -> img_known_tools: Corrispondenza di firma con OpenStego

          "L'immagine contiene steganografia LSB incorporata con OpenStego.
           Il test chi-quadrato conferma la sostituzione LSB in tutti e tre
           i canali RGB con un tasso di incorporamento del 42 %. Il payload
           nascosto &egrave; codificato in Base64 e si decodifica nella flag:
           FLAG{hidden_in_plain_sight_2024}"
```

---

## Cosa lo rende diverso

La maggior parte degli strumenti di steganografia sono utilit&agrave; monouso. steganography-mcp fornisce al vostro agente IA la capacit&agrave; di **ragionare su tutte le tecniche steganografiche simultaneamente**.

<table>
<thead>
<tr>
<th></th>
<th>Approccio tradizionale</th>
<th>steganography-mcp</th>
</tr>
</thead>
<tbody>
<tr>
<td><b>Interfaccia</b></td>
<td>10+ strumenti CLI, 5+ linguaggi, interfacce web</td>
<td>MCP &mdash; l'agente IA chiama gli strumenti conversazionalmente</td>
</tr>
<tr>
<td><b>Copertura</b></td>
<td>Una tecnica alla volta</td>
<td>7 categorie, 60 strumenti in parallelo</td>
</tr>
<tr>
<td><b>Analisi immagini</b></td>
<td>zsteg (Ruby), stegsolve (Java), script personalizzati</td>
<td>L'agente esegue chi-quadrato, analisi RS, SPA, mappa di entropia, istogramma, estrazione di piani di bit, metadati e rilevamento firme strumenti &mdash; tutto contemporaneamente</td>
</tr>
<tr>
<td><b>Forensica JPEG</b></td>
<td>stegdetect (abbandonato), ispezione DCT manuale</td>
<td>L'agente analizza istogramma DCT, doppia compressione, tabelle di quantizzazione, analisi EXIF approfondita, confronto miniature, campi commento</td>
</tr>
<tr>
<td><b>Stego audio</b></td>
<td>Audacity + script LSB manuali</td>
<td>L'agente esegue chi-quadrato LSB, analisi spettrale, verifica LSB delle regioni di silenzio, rilevamento echo hiding, estrazione metadati</td>
</tr>
<tr>
<td><b>Stego di testo</b></td>
<td>Strumenti web, ispezione manuale</td>
<td>L'agente rileva caratteri a larghezza zero, codifica spazi bianchi, Unicode invisibile, omoglifi, acrostici &mdash; e pu&ograve; incorporare/estrarre messaggi ZWC</td>
</tr>
<tr>
<td><b>Dipendenze</b></td>
<td>Ruby, Java, Perl, Python, C, strumenti web</td>
<td><code>npx -y steganography-mcp</code> &mdash; 4 dipendenze, TypeScript puro</td>
</tr>
<tr>
<td><b>Chiavi API</b></td>
<td>N/A (ma toolchain frammentata)</td>
<td>Zero. 100 % offline, nessuna chiamata esterna</td>
</tr>
<tr>
<td><b>Output</b></td>
<td>Testo grezzo, immagini, correlazione manuale</td>
<td>JSON strutturato &mdash; l'IA correla i risultati automaticamente</td>
</tr>
</tbody>
</table>

---

## Avvio rapido

### Opzione 1: npx (senza installazione)

```bash
npx -y steganography-mcp
```

Tutti i 60 strumenti funzionano immediatamente. Nessuna chiave API. Nessuna configurazione. 100 % offline.

### Opzione 2: bunx (pi&ugrave; veloce)

```bash
bunx steganography-mcp
```

### Opzione 3: Clonare

```bash
git clone https://github.com/badchars/steganography-mcp.git
cd steganography-mcp
bun install
```

### Connettere al vostro agente IA

<details open>
<summary><b>Claude Code</b></summary>

```bash
# Con npx
claude mcp add steganography -- npx -y steganography-mcp

# Con clone locale
claude mcp add steganography -- bun run /path/to/steganography-mcp/src/index.ts
```

</details>

<details>
<summary><b>Claude Desktop</b></summary>

Aggiungere in `~/Library/Application Support/Claude/claude_desktop_config.json`:

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
<summary><b>Cursor / Windsurf / altri client MCP</b></summary>

Stesso formato di configurazione JSON. Puntate il comando su `npx -y steganography-mcp` o sul percorso della vostra installazione locale.

</details>

### Iniziare l'analisi

```
Tu: "Controlla questa immagine per dati nascosti"
```

&Egrave; tutto. L'agente esegue analisi chi-quadrato, analisi RS, mappatura dell'entropia, estrazione dei metadati, rilevamento di dati aggiunti e scansione delle firme degli strumenti &mdash; automaticamente.

---

## Cosa pu&ograve; fare l'IA

### Risolutore di sfide CTF

```
Tu: "Risolvi questa sfida CTF di steganografia — l'immagine &egrave; in challenge.png"

Agente: -> img_detect: La steganalisi chi-quadrato rileva incorporamento LSB
           (p=0,00012), l'analisi RS stima un tasso di incorporamento del 38 %,
           anomalia di entropia nei blocchi (12,4)-(15,8)
        -> img_lsb_extract: 1.247 byte estratti dagli LSB del canale RGB
        -> crypto_detect: I dati corrispondono al pattern Base64 (confidenza: 0,95)
        -> crypto_decode: "Q1RGe3N0M2cwX21hc3Rlcn0=" -> "CTF{st3g0_master}"
        -> img_known_tools: Firma OpenStego rilevata nei chunk PNG

        "Flag trovata: CTF{st3g0_master}
         L'immagine utilizza steganografia LSB incorporata da OpenStego.
         Il payload era codificato in Base64 nei bit meno significativi
         RGB con un tasso di incorporamento del 38 %."
```

### Indagine forense digitale

```
Tu: "Analizza suspect.png e suspect.wav per comunicazioni clandestine"

Agente: -> img_detect: Nessuna stego LSB rilevata, ma trovati dati aggiunti
           (12.847 byte dopo il marcatore PNG IEND)
        -> file_identify: I dati aggiunti iniziano con firma ZIP (PK)
        -> img_metadata: Il chunk PNG tEXt contiene una chiave insolita "comm"
           con valore Base64
        -> audio_detect: Il file WAV presenta anomalia chi-quadrato LSB (p=0,003)
        -> audio_silence: 3 sezioni silenziose con LSB attivi rilevate
        -> audio_lsb_extract: 2.048 byte di dati nascosti estratti

        "Entrambi i file contengono dati nascosti:
         1. suspect.png ha un archivio ZIP aggiunto dopo il marcatore EOF
            del PNG, pi&ugrave; un messaggio codificato in Base64 nei metadati
         2. suspect.wav contiene steganografia LSB, specificamente nelle
            sezioni silenziose — un forte indicatore di occultamento intenzionale.
         Si raccomanda di estrarre lo ZIP e analizzare il payload del WAV."
```

### Rilevamento di testo a larghezza zero

```
Tu: "Questa email sembra normale ma potrebbe contenere testo nascosto"

Agente: -> text_detect: 847 caratteri a larghezza zero rilevati tra
           i caratteri visibili
        -> text_zwc_detect: ZWSP (342), ZWNJ (505) trovati in 127
           posizioni nel testo
        -> text_zwc_extract: La decodifica binaria produce "EXFIL-ROUTE-7"
        -> text_invisible_scan: 3 caratteri Unicode invisibili aggiuntivi
           (U+2060, U+FEFF) trovati nella sezione intestazione

        "L'email contiene un messaggio nascosto codificato con caratteri
         a larghezza zero: 'EXFIL-ROUTE-7'. 847 caratteri invisibili sono
         dispersi nel testo visibile utilizzando la codifica binaria
         ZWSP/ZWNJ. Inoltre, 3 caratteri Word Joiner e BOM sono stati
         trovati nell'intestazione — probabilmente artefatti dei metadati."
```

### Analisi forense JPEG

```
Tu: "Questa immagine JPEG &egrave; autentica o &egrave; stata manomessa?"

Agente: -> jpeg_structure: 14 marcatori analizzati, struttura JFIF normale
        -> jpeg_double_compression: Doppia compressione RILEVATA —
           punteggio artefatti di blocco 0,73, rapporto anomalia
           di quantizzazione 0,81
        -> jpeg_quantization: Qualit&agrave; ~75 (luminanza), ma i pattern
           residui suggeriscono qualit&agrave; originale ~92
        -> jpeg_exif_deep: EXIF indica "iPhone 14 Pro" ma il campo Software
           indica "Adobe Photoshop 25.0"
        -> jpeg_thumbnail_compare: Le dimensioni della miniatura NON
           corrispondono all'immagine principale (miniatura: 4032x3024,
           principale: 2048x1536)

        "Questo JPEG &egrave; stato manomesso. Prove:
         1. Doppia compressione rilevata — l'immagine &egrave; stata decodificata
            e ricodificata a qualit&agrave; inferiore (originale ~92, attuale ~75)
         2. EXIF dichiara iPhone 14 Pro ma il campo software rivela
            modifica con Photoshop
         3. La miniatura proviene dalla cattura originale 4032x3024 ma
            l'immagine principale &egrave; stata ridimensionata a 2048x1536
         Tutti e tre i riscontri confermano indipendentemente una
         modifica post-cattura."
```

---

## Riferimento strumenti (60 strumenti)

### Panoramica per categoria

| Categoria | Strumenti | Descrizione |
|-----------|-----------|-------------|
| [Steganalisi immagini](#-steganalisi-immagini-14) | 14 | Rilevamento LSB, chi-quadrato, analisi RS, mappatura entropia, piani di bit, istogramma, metadati, firme strumenti |
| [Analisi JPEG](#-analisi-jpeg-7) | 7 | Istogramma DCT, doppia compressione, tabelle di quantizzazione, EXIF approfondito, forensica miniature, analisi commenti |
| [Steganalisi audio](#-steganalisi-audio-7) | 7 | Rilevamento LSB WAV, analisi spettrale, analisi regioni di silenzio, echo hiding, estrazione metadati |
| [Testo e Unicode](#-testo-e-unicode-10) | 10 | Caratteri a larghezza zero, codifica spazi bianchi, Unicode invisibile, omoglifi, acrostici, analisi Unicode |
| [Forensica dei file](#-forensica-dei-file-10) | 10 | Magic bytes, rilevamento poliglotta, file incorporati, dati aggiunti, entropia, dump hex, stringhe, intestazioni |
| [Analisi documenti](#-analisi-documenti-5) | 5 | Contenuto PDF nascosto, metadati PDF, stream PDF, contenuto HTML nascosto, metadati XML |
| [Codifica e crittografia](#-codifica-e-crittografia-7) | 7 | Rilevamento codifica, decodificatore multi-formato, analisi di frequenza, entropia, forza bruta XOR, ID hash, pattern di cifratura |

---

<details open>
<summary><h3>Steganalisi immagini (14)</h3></summary>

| Strumento | Descrizione |
|-----------|-------------|
| `img_detect` | Rilevamento automatico di steganografia in un'immagine. Esegue chi-quadrato, analisi RS, entropia, metadati, dati aggiunti e verifiche di firme strumenti. Restituisce un report JSON completo |
| `img_lsb_detect` | Rilevamento statistico di steganografia LSB. Esegue analisi chi-quadrato e analisi di coppie di campioni su ciascun canale di colore indipendentemente |
| `img_lsb_extract` | Estrarre dati nascosti dagli LSB di un'immagine. Estrae bit dai canali e piano di bit specificati, tenta la decodifica UTF-8 e mostra il dump hex |
| `img_lsb_embed` | Incorporare un messaggio in un'immagine tramite steganografia LSB. Legge un file PNG, incorpora il messaggio nei bit meno significativi e scrive un nuovo file PNG |
| `img_bitplane` | Estrarre e visualizzare un piano di bit specifico di un canale immagine. Mostra dimensioni, percentuale di bit a 1 e un'anteprima in arte ASCII |
| `img_chi_square` | Attacco di steganalisi chi-quadrato su ciascun canale di colore indipendentemente. Rileva la sostituzione LSB verificando se le coppie di valori di pixel adiacenti sono equalizzate |
| `img_rs_analysis` | Steganalisi RS (Regular-Singular) con il metodo Fridrich-Goljan-Du. Analizza gruppi di pixel per stimare il tasso di incorporamento LSB per canale |
| `img_histogram` | Generare un istogramma dei valori dei pixel con rilevamento anomalie. Rileva anomalie di Coppie di Valori (PoV) che indicano steganografia LSB |
| `img_entropy_map` | Analisi dell'entropia per blocchi di un'immagine. Divide l'immagine in blocchi e calcola l'entropia di Shannon per blocco, segnalando le regioni ad alta entropia |
| `img_metadata` | Estrazione approfondita dei metadati da un'immagine. Per PNG: chunk di testo, lista chunk, info IHDR. Per JPEG: EXIF, commenti, tabelle di quantizzazione, lista marcatori |
| `img_appended_data` | Rilevare ed estrarre dati aggiunti dopo il marcatore EOF dell'immagine. Verifica dati nascosti dopo PNG IEND, JPEG EOI o il limite di dimensione BMP |
| `img_compare` | Confronto pixel per pixel di due immagini. Riporta conteggio pixel identici/diversi, differenza massima e quali canali sono interessati |
| `img_channel_analysis` | Analisi statistica per canale per R, G, B e A. Riporta media, deviazione standard, entropia, min, max e conteggio valori unici |
| `img_known_tools` | Scansionare i byte del file immagine per firme note di strumenti di steganografia. Verifica contro un database di pattern da OpenStego, Steghide, JSteg, F5 e altri |

</details>

<details>
<summary><h3>Analisi JPEG (7)</h3></summary>

| Strumento | Descrizione |
|-----------|-------------|
| `jpeg_structure` | Analizzare marcatori/segmenti JPEG con offset e dimensioni. Mostra la struttura interna inclusi tutti i marcatori, posizioni e lunghezze dei segmenti |
| `jpeg_dct_histogram` | Analisi della distribuzione dei coefficienti DCT per il rilevamento di steganografia. Analizza la distribuzione dei valori pixel del canale Y e i dati di entropia SOS per rilevare anomalie causate da JSteg, F5 e OutGuess |
| `jpeg_double_compression` | Rilevare artefatti di doppia compressione JPEG. Identifica artefatti di blocco caratteristici e anomalie nelle tabelle di quantizzazione &mdash; un indicatore comune di manomissione dell'immagine o incorporamento stego |
| `jpeg_quantization` | Analisi delle tabelle di quantizzazione con stima della qualit&agrave;. Mostra tutte le tabelle di quantizzazione in formato griglia 8x8 e stima il fattore di qualit&agrave; JPEG |
| `jpeg_exif_deep` | Analisi EXIF approfondita con coordinate GPS, timestamp, info software, miniature, note del produttore e tutte le voci IFD. Segnala i campi di interesse forense |
| `jpeg_thumbnail_compare` | Confrontare la miniatura EXIF con l'immagine JPEG principale. Una discrepanza di dimensioni o contenuto indica una modifica post-cattura &mdash; un artefatto forense comune |
| `jpeg_comment` | Estrarre e analizzare i marcatori COM (commento) JPEG. Verifica pattern di dati nascosti, commenti insolitamente grandi e contenuto ad alta entropia |

</details>

<details>
<summary><h3>Steganalisi audio (7)</h3></summary>

| Strumento | Descrizione |
|-----------|-------------|
| `audio_detect` | Rilevamento automatico di steganografia audio in un file WAV. Esegue chi-quadrato LSB, analisi dell'entropia, ispezione dei metadati e verifica dei dati aggiunti |
| `audio_lsb_detect` | Analisi statistica degli LSB dei campioni PCM. Esegue un test chi-quadrato sugli LSB raggruppati per coppie di valori per rilevare steganografia a sostituzione LSB |
| `audio_lsb_extract` | Estrarre dati LSB dai campioni audio. Legge il bit meno significativo di ogni campione PCM e tenta di decodificare i dati nascosti |
| `audio_spectrum` | Analisi spettrale per segnali nascosti nell'audio WAV. Analizza la distribuzione dei valori dei campioni, il tasso di attraversamento dello zero, l'energia RMS per blocco e rileva sezioni silenziose anomale |
| `audio_metadata` | Estrarre metadati da un file WAV inclusi chunk RIFF INFO, dettagli del formato e informazioni su tutti i chunk |
| `audio_silence` | Analizzare le sezioni silenziose nell'audio WAV per dati nascosti. Trova regioni con campioni vicini allo zero e verifica i loro LSB &mdash; sezioni silenziose con LSB attivi sono un forte indicatore di stego |
| `audio_echo_detect` | Rilevamento di echo hiding tramite analisi di autocorrelazione. Calcola l'autocorrelazione normalizzata ai ritardi di eco comuni. Pattern di eco regolari indicano occultamento steganografico per eco |

</details>

<details>
<summary><h3>Testo e Unicode (10)</h3></summary>

| Strumento | Descrizione |
|-----------|-------------|
| `text_detect` | Rilevamento automatico di steganografia testuale. Verifica caratteri a larghezza zero, codifica spazi bianchi, Unicode invisibile, omoglifi e pattern insoliti |
| `text_zwc_detect` | Rilevare caratteri a larghezza zero (ZWSP, ZWNJ, ZWJ, BOM) nel testo. Riporta posizioni, conteggi e lunghezza potenziale del messaggio codificato |
| `text_zwc_extract` | Decodificare un messaggio codificato con caratteri a larghezza zero. Estrae i caratteri ZWC e decodifica in binario: ZWSP=0, ZWNJ=1 (tenta entrambe le polarit&agrave;) |
| `text_zwc_embed` | Incorporare un messaggio segreto in un testo di copertura utilizzando caratteri a larghezza zero. Codifica il messaggio in binario e mappa i bit su ZWSP(0)/ZWNJ(1) |
| `text_whitespace_detect` | Rilevare codifica per spazi bianchi nel testo. Verifica ogni riga per pattern di spazi finali dove spazio=0 e tabulazione=1 potrebbero codificare dati binari |
| `text_whitespace_extract` | Estrarre un messaggio codificato per spazi bianchi dal testo. Legge gli spazi finali di ogni riga e decodifica la codifica binaria spazio=0/tabulazione=1 |
| `text_invisible_scan` | Scansionare il testo per TUTTI i caratteri Unicode invisibili. Verifica ogni carattere contro il database completo dei caratteri invisibili e riporta posizioni e nomi |
| `text_homoglyph` | Rilevare sostituzioni di omoglifi Unicode nel testo. Identifica caratteri non-ASCII che somigliano visivamente a lettere ASCII (a cirillica vs a latina, ecc.) |
| `text_unicode_analysis` | Analisi completa della distribuzione dei caratteri Unicode. Categorizza tutti i caratteri per blocco di script, esegue analisi dell'entropia e rileva mescolanza sospetta di script |
| `text_acrostic` | Rilevare pattern di prima lettera, prima parola, ultima lettera, ultima parola o n-esimo carattere (messaggi acrostici) nascosti nelle righe di testo |

</details>

<details>
<summary><h3>Forensica dei file (10)</h3></summary>

| Strumento | Descrizione |
|-----------|-------------|
| `file_identify` | Identificazione del tipo di file tramite magic bytes. Legge l'intestazione del file e la confronta con un database completo di firme di file note. Verifica discrepanze di estensione |
| `file_polyglot` | Rilevare file poliglotta validi come due o pi&ugrave; formati simultaneamente. Verifica firme di file multiple valide a offset diversi (PDF+ZIP, PNG+PDF, ecc.) |
| `file_embedded` | Cercare file incorporati all'interno di un binario, simile a binwalk. Cerca firme di magic bytes note a ogni offset per scoprire file nascosti o aggiunti |
| `file_appended` | Rilevare dati aggiunti dopo il marcatore EOF specifico del formato. Supporta PNG (IEND), JPEG (FFD9), BMP, ZIP (EOCD) e PDF (%%EOF) |
| `file_entropy` | Analisi dell'entropia sezione per sezione. Calcola l'entropia di Shannon per blocco e complessivamente, segnalando sezioni anomale ad alta entropia |
| `file_entropy_visual` | Visualizzazione ASCII dell'entropia di un file. Genera un grafico a barre testuale che mostra i livelli di entropia attraverso il file per il rilevamento visivo di anomalie |
| `file_strings` | Estrarre stringhe stampabili e Unicode da file binari. Cerca sequenze di caratteri stampabili e le riporta con gli offset del file. Supporta ASCII, UTF-8, UTF-16 |
| `file_hex` | Dump hex con barra laterale ASCII. Formato tradizionale di editor esadecimale con indirizzi di offset, byte hex e rappresentazione ASCII stampabile |
| `file_header` | Analisi approfondita di intestazione e struttura per formati noti. Analizza PNG IHDR, JPEG SOF, intestazione info BMP, intestazioni file locali ZIP e versione/metadati PDF |
| `file_compare` | Diff binario tra due file. Confronto byte per byte riportando differenze con offset, percentuale identica e rilevamento di differenze solo LSB per analisi stego |

</details>

<details>
<summary><h3>Analisi documenti (5)</h3></summary>

| Strumento | Descrizione |
|-----------|-------------|
| `doc_pdf_hidden` | Rilevamento di contenuto PDF nascosto. Cerca JavaScript, azioni automatiche, OpenAction, annotazioni nascoste, testo invisibile, file incorporati e altro contenuto occulto |
| `doc_pdf_metadata` | Estrazione di metadati PDF. Analizza il dizionario /Info e i blocchi di metadati XMP per attribuzione forense e analisi della provenienza del documento |
| `doc_pdf_streams` | Analisi degli stream PDF. Localizza tutti i blocchi stream/endstream, tenta la decompressione zlib e riporta dimensioni ed entropia per trovare dati nascosti |
| `doc_html_hidden` | Rilevamento di contenuto HTML nascosto. Cerca commenti, elementi display:none, attributi data-*, input nascosti, contenuto base64, elementi a dimensione zero e testo invisibile |
| `doc_xml_metadata` | Estrazione di metadati XML e documenti Office. Analizza Dublin Core, propriet&agrave; Microsoft Office, istruzioni di elaborazione e altri campi di metadati |

</details>

<details>
<summary><h3>Codifica e crittografia (7)</h3></summary>

| Strumento | Descrizione |
|-----------|-------------|
| `crypto_detect` | Rilevamento automatico del tipo di codifica di una stringa di input. Testa contro tutti i pattern noti (Base64, hex, binario, morse, codifica URL, entit&agrave; HTML, ecc.) e restituisce le corrispondenze ordinate per confidenza |
| `crypto_decode` | Decodificatore multi-formato con supporto per Base64, hex, binario, decimale, ottale, codifica URL, ROT13, Base32, codice Morse ed entit&agrave; HTML. La modalit&agrave; automatica rileva prima la codifica |
| `crypto_frequency` | Analisi di frequenza dei caratteri per la crittoanalisi. Conta le occorrenze dei caratteri, confronta con la frequenza standard inglese (ETAOINSHRDLU) e calcola l'Indice di Coincidenza |
| `crypto_entropy` | Calcolo e classificazione dell'entropia di Shannon per le stringhe. Calcola l'entropia a livello di carattere e di byte, classificando in categorie da dati ripetuti a cifrati/casuali |
| `crypto_xor` | Forza bruta di chiave XOR per chiavi a byte singolo e multiplo. Prova tutte le 256 chiavi a byte singolo e valuta per probabilit&agrave; di testo inglese. Usa l'IC per la stima della lunghezza di chiave multi-byte |
| `crypto_hash_id` | Identificazione del tipo di hash. Confronta l'input con pattern di hash noti per lunghezza e formato (MD5, SHA-1, SHA-256, SHA-512, bcrypt, CRC32, NTLM, ecc.) |
| `crypto_patterns` | Rilevamento di pattern di cifratura e codifica noti. Analizza il testo per cifrario di Cesare, cifrario a sostituzione, Vigen&egrave;re, trasposizione rail fence, Atbash e testo invertito |

</details>

---

## Utilizzo CLI

```bash
# Mostrare l'aiuto
npx -y steganography-mcp --help

# Elencare tutti i 60 strumenti con descrizioni
npx -y steganography-mcp --list

# Rilevare steganografia in un'immagine
npx -y steganography-mcp --tool img_detect '{"file_path":"challenge.png"}'

# Estrarre messaggio nascosto dagli LSB
npx -y steganography-mcp --tool img_lsb_extract '{"file_path":"stego.png"}'

# Steganalisi chi-quadrato
npx -y steganography-mcp --tool img_chi_square '{"file_path":"suspect.png"}'

# Analisi RS (metodo Fridrich-Goljan-Du)
npx -y steganography-mcp --tool img_rs_analysis '{"file_path":"suspect.png"}'

# Rilevamento doppia compressione JPEG
npx -y steganography-mcp --tool jpeg_double_compression '{"file_path":"photo.jpg"}'

# Analisi EXIF approfondita
npx -y steganography-mcp --tool jpeg_exif_deep '{"file_path":"photo.jpg"}'

# Rilevamento steganografia audio
npx -y steganography-mcp --tool audio_detect '{"file_path":"message.wav"}'

# Rilevare codifica caratteri a larghezza zero
npx -y steganography-mcp --tool text_zwc_detect '{"text":"testo sospetto qui"}'

# Incorporare un messaggio nascosto con caratteri a larghezza zero
npx -y steganography-mcp --tool text_zwc_embed '{"text":"testo di copertura","message":"segreto"}'

# Identificare tipo di file e rilevare poliglotta
npx -y steganography-mcp --tool file_polyglot '{"file_path":"sospetto.pdf"}'

# Cercare file incorporati (stile binwalk)
npx -y steganography-mcp --tool file_embedded '{"file_path":"mystery.bin"}'

# Visualizzazione entropia
npx -y steganography-mcp --tool file_entropy_visual '{"file_path":"data.bin"}'

# Rilevamento automatico codifica
npx -y steganography-mcp --tool crypto_detect '{"input":"aGVsbG8gd29ybGQ="}'

# Forza bruta XOR
npx -y steganography-mcp --tool crypto_xor '{"input":"4f5243484e"}'

# Rilevare pattern di cifratura
npx -y steganography-mcp --tool crypto_patterns '{"input":"Gur dhvpx oebja sbk"}'

# Con Bun (avvio pi&ugrave; veloce)
bunx steganography-mcp --tool img_detect '{"file_path":"image.png"}'
```

---

## Casi d'uso

### Sfide CTF
Risolvete sfide di steganografia nelle competizioni Capture The Flag. L'agente IA pu&ograve; applicare sistematicamente tutte le tecniche di rilevamento &mdash; analisi LSB, ispezione dei metadati, dati aggiunti, rilevamento della codifica e identificazione dei cifrari &mdash; per trovare flag nascosti in immagini, file audio, documenti e testo.

### Forensica digitale
Rilevate canali di comunicazione clandestini nelle indagini forensi. Analizzate file sospetti per dati nascosti utilizzando la steganalisi statistica (chi-quadrato, analisi RS), verificate dati aggiunti dopo i marcatori EOF, cercate file incorporati e identificate firme di strumenti di steganografia.

### Ricerca sulla sicurezza
Analizzate strumenti e tecniche di steganografia. Confrontate immagini originali e stego pixel per pixel, studiate le distribuzioni dei coefficienti DCT nella stego JPEG, misurate i cambiamenti di entropia causati dall'incorporamento e fate reverse engineering degli schemi di codifica.

### Formazione
Imparate come funzionano le tecniche di steganografia. Incorporate ed estraete messaggi LSB, codificate testo con caratteri a larghezza zero, visualizzate piani di bit e mappe di entropia, analizzate strutture di file con dump esadecimali e studiate pattern di cifratura con analisi di frequenza.

### Risposta agli incidenti
Durante la risposta agli incidenti, verificate documenti e immagini per canali di esfiltrazione nascosti. Scansionate PDF alla ricerca di JavaScript nascosto e file incorporati, rilevate codifica con caratteri a larghezza zero nelle email, identificate file poliglotta e analizzate codifiche sospette.

---

## Architettura

```
src/
  index.ts                    # Punto di ingresso CLI (--help, --list, --tool, server stdio)
  protocol/
    mcp-server.ts             # Configurazione del server MCP (trasporto stdio)
    tools.ts                  # Registro strumenti — tutti i 60 strumenti assemblati qui
  types/
    index.ts                  # Tipi condivisi (ToolDef, ToolContext, ToolResult)
  utils/
    binary.ts                 # Lettura file binari, dump hex, rilevamento formato
    stats.ts                  # Entropia di Shannon, chi-quadrato, frequenza byte
    cache.ts                  # Cache TTL
    png-parser.ts             # Parser PNG puro TS (IHDR, chunk, dati pixel)
    jpeg-parser.ts            # Parser JPEG puro TS (marcatori, EXIF, quantizzazione)
    wav-parser.ts             # Parser WAV puro TS (chunk RIFF, campioni PCM)
    bmp-parser.ts             # Parser BMP puro TS (intestazione, dati pixel)
  image/                      # Strumenti di steganalisi immagini (14)
  jpeg/                       # Strumenti di analisi JPEG (7)
  audio/                      # Strumenti di steganalisi audio (7)
  text/                       # Strumenti testo e Unicode (10)
  file/                       # Strumenti di forensica file (10)
  document/                   # Strumenti di analisi documenti (5)
  crypto/                     # Strumenti di codifica e crittografia (7)
  data/
    encoding-patterns.ts      # Pattern regex di codifica + decodificatori
    magic-bytes.ts            # Database di firme file (100+ formati)
    stego-signatures.ts       # Firme note di strumenti di steganografia
    unicode-invisible.ts      # Database di caratteri Unicode invisibili
```

**Decisioni di progettazione:**

- **4 dipendenze, nient'altro** &mdash; `@modelcontextprotocol/sdk` per il protocollo MCP, `zod` per la validazione degli input, `pngjs` per l'accesso ai pixel PNG, `jpeg-js` per la decodifica JPEG. Nessun albero di dipendenze sovraccarico. Nessun modulo nativo. Nessun binding C. Niente Python. Niente Java.
- **100 % offline** &mdash; Ogni strumento viene eseguito interamente in locale. Nessuna richiesta HTTP. Nessuna chiamata API. Nessuna telemetria. Nessuna dipendenza cloud. I vostri file non lasciano mai la vostra macchina.
- **Analisi statistica in TypeScript puro** &mdash; Test chi-quadrato, analisi RS (Fridrich-Goljan-Du), Analisi di Coppie di Campioni, entropia di Shannon, Indice di Coincidenza e analisi di frequenza sono tutti implementati in TypeScript puro. Nessuna libreria matematica esterna.
- **Parser di formato personalizzati** &mdash; Chunk PNG, marcatori/EXIF/tabelle di quantizzazione JPEG, chunk RIFF WAV e intestazioni BMP vengono analizzati con zero dipendenze esterne tramite i parser `utils/`. Ci&ograve; consente un'analisi approfondita specifica per formato che le librerie generiche non possono offrire.
- **7 provider, 1 server** &mdash; Ogni categoria di analisi &egrave; un modulo indipendente. L'agente IA sceglie quali strumenti utilizzare in base al contesto dell'indagine.
- **Pattern ToolDef pulito** &mdash; Ogni strumento segue lo stesso pattern `{ name, description, schema, execute }`. Aggiungere un nuovo strumento significa un singolo oggetto nel modulo appropriato.
- **Validazione Zod su ogni campo** &mdash; Ogni campo dello schema ha `.describe()` per il contesto dell'agente IA. Gli input non validi vengono intercettati prima dell'esecuzione con messaggi di errore chiari.

---

## Parte della suite di sicurezza MCP

| Progetto | Dominio | Strumenti |
|----------|---------|-----------|
| [hackbrowser-mcp](https://github.com/badchars/hackbrowser-mcp) | Test di sicurezza basati su browser | 39 strumenti |
| [cloud-audit-mcp](https://github.com/badchars/cloud-audit-mcp) | Sicurezza cloud (AWS/Azure/GCP) | 38 strumenti |
| [github-security-mcp](https://github.com/badchars/github-security-mcp) | Postura di sicurezza GitHub | 39 strumenti |
| [cve-mcp](https://github.com/badchars/cve-mcp) | Intelligence sulle vulnerabilit&agrave; | 23 strumenti |
| [osint-mcp-server](https://github.com/badchars/osint-mcp-server) | OSINT e ricognizione | 37 strumenti |
| [darknet-mcp-server](https://github.com/badchars/darknet-mcp-server) | Dark web e intelligence sulle minacce | 66 strumenti |
| [dns-security-mcp](https://github.com/badchars/dns-security-mcp) | Intelligence di sicurezza DNS | 103 strumenti |
| **steganography-mcp** | **Analisi steganografica** | **60 strumenti** |

---

## Contribuire

I contributi sono benvenuti. Consultate [CONTRIBUTING.md](../../CONTRIBUTING.md) per le linee guida.

---

<p align="center">
<b>Solo per ricerca di sicurezza autorizzata e scopi educativi.</b><br>
Assicuratevi sempre di avere l'autorizzazione adeguata prima di eseguire analisi steganografica su file che non vi appartengono.
</p>

<p align="center">
  <a href="../../LICENSE">Licenza MIT</a> &bull; Creato da <a href="https://orhanyildirim.us">Orhan Yildirim</a> &bull; <a href="mailto:contact@orhanyildirim.us">contact@orhanyildirim.us</a>
</p>
