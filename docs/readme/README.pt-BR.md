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
  <strong>Português (BR)</strong> |
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

<h3 align="center">O kit de ferramentas de analise esteganografica mais completo para agentes de IA.</h3>

<p align="center">
  Deteccao LSB, estegananalise qui-quadrado, analise RS, forense DCT, esteganografia de audio, codificacao de largura zero em texto, forense de arquivos, deteccao de poliglotas, identificacao de codificacao, analise JPEG avancada, esteganografia de video e GIF, esteganografia de rede, analise MP3, espectro espalhado, analise BPCS, esteganografia de arquivos compactados, criacao e incorporacao, esteganografia de QR code &mdash; unificados em um unico servidor MCP.<br>
  <b>128 ferramentas. 17 categorias. 4 dependencias. 100% offline.</b> Zero chaves de API. Toda ferramenta roda localmente.
</p>

<br>

<p align="center">
  <a href="#o-problema">O Problema</a> &bull;
  <a href="#como-e-diferente">Como e Diferente</a> &bull;
  <a href="#inicio-rapido">Inicio Rapido</a> &bull;
  <a href="#o-que-a-ia-pode-fazer">O Que a IA Pode Fazer</a> &bull;
  <a href="#referencia-de-ferramentas-128-ferramentas">Ferramentas (128)</a> &bull;
  <a href="#uso-via-cli">CLI</a> &bull;
  <a href="#arquitetura">Arquitetura</a> &bull;
  <a href="../../CONTRIBUTING.md">Contribuicao</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/steganography-mcp"><img src="https://img.shields.io/npm/v/steganography-mcp.svg" alt="versao npm"></a>
  <a href="https://www.npmjs.com/package/steganography-mcp"><img src="https://img.shields.io/npm/dm/steganography-mcp" alt="downloads npm"></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="Licenca MIT"></a>
  <img src="https://img.shields.io/badge/node-%3E%3D18-brightgreen" alt="Node >= 18">
  <img src="https://img.shields.io/badge/MCP-Compatible-blueviolet" alt="Compativel com MCP">
  <img src="https://img.shields.io/badge/tools-128-cyan" alt="128 Ferramentas">
  <img src="https://img.shields.io/badge/API_keys-Zero-green" alt="Zero Chaves de API">
  <img src="https://img.shields.io/badge/TypeScript-strict-3178c6" alt="TypeScript strict">
  <a href="https://github.com/badchars/steganography-mcp"><img src="https://img.shields.io/github/stars/badchars/steganography-mcp" alt="Estrelas GitHub"></a>
</p>

---

## O Problema

Esteganografia e a arte de esconder dados a vista de todos &mdash; dentro de imagens, arquivos de audio, documentos e ate texto Unicode. E usada em competicoes CTF, investigacoes de forense digital, canais de comunicacao ocultos e payloads de malware. Sua deteccao requer uma combinacao de analise estatistica, parsing especifico de formato, medicao de entropia e conhecimento especializado.

```
Fluxo de trabalho tradicional de analise esteganografica:
  detectar estego em imagem        ->  zsteg + stegsolve (2 ferramentas, Ruby + Java)
  analise qui-quadrado             ->  script Python customizado
  analise RS                       ->  codigo MATLAB/Python customizado
  forense JPEG DCT                 ->  stegdetect (ferramenta C abandonada de 2004)
  extrair dados LSB                ->  zsteg + steghide + openstego (3 ferramentas)
  esteganografia de audio          ->  Audacity manual + scripts customizados
  deteccao de largura zero         ->  ferramentas web + inspecao manual
  forense de arquivos / binwalk    ->  binwalk + foremost + xxd (3 ferramentas)
  metadados EXIF                   ->  exiftool (dependencia Perl)
  deteccao de codificacao          ->  CyberChef web UI + tentativa manual
  ─────────────────────────────────
  Total: 10+ ferramentas, 5+ linguagens, horas de correlacao manual
```

**steganography-mcp** fornece ao seu agente de IA 128 ferramentas em 17 categorias atraves do [Model Context Protocol](https://modelcontextprotocol.io). O agente realiza estegananalise de imagens, forense JPEG, analise de audio, deteccao de esteganografia textual, forense de arquivos, analise de documentos, identificacao de codificacao, analise JPEG avancada, esteganografia de video e GIF, esteganografia de rede, analise MP3, analise de espectro espalhado, analise BPCS, esteganografia de arquivos compactados, criacao e incorporacao de dados e esteganografia de QR code &mdash; tudo em uma unica conversa, tudo rodando 100% localmente sem dependencia de servicos externos.

```
Com steganography-mcp:
  Voce: "Analise esta imagem de desafio CTF em busca de dados ocultos"

  Agente: -> img_detect: Qui-quadrado p=0.0001 (incorporacao LSB detectada),
             analise RS estima taxa de incorporacao de 42%, anomalia de
             entropia no quadrante inferior direito
          -> img_lsb_extract: Extraidos 847 bytes dos LSBs RGB
          -> crypto_detect: Dados extraidos estao codificados em Base64
          -> crypto_decode: Decodificado para "FLAG{hidden_in_plain_sight_2024}"
          -> img_known_tools: Correspondencia de assinatura para OpenStego

          "A imagem contem esteganografia LSB incorporada com OpenStego.
           O teste qui-quadrado confirma substituicao LSB em todos os tres
           canais RGB com taxa de incorporacao de 42%. O payload oculto
           esta codificado em Base64 e decodifica para a flag:
           FLAG{hidden_in_plain_sight_2024}"
```

---

## Como e Diferente

A maioria das ferramentas de esteganografia sao utilitarios de proposito unico. steganography-mcp da ao seu agente de IA a capacidade de **analisar todas as tecnicas esteganograficas simultaneamente**.

<table>
<thead>
<tr>
<th></th>
<th>Abordagem Tradicional</th>
<th>steganography-mcp</th>
</tr>
</thead>
<tbody>
<tr>
<td><b>Interface</b></td>
<td>10+ ferramentas CLI, 5+ linguagens, UIs web</td>
<td>MCP &mdash; agente de IA chama ferramentas conversacionalmente</td>
</tr>
<tr>
<td><b>Cobertura</b></td>
<td>Uma tecnica por vez</td>
<td>17 categorias, 128 ferramentas em paralelo</td>
</tr>
<tr>
<td><b>Analise de imagens</b></td>
<td>zsteg (Ruby), stegsolve (Java), scripts customizados</td>
<td>O agente executa qui-quadrado, analise RS, SPA, mapa de entropia, histograma, extracao de plano de bits, metadados e deteccao de assinaturas de ferramentas &mdash; tudo de uma vez</td>
</tr>
<tr>
<td><b>Forense JPEG</b></td>
<td>stegdetect (abandonado), inspecao DCT manual</td>
<td>O agente analisa histograma DCT, compressao dupla, tabelas de quantizacao, analise EXIF profunda, comparacao de miniaturas, campos de comentario</td>
</tr>
<tr>
<td><b>Estego de audio</b></td>
<td>Audacity + scripts LSB manuais</td>
<td>O agente realiza LSB qui-quadrado, analise espectral, verificacao LSB em regioes de silencio, deteccao de ocultacao por eco, extracao de metadados</td>
</tr>
<tr>
<td><b>Estego de texto</b></td>
<td>Ferramentas web, inspecao manual</td>
<td>O agente detecta caracteres de largura zero, codificacao por espacos, Unicode invisivel, homoglifos, acrosticos &mdash; e pode incorporar/extrair mensagens ZWC</td>
</tr>
<tr>
<td><b>Dependencias</b></td>
<td>Ruby, Java, Perl, Python, C, ferramentas web</td>
<td><code>npx -y steganography-mcp</code> &mdash; 4 dependencias, TypeScript puro</td>
</tr>
<tr>
<td><b>Chaves de API</b></td>
<td>N/A (mas cadeia de ferramentas fragmentada)</td>
<td>Zero. 100% offline, sem chamadas externas</td>
</tr>
<tr>
<td><b>Saida</b></td>
<td>Texto bruto, imagens, correlacao manual</td>
<td>JSON estruturado &mdash; a IA correlaciona descobertas automaticamente</td>
</tr>
</tbody>
</table>

---

## Inicio Rapido

### Opcao 1: npx (sem instalacao)

```bash
npx -y steganography-mcp
```

Todas as 128 ferramentas funcionam imediatamente. Sem chaves de API. Sem configuracao. 100% offline.

### Opcao 2: bunx (mais rapido)

```bash
bunx steganography-mcp
```

### Opcao 3: Clonar

```bash
git clone https://github.com/badchars/steganography-mcp.git
cd steganography-mcp
bun install
```

### Conectar ao seu agente de IA

<details open>
<summary><b>Claude Code</b></summary>

```bash
# Com npx
claude mcp add steganography -- npx -y steganography-mcp

# Com clone local
claude mcp add steganography -- bun run /path/to/steganography-mcp/src/index.ts
```

</details>

<details>
<summary><b>Claude Desktop</b></summary>

Adicione ao `~/Library/Application Support/Claude/claude_desktop_config.json`:

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
<summary><b>Cursor / Windsurf / outros clientes MCP</b></summary>

Mesmo formato de configuracao JSON. Aponte o comando para `npx -y steganography-mcp` ou o caminho da sua instalacao local.

</details>

### Comece a analisar

```
Voce: "Verifique esta imagem em busca de dados ocultos"
```

Isso e tudo. O agente executa analise qui-quadrado, analise RS, mapeamento de entropia, extracao de metadados, deteccao de dados anexados e varredura de assinaturas de ferramentas &mdash; automaticamente.

---

## O Que a IA Pode Fazer

### Resolvedor de Desafios CTF

```
Voce: "Resolva este desafio de esteganografia CTF — a imagem esta em challenge.png"

Agente: -> img_detect: Estegananalise qui-quadrado detecta incorporacao LSB
           (p=0.00012), analise RS estima taxa de incorporacao de 38%,
           anomalia de entropia nos blocos (12,4)-(15,8)
        -> img_lsb_extract: Extraidos 1.247 bytes dos LSBs dos canais RGB
        -> crypto_detect: Dados correspondem ao padrao Base64 (confianca: 0.95)
        -> crypto_decode: "Q1RGe3N0M2cwX21hc3Rlcn0=" -> "CTF{st3g0_master}"
        -> img_known_tools: Assinatura OpenStego detectada nos chunks PNG

        "Flag encontrada: CTF{st3g0_master}
         A imagem usa esteganografia LSB incorporada pelo OpenStego.
         O payload estava codificado em Base64 nos bits menos
         significativos dos canais RGB com taxa de incorporacao de 38%."
```

### Investigacao de Forense Digital

```
Voce: "Analise suspect.png e suspect.wav em busca de comunicacao oculta"

Agente: -> img_detect: Estego LSB nao detectado, mas dados anexados encontrados
           (12.847 bytes apos o marcador PNG IEND)
        -> file_identify: Dados anexados comecam com assinatura ZIP (PK)
        -> img_metadata: Chunk tEXt do PNG contem chave incomum "comm"
           com valor em Base64
        -> audio_detect: Arquivo WAV tem anomalia qui-quadrado LSB (p=0.003)
        -> audio_silence: 3 secoes silenciosas com LSBs ativos detectadas
        -> audio_lsb_extract: Extraidos 2.048 bytes de dados ocultos

        "Ambos os arquivos contem dados ocultos:
         1. suspect.png tem um arquivo ZIP anexado apos o marcador
            EOF do PNG, mais uma mensagem codificada em Base64 nos metadados
         2. suspect.wav contem esteganografia LSB, especificamente em
            secoes silenciosas — um forte indicador de ocultacao intencional.
         Recomenda-se extrair o ZIP e analisar o payload do WAV."
```

### Deteccao de Texto de Largura Zero

```
Voce: "Este email parece normal mas pode ter texto oculto"

Agente: -> text_detect: 847 caracteres de largura zero detectados entre
           caracteres visiveis
        -> text_zwc_detect: ZWSP (342), ZWNJ (505) encontrados em 127
           posicoes ao longo do texto
        -> text_zwc_extract: Decodificacao binaria resulta em "EXFIL-ROUTE-7"
        -> text_invisible_scan: 3 caracteres Unicode invisiveis adicionais
           (U+2060, U+FEFF) encontrados na secao de cabecalho

        "O email contem uma mensagem oculta codificada com caracteres de
         largura zero: 'EXFIL-ROUTE-7'. 847 caracteres invisiveis estao
         dispersos pelo texto visivel usando codificacao binaria ZWSP/ZWNJ.
         Adicionalmente, 3 caracteres Word Joiner e BOM foram encontrados
         no cabecalho — provavelmente artefatos de metadados."
```

### Analise Forense de JPEG

```
Voce: "Esta imagem JPEG e autentica ou foi adulterada?"

Agente: -> jpeg_structure: 14 marcadores analisados, estrutura JFIF normal
        -> jpeg_double_compression: Compressao dupla DETECTADA —
           pontuacao de artefatos de bloqueio 0.73, taxa de anomalia de quantizacao 0.81
        -> jpeg_quantization: Qualidade ~75 (luminancia), mas padroes
           residuais sugerem que o original era qualidade ~92
        -> jpeg_exif_deep: EXIF diz "iPhone 14 Pro" mas campo Software
           diz "Adobe Photoshop 25.0"
        -> jpeg_thumbnail_compare: Dimensoes da miniatura NAO correspondem
           a imagem principal (miniatura: 4032x3024, principal: 2048x1536)

        "Este JPEG foi adulterado. Evidencias:
         1. Compressao dupla detectada — a imagem foi decodificada e
            recodificada em qualidade inferior (original ~92, atual ~75)
         2. EXIF afirma iPhone 14 Pro mas o campo de software revela
            edicao no Photoshop
         3. A miniatura e da captura original 4032x3024 mas a imagem
            principal foi redimensionada para 2048x1536
         Todas as tres descobertas confirmam independentemente
         modificacao pos-captura."
```

---

## Referencia de Ferramentas (128 ferramentas)

### Visao Geral das Categorias

| Categoria | Ferramentas | Descricao |
|----------|-------|-------------|
| [Estegananalise de Imagens](#-estegananalise-de-imagens-14) | 14 | Deteccao LSB, qui-quadrado, analise RS, mapeamento de entropia, planos de bits, histograma, metadados, assinaturas de ferramentas |
| [Analise JPEG](#-analise-jpeg-7) | 7 | Histograma DCT, compressao dupla, tabelas de quantizacao, EXIF profundo, forense de miniaturas, analise de comentarios |
| [Estegananalise de Audio](#-estegananalise-de-audio-7) | 7 | Deteccao LSB WAV, analise espectral, analise de regioes de silencio, ocultacao por eco, extracao de metadados |
| [Texto & Unicode](#-texto--unicode-10) | 10 | Caracteres de largura zero, codificacao por espacos, Unicode invisivel, homoglifos, acrosticos, analise Unicode |
| [Forense de Arquivos](#-forense-de-arquivos-10) | 10 | Magic bytes, deteccao de poliglotas, arquivos incorporados, dados anexados, entropia, hex dump, strings, cabecalhos |
| [Analise de Documentos](#-analise-de-documentos-5) | 5 | Conteudo PDF oculto, metadados PDF, streams PDF, conteudo HTML oculto, metadados XML |
| [Codificacao & Cripto](#-codificacao--cripto-7) | 7 | Deteccao de codificacao, decodificador multi-formato, analise de frequencia, entropia, XOR brute-force, identificacao de hash, padroes de cifra |
| [Analise JPEG Avancada](#-analise-jpeg-avancada-7) | 7 | F5, JSteg, OutGuess, deteccao PVD, janela deslizante qui-quadrado, estegananalise crop-recalibracao, compatibilidade de ferramentas |
| [Esteganografia de Video](#-esteganografia-de-video-8) | 8 | LSB de frame AVI, analise inter-frame, comparacao de frames, metadados, estrutura, dados EOF |
| [Esteganografia de GIF](#-esteganografia-de-gif-8) | 8 | Paleta LSB, entropia de sub-bloco LZW, extensoes de comentario, extensoes de aplicacao, analise de frames |
| [Esteganografia de Rede](#-esteganografia-de-rede-8) | 8 | Canais ocultos PCAP, analise de cabecalhos IP/TCP, payloads ICMP, tunelamento DNS, cabecalhos HTTP, timing |
| [Esteganografia MP3](#-esteganografia-mp3-7) | 7 | Dados ocultos ID3, analise de frames, manipulacao de padding, analise de amostras, metadados, estrutura |
| [Espectro Espalhado](#-espectro-espalhado-5) | 5 | Espectro de magnitude DFT, autocorrelacao, deteccao de marca d'agua, analise de piso de ruido, deteccao patchwork |
| [Analise BPCS](#-analise-bpcs-5) | 5 | Segmentacao de complexidade de plano de bits, mapeamento de complexidade, analise de limiar, extracao de dados, estimativa de capacidade |
| [Esteganografia de Arquivos Compactados](#-esteganografia-de-arquivos-compactados-7) | 7 | Espacos vazios ZIP, campos extras, comentarios, deteccao de poliglotas, analise de estrutura, metadados |
| [Criacao & Incorporacao](#-criacao--incorporacao-7) | 7 | Injecao EOF, injecao de metadados, codificacao por espacos, cifra nula, criacao de poliglotas, injecao de comentarios, incorporacao em paleta |
| [Esteganografia de QR Code](#-esteganografia-de-qr-code-6) | 6 | Deteccao de estego QR, analise de estrutura, capacidade ECC, analise de modulos, extracao de dados, comparacao |

---

<details open>
<summary><h3>Estegananalise de Imagens (14)</h3></summary>

| Ferramenta | Descricao |
|------|-------------|
| `img_detect` | Auto-deteccao de esteganografia em uma imagem. Executa qui-quadrado, analise RS, entropia, metadados, dados anexados e verificacoes de assinaturas de ferramentas. Retorna um relatorio JSON abrangente |
| `img_lsb_detect` | Deteccao estatistica de esteganografia LSB. Executa qui-quadrado e analise de pares de amostras em cada canal de cor independentemente |
| `img_lsb_extract` | Extrair dados ocultos dos LSBs da imagem. Extrai bits dos canais e plano de bits especificados, tenta decodificacao UTF-8 e mostra hex dump |
| `img_lsb_embed` | Incorporar uma mensagem em uma imagem usando esteganografia LSB. Le um arquivo PNG, incorpora a mensagem nos bits menos significativos e grava um novo arquivo PNG |
| `img_bitplane` | Extrair e visualizar um plano de bits especifico de um canal da imagem. Mostra dimensoes, percentual de 1-bits e uma pre-visualizacao em ASCII art |
| `img_chi_square` | Ataque esteganalitico qui-quadrado em cada canal de cor independentemente. Detecta substituicao LSB testando se pares de valores de pixels adjacentes estao equalizados |
| `img_rs_analysis` | Estegananalise RS (Regular-Singular) usando o metodo Fridrich-Goljan-Du. Analisa grupos de pixels para estimar a taxa de incorporacao LSB por canal |
| `img_histogram` | Gerar histograma de valores de pixels com deteccao de anomalias. Detecta anomalias de Pares-de-Valores (PoV) que indicam esteganografia LSB |
| `img_entropy_map` | Analise de entropia por bloco de uma imagem. Divide a imagem em blocos e calcula entropia de Shannon por bloco, sinalizando regioes de alta entropia |
| `img_metadata` | Extracao profunda de metadados de uma imagem. Para PNG: chunks de texto, lista de chunks, info IHDR. Para JPEG: EXIF, comentarios, tabelas de quantizacao, lista de marcadores |
| `img_appended_data` | Detectar e extrair dados anexados apos o marcador EOF da imagem. Verifica dados ocultos apos PNG IEND, JPEG EOI ou limite de tamanho de arquivo BMP |
| `img_compare` | Comparacao pixel-a-pixel de duas imagens. Relata contagens de pixels identicos/diferentes, diferenca maxima e quais canais sao afetados |
| `img_channel_analysis` | Analise estatistica por canal para canais R, G, B e A. Relata media, desvio padrao, entropia, min, max e contagem de valores unicos |
| `img_known_tools` | Varredura de bytes da imagem em busca de assinaturas conhecidas de ferramentas de esteganografia. Verifica contra um banco de dados de padroes do OpenStego, Steghide, JSteg, F5 e outros |

</details>

<details>
<summary><h3>Analise JPEG (7)</h3></summary>

| Ferramenta | Descricao |
|------|-------------|
| `jpeg_structure` | Analisar marcadores/segmentos JPEG com offsets e tamanhos. Mostra estrutura interna incluindo todos os marcadores, posicoes e comprimentos de segmentos |
| `jpeg_dct_histogram` | Analise de distribuicao de coeficientes DCT para deteccao de esteganografia. Analisa distribuicao de valores de pixels do canal Y e dados de entropia SOS para detectar anomalias causadas por JSteg, F5 e OutGuess |
| `jpeg_double_compression` | Detectar artefatos de compressao dupla JPEG. Identifica artefatos de bloqueio caracteristicos e anomalias de tabelas de quantizacao &mdash; um indicador comum de adulteracao de imagem ou incorporacao estego |
| `jpeg_quantization` | Analise de tabelas de quantizacao com estimativa de qualidade. Exibe todas as tabelas de quantizacao em formato de grade 8x8 e estima o fator de qualidade JPEG |
| `jpeg_exif_deep` | Analise EXIF profunda incluindo coordenadas GPS, timestamps, informacoes de software, miniaturas, notas do fabricante e todas as entradas IFD. Sinaliza campos de interesse forense |
| `jpeg_thumbnail_compare` | Comparar miniatura EXIF com a imagem JPEG principal. Incompatibilidade de dimensoes ou conteudo indica modificacao pos-captura &mdash; um artefato forense comum |
| `jpeg_comment` | Extrair e analisar marcadores JPEG COM (comentario). Verifica padroes de dados ocultos, comentarios incomumente grandes e conteudo de alta entropia |

</details>

<details>
<summary><h3>Estegananalise de Audio (7)</h3></summary>

| Ferramenta | Descricao |
|------|-------------|
| `audio_detect` | Auto-deteccao de esteganografia de audio em arquivo WAV. Executa LSB qui-quadrado, analise de entropia, inspecao de metadados e verifica dados anexados |
| `audio_lsb_detect` | Analise estatistica de LSB de amostras PCM. Realiza teste qui-quadrado em LSBs agrupados por pares de valores para detectar esteganografia de substituicao LSB |
| `audio_lsb_extract` | Extrair dados LSB de amostras de audio. Le o bit menos significativo de cada amostra PCM e tenta decodificar dados ocultos |
| `audio_spectrum` | Analise espectral para sinais ocultos em audio WAV. Analisa distribuicao de valores de amostras, taxa de cruzamento por zero, energia RMS por bloco e detecta secoes silenciosas anomalas |
| `audio_metadata` | Extrair metadados de arquivo WAV incluindo chunks RIFF INFO, detalhes de formato e todas as informacoes de chunks |
| `audio_silence` | Analisar secoes silenciosas em audio WAV em busca de dados ocultos. Encontra regioes de amostras proximas a zero e verifica seus LSBs &mdash; secoes silenciosas com LSBs ativos sao um forte indicador de estego |
| `audio_echo_detect` | Deteccao de ocultacao por eco via analise de autocorrelacao. Computa autocorrelacao normalizada em atrasos de eco comuns. Padroes de eco regulares indicam ocultacao esteganografica por eco |

</details>

<details>
<summary><h3>Texto & Unicode (10)</h3></summary>

| Ferramenta | Descricao |
|------|-------------|
| `text_detect` | Auto-deteccao de esteganografia de texto. Verifica caracteres de largura zero, codificacao por espacos, Unicode invisivel, homoglifos e padroes incomuns |
| `text_zwc_detect` | Detectar caracteres de largura zero (ZWSP, ZWNJ, ZWJ, BOM) em texto. Relata posicoes, contagens e comprimento potencial de mensagem codificada |
| `text_zwc_extract` | Decodificar uma mensagem codificada por caracteres de largura zero. Extrai caracteres ZWC e decodifica binario: ZWSP=0, ZWNJ=1 (tenta ambas as polaridades) |
| `text_zwc_embed` | Incorporar uma mensagem secreta em texto de cobertura usando caracteres de largura zero. Codifica mensagem para binario e mapeia bits para ZWSP(0)/ZWNJ(1) |
| `text_whitespace_detect` | Detectar codificacao por espacos em texto. Verifica cada linha para padroes de espaco no final onde espaco=0 e tab=1 podem codificar dados binarios |
| `text_whitespace_extract` | Extrair uma mensagem codificada por espacos de texto. Le espacos finais de cada linha e decodifica codificacao binaria espaco=0/tab=1 |
| `text_invisible_scan` | Varredura de texto em busca de TODOS os caracteres Unicode invisiveis. Verifica cada caractere contra o banco de dados completo de caracteres invisiveis e relata posicoes e nomes |
| `text_homoglyph` | Detectar substituicoes de homoglifos Unicode em texto. Identifica caracteres nao-ASCII que se assemelham visualmente a letras ASCII (a cirilico vs a latino, etc.) |
| `text_unicode_analysis` | Analise completa de distribuicao de caracteres Unicode. Categoriza todos os caracteres por bloco de script, realiza analise de entropia e detecta mistura suspeita de scripts |
| `text_acrostic` | Detectar padroes de primeira letra, primeira palavra, ultima letra, ultima palavra ou n-esimo caractere (mensagens acrosticas) ocultos nas linhas do texto |

</details>

<details>
<summary><h3>Forense de Arquivos (10)</h3></summary>

| Ferramenta | Descricao |
|------|-------------|
| `file_identify` | Identificacao de tipo de arquivo via magic bytes. Le o cabecalho do arquivo e compara contra um banco de dados abrangente de assinaturas de arquivos conhecidas. Verifica incompatibilidade de extensao |
| `file_polyglot` | Detectar arquivos poliglotas validos como dois ou mais formatos simultaneamente. Verifica multiplas assinaturas de arquivo validas em diferentes offsets (PDF+ZIP, PNG+PDF, etc.) |
| `file_embedded` | Varredura de arquivos incorporados dentro de um binario, similar ao binwalk. Busca assinaturas de magic bytes conhecidas em cada offset para descobrir arquivos ocultos ou anexados |
| `file_appended` | Detectar dados anexados apos o marcador EOF especifico do formato. Suporta PNG (IEND), JPEG (FFD9), BMP, ZIP (EOCD) e PDF (%%EOF) |
| `file_entropy` | Analise de entropia secao por secao. Calcula entropia de Shannon por bloco e geral, sinalizando secoes anomalas de alta entropia |
| `file_entropy_visual` | Visualizacao ASCII de entropia de arquivo. Renderiza um grafico de barras baseado em texto mostrando niveis de entropia ao longo do arquivo para deteccao visual de anomalias |
| `file_strings` | Extrair strings imprimiveis e Unicode de arquivos binarios. Varre sequencias de caracteres imprimiveis e relata com offsets de arquivo. Suporta ASCII, UTF-8, UTF-16 |
| `file_hex` | Hex dump com barra lateral ASCII. Formato tradicional de editor hex com enderecos de offset, bytes hex e representacao ASCII imprimivel |
| `file_header` | Analise profunda de cabecalho e estrutura para formatos conhecidos. Analisa PNG IHDR, JPEG SOF, cabecalho info BMP, cabecalhos locais de arquivo ZIP e versao/metadados PDF |
| `file_compare` | Diff binario entre dois arquivos. Comparacao byte a byte relatando diferencas com offsets, percentual identico e deteccao de diferencas apenas em LSB para analise estego |

</details>

<details>
<summary><h3>Analise de Documentos (5)</h3></summary>

| Ferramenta | Descricao |
|------|-------------|
| `doc_pdf_hidden` | Deteccao de conteudo PDF oculto. Varre JavaScript, auto-acoes, OpenAction, anotacoes ocultas, texto invisivel, arquivos incorporados e outro conteudo secreto |
| `doc_pdf_metadata` | Extracao de metadados PDF. Analisa o dicionario /Info e blocos de metadados XMP para atribuicao forense e analise de proveniencia do documento |
| `doc_pdf_streams` | Analise de streams PDF. Localiza todos os blocos stream/endstream, tenta descompressao zlib e relata tamanhos e entropia para encontrar dados ocultos |
| `doc_html_hidden` | Deteccao de conteudo HTML oculto. Varre comentarios, elementos display:none, atributos data-*, inputs ocultos, conteudo base64, elementos de tamanho zero e texto invisivel |
| `doc_xml_metadata` | Extracao de metadados XML e Office de documentos. Analisa Dublin Core, propriedades Microsoft Office, instrucoes de processamento e outros campos de metadados |

</details>

<details>
<summary><h3>Codificacao & Cripto (7)</h3></summary>

| Ferramenta | Descricao |
|------|-------------|
| `crypto_detect` | Auto-deteccao de tipo de codificacao de uma string de entrada. Testa contra todos os padroes conhecidos (Base64, hex, binario, morse, codificacao URL, entidades HTML, etc.) e retorna correspondencias ordenadas por confianca |
| `crypto_decode` | Decodificador multi-formato suportando Base64, hex, binario, decimal, octal, codificacao URL, ROT13, Base32, codigo Morse e entidades HTML. Modo auto detecta codificacao primeiro |
| `crypto_frequency` | Analise de frequencia de caracteres para criptoanalise. Conta ocorrencias de caracteres, compara com frequencia padrao do ingles (ETAOINSHRDLU) e calcula Indice de Coincidencia |
| `crypto_entropy` | Calculo e classificacao de entropia de Shannon para strings. Computa entropia em nivel de caractere e byte, classificando em categorias de dados repetidos a criptografados/aleatorios |
| `crypto_xor` | XOR brute-force para chaves de byte unico e multiplos bytes. Tenta todas as 256 chaves de byte unico e pontua por probabilidade de texto em ingles. Usa IC para estimativa de comprimento de chave multi-byte |
| `crypto_hash_id` | Identificacao de tipo de hash. Compara entrada contra padroes de hash conhecidos por comprimento e formato (MD5, SHA-1, SHA-256, SHA-512, bcrypt, CRC32, NTLM, etc.) |
| `crypto_patterns` | Deteccao de padroes de cifra e codificacao conhecidos. Analisa texto para cifra de Cesar, cifra de substituicao, Vigenere, transposicao rail fence, Atbash e texto invertido |

</details>

---

## Uso via CLI

```bash
# Mostrar ajuda
npx -y steganography-mcp --help

# Listar todas as 128 ferramentas com descricoes
npx -y steganography-mcp --list

# Detectar esteganografia em uma imagem
npx -y steganography-mcp --tool img_detect '{"file_path":"challenge.png"}'

# Extrair mensagem oculta dos LSBs
npx -y steganography-mcp --tool img_lsb_extract '{"file_path":"stego.png"}'

# Estegananalise qui-quadrado
npx -y steganography-mcp --tool img_chi_square '{"file_path":"suspect.png"}'

# Analise RS (metodo Fridrich-Goljan-Du)
npx -y steganography-mcp --tool img_rs_analysis '{"file_path":"suspect.png"}'

# Deteccao de compressao dupla JPEG
npx -y steganography-mcp --tool jpeg_double_compression '{"file_path":"photo.jpg"}'

# Analise EXIF profunda
npx -y steganography-mcp --tool jpeg_exif_deep '{"file_path":"photo.jpg"}'

# Deteccao de esteganografia de audio
npx -y steganography-mcp --tool audio_detect '{"file_path":"message.wav"}'

# Detectar codificacao por caracteres de largura zero
npx -y steganography-mcp --tool text_zwc_detect '{"text":"texto suspeito aqui"}'

# Incorporar uma mensagem oculta com caracteres de largura zero
npx -y steganography-mcp --tool text_zwc_embed '{"text":"texto de cobertura","message":"segredo"}'

# Identificar tipo de arquivo e detectar poliglotas
npx -y steganography-mcp --tool file_polyglot '{"file_path":"suspeito.pdf"}'

# Varredura de arquivos incorporados (estilo binwalk)
npx -y steganography-mcp --tool file_embedded '{"file_path":"misterio.bin"}'

# Visualizacao de entropia
npx -y steganography-mcp --tool file_entropy_visual '{"file_path":"dados.bin"}'

# Auto-deteccao de codificacao
npx -y steganography-mcp --tool crypto_detect '{"input":"aGVsbG8gd29ybGQ="}'

# XOR brute-force
npx -y steganography-mcp --tool crypto_xor '{"input":"4f5243484e"}'

# Detectar padroes de cifra
npx -y steganography-mcp --tool crypto_patterns '{"input":"Gur dhvpx oebja sbk"}'

# Usando Bun (inicializacao mais rapida)
bunx steganography-mcp --tool img_detect '{"file_path":"image.png"}'
```

---

## Casos de Uso

### Desafios CTF
Resolva desafios de esteganografia em competicoes de captura de bandeira. O agente de IA pode aplicar sistematicamente todas as tecnicas de deteccao &mdash; analise LSB, inspecao de metadados, dados anexados, deteccao de codificacao e identificacao de cifras &mdash; para encontrar flags ocultas em imagens, arquivos de audio, documentos e texto.

### Forense Digital
Detecte canais de comunicacao ocultos em investigacoes forenses. Analise arquivos suspeitos em busca de dados ocultos usando estegananalise estatistica (qui-quadrado, analise RS), verifique dados anexados apos marcadores EOF, varra arquivos incorporados e identifique assinaturas de ferramentas de esteganografia.

### Pesquisa de Seguranca
Analise ferramentas e tecnicas de esteganografia. Compare imagens originais e estego pixel por pixel, estude distribuicoes de coeficientes DCT em estego JPEG, meca mudancas de entropia da incorporacao e faca engenharia reversa de esquemas de codificacao.

### Educacao
Aprenda como as tecnicas de esteganografia funcionam. Incorpore e extraia mensagens LSB, codifique texto com caracteres de largura zero, visualize planos de bits e mapas de entropia, analise estruturas de arquivos com hex dumps e estude padroes de cifra com analise de frequencia.

### Resposta a Incidentes
Durante a resposta a incidentes, verifique documentos e imagens em busca de canais de exfiltracao ocultos. Varra PDFs em busca de JavaScript oculto e arquivos incorporados, detecte codificacao de largura zero em emails, identifique arquivos poliglotas e analise codificacoes suspeitas.

---

## Arquitetura

```
src/
  index.ts                    # Ponto de entrada CLI (--help, --list, --tool, servidor stdio)
  protocol/
    mcp-server.ts             # Configuracao do servidor MCP (transporte stdio)
    tools.ts                  # Registro de ferramentas — todas as 128 ferramentas montadas aqui
  types/
    index.ts                  # Tipos compartilhados (ToolDef, ToolContext, ToolResult)
  utils/
    binary.ts                 # Leitura de arquivos binarios, hex dump, deteccao de formato
    stats.ts                  # Entropia de Shannon, qui-quadrado, frequencia de bytes
    cache.ts                  # Cache TTL
    png-parser.ts             # Parser PNG em TS puro (IHDR, chunks, dados de pixels)
    jpeg-parser.ts            # Parser JPEG em TS puro (marcadores, EXIF, quantizacao)
    wav-parser.ts             # Parser WAV em TS puro (chunks RIFF, amostras PCM)
    bmp-parser.ts             # Parser BMP em TS puro (cabecalho, dados de pixels)
    avi-parser.ts             # Parser AVI em TS puro (frames, cabecalhos)
    gif-parser.ts             # Parser GIF em TS puro (paleta, frames, extensoes)
    pcap-parser.ts            # Parser PCAP em TS puro (pacotes, cabecalhos)
    mp3-parser.ts             # Parser MP3 em TS puro (frames, tags ID3)
    zip-parser.ts             # Parser ZIP em TS puro (cabecalhos, entradas)
  image/                      # Ferramentas de estegananalise de imagens (14)
  jpeg/                       # Ferramentas de analise JPEG (7)
  audio/                      # Ferramentas de estegananalise de audio (7)
  text/                       # Ferramentas de texto & Unicode (10)
  file/                       # Ferramentas de forense de arquivos (10)
  document/                   # Ferramentas de analise de documentos (5)
  crypto/                     # Ferramentas de codificacao & cripto (7)
  jpegadv/                    # Ferramentas de analise JPEG avancada (7)
  video/                      # Ferramentas de esteganografia de video (8)
  gif/                        # Ferramentas de esteganografia de GIF (8)
  network/                    # Ferramentas de esteganografia de rede (8)
  mp3/                        # Ferramentas de esteganografia MP3 (7)
  spread/                     # Ferramentas de espectro espalhado (5)
  bpcs/                       # Ferramentas de analise BPCS (5)
  archive/                    # Ferramentas de esteganografia de arquivos compactados (7)
  create/                     # Ferramentas de criacao & incorporacao (7)
  qrcode/                     # Ferramentas de esteganografia de QR code (6)
  data/
    encoding-patterns.ts      # Padroes regex de codificacao + decodificadores
    magic-bytes.ts            # Banco de dados de assinaturas de arquivo (100+ formatos)
    stego-signatures.ts       # Assinaturas conhecidas de ferramentas de esteganografia
    unicode-invisible.ts      # Banco de dados de caracteres Unicode invisiveis
```

**Decisoes de design:**

- **4 dependencias, nada mais** &mdash; `@modelcontextprotocol/sdk` para o protocolo MCP, `zod` para validacao de entrada, `pngjs` para acesso a pixels PNG, `jpeg-js` para decodificacao JPEG. Sem arvore de dependencias inchada. Sem modulos nativos. Sem bindings C. Sem Python. Sem Java.
- **100% offline** &mdash; Toda ferramenta roda inteiramente localmente. Sem requisicoes HTTP. Sem chamadas de API. Sem telemetria. Sem dependencias de nuvem. Seus arquivos nunca saem da sua maquina.
- **Analise estatistica em TypeScript puro** &mdash; Teste qui-quadrado, analise RS (Fridrich-Goljan-Du), Analise de Pares de Amostras, entropia de Shannon, Indice de Coincidencia e analise de frequencia sao todos implementados em TypeScript puro. Sem bibliotecas matematicas externas.
- **Parsers de formato customizados** &mdash; Chunks PNG, marcadores/EXIF/tabelas de quantizacao JPEG, chunks RIFF WAV e cabecalhos BMP sao analisados com zero dependencias externas usando os parsers `utils/`. Isso permite analise profunda especifica de formato que bibliotecas de proposito geral nao conseguem fornecer.
- **17 provedores, 1 servidor** &mdash; Cada categoria de analise e um modulo independente. O agente de IA escolhe quais ferramentas usar com base no contexto da investigacao.
- **Padrao ToolDef limpo** &mdash; Toda ferramenta segue o mesmo padrao `{ name, description, schema, execute }`. Adicionar uma nova ferramenta e um unico objeto no modulo apropriado.
- **Validacao Zod em cada campo** &mdash; Todo campo de schema tem `.describe()` para contexto do agente de IA. Entradas invalidas sao capturadas antes da execucao com mensagens de erro claras.

---

## Parte do MCP Security Suite

| Projeto | Dominio | Ferramentas |
|---|---|---|
| [hackbrowser-mcp](https://github.com/badchars/hackbrowser-mcp) | Teste de seguranca baseado em navegador | 39 ferramentas |
| [cloud-audit-mcp](https://github.com/badchars/cloud-audit-mcp) | Seguranca em nuvem (AWS/Azure/GCP) | 38 ferramentas |
| [github-security-mcp](https://github.com/badchars/github-security-mcp) | Postura de seguranca GitHub | 39 ferramentas |
| [cve-mcp](https://github.com/badchars/cve-mcp) | Inteligencia de vulnerabilidades | 23 ferramentas |
| [osint-mcp-server](https://github.com/badchars/osint-mcp-server) | OSINT & reconhecimento | 37 ferramentas |
| [darknet-mcp-server](https://github.com/badchars/darknet-mcp-server) | Dark web & inteligencia de ameacas | 66 ferramentas |
| [dns-security-mcp](https://github.com/badchars/dns-security-mcp) | Inteligencia de seguranca DNS | 103 ferramentas |
| **steganography-mcp** | **Analise esteganografica** | **128 ferramentas** |

---

## Contribuicao

Contribuicoes sao bem-vindas. Veja [CONTRIBUTING.md](../../CONTRIBUTING.md) para orientacoes.

---

<p align="center">
<b>Apenas para pesquisa de seguranca autorizada e fins educacionais.</b><br>
Sempre certifique-se de ter autorizacao adequada antes de realizar analise esteganografica em arquivos que voce nao possui.
</p>

<p align="center">
  <a href="../../LICENSE">Licenca MIT</a> &bull; Criado por <a href="https://orhanyildirim.us">Orhan Yildirim</a> &bull; <a href="mailto:contact@orhanyildirim.us">contact@orhanyildirim.us</a>
</p>
