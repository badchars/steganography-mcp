<p align="center">
  <a href="../../README.md">English</a> |
  <a href="README.zh.md">中文</a> |
  <a href="README.zh-TW.md">繁體中文</a> |
  <a href="README.ko.md">한국어</a> |
  <a href="README.ja.md">日本語</a> |
  <a href="README.de.md">Deutsch</a> |
  <strong>Español</strong> |
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

<h3 align="center">El kit de an&aacute;lisis esteganogr&aacute;fico m&aacute;s completo para agentes de IA.</h3>

<p align="center">
  Detecci&oacute;n LSB, estegoan&aacute;lisis chi-cuadrado, an&aacute;lisis RS, forense DCT, esteganograf&iacute;a de audio, codificaci&oacute;n de texto con caracteres de ancho cero, forense de archivos, detecci&oacute;n de pol&iacute;glotas, identificaci&oacute;n de codificaci&oacute;n, an&aacute;lisis JPEG avanzado, esteganograf&iacute;a de video/GIF/MP3, esteganograf&iacute;a de red, an&aacute;lisis de espectro ensanchado, BPCS, esteganograf&iacute;a de archivos comprimidos, creaci&oacute;n e incrustaci&oacute;n, estegoan&aacute;lisis de c&oacute;digos QR &mdash; unificado en un &uacute;nico servidor MCP.<br>
  <b>128 herramientas. 17 categor&iacute;as. 4 dependencias. 100 % sin conexi&oacute;n.</b> Sin claves API. Todas las herramientas se ejecutan localmente.
</p>

<br>

<p align="center">
  <a href="#el-problema">El problema</a> &bull;
  <a href="#en-qu&eacute;-se-diferencia">En qu&eacute; se diferencia</a> &bull;
  <a href="#inicio-r&aacute;pido">Inicio r&aacute;pido</a> &bull;
  <a href="#qu&eacute;-puede-hacer-la-ia">Qu&eacute; puede hacer la IA</a> &bull;
  <a href="#referencia-de-herramientas-128-herramientas">Herramientas (128)</a> &bull;
  <a href="#uso-de-cli">Uso de CLI</a> &bull;
  <a href="#arquitectura">Arquitectura</a> &bull;
  <a href="../../CONTRIBUTING.md">Contribuir</a>
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

## El problema

La esteganograf&iacute;a es el arte de ocultar datos a plena vista &mdash; dentro de im&aacute;genes, archivos de audio, documentos e incluso texto Unicode. Se utiliza en competiciones CTF, investigaciones forenses digitales, canales de comunicaci&oacute;n encubiertos y cargas &uacute;tiles de malware. Su detecci&oacute;n requiere una combinaci&oacute;n de an&aacute;lisis estad&iacute;stico, an&aacute;lisis espec&iacute;fico de formato, medici&oacute;n de entrop&iacute;a y conocimiento especializado.

```
Flujo de trabajo tradicional de an&aacute;lisis esteganogr&aacute;fico:
  detectar estego en imagen       ->  zsteg + stegsolve (2 herramientas, Ruby + Java)
  an&aacute;lisis chi-cuadrado           ->  script Python personalizado
  an&aacute;lisis RS                     ->  c&oacute;digo MATLAB/Python personalizado
  forense JPEG DCT                ->  stegdetect (herramienta C abandonada de 2004)
  extraer datos LSB               ->  zsteg + steghide + openstego (3 herramientas)
  esteganograf&iacute;a de audio          ->  Audacity manual + scripts personalizados
  detecci&oacute;n texto ancho cero      ->  herramientas web + inspecci&oacute;n manual
  forense de archivos / binwalk   ->  binwalk + foremost + xxd (3 herramientas)
  metadatos EXIF                  ->  exiftool (dependencia Perl)
  detecci&oacute;n de codificaci&oacute;n       ->  CyberChef web UI + adivinaci&oacute;n manual
  ─────────────────────────────────
  Total: 10+ herramientas, 5+ lenguajes, horas de correlaci&oacute;n manual
```

**steganography-mcp** le da a su agente de IA 128 herramientas en 17 categor&iacute;as a trav&eacute;s del [Model Context Protocol](https://modelcontextprotocol.io). El agente realiza estegoan&aacute;lisis de im&aacute;genes, forense JPEG, an&aacute;lisis JPEG avanzado, an&aacute;lisis de audio, detecci&oacute;n de esteganograf&iacute;a de texto, forense de archivos, an&aacute;lisis de documentos, identificaci&oacute;n de codificaci&oacute;n, esteganograf&iacute;a de video/GIF/MP3, esteganograf&iacute;a de red, an&aacute;lisis de espectro ensanchado, an&aacute;lisis BPCS, esteganograf&iacute;a de archivos comprimidos, creaci&oacute;n e incrustaci&oacute;n, y estegoan&aacute;lisis de c&oacute;digos QR &mdash; todo en una sola conversaci&oacute;n, todo ejecut&aacute;ndose 100 % localmente sin dependencia de servicios externos.

```
Con steganography-mcp:
  T&uacute;: "Analiza esta imagen de desaf&iacute;o CTF en busca de datos ocultos"

  Agente: -> img_detect: Chi-cuadrado p=0,0001 (incrustaci&oacute;n LSB detectada),
             an&aacute;lisis RS estima tasa de incrustaci&oacute;n del 42 %, anomal&iacute;a
             de entrop&iacute;a en el cuadrante inferior derecho
          -> img_lsb_extract: 847 bytes extra&iacute;dos de LSBs RGB
          -> crypto_detect: Los datos extra&iacute;dos est&aacute;n codificados en Base64
          -> crypto_decode: Decodificado a "FLAG{hidden_in_plain_sight_2024}"
          -> img_known_tools: Coincidencia de firma con OpenStego

          "La imagen contiene esteganograf&iacute;a LSB incrustada con OpenStego.
           La prueba chi-cuadrado confirma reemplazo LSB en los tres
           canales RGB con una tasa de incrustaci&oacute;n del 42 %. La carga
           oculta est&aacute; codificada en Base64 y se decodifica como la bandera:
           FLAG{hidden_in_plain_sight_2024}"
```

---

## En qu&eacute; se diferencia

La mayor&iacute;a de las herramientas de esteganograf&iacute;a son utilidades de prop&oacute;sito &uacute;nico. steganography-mcp le da a su agente de IA la capacidad de **razonar sobre todas las t&eacute;cnicas esteganogr&aacute;ficas simult&aacute;neamente**.

<table>
<thead>
<tr>
<th></th>
<th>Enfoque tradicional</th>
<th>steganography-mcp</th>
</tr>
</thead>
<tbody>
<tr>
<td><b>Interfaz</b></td>
<td>10+ herramientas CLI, 5+ lenguajes, UIs web</td>
<td>MCP &mdash; el agente de IA llama herramientas conversacionalmente</td>
</tr>
<tr>
<td><b>Cobertura</b></td>
<td>Una t&eacute;cnica a la vez</td>
<td>17 categor&iacute;as, 128 herramientas en paralelo</td>
</tr>
<tr>
<td><b>An&aacute;lisis de imagen</b></td>
<td>zsteg (Ruby), stegsolve (Java), scripts personalizados</td>
<td>El agente ejecuta chi-cuadrado, an&aacute;lisis RS, SPA, mapa de entrop&iacute;a, histograma, extracci&oacute;n de planos de bits, metadatos y detecci&oacute;n de firmas de herramientas &mdash; todo a la vez</td>
</tr>
<tr>
<td><b>Forense JPEG</b></td>
<td>stegdetect (abandonado), inspecci&oacute;n DCT manual</td>
<td>El agente analiza histograma DCT, doble compresi&oacute;n, tablas de cuantificaci&oacute;n, an&aacute;lisis EXIF profundo, comparaci&oacute;n de miniaturas, campos de comentarios</td>
</tr>
<tr>
<td><b>Estego de audio</b></td>
<td>Audacity + scripts LSB manuales</td>
<td>El agente realiza chi-cuadrado LSB, an&aacute;lisis espectral, verificaci&oacute;n LSB de regiones de silencio, detecci&oacute;n de ocultaci&oacute;n por eco, extracci&oacute;n de metadatos</td>
</tr>
<tr>
<td><b>Estego de texto</b></td>
<td>Herramientas web, inspecci&oacute;n manual</td>
<td>El agente detecta caracteres de ancho cero, codificaci&oacute;n de espacios en blanco, Unicode invisible, hom&oacute;glifos, acr&oacute;sticos &mdash; y puede incrustar/extraer mensajes ZWC</td>
</tr>
<tr>
<td><b>Dependencias</b></td>
<td>Ruby, Java, Perl, Python, C, herramientas web</td>
<td><code>npx -y steganography-mcp</code> &mdash; 4 dependencias, TypeScript puro</td>
</tr>
<tr>
<td><b>Claves API</b></td>
<td>N/A (pero cadena de herramientas fragmentada)</td>
<td>Cero. 100 % sin conexi&oacute;n, sin llamadas externas</td>
</tr>
<tr>
<td><b>Salida</b></td>
<td>Texto sin formato, im&aacute;genes, correlaci&oacute;n manual</td>
<td>JSON estructurado &mdash; la IA correlaciona hallazgos autom&aacute;ticamente</td>
</tr>
</tbody>
</table>

---

## Inicio r&aacute;pido

### Opci&oacute;n 1: npx (sin instalaci&oacute;n)

```bash
npx -y steganography-mcp
```

Las 128 herramientas funcionan inmediatamente. Sin claves API. Sin configuraci&oacute;n. 100 % sin conexi&oacute;n.

### Opci&oacute;n 2: bunx (m&aacute;s r&aacute;pido)

```bash
bunx steganography-mcp
```

### Opci&oacute;n 3: Clonar

```bash
git clone https://github.com/badchars/steganography-mcp.git
cd steganography-mcp
bun install
```

### Conectar con su agente de IA

<details open>
<summary><b>Claude Code</b></summary>

```bash
# Con npx
claude mcp add steganography -- npx -y steganography-mcp

# Con clon local
claude mcp add steganography -- bun run /path/to/steganography-mcp/src/index.ts
```

</details>

<details>
<summary><b>Claude Desktop</b></summary>

A&ntilde;adir en `~/Library/Application Support/Claude/claude_desktop_config.json`:

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
<summary><b>Cursor / Windsurf / otros clientes MCP</b></summary>

Mismo formato de configuraci&oacute;n JSON. Apunte el comando a `npx -y steganography-mcp` o a la ruta de su instalaci&oacute;n local.

</details>

### Comenzar a analizar

```
T&uacute;: "Verifica esta imagen en busca de datos ocultos"
```

Eso es todo. El agente ejecuta an&aacute;lisis chi-cuadrado, an&aacute;lisis RS, mapeo de entrop&iacute;a, extracci&oacute;n de metadatos, detecci&oacute;n de datos a&ntilde;adidos y escaneo de firmas de herramientas &mdash; autom&aacute;ticamente.

---

## Qu&eacute; puede hacer la IA

### Resolutor de desaf&iacute;os CTF

```
T&uacute;: "Resuelve este desaf&iacute;o CTF de esteganograf&iacute;a — la imagen est&aacute; en challenge.png"

Agente: -> img_detect: El estegoan&aacute;lisis chi-cuadrado detecta incrustaci&oacute;n LSB
           (p=0,00012), an&aacute;lisis RS estima tasa de incrustaci&oacute;n del 38 %,
           anomal&iacute;a de entrop&iacute;a en bloques (12,4)-(15,8)
        -> img_lsb_extract: 1.247 bytes extra&iacute;dos de LSBs del canal RGB
        -> crypto_detect: Los datos coinciden con patr&oacute;n Base64 (confianza: 0,95)
        -> crypto_decode: "Q1RGe3N0M2cwX21hc3Rlcn0=" -> "CTF{st3g0_master}"
        -> img_known_tools: Firma de OpenStego detectada en chunks PNG

        "Bandera encontrada: CTF{st3g0_master}
         La imagen usa esteganograf&iacute;a LSB incrustada por OpenStego.
         La carga estaba codificada en Base64 en los bits menos
         significativos RGB con una tasa de incrustaci&oacute;n del 38 %."
```

### Investigaci&oacute;n forense digital

```
T&uacute;: "Analiza suspect.png y suspect.wav en busca de comunicaci&oacute;n encubierta"

Agente: -> img_detect: No se detect&oacute; estego LSB, pero se encontraron datos
           a&ntilde;adidos (12.847 bytes despu&eacute;s del marcador PNG IEND)
        -> file_identify: Los datos a&ntilde;adidos comienzan con firma ZIP (PK)
        -> img_metadata: El chunk PNG tEXt contiene una clave inusual "comm"
           con valor Base64
        -> audio_detect: El archivo WAV tiene anomal&iacute;a chi-cuadrado LSB (p=0,003)
        -> audio_silence: 3 secciones silenciosas con LSBs activos detectadas
        -> audio_lsb_extract: 2.048 bytes de datos ocultos extra&iacute;dos

        "Ambos archivos contienen datos ocultos:
         1. suspect.png tiene un archivo ZIP a&ntilde;adido despu&eacute;s del marcador
            EOF de PNG, m&aacute;s un mensaje codificado en Base64 en los metadatos
         2. suspect.wav contiene esteganograf&iacute;a LSB, espec&iacute;ficamente en
            secciones silenciosas — un fuerte indicador de ocultaci&oacute;n intencional.
         Se recomienda extraer el ZIP y analizar la carga del WAV."
```

### Detecci&oacute;n de texto con ancho cero

```
T&uacute;: "Este correo parece normal pero podr&iacute;a contener texto oculto"

Agente: -> text_detect: 847 caracteres de ancho cero detectados entre
           caracteres visibles
        -> text_zwc_detect: ZWSP (342), ZWNJ (505) encontrados en 127
           posiciones a lo largo del texto
        -> text_zwc_extract: La decodificaci&oacute;n binaria produce "EXFIL-ROUTE-7"
        -> text_invisible_scan: 3 caracteres Unicode invisibles adicionales
           (U+2060, U+FEFF) encontrados en la secci&oacute;n del encabezado

        "El correo contiene un mensaje oculto codificado con caracteres
         de ancho cero: 'EXFIL-ROUTE-7'. 847 caracteres invisibles est&aacute;n
         dispersos a lo largo del texto visible usando codificaci&oacute;n binaria
         ZWSP/ZWNJ. Adem&aacute;s, se encontraron 3 caracteres Word Joiner y
         BOM en el encabezado — probablemente artefactos de metadatos."
```

### An&aacute;lisis forense JPEG

```
T&uacute;: "&iquest;Esta imagen JPEG es aut&eacute;ntica o ha sido manipulada?"

Agente: -> jpeg_structure: 14 marcadores analizados, estructura JFIF normal
        -> jpeg_double_compression: Doble compresi&oacute;n DETECTADA —
           puntuaci&oacute;n de artefactos de bloqueo 0,73, ratio de anomal&iacute;a
           de cuantificaci&oacute;n 0,81
        -> jpeg_quantization: Calidad ~75 (luminancia), pero patrones
           residuales sugieren calidad original ~92
        -> jpeg_exif_deep: EXIF dice "iPhone 14 Pro" pero el campo Software
           dice "Adobe Photoshop 25.0"
        -> jpeg_thumbnail_compare: Las dimensiones de la miniatura NO
           coinciden con la imagen principal (miniatura: 4032x3024,
           principal: 2048x1536)

        "Este JPEG ha sido manipulado. Evidencia:
         1. Doble compresi&oacute;n detectada — la imagen fue decodificada y
            recodificada a menor calidad (original ~92, actual ~75)
         2. EXIF indica iPhone 14 Pro pero el campo software revela
            edici&oacute;n con Photoshop
         3. La miniatura es de la captura original 4032x3024 pero la
            imagen principal fue redimensionada a 2048x1536
         Los tres hallazgos confirman independientemente una
         modificaci&oacute;n posterior a la captura."
```

---

## Referencia de herramientas (128 herramientas)

### Resumen por categor&iacute;a

| Categor&iacute;a | Herramientas | Descripci&oacute;n |
|----------|--------------|-------------|
| [Estegoan&aacute;lisis de imagen](#-estegoan&aacute;lisis-de-imagen-14) | 14 | Detecci&oacute;n LSB, chi-cuadrado, an&aacute;lisis RS, mapeo de entrop&iacute;a, planos de bits, histograma, metadatos, firmas de herramientas |
| [An&aacute;lisis JPEG](#-an&aacute;lisis-jpeg-7) | 7 | Histograma DCT, doble compresi&oacute;n, tablas de cuantificaci&oacute;n, EXIF profundo, forense de miniaturas, an&aacute;lisis de comentarios |
| [Estegoan&aacute;lisis de audio](#-estegoan&aacute;lisis-de-audio-7) | 7 | Detecci&oacute;n LSB en WAV, an&aacute;lisis espectral, an&aacute;lisis de regiones de silencio, ocultaci&oacute;n por eco, extracci&oacute;n de metadatos |
| [Texto y Unicode](#-texto-y-unicode-10) | 10 | Caracteres de ancho cero, codificaci&oacute;n de espacios, Unicode invisible, hom&oacute;glifos, acr&oacute;sticos, an&aacute;lisis Unicode |
| [Forense de archivos](#-forense-de-archivos-10) | 10 | Magic bytes, detecci&oacute;n de pol&iacute;glotas, archivos incrustados, datos a&ntilde;adidos, entrop&iacute;a, volcado hex, strings, cabeceras |
| [An&aacute;lisis de documentos](#-an&aacute;lisis-de-documentos-5) | 5 | Contenido PDF oculto, metadatos PDF, streams PDF, contenido HTML oculto, metadatos XML |
| [Codificaci&oacute;n y criptograf&iacute;a](#-codificaci&oacute;n-y-criptograf&iacute;a-7) | 7 | Detecci&oacute;n de codificaci&oacute;n, decodificador multiformato, an&aacute;lisis de frecuencia, entrop&iacute;a, fuerza bruta XOR, ID de hash, patrones de cifrado |
| [An&aacute;lisis JPEG avanzado](#-an&aacute;lisis-jpeg-avanzado-7) | 7 | Detecci&oacute;n de F5, JSteg, OutGuess, PVD, chi-cuadrado de ventana deslizante, estegoan&aacute;lisis crop-recalibrate, compatibilidad de herramientas |
| [Esteganograf&iacute;a de video](#-esteganograf&iacute;a-de-video-8) | 8 | LSB de cuadros AVI, an&aacute;lisis inter-cuadro, comparaci&oacute;n de cuadros, metadatos, estructura, datos EOF |
| [Esteganograf&iacute;a GIF](#-esteganograf&iacute;a-gif-8) | 8 | LSB de paleta, entrop&iacute;a de sub-bloques LZW, extensiones de comentarios, extensiones de aplicaci&oacute;n, an&aacute;lisis de cuadros |
| [Esteganograf&iacute;a de red](#-esteganograf&iacute;a-de-red-8) | 8 | Canales encubiertos PCAP, an&aacute;lisis de cabeceras IP/TCP, payloads ICMP, t&uacute;neles DNS, cabeceras HTTP, timing |
| [Esteganograf&iacute;a MP3](#-esteganograf&iacute;a-mp3-7) | 7 | Datos ocultos en ID3, an&aacute;lisis de frames, manipulaci&oacute;n de padding, an&aacute;lisis de muestras, metadatos, estructura |
| [An&aacute;lisis de espectro ensanchado](#-an&aacute;lisis-de-espectro-ensanchado-5) | 5 | Espectro de magnitud DFT, autocorrelaci&oacute;n, detecci&oacute;n de marcas de agua, an&aacute;lisis de piso de ruido, detecci&oacute;n de patchwork |
| [An&aacute;lisis BPCS](#-an&aacute;lisis-bpcs-5) | 5 | Segmentaci&oacute;n por complejidad de plano de bits, mapeo de complejidad, an&aacute;lisis de umbral, extracci&oacute;n de datos, estimaci&oacute;n de capacidad |
| [Esteganograf&iacute;a de archivos comprimidos](#-esteganograf&iacute;a-de-archivos-comprimidos-7) | 7 | Espacios slack en ZIP, campos extra, comentarios, detecci&oacute;n de pol&iacute;glotas, an&aacute;lisis de estructura, metadatos |
| [Creaci&oacute;n e incrustaci&oacute;n](#-creaci&oacute;n-e-incrustaci&oacute;n-7) | 7 | Inyecci&oacute;n EOF, inyecci&oacute;n de metadatos, codificaci&oacute;n de espacios en blanco, cifrado nulo, creaci&oacute;n de pol&iacute;glotas, inyecci&oacute;n de comentarios, incrustaci&oacute;n en paleta |
| [Esteganograf&iacute;a de c&oacute;digos QR](#-esteganograf&iacute;a-de-c&oacute;digos-qr-6) | 6 | Detecci&oacute;n de stego QR, an&aacute;lisis de estructura, capacidad ECC, an&aacute;lisis de m&oacute;dulos, extracci&oacute;n de datos, comparaci&oacute;n |

---

<details open>
<summary><h3>Estegoan&aacute;lisis de imagen (14)</h3></summary>

| Herramienta | Descripci&oacute;n |
|-------------|-------------|
| `img_detect` | Detecci&oacute;n autom&aacute;tica de esteganograf&iacute;a en una imagen. Ejecuta chi-cuadrado, an&aacute;lisis RS, entrop&iacute;a, metadatos, datos a&ntilde;adidos y verificaciones de firmas de herramientas. Devuelve un informe JSON completo |
| `img_lsb_detect` | Detecci&oacute;n estad&iacute;stica de esteganograf&iacute;a LSB. Ejecuta an&aacute;lisis chi-cuadrado y de pares de muestras en cada canal de color independientemente |
| `img_lsb_extract` | Extraer datos ocultos de los LSBs de una imagen. Extrae bits de los canales y plano de bits especificados, intenta decodificaci&oacute;n UTF-8 y muestra volcado hex |
| `img_lsb_embed` | Incrustar un mensaje en una imagen usando esteganograf&iacute;a LSB. Lee un archivo PNG, incrusta el mensaje en los bits menos significativos y escribe un nuevo archivo PNG |
| `img_bitplane` | Extraer y visualizar un plano de bits espec&iacute;fico de un canal de imagen. Muestra dimensiones, porcentaje de bits en 1 y una vista previa en arte ASCII |
| `img_chi_square` | Ataque de estegoan&aacute;lisis chi-cuadrado en cada canal de color independientemente. Detecta reemplazo LSB comprobando si los pares de valores de p&iacute;xeles adyacentes est&aacute;n ecualizados |
| `img_rs_analysis` | Estegoan&aacute;lisis RS (Regular-Singular) usando el m&eacute;todo Fridrich-Goljan-Du. Analiza grupos de p&iacute;xeles para estimar la tasa de incrustaci&oacute;n LSB por canal |
| `img_histogram` | Generar un histograma de valores de p&iacute;xeles con detecci&oacute;n de anomal&iacute;as. Detecta anomal&iacute;as de Pares de Valores (PoV) que indican esteganograf&iacute;a LSB |
| `img_entropy_map` | An&aacute;lisis de entrop&iacute;a por bloques de una imagen. Divide la imagen en bloques y calcula la entrop&iacute;a de Shannon por bloque, marcando regiones de alta entrop&iacute;a |
| `img_metadata` | Extracci&oacute;n profunda de metadatos de una imagen. Para PNG: chunks de texto, lista de chunks, info IHDR. Para JPEG: EXIF, comentarios, tablas de cuantificaci&oacute;n, lista de marcadores |
| `img_appended_data` | Detectar y extraer datos a&ntilde;adidos despu&eacute;s del marcador EOF de la imagen. Comprueba datos ocultos despu&eacute;s de PNG IEND, JPEG EOI o el l&iacute;mite de tama&ntilde;o de archivo BMP |
| `img_compare` | Comparaci&oacute;n p&iacute;xel a p&iacute;xel de dos im&aacute;genes. Informa conteo de p&iacute;xeles id&eacute;nticos/diferentes, diferencia m&aacute;xima y qu&eacute; canales est&aacute;n afectados |
| `img_channel_analysis` | An&aacute;lisis estad&iacute;stico por canal para R, G, B y A. Informa media, desviaci&oacute;n est&aacute;ndar, entrop&iacute;a, m&iacute;nimo, m&aacute;ximo y conteo de valores &uacute;nicos |
| `img_known_tools` | Escanear bytes del archivo de imagen en busca de firmas conocidas de herramientas de esteganograf&iacute;a. Comprueba contra una base de datos de patrones de OpenStego, Steghide, JSteg, F5 y otros |

</details>

<details>
<summary><h3>An&aacute;lisis JPEG (7)</h3></summary>

| Herramienta | Descripci&oacute;n |
|-------------|-------------|
| `jpeg_structure` | Analizar marcadores/segmentos JPEG con offsets y tama&ntilde;os. Muestra la estructura interna incluyendo todos los marcadores, posiciones y longitudes de segmentos |
| `jpeg_dct_histogram` | An&aacute;lisis de distribuci&oacute;n de coeficientes DCT para detecci&oacute;n de esteganograf&iacute;a. Analiza la distribuci&oacute;n de valores de p&iacute;xeles del canal Y y datos de entrop&iacute;a SOS para detectar anomal&iacute;as causadas por JSteg, F5 y OutGuess |
| `jpeg_double_compression` | Detectar artefactos de doble compresi&oacute;n JPEG. Identifica artefactos de bloqueo caracter&iacute;sticos y anomal&iacute;as en tablas de cuantificaci&oacute;n &mdash; un indicador com&uacute;n de manipulaci&oacute;n de imagen o incrustaci&oacute;n estego |
| `jpeg_quantization` | An&aacute;lisis de tablas de cuantificaci&oacute;n con estimaci&oacute;n de calidad. Muestra todas las tablas de cuantificaci&oacute;n en formato de cuadr&iacute;cula 8x8 y estima el factor de calidad JPEG |
| `jpeg_exif_deep` | An&aacute;lisis EXIF profundo incluyendo coordenadas GPS, marcas de tiempo, informaci&oacute;n de software, miniaturas, notas del fabricante y todas las entradas IFD. Marca campos de inter&eacute;s forense |
| `jpeg_thumbnail_compare` | Comparar miniatura EXIF contra la imagen JPEG principal. Una discrepancia de dimensiones o contenido indica modificaci&oacute;n posterior a la captura &mdash; un artefacto forense com&uacute;n |
| `jpeg_comment` | Extraer y analizar marcadores COM (comentario) de JPEG. Comprueba patrones de datos ocultos, comentarios inusualmente grandes y contenido de alta entrop&iacute;a |

</details>

<details>
<summary><h3>Estegoan&aacute;lisis de audio (7)</h3></summary>

| Herramienta | Descripci&oacute;n |
|-------------|-------------|
| `audio_detect` | Detecci&oacute;n autom&aacute;tica de esteganograf&iacute;a de audio en un archivo WAV. Ejecuta chi-cuadrado LSB, an&aacute;lisis de entrop&iacute;a, inspecci&oacute;n de metadatos y comprobaci&oacute;n de datos a&ntilde;adidos |
| `audio_lsb_detect` | An&aacute;lisis estad&iacute;stico de LSB de muestras PCM. Realiza prueba chi-cuadrado en LSBs agrupados por pares de valores para detectar esteganograf&iacute;a de reemplazo LSB |
| `audio_lsb_extract` | Extraer datos LSB de muestras de audio. Lee el bit menos significativo de cada muestra PCM e intenta decodificar datos ocultos |
| `audio_spectrum` | An&aacute;lisis espectral para se&ntilde;ales ocultas en audio WAV. Analiza distribuci&oacute;n de valores de muestras, tasa de cruces por cero, energ&iacute;a RMS por bloque y detecta secciones silenciosas an&oacute;malas |
| `audio_metadata` | Extraer metadatos de un archivo WAV incluyendo chunks RIFF INFO, detalles de formato e informaci&oacute;n de todos los chunks |
| `audio_silence` | Analizar secciones silenciosas en audio WAV en busca de datos ocultos. Encuentra regiones de muestras cercanas a cero y comprueba sus LSBs &mdash; secciones silenciosas con LSBs activos son un fuerte indicador estego |
| `audio_echo_detect` | Detecci&oacute;n de ocultaci&oacute;n por eco mediante an&aacute;lisis de autocorrelaci&oacute;n. Calcula autocorrelaci&oacute;n normalizada en retardos de eco comunes. Patrones de eco regulares indican ocultaci&oacute;n esteganogr&aacute;fica por eco |

</details>

<details>
<summary><h3>Texto y Unicode (10)</h3></summary>

| Herramienta | Descripci&oacute;n |
|-------------|-------------|
| `text_detect` | Detecci&oacute;n autom&aacute;tica de esteganograf&iacute;a de texto. Comprueba caracteres de ancho cero, codificaci&oacute;n de espacios en blanco, Unicode invisible, hom&oacute;glifos y patrones inusuales |
| `text_zwc_detect` | Detectar caracteres de ancho cero (ZWSP, ZWNJ, ZWJ, BOM) en texto. Informa posiciones, conteos y longitud potencial del mensaje codificado |
| `text_zwc_extract` | Decodificar un mensaje codificado con caracteres de ancho cero. Extrae caracteres ZWC y decodifica binario: ZWSP=0, ZWNJ=1 (intenta ambas polaridades) |
| `text_zwc_embed` | Incrustar un mensaje secreto en texto de cobertura usando caracteres de ancho cero. Codifica el mensaje en binario y mapea bits a ZWSP(0)/ZWNJ(1) |
| `text_whitespace_detect` | Detectar codificaci&oacute;n de espacios en blanco en texto. Comprueba cada l&iacute;nea en busca de patrones de espacios finales donde espacio=0 y tabulaci&oacute;n=1 podr&iacute;an codificar datos binarios |
| `text_whitespace_extract` | Extraer un mensaje codificado en espacios en blanco del texto. Lee los espacios finales de cada l&iacute;nea y decodifica la codificaci&oacute;n binaria espacio=0/tabulaci&oacute;n=1 |
| `text_invisible_scan` | Escanear texto en busca de TODOS los caracteres Unicode invisibles. Comprueba cada car&aacute;cter contra la base de datos completa de caracteres invisibles e informa posiciones y nombres |
| `text_homoglyph` | Detectar sustituciones de hom&oacute;glifos Unicode en texto. Identifica caracteres no ASCII que se asemejan visualmente a letras ASCII (a cir&iacute;lica vs a latina, etc.) |
| `text_unicode_analysis` | An&aacute;lisis completo de distribuci&oacute;n de caracteres Unicode. Categoriza todos los caracteres por bloque de script, realiza an&aacute;lisis de entrop&iacute;a y detecta mezcla sospechosa de scripts |
| `text_acrostic` | Detectar patrones de primera letra, primera palabra, &uacute;ltima letra, &uacute;ltima palabra o en&eacute;simo car&aacute;cter (mensajes acr&oacute;sticos) ocultos a lo largo de las l&iacute;neas de texto |

</details>

<details>
<summary><h3>Forense de archivos (10)</h3></summary>

| Herramienta | Descripci&oacute;n |
|-------------|-------------|
| `file_identify` | Identificaci&oacute;n del tipo de archivo mediante magic bytes. Lee la cabecera del archivo y la compara contra una base de datos completa de firmas de archivos conocidas. Comprueba discrepancia de extensi&oacute;n |
| `file_polyglot` | Detectar archivos pol&iacute;glotas v&aacute;lidos como dos o m&aacute;s formatos simult&aacute;neamente. Comprueba m&uacute;ltiples firmas de archivo v&aacute;lidas en diferentes offsets (PDF+ZIP, PNG+PDF, etc.) |
| `file_embedded` | Buscar archivos incrustados dentro de un binario, similar a binwalk. Busca firmas de magic bytes conocidas en cada offset para descubrir archivos ocultos o a&ntilde;adidos |
| `file_appended` | Detectar datos a&ntilde;adidos despu&eacute;s del marcador EOF espec&iacute;fico del formato. Soporta PNG (IEND), JPEG (FFD9), BMP, ZIP (EOCD) y PDF (%%EOF) |
| `file_entropy` | An&aacute;lisis de entrop&iacute;a secci&oacute;n por secci&oacute;n. Calcula entrop&iacute;a de Shannon por bloque y en general, marcando secciones an&oacute;malas de alta entrop&iacute;a |
| `file_entropy_visual` | Visualizaci&oacute;n ASCII de entrop&iacute;a de un archivo. Renderiza un gr&aacute;fico de barras basado en texto mostrando niveles de entrop&iacute;a a lo largo del archivo para detecci&oacute;n visual de anomal&iacute;as |
| `file_strings` | Extraer cadenas imprimibles y Unicode de archivos binarios. Busca secuencias de caracteres imprimibles y las reporta con offsets de archivo. Soporta ASCII, UTF-8, UTF-16 |
| `file_hex` | Volcado hex con barra lateral ASCII. Formato tradicional de editor hex con direcciones de offset, bytes hex y representaci&oacute;n ASCII imprimible |
| `file_header` | An&aacute;lisis profundo de cabecera y estructura para formatos conocidos. Analiza PNG IHDR, JPEG SOF, cabecera de info BMP, cabeceras de archivo local ZIP y versi&oacute;n/metadatos PDF |
| `file_compare` | Diff binario entre dos archivos. Comparaci&oacute;n byte a byte reportando diferencias con offsets, porcentaje id&eacute;ntico y detecci&oacute;n de diferencia solo en LSB para an&aacute;lisis estego |

</details>

<details>
<summary><h3>An&aacute;lisis de documentos (5)</h3></summary>

| Herramienta | Descripci&oacute;n |
|-------------|-------------|
| `doc_pdf_hidden` | Detecci&oacute;n de contenido PDF oculto. Busca JavaScript, acciones autom&aacute;ticas, OpenAction, anotaciones ocultas, texto invisible, archivos incrustados y otro contenido encubierto |
| `doc_pdf_metadata` | Extracci&oacute;n de metadatos PDF. Analiza el diccionario /Info y bloques de metadatos XMP para atribuci&oacute;n forense y an&aacute;lisis de procedencia del documento |
| `doc_pdf_streams` | An&aacute;lisis de streams PDF. Localiza todos los bloques stream/endstream, intenta descompresi&oacute;n zlib e informa tama&ntilde;os y entrop&iacute;a para encontrar datos ocultos |
| `doc_html_hidden` | Detecci&oacute;n de contenido HTML oculto. Busca comentarios, elementos con display:none, atributos data-*, inputs ocultos, contenido base64, elementos de tama&ntilde;o cero y texto invisible |
| `doc_xml_metadata` | Extracci&oacute;n de metadatos XML y documentos Office. Analiza Dublin Core, propiedades de Microsoft Office, instrucciones de procesamiento y otros campos de metadatos |

</details>

<details>
<summary><h3>Codificaci&oacute;n y criptograf&iacute;a (7)</h3></summary>

| Herramienta | Descripci&oacute;n |
|-------------|-------------|
| `crypto_detect` | Detecci&oacute;n autom&aacute;tica del tipo de codificaci&oacute;n de una cadena de entrada. Prueba contra todos los patrones conocidos (Base64, hex, binario, morse, codificaci&oacute;n URL, entidades HTML, etc.) y devuelve coincidencias ordenadas por confianza |
| `crypto_decode` | Decodificador multiformato con soporte para Base64, hex, binario, decimal, octal, codificaci&oacute;n URL, ROT13, Base32, c&oacute;digo Morse y entidades HTML. El modo autom&aacute;tico detecta la codificaci&oacute;n primero |
| `crypto_frequency` | An&aacute;lisis de frecuencia de caracteres para criptoan&aacute;lisis. Cuenta ocurrencias de caracteres, compara con la frecuencia est&aacute;ndar del ingl&eacute;s (ETAOINSHRDLU) y calcula el &Iacute;ndice de Coincidencia |
| `crypto_entropy` | C&aacute;lculo y clasificaci&oacute;n de entrop&iacute;a de Shannon para cadenas. Calcula entrop&iacute;a a nivel de car&aacute;cter y byte, clasificando en categor&iacute;as desde datos repetidos hasta cifrado/aleatorio |
| `crypto_xor` | Fuerza bruta de clave XOR para claves de byte &uacute;nico y m&uacute;ltiple. Prueba las 256 claves de byte &uacute;nico y puntua por probabilidad de texto en ingl&eacute;s. Usa IC para estimaci&oacute;n de longitud de clave multibyte |
| `crypto_hash_id` | Identificaci&oacute;n de tipo de hash. Compara la entrada con patrones de hash conocidos por longitud y formato (MD5, SHA-1, SHA-256, SHA-512, bcrypt, CRC32, NTLM, etc.) |
| `crypto_patterns` | Detecci&oacute;n de patrones de cifrado y codificaci&oacute;n conocidos. Analiza texto buscando cifrado C&eacute;sar, cifrado de sustituci&oacute;n, Vigen&egrave;re, transposici&oacute;n rail fence, Atbash y texto invertido |

</details>

---

## Uso de CLI

```bash
# Mostrar ayuda
npx -y steganography-mcp --help

# Listar las 128 herramientas con descripciones
npx -y steganography-mcp --list

# Detectar esteganograf&iacute;a en una imagen
npx -y steganography-mcp --tool img_detect '{"file_path":"challenge.png"}'

# Extraer mensaje oculto de LSBs
npx -y steganography-mcp --tool img_lsb_extract '{"file_path":"stego.png"}'

# Estegoan&aacute;lisis chi-cuadrado
npx -y steganography-mcp --tool img_chi_square '{"file_path":"suspect.png"}'

# An&aacute;lisis RS (m&eacute;todo Fridrich-Goljan-Du)
npx -y steganography-mcp --tool img_rs_analysis '{"file_path":"suspect.png"}'

# Detecci&oacute;n de doble compresi&oacute;n JPEG
npx -y steganography-mcp --tool jpeg_double_compression '{"file_path":"photo.jpg"}'

# An&aacute;lisis EXIF profundo
npx -y steganography-mcp --tool jpeg_exif_deep '{"file_path":"photo.jpg"}'

# Detecci&oacute;n de esteganograf&iacute;a de audio
npx -y steganography-mcp --tool audio_detect '{"file_path":"message.wav"}'

# Detectar codificaci&oacute;n de caracteres de ancho cero
npx -y steganography-mcp --tool text_zwc_detect '{"text":"texto sospechoso aqu&iacute;"}'

# Incrustar un mensaje oculto con caracteres de ancho cero
npx -y steganography-mcp --tool text_zwc_embed '{"text":"texto de cobertura","message":"secreto"}'

# Identificar tipo de archivo y detectar pol&iacute;glotas
npx -y steganography-mcp --tool file_polyglot '{"file_path":"sospechoso.pdf"}'

# Buscar archivos incrustados (estilo binwalk)
npx -y steganography-mcp --tool file_embedded '{"file_path":"mystery.bin"}'

# Visualizaci&oacute;n de entrop&iacute;a
npx -y steganography-mcp --tool file_entropy_visual '{"file_path":"data.bin"}'

# Detecci&oacute;n autom&aacute;tica de codificaci&oacute;n
npx -y steganography-mcp --tool crypto_detect '{"input":"aGVsbG8gd29ybGQ="}'

# Fuerza bruta XOR
npx -y steganography-mcp --tool crypto_xor '{"input":"4f5243484e"}'

# Detectar patrones de cifrado
npx -y steganography-mcp --tool crypto_patterns '{"input":"Gur dhvpx oebja sbk"}'

# Usando Bun (inicio m&aacute;s r&aacute;pido)
bunx steganography-mcp --tool img_detect '{"file_path":"image.png"}'
```

---

## Casos de uso

### Desaf&iacute;os CTF
Resuelva desaf&iacute;os de esteganograf&iacute;a en competiciones de captura de bandera. El agente de IA puede aplicar sistem&aacute;ticamente todas las t&eacute;cnicas de detecci&oacute;n &mdash; an&aacute;lisis LSB, inspecci&oacute;n de metadatos, datos a&ntilde;adidos, detecci&oacute;n de codificaci&oacute;n e identificaci&oacute;n de cifrados &mdash; para encontrar banderas ocultas en im&aacute;genes, archivos de audio, documentos y texto.

### Forense digital
Detecte canales de comunicaci&oacute;n encubiertos en investigaciones forenses. Analice archivos sospechosos en busca de datos ocultos usando estegoan&aacute;lisis estad&iacute;stico (chi-cuadrado, an&aacute;lisis RS), compruebe datos a&ntilde;adidos despu&eacute;s de marcadores EOF, busque archivos incrustados e identifique firmas de herramientas de esteganograf&iacute;a.

### Investigaci&oacute;n de seguridad
Analice herramientas y t&eacute;cnicas de esteganograf&iacute;a. Compare im&aacute;genes originales y estego p&iacute;xel a p&iacute;xel, estudie distribuciones de coeficientes DCT en estego JPEG, mida cambios de entrop&iacute;a por incrustaci&oacute;n y haga ingenier&iacute;a inversa de esquemas de codificaci&oacute;n.

### Educaci&oacute;n
Aprenda c&oacute;mo funcionan las t&eacute;cnicas de esteganograf&iacute;a. Incruste y extraiga mensajes LSB, codifique texto con caracteres de ancho cero, visualice planos de bits y mapas de entrop&iacute;a, analice estructuras de archivos con volcados hex y estudie patrones de cifrado con an&aacute;lisis de frecuencia.

### Respuesta a incidentes
Durante la respuesta a incidentes, verifique documentos e im&aacute;genes en busca de canales ocultos de exfiltraci&oacute;n. Escanee PDFs buscando JavaScript oculto y archivos incrustados, detecte codificaci&oacute;n de caracteres de ancho cero en correos electr&oacute;nicos, identifique archivos pol&iacute;glotas y analice codificaciones sospechosas.

---

## Arquitectura

```
src/
  index.ts                    # Punto de entrada CLI (--help, --list, --tool, servidor stdio)
  protocol/
    mcp-server.ts             # Configuraci&oacute;n del servidor MCP (transporte stdio)
    tools.ts                  # Registro de herramientas — las 128 herramientas ensambladas aqu&iacute;
  types/
    index.ts                  # Tipos compartidos (ToolDef, ToolContext, ToolResult)
  utils/
    binary.ts                 # Lectura de archivos binarios, volcado hex, detecci&oacute;n de formato
    stats.ts                  # Entrop&iacute;a de Shannon, chi-cuadrado, frecuencia de bytes, DFT, autocorrelaci&oacute;n, complejidad BPCS, prueba de patchwork
    cache.ts                  # Cach&eacute; TTL
    png-parser.ts             # Parser PNG puro en TS (IHDR, chunks, datos de p&iacute;xeles)
    jpeg-parser.ts            # Parser JPEG puro en TS (marcadores, EXIF, cuantificaci&oacute;n)
    wav-parser.ts             # Parser WAV puro en TS (chunks RIFF, muestras PCM)
    bmp-parser.ts             # Parser BMP puro en TS (cabecera, datos de p&iacute;xeles)
    avi-parser.ts             # Parser AVI puro en TS (frames, cabeceras)
    gif-parser.ts             # Parser GIF puro en TS (paleta, bloques LZW, extensiones)
    pcap-parser.ts            # Parser PCAP puro en TS (paquetes, cabeceras)
    mp3-parser.ts             # Parser MP3 puro en TS (frames, etiquetas ID3)
    zip-parser.ts             # Parser ZIP puro en TS (entradas, espacios slack)
  image/                      # Herramientas de estegoan&aacute;lisis de imagen (14)
  jpeg/                       # Herramientas de an&aacute;lisis JPEG (7)
  audio/                      # Herramientas de estegoan&aacute;lisis de audio (7)
  text/                       # Herramientas de texto y Unicode (10)
  file/                       # Herramientas de forense de archivos (10)
  document/                   # Herramientas de an&aacute;lisis de documentos (5)
  crypto/                     # Herramientas de codificaci&oacute;n y criptograf&iacute;a (7)
  jpegadv/                    # Herramientas de an&aacute;lisis JPEG avanzado (7)
  video/                      # Herramientas de esteganograf&iacute;a de video (8)
  gif/                        # Herramientas de esteganograf&iacute;a GIF (8)
  network/                    # Herramientas de esteganograf&iacute;a de red (8)
  mp3/                        # Herramientas de esteganograf&iacute;a MP3 (7)
  spread/                     # Herramientas de an&aacute;lisis de espectro ensanchado (5)
  bpcs/                       # Herramientas de an&aacute;lisis BPCS (5)
  archive/                    # Herramientas de esteganograf&iacute;a de archivos comprimidos (7)
  create/                     # Herramientas de creaci&oacute;n e incrustaci&oacute;n (7)
  qrcode/                     # Herramientas de esteganograf&iacute;a de c&oacute;digos QR (6)
  data/
    encoding-patterns.ts      # Patrones regex de codificaci&oacute;n + decodificadores
    magic-bytes.ts            # Base de datos de firmas de archivos (100+ formatos)
    stego-signatures.ts       # Firmas conocidas de herramientas de esteganograf&iacute;a
    unicode-invisible.ts      # Base de datos de caracteres Unicode invisibles
```

**Decisiones de dise&ntilde;o:**

- **4 dependencias, nada m&aacute;s** &mdash; `@modelcontextprotocol/sdk` para el protocolo MCP, `zod` para validaci&oacute;n de entrada, `pngjs` para acceso a p&iacute;xeles PNG, `jpeg-js` para decodificaci&oacute;n JPEG. Sin &aacute;rbol de dependencias inflado. Sin m&oacute;dulos nativos. Sin bindings de C. Sin Python. Sin Java.
- **100 % sin conexi&oacute;n** &mdash; Cada herramienta se ejecuta completamente en local. Sin solicitudes HTTP. Sin llamadas API. Sin telemetr&iacute;a. Sin dependencias de la nube. Sus archivos nunca abandonan su m&aacute;quina.
- **An&aacute;lisis estad&iacute;stico en TypeScript puro** &mdash; Prueba chi-cuadrado, an&aacute;lisis RS (Fridrich-Goljan-Du), An&aacute;lisis de Pares de Muestras, entrop&iacute;a de Shannon, &Iacute;ndice de Coincidencia y an&aacute;lisis de frecuencia est&aacute;n todos implementados en TypeScript puro. Sin bibliotecas matem&aacute;ticas externas.
- **Parsers de formato propios** &mdash; Chunks PNG, marcadores/EXIF/tablas de cuantificaci&oacute;n JPEG, chunks RIFF de WAV y cabeceras BMP se analizan con cero dependencias externas usando los parsers de `utils/`. Esto permite an&aacute;lisis profundos espec&iacute;ficos de formato que las bibliotecas de prop&oacute;sito general no pueden proporcionar.
- **17 proveedores, 1 servidor** &mdash; Cada categor&iacute;a de an&aacute;lisis es un m&oacute;dulo independiente. El agente de IA elige qu&eacute; herramientas usar seg&uacute;n el contexto de la investigaci&oacute;n.
- **Patr&oacute;n ToolDef limpio** &mdash; Cada herramienta sigue el mismo patr&oacute;n `{ name, description, schema, execute }`. A&ntilde;adir una nueva herramienta es un &uacute;nico objeto en el m&oacute;dulo correspondiente.
- **Validaci&oacute;n Zod en cada campo** &mdash; Cada campo del esquema tiene `.describe()` para contexto del agente de IA. Las entradas inv&aacute;lidas se capturan antes de la ejecuci&oacute;n con mensajes de error claros.

---

## Parte de la suite de seguridad MCP

| Proyecto | Dominio | Herramientas |
|----------|---------|--------------|
| [hackbrowser-mcp](https://github.com/badchars/hackbrowser-mcp) | Pruebas de seguridad basadas en navegador | 39 herramientas |
| [cloud-audit-mcp](https://github.com/badchars/cloud-audit-mcp) | Seguridad en la nube (AWS/Azure/GCP) | 38 herramientas |
| [github-security-mcp](https://github.com/badchars/github-security-mcp) | Postura de seguridad de GitHub | 39 herramientas |
| [cve-mcp](https://github.com/badchars/cve-mcp) | Inteligencia de vulnerabilidades | 23 herramientas |
| [osint-mcp-server](https://github.com/badchars/osint-mcp-server) | OSINT y reconocimiento | 37 herramientas |
| [darknet-mcp-server](https://github.com/badchars/darknet-mcp-server) | Dark web e inteligencia de amenazas | 66 herramientas |
| [dns-security-mcp](https://github.com/badchars/dns-security-mcp) | Inteligencia de seguridad DNS | 103 herramientas |
| **steganography-mcp** | **An&aacute;lisis esteganogr&aacute;fico** | **128 herramientas** |

---

## Contribuir

Las contribuciones son bienvenidas. Consulte [CONTRIBUTING.md](../../CONTRIBUTING.md) para las directrices.

---

<p align="center">
<b>Solo para investigaci&oacute;n de seguridad autorizada y fines educativos.</b><br>
Aseg&uacute;rese siempre de tener la autorizaci&oacute;n adecuada antes de realizar an&aacute;lisis esteganogr&aacute;fico en archivos que no le pertenecen.
</p>

<p align="center">
  <a href="../../LICENSE">Licencia MIT</a> &bull; Creado por <a href="https://orhanyildirim.us">Orhan Yildirim</a> &bull; <a href="mailto:contact@orhanyildirim.us">contact@orhanyildirim.us</a>
</p>
