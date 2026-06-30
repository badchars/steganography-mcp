<p align="center">
  <a href="../../README.md">English</a> |
  <a href="README.zh.md">中文</a> |
  <a href="README.zh-TW.md">繁體中文</a> |
  <a href="README.ko.md">한국어</a> |
  <a href="README.ja.md">日本語</a> |
  <a href="README.de.md">Deutsch</a> |
  <a href="README.es.md">Español</a> |
  <strong>Français</strong> |
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

<h3 align="center">La bo&icirc;te &agrave; outils d'analyse st&eacute;ganographique la plus compl&egrave;te pour les agents IA.</h3>

<p align="center">
  D&eacute;tection LSB, st&eacute;ganalyse chi-carr&eacute;, analyse RS, forensique DCT, st&eacute;ganographie audio, encodage de texte en caract&egrave;res de largeur z&eacute;ro, forensique de fichiers, d&eacute;tection polyglotte, identification d'encodage, analyse JPEG avanc&eacute;e, st&eacute;ganographie vid&eacute;o/GIF/MP3, st&eacute;ganographie r&eacute;seau, analyse &agrave; spectre &eacute;tal&eacute;, BPCS, st&eacute;ganographie d'archives, cr&eacute;ation et incorporation, st&eacute;ganalyse de codes QR &mdash; unifi&eacute;s en un seul serveur MCP.<br>
  <b>128 outils. 17 cat&eacute;gories. 4 d&eacute;pendances. 100 % hors ligne.</b> Aucune cl&eacute; API requise. Chaque outil s'ex&eacute;cute localement.
</p>

<br>

<p align="center">
  <a href="#le-probl&egrave;me">Le probl&egrave;me</a> &bull;
  <a href="#ce-qui-le-diff&eacute;rencie">Ce qui le diff&eacute;rencie</a> &bull;
  <a href="#d&eacute;marrage-rapide">D&eacute;marrage rapide</a> &bull;
  <a href="#ce-que-lia-peut-faire">Ce que l'IA peut faire</a> &bull;
  <a href="#r&eacute;f&eacute;rence-des-outils-128-outils">Outils (128)</a> &bull;
  <a href="#utilisation-cli">Utilisation CLI</a> &bull;
  <a href="#architecture">Architecture</a> &bull;
  <a href="../../CONTRIBUTING.md">Contribuer</a>
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

## Le probl&egrave;me

La st&eacute;ganographie est l'art de dissimuler des donn&eacute;es &agrave; la vue de tous &mdash; dans des images, des fichiers audio, des documents et m&ecirc;me du texte Unicode. Elle est utilis&eacute;e dans les comp&eacute;titions CTF, les enqu&ecirc;tes forensiques num&eacute;riques, les canaux de communication clandestins et les charges utiles de malware. Sa d&eacute;tection n&eacute;cessite une combinaison d'analyse statistique, d'analyse sp&eacute;cifique au format, de mesure d'entropie et d'expertise du domaine.

```
Flux de travail traditionnel d'analyse st&eacute;ganographique :
  d&eacute;tecter la st&eacute;go d'image        ->  zsteg + stegsolve (2 outils, Ruby + Java)
  analyse chi-carr&eacute;                ->  script Python personnalis&eacute;
  analyse RS                       ->  code MATLAB/Python personnalis&eacute;
  forensique JPEG DCT              ->  stegdetect (outil C abandonn&eacute; de 2004)
  extraire les donn&eacute;es LSB         ->  zsteg + steghide + openstego (3 outils)
  st&eacute;ganographie audio              ->  Audacity manuel + scripts personnalis&eacute;s
  d&eacute;tection texte largeur z&eacute;ro     ->  outils web + inspection manuelle
  forensique de fichiers / binwalk ->  binwalk + foremost + xxd (3 outils)
  m&eacute;tadonn&eacute;es EXIF                 ->  exiftool (d&eacute;pendance Perl)
  d&eacute;tection d'encodage             ->  CyberChef web UI + supposition manuelle
  ─────────────────────────────────
  Total : 10+ outils, 5+ langages, des heures de corr&eacute;lation manuelle
```

**steganography-mcp** donne &agrave; votre agent IA 128 outils r&eacute;partis en 17 cat&eacute;gories via le [Model Context Protocol](https://modelcontextprotocol.io). L'agent effectue la st&eacute;ganalyse d'images, la forensique JPEG, l'analyse JPEG avanc&eacute;e, l'analyse audio, la d&eacute;tection de st&eacute;ganographie textuelle, la forensique de fichiers, l'analyse de documents, l'identification d'encodage, la st&eacute;ganographie vid&eacute;o/GIF/MP3, la st&eacute;ganographie r&eacute;seau, l'analyse &agrave; spectre &eacute;tal&eacute;, l'analyse BPCS, la st&eacute;ganographie d'archives, la cr&eacute;ation et incorporation, et la st&eacute;ganalyse de codes QR &mdash; le tout dans une seule conversation, le tout ex&eacute;cut&eacute; &agrave; 100 % localement sans aucune d&eacute;pendance &agrave; des services externes.

```
Avec steganography-mcp :
  Vous : "Analyse cette image de d&eacute;fi CTF pour trouver des donn&eacute;es cach&eacute;es"

  Agent : -> img_detect : Chi-carr&eacute; p=0,0001 (incorporation LSB d&eacute;tect&eacute;e),
             l'analyse RS estime un taux d'incorporation de 42 %, anomalie
             d'entropie dans le quadrant inf&eacute;rieur droit
          -> img_lsb_extract : 847 octets extraits des LSBs RGB
          -> crypto_detect : Les donn&eacute;es extraites sont encod&eacute;es en Base64
          -> crypto_decode : D&eacute;cod&eacute; en "FLAG{hidden_in_plain_sight_2024}"
          -> img_known_tools : Correspondance de signature avec OpenStego

          "L'image contient de la st&eacute;ganographie LSB incorpor&eacute;e avec OpenStego.
           Le test chi-carr&eacute; confirme le remplacement LSB dans les trois
           canaux RGB avec un taux d'incorporation de 42 %. La charge utile
           cach&eacute;e est encod&eacute;e en Base64 et se d&eacute;code en le drapeau :
           FLAG{hidden_in_plain_sight_2024}"
```

---

## Ce qui le diff&eacute;rencie

La plupart des outils de st&eacute;ganographie sont des utilitaires &agrave; usage unique. steganography-mcp donne &agrave; votre agent IA la capacit&eacute; de **raisonner sur toutes les techniques st&eacute;ganographiques simultan&eacute;ment**.

<table>
<thead>
<tr>
<th></th>
<th>Approche traditionnelle</th>
<th>steganography-mcp</th>
</tr>
</thead>
<tbody>
<tr>
<td><b>Interface</b></td>
<td>10+ outils CLI, 5+ langages, interfaces web</td>
<td>MCP &mdash; l'agent IA appelle les outils de mani&egrave;re conversationnelle</td>
</tr>
<tr>
<td><b>Couverture</b></td>
<td>Une technique &agrave; la fois</td>
<td>17 cat&eacute;gories, 128 outils en parall&egrave;le</td>
</tr>
<tr>
<td><b>Analyse d'image</b></td>
<td>zsteg (Ruby), stegsolve (Java), scripts personnalis&eacute;s</td>
<td>L'agent ex&eacute;cute chi-carr&eacute;, analyse RS, SPA, carte d'entropie, histogramme, extraction de plans de bits, m&eacute;tadonn&eacute;es et d&eacute;tection de signatures d'outils &mdash; tout en une fois</td>
</tr>
<tr>
<td><b>Forensique JPEG</b></td>
<td>stegdetect (abandonn&eacute;), inspection DCT manuelle</td>
<td>L'agent analyse l'histogramme DCT, la double compression, les tables de quantification, l'analyse EXIF approfondie, la comparaison de miniatures, les champs de commentaires</td>
</tr>
<tr>
<td><b>St&eacute;go audio</b></td>
<td>Audacity + scripts LSB manuels</td>
<td>L'agent effectue le chi-carr&eacute; LSB, l'analyse spectrale, la v&eacute;rification LSB des r&eacute;gions de silence, la d&eacute;tection de dissimulation par &eacute;cho, l'extraction de m&eacute;tadonn&eacute;es</td>
</tr>
<tr>
<td><b>St&eacute;go de texte</b></td>
<td>Outils web, inspection manuelle</td>
<td>L'agent d&eacute;tecte les caract&egrave;res de largeur z&eacute;ro, l'encodage par espaces blancs, l'Unicode invisible, les homoglyphes, les acrostiches &mdash; et peut incorporer/extraire des messages ZWC</td>
</tr>
<tr>
<td><b>D&eacute;pendances</b></td>
<td>Ruby, Java, Perl, Python, C, outils web</td>
<td><code>npx -y steganography-mcp</code> &mdash; 4 d&eacute;pendances, TypeScript pur</td>
</tr>
<tr>
<td><b>Cl&eacute;s API</b></td>
<td>N/A (mais cha&icirc;ne d'outils fragment&eacute;e)</td>
<td>Z&eacute;ro. 100 % hors ligne, aucun appel externe</td>
</tr>
<tr>
<td><b>Sortie</b></td>
<td>Texte brut, images, corr&eacute;lation manuelle</td>
<td>JSON structur&eacute; &mdash; l'IA corr&egrave;le les r&eacute;sultats automatiquement</td>
</tr>
</tbody>
</table>

---

## D&eacute;marrage rapide

### Option 1 : npx (sans installation)

```bash
npx -y steganography-mcp
```

Les 128 outils fonctionnent imm&eacute;diatement. Aucune cl&eacute; API. Aucune configuration. 100 % hors ligne.

### Option 2 : bunx (plus rapide)

```bash
bunx steganography-mcp
```

### Option 3 : Cloner

```bash
git clone https://github.com/badchars/steganography-mcp.git
cd steganography-mcp
bun install
```

### Connecter &agrave; votre agent IA

<details open>
<summary><b>Claude Code</b></summary>

```bash
# Avec npx
claude mcp add steganography -- npx -y steganography-mcp

# Avec un clone local
claude mcp add steganography -- bun run /path/to/steganography-mcp/src/index.ts
```

</details>

<details>
<summary><b>Claude Desktop</b></summary>

Ajouter dans `~/Library/Application Support/Claude/claude_desktop_config.json` :

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
<summary><b>Cursor / Windsurf / autres clients MCP</b></summary>

M&ecirc;me format de configuration JSON. Pointez la commande vers `npx -y steganography-mcp` ou le chemin de votre installation locale.

</details>

### Commencer l'analyse

```
Vous : "V&eacute;rifie cette image pour des donn&eacute;es cach&eacute;es"
```

C'est tout. L'agent ex&eacute;cute l'analyse chi-carr&eacute;, l'analyse RS, la cartographie d'entropie, l'extraction de m&eacute;tadonn&eacute;es, la d&eacute;tection de donn&eacute;es ajout&eacute;es et le scan de signatures d'outils &mdash; automatiquement.

---

## Ce que l'IA peut faire

### Solveur de d&eacute;fis CTF

```
Vous : "R&eacute;sous ce d&eacute;fi CTF de st&eacute;ganographie — l'image est &agrave; challenge.png"

Agent : -> img_detect : La st&eacute;ganalyse chi-carr&eacute; d&eacute;tecte une incorporation LSB
           (p=0,00012), l'analyse RS estime un taux d'incorporation de 38 %,
           anomalie d'entropie aux blocs (12,4)-(15,8)
        -> img_lsb_extract : 1 247 octets extraits des LSBs du canal RGB
        -> crypto_detect : Les donn&eacute;es correspondent au motif Base64 (confiance : 0,95)
        -> crypto_decode : "Q1RGe3N0M2cwX21hc3Rlcn0=" -> "CTF{st3g0_master}"
        -> img_known_tools : Signature OpenStego d&eacute;tect&eacute;e dans les chunks PNG

        "Drapeau trouv&eacute; : CTF{st3g0_master}
         L'image utilise la st&eacute;ganographie LSB incorpor&eacute;e par OpenStego.
         La charge utile &eacute;tait encod&eacute;e en Base64 dans les bits de poids
         faible RGB avec un taux d'incorporation de 38 %."
```

### Enqu&ecirc;te forensique num&eacute;rique

```
Vous : "Analyse suspect.png et suspect.wav pour de la communication clandestine"

Agent : -> img_detect : Pas de st&eacute;go LSB d&eacute;tect&eacute;e, mais des donn&eacute;es ajout&eacute;es
           trouv&eacute;es (12 847 octets apr&egrave;s le marqueur PNG IEND)
        -> file_identify : Les donn&eacute;es ajout&eacute;es commencent par la signature ZIP (PK)
        -> img_metadata : Le chunk PNG tEXt contient une cl&eacute; inhabituelle "comm"
           avec une valeur Base64
        -> audio_detect : Le fichier WAV pr&eacute;sente une anomalie chi-carr&eacute; LSB (p=0,003)
        -> audio_silence : 3 sections silencieuses avec des LSBs actifs d&eacute;tect&eacute;es
        -> audio_lsb_extract : 2 048 octets de donn&eacute;es cach&eacute;es extraits

        "Les deux fichiers contiennent des donn&eacute;es cach&eacute;es :
         1. suspect.png a une archive ZIP ajout&eacute;e apr&egrave;s le marqueur EOF
            du PNG, plus un message encod&eacute; en Base64 dans les m&eacute;tadonn&eacute;es
         2. suspect.wav contient de la st&eacute;ganographie LSB, sp&eacute;cifiquement
            dans les sections silencieuses — un indicateur fort de dissimulation
            intentionnelle.
         Recommandation : extraire le ZIP et analyser la charge utile du WAV."
```

### D&eacute;tection de texte &agrave; largeur z&eacute;ro

```
Vous : "Cet e-mail semble normal mais pourrait contenir du texte cach&eacute;"

Agent : -> text_detect : 847 caract&egrave;res de largeur z&eacute;ro d&eacute;tect&eacute;s entre
           les caract&egrave;res visibles
        -> text_zwc_detect : ZWSP (342), ZWNJ (505) trouv&eacute;s &agrave; 127
           positions dans tout le texte
        -> text_zwc_extract : Le d&eacute;codage binaire produit "EXFIL-ROUTE-7"
        -> text_invisible_scan : 3 caract&egrave;res Unicode invisibles
           suppl&eacute;mentaires (U+2060, U+FEFF) trouv&eacute;s dans la section d'en-t&ecirc;te

        "L'e-mail contient un message cach&eacute; encod&eacute; avec des caract&egrave;res
         de largeur z&eacute;ro : 'EXFIL-ROUTE-7'. 847 caract&egrave;res invisibles
         sont dispers&eacute;s dans le texte visible en utilisant l'encodage
         binaire ZWSP/ZWNJ. De plus, 3 caract&egrave;res Word Joiner et BOM
         ont &eacute;t&eacute; trouv&eacute;s dans l'en-t&ecirc;te — probablement des artefacts
         de m&eacute;tadonn&eacute;es."
```

### Analyse forensique JPEG

```
Vous : "Cette image JPEG est-elle authentique ou a-t-elle &eacute;t&eacute; alt&eacute;r&eacute;e ?"

Agent : -> jpeg_structure : 14 marqueurs analys&eacute;s, structure JFIF normale
        -> jpeg_double_compression : Double compression D&Eacute;TECT&Eacute;E —
           score d'artefacts de blocage 0,73, ratio d'anomalie
           de quantification 0,81
        -> jpeg_quantization : Qualit&eacute; ~75 (luminance), mais les motifs
           r&eacute;siduels sugg&egrave;rent une qualit&eacute; originale ~92
        -> jpeg_exif_deep : EXIF indique "iPhone 14 Pro" mais le champ
           Logiciel indique "Adobe Photoshop 25.0"
        -> jpeg_thumbnail_compare : Les dimensions de la miniature
           NE correspondent PAS &agrave; l'image principale (miniature : 4032x3024,
           principale : 2048x1536)

        "Ce JPEG a &eacute;t&eacute; alt&eacute;r&eacute;. Preuves :
         1. Double compression d&eacute;tect&eacute;e — l'image a &eacute;t&eacute; d&eacute;cod&eacute;e et
            r&eacute;encod&eacute;e &agrave; une qualit&eacute; inf&eacute;rieure (originale ~92, actuelle ~75)
         2. EXIF pr&eacute;tend iPhone 14 Pro mais le champ logiciel r&eacute;v&egrave;le
            une &eacute;dition Photoshop
         3. La miniature provient de la capture originale 4032x3024 mais
            l'image principale a &eacute;t&eacute; redimensionn&eacute;e &agrave; 2048x1536
         Les trois constatations confirment ind&eacute;pendamment une
         modification post-capture."
```

---

## R&eacute;f&eacute;rence des outils (128 outils)

### Aper&ccedil;u par cat&eacute;gorie

| Cat&eacute;gorie | Outils | Description |
|-----------|--------|-------------|
| [St&eacute;ganalyse d'image](#-st&eacute;ganalyse-dimage-14) | 14 | D&eacute;tection LSB, chi-carr&eacute;, analyse RS, cartographie d'entropie, plans de bits, histogramme, m&eacute;tadonn&eacute;es, signatures d'outils |
| [Analyse JPEG](#-analyse-jpeg-7) | 7 | Histogramme DCT, double compression, tables de quantification, EXIF approfondi, forensique de miniatures, analyse de commentaires |
| [St&eacute;ganalyse audio](#-st&eacute;ganalyse-audio-7) | 7 | D&eacute;tection LSB WAV, analyse spectrale, analyse des r&eacute;gions de silence, dissimulation par &eacute;cho, extraction de m&eacute;tadonn&eacute;es |
| [Texte et Unicode](#-texte-et-unicode-10) | 10 | Caract&egrave;res de largeur z&eacute;ro, encodage par espaces, Unicode invisible, homoglyphes, acrostiches, analyse Unicode |
| [Forensique de fichiers](#-forensique-de-fichiers-10) | 10 | Magic bytes, d&eacute;tection polyglotte, fichiers embarqu&eacute;s, donn&eacute;es ajout&eacute;es, entropie, dump hex, cha&icirc;nes, en-t&ecirc;tes |
| [Analyse de documents](#-analyse-de-documents-5) | 5 | Contenu PDF cach&eacute;, m&eacute;tadonn&eacute;es PDF, flux PDF, contenu HTML cach&eacute;, m&eacute;tadonn&eacute;es XML |
| [Encodage et cryptographie](#-encodage-et-cryptographie-7) | 7 | D&eacute;tection d'encodage, d&eacute;codeur multi-format, analyse de fr&eacute;quence, entropie, force brute XOR, ID de hash, motifs de chiffrement |
| [Analyse JPEG avanc&eacute;e](#-analyse-jpeg-avanc&eacute;e-7) | 7 | D&eacute;tection F5, JSteg, OutGuess, PVD, chi-carr&eacute; &agrave; fen&ecirc;tre glissante, st&eacute;ganalyse crop-recalibrate, compatibilit&eacute; d'outils |
| [St&eacute;ganographie vid&eacute;o](#-st&eacute;ganographie-vid&eacute;o-8) | 8 | LSB de trames AVI, analyse inter-trames, comparaison de trames, m&eacute;tadonn&eacute;es, structure, donn&eacute;es EOF |
| [St&eacute;ganographie GIF](#-st&eacute;ganographie-gif-8) | 8 | LSB de palette, entropie des sous-blocs LZW, extensions de commentaires, extensions d'applications, analyse de trames |
| [St&eacute;ganographie r&eacute;seau](#-st&eacute;ganographie-r&eacute;seau-8) | 8 | Canaux cach&eacute;s PCAP, analyse des en-t&ecirc;tes IP/TCP, charges utiles ICMP, tunneling DNS, en-t&ecirc;tes HTTP, timing |
| [St&eacute;ganographie MP3](#-st&eacute;ganographie-mp3-7) | 7 | Donn&eacute;es cach&eacute;es ID3, analyse de trames, manipulation de padding, analyse d'&eacute;chantillons, m&eacute;tadonn&eacute;es, structure |
| [Analyse &agrave; spectre &eacute;tal&eacute;](#-analyse-&agrave;-spectre-&eacute;tal&eacute;-5) | 5 | Spectre de magnitude DFT, autocorr&eacute;lation, d&eacute;tection de filigrane, analyse du plancher de bruit, d&eacute;tection patchwork |
| [Analyse BPCS](#-analyse-bpcs-5) | 5 | Segmentation par complexit&eacute; de plan de bits, cartographie de complexit&eacute;, analyse de seuil, extraction de donn&eacute;es, estimation de capacit&eacute; |
| [St&eacute;ganographie d'archives](#-st&eacute;ganographie-darchives-7) | 7 | Espaces slack ZIP, champs suppl&eacute;mentaires, commentaires, d&eacute;tection polyglotte, analyse de structure, m&eacute;tadonn&eacute;es |
| [Cr&eacute;ation et incorporation](#-cr&eacute;ation-et-incorporation-7) | 7 | Injection EOF, injection de m&eacute;tadonn&eacute;es, encodage par espaces blancs, chiffre nul, cr&eacute;ation polyglotte, injection de commentaires, incorporation dans la palette |
| [St&eacute;ganographie de codes QR](#-st&eacute;ganographie-de-codes-qr-6) | 6 | D&eacute;tection st&eacute;go QR, analyse de structure, capacit&eacute; ECC, analyse de modules, extraction de donn&eacute;es, comparaison |

---

<details open>
<summary><h3>St&eacute;ganalyse d'image (14)</h3></summary>

| Outil | Description |
|-------|-------------|
| `img_detect` | D&eacute;tection automatique de st&eacute;ganographie dans une image. Ex&eacute;cute chi-carr&eacute;, analyse RS, entropie, m&eacute;tadonn&eacute;es, donn&eacute;es ajout&eacute;es et v&eacute;rifications de signatures d'outils. Renvoie un rapport JSON complet |
| `img_lsb_detect` | D&eacute;tection statistique de st&eacute;ganographie LSB. Ex&eacute;cute l'analyse chi-carr&eacute; et l'analyse de paires d'&eacute;chantillons sur chaque canal de couleur ind&eacute;pendamment |
| `img_lsb_extract` | Extraire les donn&eacute;es cach&eacute;es des LSBs d'une image. Extrait les bits des canaux et du plan de bits sp&eacute;cifi&eacute;s, tente le d&eacute;codage UTF-8 et affiche le dump hex |
| `img_lsb_embed` | Incorporer un message dans une image via st&eacute;ganographie LSB. Lit un fichier PNG, incorpore le message dans les bits de poids faible et &eacute;crit un nouveau fichier PNG |
| `img_bitplane` | Extraire et visualiser un plan de bits sp&eacute;cifique d'un canal d'image. Affiche les dimensions, le pourcentage de bits &agrave; 1 et un aper&ccedil;u en art ASCII |
| `img_chi_square` | Attaque de st&eacute;ganalyse chi-carr&eacute; sur chaque canal de couleur ind&eacute;pendamment. D&eacute;tecte le remplacement LSB en testant si les paires de valeurs de pixels adjacents sont &eacute;galis&eacute;es |
| `img_rs_analysis` | St&eacute;ganalyse RS (Regular-Singular) selon la m&eacute;thode Fridrich-Goljan-Du. Analyse les groupes de pixels pour estimer le taux d'incorporation LSB par canal |
| `img_histogram` | G&eacute;n&eacute;rer un histogramme de valeurs de pixels avec d&eacute;tection d'anomalies. D&eacute;tecte les anomalies de Paires de Valeurs (PoV) qui indiquent une st&eacute;ganographie LSB |
| `img_entropy_map` | Analyse d'entropie par blocs d'une image. Divise l'image en blocs et calcule l'entropie de Shannon par bloc, signalant les r&eacute;gions &agrave; haute entropie |
| `img_metadata` | Extraction approfondie des m&eacute;tadonn&eacute;es d'une image. Pour PNG : chunks de texte, liste de chunks, info IHDR. Pour JPEG : EXIF, commentaires, tables de quantification, liste de marqueurs |
| `img_appended_data` | D&eacute;tecter et extraire les donn&eacute;es ajout&eacute;es apr&egrave;s le marqueur EOF de l'image. V&eacute;rifie les donn&eacute;es cach&eacute;es apr&egrave;s PNG IEND, JPEG EOI ou la limite de taille BMP |
| `img_compare` | Comparaison pixel par pixel de deux images. Rapporte le nombre de pixels identiques/diff&eacute;rents, la diff&eacute;rence maximale et les canaux affect&eacute;s |
| `img_channel_analysis` | Analyse statistique par canal pour R, G, B et A. Rapporte moyenne, &eacute;cart-type, entropie, min, max et nombre de valeurs uniques |
| `img_known_tools` | Scanner les octets du fichier image pour des signatures connues d'outils de st&eacute;ganographie. V&eacute;rifie contre une base de donn&eacute;es de motifs d'OpenStego, Steghide, JSteg, F5 et autres |

</details>

<details>
<summary><h3>Analyse JPEG (7)</h3></summary>

| Outil | Description |
|-------|-------------|
| `jpeg_structure` | Analyser les marqueurs/segments JPEG avec offsets et tailles. Affiche la structure interne incluant tous les marqueurs, positions et longueurs de segments |
| `jpeg_dct_histogram` | Analyse de distribution des coefficients DCT pour la d&eacute;tection de st&eacute;ganographie. Analyse la distribution des valeurs de pixels du canal Y et les donn&eacute;es d'entropie SOS pour d&eacute;tecter les anomalies caus&eacute;es par JSteg, F5 et OutGuess |
| `jpeg_double_compression` | D&eacute;tecter les artefacts de double compression JPEG. Identifie les artefacts de blocage caract&eacute;ristiques et les anomalies de tables de quantification &mdash; un indicateur courant d'alt&eacute;ration d'image ou d'incorporation st&eacute;go |
| `jpeg_quantization` | Analyse des tables de quantification avec estimation de qualit&eacute;. Affiche toutes les tables de quantification au format grille 8x8 et estime le facteur de qualit&eacute; JPEG |
| `jpeg_exif_deep` | Analyse EXIF approfondie incluant coordonn&eacute;es GPS, horodatages, info logiciel, miniatures, notes du fabricant et toutes les entr&eacute;es IFD. Signale les champs d'int&eacute;r&ecirc;t forensique |
| `jpeg_thumbnail_compare` | Comparer la miniature EXIF avec l'image JPEG principale. Une discordance de dimensions ou de contenu indique une modification post-capture &mdash; un artefact forensique courant |
| `jpeg_comment` | Extraire et analyser les marqueurs COM (commentaire) JPEG. V&eacute;rifie les motifs de donn&eacute;es cach&eacute;es, les commentaires inhabituellement volumineux et le contenu &agrave; haute entropie |

</details>

<details>
<summary><h3>St&eacute;ganalyse audio (7)</h3></summary>

| Outil | Description |
|-------|-------------|
| `audio_detect` | D&eacute;tection automatique de st&eacute;ganographie audio dans un fichier WAV. Ex&eacute;cute chi-carr&eacute; LSB, analyse d'entropie, inspection des m&eacute;tadonn&eacute;es et v&eacute;rification des donn&eacute;es ajout&eacute;es |
| `audio_lsb_detect` | Analyse statistique des LSBs d'&eacute;chantillons PCM. Effectue un test chi-carr&eacute; sur les LSBs group&eacute;s par paires de valeurs pour d&eacute;tecter la st&eacute;ganographie par remplacement LSB |
| `audio_lsb_extract` | Extraire les donn&eacute;es LSB des &eacute;chantillons audio. Lit le bit de poids faible de chaque &eacute;chantillon PCM et tente de d&eacute;coder les donn&eacute;es cach&eacute;es |
| `audio_spectrum` | Analyse spectrale pour signaux cach&eacute;s dans l'audio WAV. Analyse la distribution des valeurs d'&eacute;chantillons, le taux de passages par z&eacute;ro, l'&eacute;nergie RMS par bloc et d&eacute;tecte les sections silencieuses anomales |
| `audio_metadata` | Extraire les m&eacute;tadonn&eacute;es d'un fichier WAV incluant les chunks RIFF INFO, les d&eacute;tails de format et toutes les informations de chunks |
| `audio_silence` | Analyser les sections silencieuses d'un audio WAV pour des donn&eacute;es cach&eacute;es. Trouve les r&eacute;gions d'&eacute;chantillons proches de z&eacute;ro et v&eacute;rifie leurs LSBs &mdash; des sections silencieuses avec des LSBs actifs sont un indicateur fort de st&eacute;go |
| `audio_echo_detect` | D&eacute;tection de dissimulation par &eacute;cho via analyse d'autocorr&eacute;lation. Calcule l'autocorr&eacute;lation normalis&eacute;e aux d&eacute;lais d'&eacute;cho courants. Des motifs d'&eacute;cho r&eacute;guliers indiquent une dissimulation st&eacute;ganographique par &eacute;cho |

</details>

<details>
<summary><h3>Texte et Unicode (10)</h3></summary>

| Outil | Description |
|-------|-------------|
| `text_detect` | D&eacute;tection automatique de st&eacute;ganographie textuelle. V&eacute;rifie les caract&egrave;res de largeur z&eacute;ro, l'encodage par espaces blancs, l'Unicode invisible, les homoglyphes et les motifs inhabituels |
| `text_zwc_detect` | D&eacute;tecter les caract&egrave;res de largeur z&eacute;ro (ZWSP, ZWNJ, ZWJ, BOM) dans le texte. Rapporte les positions, les comptages et la longueur potentielle du message encod&eacute; |
| `text_zwc_extract` | D&eacute;coder un message encod&eacute; en caract&egrave;res de largeur z&eacute;ro. Extrait les caract&egrave;res ZWC et d&eacute;code en binaire : ZWSP=0, ZWNJ=1 (tente les deux polarit&eacute;s) |
| `text_zwc_embed` | Incorporer un message secret dans un texte de couverture en utilisant des caract&egrave;res de largeur z&eacute;ro. Encode le message en binaire et fait correspondre les bits &agrave; ZWSP(0)/ZWNJ(1) |
| `text_whitespace_detect` | D&eacute;tecter l'encodage par espaces blancs dans le texte. V&eacute;rifie chaque ligne pour des motifs d'espaces de fin o&ugrave; espace=0 et tabulation=1 pourraient encoder des donn&eacute;es binaires |
| `text_whitespace_extract` | Extraire un message encod&eacute; par espaces blancs d'un texte. Lit les espaces de fin de chaque ligne et d&eacute;code l'encodage binaire espace=0/tabulation=1 |
| `text_invisible_scan` | Scanner le texte pour TOUS les caract&egrave;res Unicode invisibles. V&eacute;rifie chaque caract&egrave;re contre la base de donn&eacute;es compl&egrave;te des caract&egrave;res invisibles et rapporte positions et noms |
| `text_homoglyph` | D&eacute;tecter les substitutions d'homoglyphes Unicode dans le texte. Identifie les caract&egrave;res non-ASCII qui ressemblent visuellement aux lettres ASCII (a cyrillique vs a latin, etc.) |
| `text_unicode_analysis` | Analyse compl&egrave;te de la distribution des caract&egrave;res Unicode. Cat&eacute;gorise tous les caract&egrave;res par bloc de script, effectue une analyse d'entropie et d&eacute;tecte le m&eacute;lange suspect de scripts |
| `text_acrostic` | D&eacute;tecter les motifs de premi&egrave;re lettre, premier mot, derni&egrave;re lettre, dernier mot ou ni&egrave;me caract&egrave;re (messages acrostiches) cach&eacute;s &agrave; travers les lignes de texte |

</details>

<details>
<summary><h3>Forensique de fichiers (10)</h3></summary>

| Outil | Description |
|-------|-------------|
| `file_identify` | Identification du type de fichier via magic bytes. Lit l'en-t&ecirc;te du fichier et compare avec une base de donn&eacute;es compl&egrave;te de signatures de fichiers connues. V&eacute;rifie les discordances d'extension |
| `file_polyglot` | D&eacute;tecter les fichiers polyglottes valides comme deux formats ou plus simultan&eacute;ment. V&eacute;rifie les multiples signatures de fichiers valides &agrave; diff&eacute;rents offsets (PDF+ZIP, PNG+PDF, etc.) |
| `file_embedded` | Rechercher des fichiers embarqu&eacute;s dans un binaire, similaire &agrave; binwalk. Recherche des signatures de magic bytes connues &agrave; chaque offset pour d&eacute;couvrir des fichiers cach&eacute;s ou ajout&eacute;s |
| `file_appended` | D&eacute;tecter les donn&eacute;es ajout&eacute;es apr&egrave;s le marqueur EOF sp&eacute;cifique au format. Supporte PNG (IEND), JPEG (FFD9), BMP, ZIP (EOCD) et PDF (%%EOF) |
| `file_entropy` | Analyse d'entropie section par section. Calcule l'entropie de Shannon par bloc et globalement, signalant les sections anomales &agrave; haute entropie |
| `file_entropy_visual` | Visualisation ASCII de l'entropie d'un fichier. G&eacute;n&egrave;re un diagramme en barres textuels montrant les niveaux d'entropie &agrave; travers le fichier pour la d&eacute;tection visuelle d'anomalies |
| `file_strings` | Extraire les cha&icirc;nes imprimables et Unicode des fichiers binaires. Recherche les s&eacute;quences de caract&egrave;res imprimables et les rapporte avec les offsets de fichier. Supporte ASCII, UTF-8, UTF-16 |
| `file_hex` | Dump hex avec barre lat&eacute;rale ASCII. Format traditionnel d'&eacute;diteur hex avec adresses d'offset, octets hex et repr&eacute;sentation ASCII imprimable |
| `file_header` | Analyse approfondie d'en-t&ecirc;te et de structure pour les formats connus. Analyse PNG IHDR, JPEG SOF, en-t&ecirc;te d'info BMP, en-t&ecirc;tes de fichier local ZIP et version/m&eacute;tadonn&eacute;es PDF |
| `file_compare` | Diff binaire entre deux fichiers. Comparaison octet par octet rapportant les diff&eacute;rences avec offsets, pourcentage identique et d&eacute;tection de diff&eacute;rence LSB uniquement pour l'analyse st&eacute;go |

</details>

<details>
<summary><h3>Analyse de documents (5)</h3></summary>

| Outil | Description |
|-------|-------------|
| `doc_pdf_hidden` | D&eacute;tection de contenu PDF cach&eacute;. Recherche le JavaScript, les actions automatiques, OpenAction, les annotations cach&eacute;es, le texte invisible, les fichiers embarqu&eacute;s et autre contenu dissimul&eacute; |
| `doc_pdf_metadata` | Extraction de m&eacute;tadonn&eacute;es PDF. Analyse le dictionnaire /Info et les blocs de m&eacute;tadonn&eacute;es XMP pour l'attribution forensique et l'analyse de provenance du document |
| `doc_pdf_streams` | Analyse des flux PDF. Localise tous les blocs stream/endstream, tente la d&eacute;compression zlib et rapporte les tailles et l'entropie pour trouver des donn&eacute;es cach&eacute;es |
| `doc_html_hidden` | D&eacute;tection de contenu HTML cach&eacute;. Recherche les commentaires, les &eacute;l&eacute;ments display:none, les attributs data-*, les inputs cach&eacute;s, le contenu base64, les &eacute;l&eacute;ments de taille z&eacute;ro et le texte invisible |
| `doc_xml_metadata` | Extraction de m&eacute;tadonn&eacute;es XML et documents Office. Analyse Dublin Core, les propri&eacute;t&eacute;s Microsoft Office, les instructions de traitement et autres champs de m&eacute;tadonn&eacute;es |

</details>

<details>
<summary><h3>Encodage et cryptographie (7)</h3></summary>

| Outil | Description |
|-------|-------------|
| `crypto_detect` | D&eacute;tection automatique du type d'encodage d'une cha&icirc;ne de caract&egrave;res. Teste contre tous les motifs connus (Base64, hex, binaire, morse, encodage URL, entit&eacute;s HTML, etc.) et renvoie les correspondances tri&eacute;es par confiance |
| `crypto_decode` | D&eacute;codeur multi-format supportant Base64, hex, binaire, d&eacute;cimal, octal, encodage URL, ROT13, Base32, code Morse et entit&eacute;s HTML. Le mode auto d&eacute;tecte l'encodage d'abord |
| `crypto_frequency` | Analyse de fr&eacute;quence des caract&egrave;res pour la cryptanalyse. Compte les occurrences de caract&egrave;res, compare &agrave; la fr&eacute;quence standard anglaise (ETAOINSHRDLU) et calcule l'Indice de Co&iuml;ncidence |
| `crypto_entropy` | Calcul et classification de l'entropie de Shannon pour les cha&icirc;nes. Calcule l'entropie au niveau caract&egrave;re et octet, classifiant en cat&eacute;gories de donn&eacute;es r&eacute;p&eacute;t&eacute;es &agrave; chiffr&eacute;/al&eacute;atoire |
| `crypto_xor` | Force brute de cl&eacute; XOR pour cl&eacute;s mono-octet et multi-octets. Teste les 256 cl&eacute;s mono-octet et note par probabilit&eacute; de texte anglais. Utilise l'IC pour l'estimation de longueur de cl&eacute; multi-octets |
| `crypto_hash_id` | Identification du type de hash. Compare l'entr&eacute;e avec les motifs de hash connus par longueur et format (MD5, SHA-1, SHA-256, SHA-512, bcrypt, CRC32, NTLM, etc.) |
| `crypto_patterns` | D&eacute;tection de motifs de chiffrement et d'encodage connus. Analyse le texte pour le chiffre de C&eacute;sar, le chiffre de substitution, Vigen&egrave;re, la transposition rail fence, Atbash et le texte invers&eacute; |

</details>

---

## Utilisation CLI

```bash
# Afficher l'aide
npx -y steganography-mcp --help

# Lister les 128 outils avec descriptions
npx -y steganography-mcp --list

# D&eacute;tecter la st&eacute;ganographie dans une image
npx -y steganography-mcp --tool img_detect '{"file_path":"challenge.png"}'

# Extraire un message cach&eacute; des LSBs
npx -y steganography-mcp --tool img_lsb_extract '{"file_path":"stego.png"}'

# St&eacute;ganalyse chi-carr&eacute;
npx -y steganography-mcp --tool img_chi_square '{"file_path":"suspect.png"}'

# Analyse RS (m&eacute;thode Fridrich-Goljan-Du)
npx -y steganography-mcp --tool img_rs_analysis '{"file_path":"suspect.png"}'

# D&eacute;tection de double compression JPEG
npx -y steganography-mcp --tool jpeg_double_compression '{"file_path":"photo.jpg"}'

# Analyse EXIF approfondie
npx -y steganography-mcp --tool jpeg_exif_deep '{"file_path":"photo.jpg"}'

# D&eacute;tection de st&eacute;ganographie audio
npx -y steganography-mcp --tool audio_detect '{"file_path":"message.wav"}'

# D&eacute;tecter l'encodage par caract&egrave;res de largeur z&eacute;ro
npx -y steganography-mcp --tool text_zwc_detect '{"text":"texte suspect ici"}'

# Incorporer un message cach&eacute; avec des caract&egrave;res de largeur z&eacute;ro
npx -y steganography-mcp --tool text_zwc_embed '{"text":"texte de couverture","message":"secret"}'

# Identifier le type de fichier et d&eacute;tecter les polyglottes
npx -y steganography-mcp --tool file_polyglot '{"file_path":"suspect.pdf"}'

# Rechercher des fichiers embarqu&eacute;s (style binwalk)
npx -y steganography-mcp --tool file_embedded '{"file_path":"mystery.bin"}'

# Visualisation d'entropie
npx -y steganography-mcp --tool file_entropy_visual '{"file_path":"data.bin"}'

# D&eacute;tection automatique d'encodage
npx -y steganography-mcp --tool crypto_detect '{"input":"aGVsbG8gd29ybGQ="}'

# Force brute XOR
npx -y steganography-mcp --tool crypto_xor '{"input":"4f5243484e"}'

# D&eacute;tecter les motifs de chiffrement
npx -y steganography-mcp --tool crypto_patterns '{"input":"Gur dhvpx oebja sbk"}'

# Avec Bun (d&eacute;marrage plus rapide)
bunx steganography-mcp --tool img_detect '{"file_path":"image.png"}'
```

---

## Cas d'utilisation

### D&eacute;fis CTF
R&eacute;solvez des d&eacute;fis de st&eacute;ganographie dans les comp&eacute;titions de capture de drapeau. L'agent IA peut appliquer syst&eacute;matiquement toutes les techniques de d&eacute;tection &mdash; analyse LSB, inspection des m&eacute;tadonn&eacute;es, donn&eacute;es ajout&eacute;es, d&eacute;tection d'encodage et identification de chiffrement &mdash; pour trouver des drapeaux cach&eacute;s dans les images, fichiers audio, documents et textes.

### Forensique num&eacute;rique
D&eacute;tectez les canaux de communication clandestins lors d'enqu&ecirc;tes forensiques. Analysez les fichiers suspects pour des donn&eacute;es cach&eacute;es en utilisant la st&eacute;ganalyse statistique (chi-carr&eacute;, analyse RS), v&eacute;rifiez les donn&eacute;es apr&egrave;s les marqueurs EOF, recherchez les fichiers embarqu&eacute;s et identifiez les signatures d'outils de st&eacute;ganographie.

### Recherche en s&eacute;curit&eacute;
Analysez les outils et techniques de st&eacute;ganographie. Comparez les images originales et st&eacute;go pixel par pixel, &eacute;tudiez les distributions de coefficients DCT dans la st&eacute;go JPEG, mesurez les changements d'entropie li&eacute;s &agrave; l'incorporation et r&eacute;tro-analysez les sch&eacute;mas d'encodage.

### &Eacute;ducation
Apprenez le fonctionnement des techniques de st&eacute;ganographie. Incorporez et extrayez des messages LSB, encodez du texte avec des caract&egrave;res de largeur z&eacute;ro, visualisez les plans de bits et les cartes d'entropie, analysez les structures de fichiers avec des dumps hex et &eacute;tudiez les motifs de chiffrement avec l'analyse de fr&eacute;quence.

### R&eacute;ponse aux incidents
Lors de la r&eacute;ponse aux incidents, v&eacute;rifiez les documents et images pour des canaux d'exfiltration cach&eacute;s. Scannez les PDFs &agrave; la recherche de JavaScript cach&eacute; et de fichiers embarqu&eacute;s, d&eacute;tectez l'encodage par caract&egrave;res de largeur z&eacute;ro dans les e-mails, identifiez les fichiers polyglottes et analysez les encodages suspects.

---

## Architecture

```
src/
  index.ts                    # Point d'entr&eacute;e CLI (--help, --list, --tool, serveur stdio)
  protocol/
    mcp-server.ts             # Configuration du serveur MCP (transport stdio)
    tools.ts                  # Registre des outils — les 128 outils assembl&eacute;s ici
  types/
    index.ts                  # Types partag&eacute;s (ToolDef, ToolContext, ToolResult)
  utils/
    binary.ts                 # Lecture de fichiers binaires, dump hex, d&eacute;tection de format
    stats.ts                  # Entropie de Shannon, chi-carr&eacute;, fr&eacute;quence d'octets, DFT, autocorr&eacute;lation, complexit&eacute; BPCS, test patchwork
    cache.ts                  # Cache TTL
    png-parser.ts             # Parser PNG pur TS (IHDR, chunks, donn&eacute;es de pixels)
    jpeg-parser.ts            # Parser JPEG pur TS (marqueurs, EXIF, quantification)
    wav-parser.ts             # Parser WAV pur TS (chunks RIFF, &eacute;chantillons PCM)
    bmp-parser.ts             # Parser BMP pur TS (en-t&ecirc;te, donn&eacute;es de pixels)
    avi-parser.ts             # Parser AVI pur TS (trames, en-t&ecirc;tes)
    gif-parser.ts             # Parser GIF pur TS (palette, blocs LZW, extensions)
    pcap-parser.ts            # Parser PCAP pur TS (paquets, en-t&ecirc;tes)
    mp3-parser.ts             # Parser MP3 pur TS (trames, tags ID3)
    zip-parser.ts             # Parser ZIP pur TS (entr&eacute;es, espaces slack)
  image/                      # Outils de st&eacute;ganalyse d'image (14)
  jpeg/                       # Outils d'analyse JPEG (7)
  audio/                      # Outils de st&eacute;ganalyse audio (7)
  text/                       # Outils texte et Unicode (10)
  file/                       # Outils de forensique de fichiers (10)
  document/                   # Outils d'analyse de documents (5)
  crypto/                     # Outils d'encodage et cryptographie (7)
  jpegadv/                    # Outils d'analyse JPEG avanc&eacute;e (7)
  video/                      # Outils de st&eacute;ganographie vid&eacute;o (8)
  gif/                        # Outils de st&eacute;ganographie GIF (8)
  network/                    # Outils de st&eacute;ganographie r&eacute;seau (8)
  mp3/                        # Outils de st&eacute;ganographie MP3 (7)
  spread/                     # Outils d'analyse &agrave; spectre &eacute;tal&eacute; (5)
  bpcs/                       # Outils d'analyse BPCS (5)
  archive/                    # Outils de st&eacute;ganographie d'archives (7)
  create/                     # Outils de cr&eacute;ation et incorporation (7)
  qrcode/                     # Outils de st&eacute;ganographie de codes QR (6)
  data/
    encoding-patterns.ts      # Motifs regex d'encodage + d&eacute;codeurs
    magic-bytes.ts            # Base de donn&eacute;es de signatures de fichiers (100+ formats)
    stego-signatures.ts       # Signatures connues d'outils de st&eacute;ganographie
    unicode-invisible.ts      # Base de donn&eacute;es de caract&egrave;res Unicode invisibles
```

**D&eacute;cisions de conception :**

- **4 d&eacute;pendances, rien d'autre** &mdash; `@modelcontextprotocol/sdk` pour le protocole MCP, `zod` pour la validation des entr&eacute;es, `pngjs` pour l'acc&egrave;s aux pixels PNG, `jpeg-js` pour le d&eacute;codage JPEG. Pas d'arbre de d&eacute;pendances surcharg&eacute;. Pas de modules natifs. Pas de bindings C. Pas de Python. Pas de Java.
- **100 % hors ligne** &mdash; Chaque outil s'ex&eacute;cute enti&egrave;rement en local. Aucune requ&ecirc;te HTTP. Aucun appel API. Aucune t&eacute;l&eacute;m&eacute;trie. Aucune d&eacute;pendance cloud. Vos fichiers ne quittent jamais votre machine.
- **Analyse statistique en TypeScript pur** &mdash; Test chi-carr&eacute;, analyse RS (Fridrich-Goljan-Du), Analyse de Paires d'&Eacute;chantillons, entropie de Shannon, Indice de Co&iuml;ncidence et analyse de fr&eacute;quence sont tous impl&eacute;ment&eacute;s en TypeScript pur. Aucune biblioth&egrave;que math&eacute;matique externe.
- **Parsers de format personnalis&eacute;s** &mdash; Les chunks PNG, marqueurs/EXIF/tables de quantification JPEG, chunks RIFF WAV et en-t&ecirc;tes BMP sont analys&eacute;s sans aucune d&eacute;pendance externe gr&acirc;ce aux parsers `utils/`. Cela permet une analyse approfondie sp&eacute;cifique au format que les biblioth&egrave;ques g&eacute;n&eacute;riques ne peuvent pas offrir.
- **17 fournisseurs, 1 serveur** &mdash; Chaque cat&eacute;gorie d'analyse est un module ind&eacute;pendant. L'agent IA choisit quels outils utiliser en fonction du contexte de l'enqu&ecirc;te.
- **Patron ToolDef propre** &mdash; Chaque outil suit le m&ecirc;me patron `{ name, description, schema, execute }`. Ajouter un nouvel outil consiste en un seul objet dans le module concern&eacute;.
- **Validation Zod sur chaque champ** &mdash; Chaque champ de sch&eacute;ma poss&egrave;de `.describe()` pour le contexte de l'agent IA. Les entr&eacute;es invalides sont intercept&eacute;es avant l'ex&eacute;cution avec des messages d'erreur clairs.

---

## Fait partie de la suite de s&eacute;curit&eacute; MCP

| Projet | Domaine | Outils |
|--------|---------|--------|
| [hackbrowser-mcp](https://github.com/badchars/hackbrowser-mcp) | Tests de s&eacute;curit&eacute; bas&eacute;s sur le navigateur | 39 outils |
| [cloud-audit-mcp](https://github.com/badchars/cloud-audit-mcp) | S&eacute;curit&eacute; cloud (AWS/Azure/GCP) | 38 outils |
| [github-security-mcp](https://github.com/badchars/github-security-mcp) | Posture de s&eacute;curit&eacute; GitHub | 39 outils |
| [cve-mcp](https://github.com/badchars/cve-mcp) | Renseignement sur les vuln&eacute;rabilit&eacute;s | 23 outils |
| [osint-mcp-server](https://github.com/badchars/osint-mcp-server) | OSINT et reconnaissance | 37 outils |
| [darknet-mcp-server](https://github.com/badchars/darknet-mcp-server) | Dark web et renseignement sur les menaces | 66 outils |
| [dns-security-mcp](https://github.com/badchars/dns-security-mcp) | Renseignement de s&eacute;curit&eacute; DNS | 103 outils |
| **steganography-mcp** | **Analyse st&eacute;ganographique** | **128 outils** |

---

## Contribuer

Les contributions sont les bienvenues. Consultez [CONTRIBUTING.md](../../CONTRIBUTING.md) pour les directives.

---

<p align="center">
<b>&Agrave; des fins de recherche en s&eacute;curit&eacute; autoris&eacute;e et &eacute;ducatives uniquement.</b><br>
Assurez-vous toujours d'avoir l'autorisation ad&eacute;quate avant d'effectuer une analyse st&eacute;ganographique sur des fichiers qui ne vous appartiennent pas.
</p>

<p align="center">
  <a href="../../LICENSE">Licence MIT</a> &bull; Cr&eacute;&eacute; par <a href="https://orhanyildirim.us">Orhan Yildirim</a> &bull; <a href="mailto:contact@orhanyildirim.us">contact@orhanyildirim.us</a>
</p>
