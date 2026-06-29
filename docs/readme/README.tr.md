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
  <a href="README.pt-BR.md">Português (BR)</a> |
  <a href="README.ar.md">العربية</a> |
  <a href="README.th.md">ไทย</a> |
  <strong>Türkçe</strong> |
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

<h3 align="center">AI ajanlari icin en kapsamli steganografi analiz araclari.</h3>

<p align="center">
  LSB tespiti, ki-kare steganaliz, RS analizi, DCT adli bilisim, ses steganografisi, sifir genislikli metin kodlama, dosya adli bilisim, poliglot tespiti, kodlama tanima &mdash; tek bir MCP sunucusunda birlesti.<br>
  <b>60 arac. 7 kategori. 4 bagimlilik. %100 cevrimdisi.</b> Sifir API anahtari. Her arac yerel calisir.
</p>

<br>

<p align="center">
  <a href="#sorun">Sorun</a> &bull;
  <a href="#farki-ne">Farki Ne</a> &bull;
  <a href="#hizli-baslangic">Hizli Baslangic</a> &bull;
  <a href="#ai-neler-yapabilir">AI Neler Yapabilir</a> &bull;
  <a href="#arac-referansi-60-arac">Araclar (60)</a> &bull;
  <a href="#cli-kullanimi">CLI Kullanimi</a> &bull;
  <a href="#mimari">Mimari</a> &bull;
  <a href="../../CONTRIBUTING.md">Katki</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/steganography-mcp"><img src="https://img.shields.io/npm/v/steganography-mcp.svg" alt="npm surumu"></a>
  <a href="https://www.npmjs.com/package/steganography-mcp"><img src="https://img.shields.io/npm/dm/steganography-mcp" alt="npm indirme"></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT Lisansi"></a>
  <img src="https://img.shields.io/badge/node-%3E%3D18-brightgreen" alt="Node >= 18">
  <img src="https://img.shields.io/badge/MCP-Compatible-blueviolet" alt="MCP Uyumlu">
  <img src="https://img.shields.io/badge/tools-60-cyan" alt="60 Arac">
  <img src="https://img.shields.io/badge/API_keys-Zero-green" alt="Sifir API Anahtari">
  <img src="https://img.shields.io/badge/TypeScript-strict-3178c6" alt="TypeScript strict">
  <a href="https://github.com/badchars/steganography-mcp"><img src="https://img.shields.io/github/stars/badchars/steganography-mcp" alt="GitHub yildiz"></a>
</p>

---

## Sorun

Steganografi, verileri gorunur yerde gizleme sanatidir &mdash; goruntulerin, ses dosyalarinin, belgelerin ve hatta Unicode metnin icinde. CTF yarismalarinda, dijital adli bilisim sorusturmalarinda, gizli iletisim kanallarinda ve zararli yazilim yuklerinde kullanilir. Tespiti; istatistiksel analiz, formata ozgu ayristirma, entropi olcumu ve alan uzmanligi kombinasyonunu gerektirir.

```
Geleneksel steganografi analiz is akisi:
  goruntu stego tespiti          ->  zsteg + stegsolve (2 arac, Ruby + Java)
  ki-kare analizi                ->  ozel Python betigii
  RS analizi                     ->  ozel MATLAB/Python kodu
  JPEG DCT adli bilisim          ->  stegdetect (2004'ten terk edilmis C araci)
  LSB veri cikarma               ->  zsteg + steghide + openstego (3 arac)
  ses steganografisi             ->  Audacity manuel + ozel betikler
  sifir genislikli metin tespiti ->  web araclari + manuel inceleme
  dosya adli bilisim / binwalk   ->  binwalk + foremost + xxd (3 arac)
  EXIF meta verileri             ->  exiftool (Perl bagimliligi)
  kodlama tespiti                ->  CyberChef web UI + manuel tahmin
  ─────────────────────────────────
  Toplam: 10+ arac, 5+ dil, saatlerce manuel korelasyon
```

**steganography-mcp**, AI ajaniniza [Model Context Protocol](https://modelcontextprotocol.io) uzerinden 7 kategoride 60 arac sunar. Ajan; goruntu steganalizi, JPEG adli bilisim, ses analizi, metin steganografi tespiti, dosya adli bilisim, belge analizi ve kodlama tanima islemlerini gerceklestirir &mdash; hepsi tek bir konusmada, hepsi %100 yerel olarak calisan, dis servislere hicbir bagimlilik olmadan.

```
steganography-mcp ile:
  Siz: "Bu CTF goruntusunu gizli veriler icin analiz et"

  Ajan: -> img_detect: Ki-kare p=0.0001 (LSB gomme tespit edildi),
            RS analizi %42 gomme orani tahmin ediyor, sag alt
            kadrandaki entropi anomalisi
         -> img_lsb_extract: RGB LSB'lerinden 847 bayt cikarildi
         -> crypto_detect: Cikarilan veriler Base64 kodlu
         -> crypto_decode: "FLAG{hidden_in_plain_sight_2024}" olarak cozuldu
         -> img_known_tools: OpenStego imza eslemesi

         "Goruntu, OpenStego ile gomulmus LSB steganografisi iceriyor.
          Ki-kare testi, uc RGB kanalinin tamaminda %42 gomme oranyla
          LSB degistirmeyi dogruluyor. Gizli yuk Base64 kodlu
          ve bayraga cozuluyor:
          FLAG{hidden_in_plain_sight_2024}"
```

---

## Farki Ne

Cogu steganografi araci tek amacli yardimci programlardir. steganography-mcp, AI ajaniniza **tum steganografi tekniklerini es zamanli olarak analiz etme** yetenegini verir.

<table>
<thead>
<tr>
<th></th>
<th>Geleneksel Yaklasim</th>
<th>steganography-mcp</th>
</tr>
</thead>
<tbody>
<tr>
<td><b>Arayuz</b></td>
<td>10+ CLI araci, 5+ dil, web arayuzleri</td>
<td>MCP &mdash; AI ajan araclari konusmali olarak cagirir</td>
</tr>
<tr>
<td><b>Kapsam</b></td>
<td>Ayni anda tek teknik</td>
<td>7 kategori, 60 arac paralel</td>
</tr>
<tr>
<td><b>Goruntu analizi</b></td>
<td>zsteg (Ruby), stegsolve (Java), ozel betikler</td>
<td>Ajan ki-kare, RS analizi, SPA, entropi haritasi, histogram, bit duzlemi cikarma, meta veriler ve arac imza tespiti calistirir &mdash; hepsini ayni anda</td>
</tr>
<tr>
<td><b>JPEG adli bilisim</b></td>
<td>stegdetect (terk edilmis), manuel DCT incelemesi</td>
<td>Ajan DCT histogrami, cift siklstirma, niceleme tablolari, derin EXIF analizi, kucuk resim karsilastirma, yorum alanlari analiz eder</td>
</tr>
<tr>
<td><b>Ses stego</b></td>
<td>Audacity + manuel LSB betikleri</td>
<td>Ajan LSB ki-kare, spektrum analizi, sessiz bolge LSB kontrolu, yansima gizleme tespiti, meta veri cikarma islemlerini yapar</td>
</tr>
<tr>
<td><b>Metin stego</b></td>
<td>Web araclari, manuel inceleme</td>
<td>Ajan sifir genislikli karakterleri, bosluk kodlamasi, gorunmez Unicode, homoglifleri, akrostisleri tespit eder &mdash; ve ZWC mesajlari gomebilir/cikarabilir</td>
</tr>
<tr>
<td><b>Bagimliliklar</b></td>
<td>Ruby, Java, Perl, Python, C, web araclari</td>
<td><code>npx -y steganography-mcp</code> &mdash; 4 bagimlilik, saf TypeScript</td>
</tr>
<tr>
<td><b>API anahtarlari</b></td>
<td>N/A (ama parcalanmis arac zinciri)</td>
<td>Sifir. %100 cevrimdisi, dis cagri yok</td>
</tr>
<tr>
<td><b>Cikti</b></td>
<td>Ham metin, goruntuler, manuel korelasyon</td>
<td>Yapilandirilmis JSON &mdash; AI bulguları otomatik olarak iliskilendirir</td>
</tr>
</tbody>
</table>

---

## Hizli Baslangic

### Secenek 1: npx (kurulum gereksiz)

```bash
npx -y steganography-mcp
```

60 aracin tamami aninda calisir. API anahtari yok. Yapilandirma yok. %100 cevrimdisi.

### Secenek 2: bunx (daha hizli)

```bash
bunx steganography-mcp
```

### Secenek 3: Klonlama

```bash
git clone https://github.com/badchars/steganography-mcp.git
cd steganography-mcp
bun install
```

### AI ajaniniza baglanma

<details open>
<summary><b>Claude Code</b></summary>

```bash
# npx ile
claude mcp add steganography -- npx -y steganography-mcp

# Yerel klon ile
claude mcp add steganography -- bun run /path/to/steganography-mcp/src/index.ts
```

</details>

<details>
<summary><b>Claude Desktop</b></summary>

`~/Library/Application Support/Claude/claude_desktop_config.json` dosyasina ekleyin:

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
<summary><b>Cursor / Windsurf / diger MCP istemcileri</b></summary>

Ayni JSON yapilandirma formati. Komutu `npx -y steganography-mcp` veya yerel kurulum yolunuza yonlendirin.

</details>

### Analiz etmeye baslayin

```
Siz: "Bu goruntuyu gizli veriler icin kontrol et"
```

Hepsi bu. Ajan ki-kare analizi, RS analizi, entropi haritalama, meta veri cikarma, eklenmis veri tespiti ve arac imza tarama islemlerini calistirir &mdash; otomatik olarak.

---

## AI Neler Yapabilir

### CTF Gorev Cozucu

```
Siz: "Bu CTF steganografi gorevini coz — goruntu challenge.png'de"

Ajan: -> img_detect: Ki-kare steganaliz LSB gomme tespit ediyor
          (p=0.00012), RS analizi %38 gomme orani tahmin ediyor,
          (12,4)-(15,8) bloklarinda entropi anomalisi
       -> img_lsb_extract: RGB kanal LSB'lerinden 1.247 bayt cikarildi
       -> crypto_detect: Veriler Base64 kalibina uyuyor (guven: 0.95)
       -> crypto_decode: "Q1RGe3N0M2cwX21hc3Rlcn0=" -> "CTF{st3g0_master}"
       -> img_known_tools: PNG chunk'larinda OpenStego imzasi tespit edildi

       "Bayrak bulundu: CTF{st3g0_master}
        Goruntu, OpenStego ile gomulmus LSB steganografisi kullaniyor.
        Yuk, RGB kanallarinin en dusuk anlamli bitlerinde
        Base64 kodlu olarak %38 gomme oraniyla gizlenmis."
```

### Dijital Adli Bilisim Sorusturmasi

```
Siz: "suspect.png ve suspect.wav dosyalarini gizli iletisim icin analiz et"

Ajan: -> img_detect: LSB stego tespit edilmedi, ancak eklenmis veri bulundu
          (PNG IEND isaretcisinden sonra 12.847 bayt)
       -> file_identify: Eklenmis veri ZIP imzasiyla basliyor (PK)
       -> img_metadata: PNG tEXt chunk'i Base64 degerli olagan disi
          "comm" anahtari iceriyor
       -> audio_detect: WAV dosyasi LSB ki-kare anomalisine sahip (p=0.003)
       -> audio_silence: Aktif LSB'lere sahip 3 sessiz bolum tespit edildi
       -> audio_lsb_extract: 2.048 bayt gizli veri cikarildi

       "Her iki dosya da gizli veri iceriyor:
        1. suspect.png, PNG EOF isaretcisinden sonra eklenmi bir ZIP
           arsivi ve meta verilerde Base64 kodlu bir mesaj iceriyor
        2. suspect.wav, ozellikle sessiz bolumlerde LSB steganografisi
           iceriyor — kasitli gizlemenin guclu bir gostergesi.
        ZIP'in cikarilmasi ve WAV yukunnun analiz edilmesi onerilir."
```

### Sifir Genislikli Metin Tespiti

```
Siz: "Bu e-posta normal gorunuyor ama gizli metin iceriyor olabilir"

Ajan: -> text_detect: Gorunen karakterler arasinda 847 sifir genislikli
          karakter tespit edildi
       -> text_zwc_detect: Metin boyunca 127 konumda ZWSP (342),
          ZWNJ (505) bulundu
       -> text_zwc_extract: Ikili kod cozme "EXFIL-ROUTE-7" veriyor
       -> text_invisible_scan: Baslik bolumunde 3 ek gorunmez Unicode
          karakteri (U+2060, U+FEFF) bulundu

       "E-posta, sifir genislikli karakterlerle kodlanmis gizli bir mesaj
        iceriyor: 'EXFIL-ROUTE-7'. 847 gorunmez karakter, ZWSP/ZWNJ
        ikili kodlama kullanilarak gorunen metin boyunca dagilmis.
        Ek olarak, baslikta 3 Word Joiner ve BOM karakteri bulundu
        — muhtemelen meta veri kalintilari."
```

### JPEG Adli Bilisim Analizi

```
Siz: "Bu JPEG goruntu orijinal mi yoksa uzerinde oynanmis mi?"

Ajan: -> jpeg_structure: 14 isaretci ayristirildi, normal JFIF yapisi
       -> jpeg_double_compression: Cift siklstirma TESPIT EDILDI —
          blok artefakt puani 0.73, niceleme anomali orani 0.81
       -> jpeg_quantization: Kalite ~75 (parlaklik), ancak artik
          oruntular orijinalin ~92 kalitede oldugunu gosteriyor
       -> jpeg_exif_deep: EXIF "iPhone 14 Pro" diyor ancak Yazilim
          alani "Adobe Photoshop 25.0" diyor
       -> jpeg_thumbnail_compare: Kucuk resim boyutlari ana goruntuyle
          UYUSMUYOR (kucuk resim: 4032x3024, ana: 2048x1536)

       "Bu JPEG uzerinde oynanmis. Kanitlar:
        1. Cift siklstirma tespit edildi — goruntu cozulmus ve daha dusuk
           kalitede yeniden kodlanmis (orijinal ~92, mevcut ~75)
        2. EXIF iPhone 14 Pro iddia ediyor ancak yazilim alani
           Photoshop duzenlemesini ortaya koyuyor
        3. Kucuk resim orijinal 4032x3024 cekimden ancak ana goruntu
           2048x1536'ya yeniden boyutlanmis
        Uc bulgunun tamami, cekim sonrasi degisikligi bagimsiz olarak
        dogruluyor."
```

---

## Arac Referansi (60 arac)

### Kategori Genel Bakisi

| Kategori | Araclar | Aciklama |
|----------|-------|-------------|
| [Goruntu Steganalizi](#-goruntu-steganalizi-14) | 14 | LSB tespiti, ki-kare, RS analizi, entropi haritalama, bit duzlemleri, histogram, meta veriler, arac imzalari |
| [JPEG Analizi](#-jpeg-analizi-7) | 7 | DCT histogrami, cift siklstirma, niceleme tablolari, derin EXIF, kucuk resim adli bilisimi, yorum analizi |
| [Ses Steganalizi](#-ses-steganalizi-7) | 7 | WAV LSB tespiti, spektrum analizi, sessiz bolge analizi, yansima gizleme, meta veri cikarma |
| [Metin & Unicode](#-metin--unicode-10) | 10 | Sifir genislikli karakterler, bosluk kodlama, gorunmez Unicode, homoglifler, akrostisler, Unicode analizi |
| [Dosya Adli Bilisimi](#-dosya-adli-bilisimi-10) | 10 | Sihirli baytlar, poliglot tespiti, gomulu dosyalar, eklenmis veriler, entropi, hex dump, dizeler, basliklar |
| [Belge Analizi](#-belge-analizi-5) | 5 | Gizli PDF icerigi, PDF meta verileri, PDF akislari, gizli HTML icerigi, XML meta verileri |
| [Kodlama & Kripto](#-kodlama--kripto-7) | 7 | Kodlama tespiti, coklu format kod cozucu, frekans analizi, entropi, XOR kaba kuvvet, hash tanima, sifre kaliplari |

---

<details open>
<summary><h3>Goruntu Steganalizi (14)</h3></summary>

| Arac | Aciklama |
|------|-------------|
| `img_detect` | Bir goruntude steganografiyi otomatik tespit et. Ki-kare, RS analizi, entropi, meta veriler, eklenmis veriler ve arac imza kontrollerini calistirir. Kapsamli bir JSON raporu dondurur |
| `img_lsb_detect` | Istatistiksel LSB steganografi tespiti. Her renk kanalinda bagimsiz olarak ki-kare ve ornek cifti analizi calistirir |
| `img_lsb_extract` | Goruntu LSB'lerinden gizli verileri cikar. Belirtilen kanallardan ve bit duzleminden bitleri cikarir, UTF-8 kod cozme dener ve hex dump gosterir |
| `img_lsb_embed` | LSB steganografisi kullanarak bir goruntuye mesaj gom. Bir PNG dosyasi okur, mesaji en dusuk anlamli bitlere gomer ve yeni bir PNG dosyasi yazar |
| `img_bitplane` | Bir goruntu kanalindan belirli bir bit duzlemini cikar ve goruntule. Boyutlari, 1-bit yuzdelerini ve bir ASCII art onizleme gosterir |
| `img_chi_square` | Her renk kanalinda bagimsiz ki-kare steganalitik saldiri. Komsu piksel deger ciftlerinin esitlenip esitlenmedigini test ederek LSB degistirmeyi tespit eder |
| `img_rs_analysis` | Fridrich-Goljan-Du yontemiyle RS (Duzgun-Tekil) steganalizi. Kanal basina LSB gomme oranini tahmin etmek icin piksel gruplarini analiz eder |
| `img_histogram` | Anomali tespitli piksel degeri histogrami olustur. LSB steganografisini gosteren Deger Cifti (PoV) anomalilerini tespit eder |
| `img_entropy_map` | Bir goruntunun blok basina entropi analizi. Goruntuyu bloklara boler ve blok basina Shannon entropisi hesaplar, yuksek entropili bolgeleri isaretler |
| `img_metadata` | Goruntuden derin meta veri cikarma. PNG icin: metin chunk'lari, chunk listesi, IHDR bilgisi. JPEG icin: EXIF, yorumlar, niceleme tablolari, isaretci listesi |
| `img_appended_data` | Goruntu EOF isaretcisinden sonra eklenmis verileri tespit et ve cikar. PNG IEND, JPEG EOI veya BMP dosya boyutu sinirinin otesindeki gizli verileri kontrol eder |
| `img_compare` | Iki goruntunun piksel piksel karsilastirmasi. Ayni/farkli piksel sayilarini, maksimum farki ve hangi kanallarin etkilendigini raporlar |
| `img_channel_analysis` | R, G, B ve A kanallari icin kanal bazinda istatistiksel analiz. Ortalama, standart sapma, entropi, min, maks ve benzersiz deger sayisini raporlar |
| `img_known_tools` | Goruntu dosyasi baytlarini bilinen steganografi araci imzalari icin tara. OpenStego, Steghide, JSteg, F5 ve diger kalip veritabanina karsi kontrol eder |

</details>

<details>
<summary><h3>JPEG Analizi (7)</h3></summary>

| Arac | Aciklama |
|------|-------------|
| `jpeg_structure` | JPEG isaretcilerini/segmentlerini ofsetler ve boyutlarla ayristir. Tum isaretciler, konumlar ve segment uzunlukları dahil ic yapiyi gosterir |
| `jpeg_dct_histogram` | Steganografi tespiti icin DCT katsayi dagilim analizi. JSteg, F5 ve OutGuess'in neden oldugu anomalileri tespit etmek icin Y-kanal piksel degeri dagilimini ve SOS entropi verilerini analiz eder |
| `jpeg_double_compression` | Cift JPEG siklstirma artefaktlarini tespit et. Karakteristik bloklama artefaktlarini ve niceleme tablosu anomalilerini tanimlar &mdash; goruntu uzerinde oynama veya stego gommenin yaygin bir gostergesi |
| `jpeg_quantization` | Kalite tahminiyle niceleme tablosu analizi. Tum niceleme tablolarini 8x8 izgara formatinda goruntler ve JPEG kalite faktorunu tahmin eder |
| `jpeg_exif_deep` | GPS koordinatlari, zaman damgalari, yazilim bilgisi, kucuk resimler, uretici notlari ve tum IFD girisleri dahil derin EXIF analizi. Adli bilisim acisindan ilginc alanlari isaretler |
| `jpeg_thumbnail_compare` | EXIF kucuk resmini ana JPEG goruntusuyle karsilastir. Boyut veya icerik uyumsuzlugu, cekim sonrasi degisiklige isaret eder &mdash; yaygin bir adli bilisim artefakti |
| `jpeg_comment` | JPEG COM (yorum) isaretcilerini cikar ve analiz et. Gizli veri kaliplarini, olagan disi buyuk yorumlari ve yuksek entropili icerigi kontrol eder |

</details>

<details>
<summary><h3>Ses Steganalizi (7)</h3></summary>

| Arac | Aciklama |
|------|-------------|
| `audio_detect` | WAV dosyasinda ses steganografisini otomatik tespit et. LSB ki-kare, entropi analizi, meta veri incelemesi calistirir ve eklenmis verileri kontrol eder |
| `audio_lsb_detect` | PCM orneklerinin LSB istatistiksel analizi. LSB degistirme steganografisini tespit etmek icin deger ciftlerine gore gruplanmis LSB'lerde ki-kare testi uygular |
| `audio_lsb_extract` | Ses orneklerinden LSB verilerini cikar. Her PCM orneginin en dusuk anlamli bitini okur ve gizli verileri cozmeye calisir |
| `audio_spectrum` | WAV sesinde gizli sinyaller icin spektral analiz. Ornek deger dagilimini, sifir gecis oranini, blok basina RMS enerjisini analiz eder ve anormal sessiz bolumleri tespit eder |
| `audio_metadata` | RIFF INFO chunk'lari, format detaylari ve tum chunk bilgileri dahil WAV dosyasindan meta veri cikar |
| `audio_silence` | WAV sesindeki sessiz bolumleri gizli veriler icin analiz et. Sifira yakin ornek bolgelerini bulur ve LSB'lerini kontrol eder &mdash; aktif LSB'lere sahip sessiz bolumler guclu bir stego gostergesidir |
| `audio_echo_detect` | Otokorelasyon analizi ile yansima gizleme tespiti. Yaygin yansima gecikmelerinde normallestirilmis otokorelasyon hesaplar. Duzenli yansima kaliplari steganografik yansima gizlemeyi gosterir |

</details>

<details>
<summary><h3>Metin & Unicode (10)</h3></summary>

| Arac | Aciklama |
|------|-------------|
| `text_detect` | Metin steganografisini otomatik tespit et. Sifir genislikli karakterleri, bosluk kodlamasini, gorunmez Unicode'u, homoglifleri ve olagan disi kaliplari kontrol eder |
| `text_zwc_detect` | Metinde sifir genislikli karakterleri (ZWSP, ZWNJ, ZWJ, BOM) tespit et. Konumlari, sayilari ve potansiyel kodlanmis mesaj uzunlugunu raporlar |
| `text_zwc_extract` | Sifir genislikli karakterlerle kodlanmis bir mesajin kodunu coz. ZWC karakterlerini cikarir ve ikili olarak cozumler: ZWSP=0, ZWNJ=1 (her iki kutuplulugu dener) |
| `text_zwc_embed` | Sifir genislikli karakterler kullanarak bir ortum metnine gizli mesaj gom. Mesaji ikiliye kodlar ve bitleri ZWSP(0)/ZWNJ(1) ile esler |
| `text_whitespace_detect` | Metinde bosluk kodlamasini tespit et. Her satiri, bosluk=0 ve tab=1'in ikili veri kodlayabilecegi sondaki bosluk kaliplari icin kontrol eder |
| `text_whitespace_extract` | Metinden boslukla kodlanmis bir mesaji cikar. Her satirdan sondaki bosluklari okur ve bosluk=0/tab=1 ikili kodlamasini cozumler |
| `text_invisible_scan` | Metni TUM gorunmez Unicode karakterleri icin tara. Her karakteri tam gorunmez karakter veritabanina karsi kontrol eder ve konumlari ve adlari raporlar |
| `text_homoglyph` | Metinde Unicode homoglif degisikliklerini tespit et. ASCII harflere gorsel olarak benzeyen ASCII olmayan karakterleri tanimlar (Kiril a - Latin a gibi) |
| `text_unicode_analysis` | Tam Unicode karakter dagilim analizi. Tum karakterleri alfabe bloguna gore kategorize eder, entropi analizi yapar ve suphe uyandiran alfabe karisimini tespit eder |
| `text_acrostic` | Metin satirlari boyunca gizlenmis ilk harf, ilk kelime, son harf, son kelime veya n'inci karakter kaliplarini (akrostis mesajlari) tespit et |

</details>

<details>
<summary><h3>Dosya Adli Bilisimi (10)</h3></summary>

| Arac | Aciklama |
|------|-------------|
| `file_identify` | Sihirli baytlar araciligiyla dosya turu tanima. Dosya basligini okur ve bilinen dosya imzalarinin kapsamli veritabanina karsi eslestirir. Uzanti uyumsuzlugunu kontrol eder |
| `file_polyglot` | Ayni anda iki veya daha fazla format olarak gecerli poliglot dosyalari tespit et. Farkli ofsetlerde birden fazla gecerli dosya imzasini kontrol eder (PDF+ZIP, PNG+PDF, vb.) |
| `file_embedded` | Bir ikili dosya icinde gomulu dosyalari tara, binwalk benzeri. Gizli veya eklenmis dosyalari kesfetmek icin her ofsette bilinen sihirli bayt imzalarini arar |
| `file_appended` | Dosyanin formata ozgu EOF isaretcisinden sonra eklenmis verileri tespit et. PNG (IEND), JPEG (FFD9), BMP, ZIP (EOCD) ve PDF (%%EOF) destekler |
| `file_entropy` | Bolum bolum entropi analizi. Blok basina ve genel Shannon entropisini hesaplar, anormal yuksek entropili bolumleri isaretler |
| `file_entropy_visual` | Dosyanin ASCII entropi gorsellestirmesi. Gorsel anomali tespiti icin dosya boyunca entropi seviyelerini gosteren metin tabanli cubuk grafik olusturur |
| `file_strings` | Ikili dosyalardan yazdirilabilir ve Unicode dizeleri cikar. Yazdirilabilir karakter dizilerini tarar ve dosya ofsetleriyle raporlar. ASCII, UTF-8, UTF-16 destekler |
| `file_hex` | ASCII yan cubuklu hex dump. Ofset adresleri, hex baytlari ve yazdirilabilir ASCII temsiliyle geleneksel hex duzenleyici formati |
| `file_header` | Bilinen formatlar icin derin baslik ve yapi analizi. PNG IHDR, JPEG SOF, BMP bilgi basligi, ZIP yerel dosya basliklari ve PDF surum/meta verilerini ayristirir |
| `file_compare` | Iki dosya arasinda ikili fark. Stego analizi icin ofsetlerle farkliliklari, ayni yuzdelerini ve yalnizca LSB farkliliklarinin tespitini raporlayan bayt bayt karsilastirma |

</details>

<details>
<summary><h3>Belge Analizi (5)</h3></summary>

| Arac | Aciklama |
|------|-------------|
| `doc_pdf_hidden` | Gizli PDF icerigini tespit et. JavaScript, otomatik islemler, OpenAction, gizli dipnotlar, gorunmez metin, gomulu dosyalar ve diger gizli icerigi tarar |
| `doc_pdf_metadata` | PDF meta veri cikarma. Adli bilisim atfi ve belge kokeni analizi icin /Info sozlugunu ve XMP meta veri bloklarini ayristirir |
| `doc_pdf_streams` | PDF akis analizi. Tum stream/endstream bloklarini bulur, zlib sikistirma acmayi dener ve gizli verileri bulmak icin boyutlari ve entropiyi raporlar |
| `doc_html_hidden` | Gizli HTML icerigini tespit et. Yorumlari, display:none elemanlarini, data-* ozelliklerini, gizli girisleri, base64 icerigi, sifir boyutlu elemanlari ve gorunmez metni tarar |
| `doc_xml_metadata` | XML ve Office belge meta veri cikarma. Dublin Core, Microsoft Office ozelliklerini, isleme talimatlarini ve diger meta veri alanlarini ayristirir |

</details>

<details>
<summary><h3>Kodlama & Kripto (7)</h3></summary>

| Arac | Aciklama |
|------|-------------|
| `crypto_detect` | Bir giris dizesinin kodlama turunu otomatik tespit et. Tum bilinen kaliplara karsi test eder (Base64, hex, ikili, morse, URL kodlama, HTML varliklari, vb.) ve guvene gore siralanmis eslesmeler dondurur |
| `crypto_decode` | Base64, hex, ikili, ondalik, sekizlik, URL kodlama, ROT13, Base32, Morse kodu ve HTML varliklarini destekleyen coklu format kod cozucu. Otomatik mod once kodlamayi tespit eder |
| `crypto_frequency` | Kriptoanaliz icin karakter frekans analizi. Karakter tekrarlarini sayar, standart Ingilizce frekansiyla (ETAOINSHRDLU) karsilastirir ve Uyum Indeksini hesaplar |
| `crypto_entropy` | Dizeler icin Shannon entropi hesaplama ve siniflandirma. Karakter ve bayt duzeyinde entropi hesaplar, tekrarlanan veriden sifrelenmis/rastgele'ye kadar kategorilere siniflandirir |
| `crypto_xor` | Tek baytli ve cok baytli anahtarlar icin XOR kaba kuvvet. Tum 256 tek baytli anahtari dener ve Ingilizce metin olasiligi ile puanlar. Cok baytli anahtar uzunlugu tahmini icin IC kullanir |
| `crypto_hash_id` | Hash turu tanima. Girisi uzunluk ve formata gore bilinen hash kaliplariyla eslestirir (MD5, SHA-1, SHA-256, SHA-512, bcrypt, CRC32, NTLM, vb.) |
| `crypto_patterns` | Bilinen sifre ve kodlama kalibi tespiti. Metni Sezar sifresi, yerine koyma sifresi, Vigenere, ray cit transpozisyonu, Atbash ve ters metin icin analiz eder |

</details>

---

## CLI Kullanimi

```bash
# Yardimi goster
npx -y steganography-mcp --help

# Tum 60 araci aciklamalariyla listele
npx -y steganography-mcp --list

# Goruntude steganografi tespit et
npx -y steganography-mcp --tool img_detect '{"file_path":"challenge.png"}'

# LSB'lerden gizli mesaji cikar
npx -y steganography-mcp --tool img_lsb_extract '{"file_path":"stego.png"}'

# Ki-kare steganalizi
npx -y steganography-mcp --tool img_chi_square '{"file_path":"suspect.png"}'

# RS analizi (Fridrich-Goljan-Du yontemi)
npx -y steganography-mcp --tool img_rs_analysis '{"file_path":"suspect.png"}'

# JPEG cift siklstirma tespiti
npx -y steganography-mcp --tool jpeg_double_compression '{"file_path":"photo.jpg"}'

# Derin EXIF analizi
npx -y steganography-mcp --tool jpeg_exif_deep '{"file_path":"photo.jpg"}'

# Ses steganografi tespiti
npx -y steganography-mcp --tool audio_detect '{"file_path":"message.wav"}'

# Sifir genislikli karakter kodlamasini tespit et
npx -y steganography-mcp --tool text_zwc_detect '{"text":"suphelii metin burada"}'

# Sifir genislikli karakterlerle gizli mesaj gom
npx -y steganography-mcp --tool text_zwc_embed '{"text":"ortum metni","message":"gizli"}'

# Dosya turunu tanimla ve poliglotlari tespit et
npx -y steganography-mcp --tool file_polyglot '{"file_path":"supheli.pdf"}'

# Gomulu dosyalari tara (binwalk tarzi)
npx -y steganography-mcp --tool file_embedded '{"file_path":"gizemli.bin"}'

# Entropi gorsellestirme
npx -y steganography-mcp --tool file_entropy_visual '{"file_path":"veri.bin"}'

# Otomatik kodlama tespiti
npx -y steganography-mcp --tool crypto_detect '{"input":"aGVsbG8gd29ybGQ="}'

# XOR kaba kuvvet
npx -y steganography-mcp --tool crypto_xor '{"input":"4f5243484e"}'

# Sifre kaliplarini tespit et
npx -y steganography-mcp --tool crypto_patterns '{"input":"Gur dhvpx oebja sbk"}'

# Bun kullanarak (daha hizli baslatma)
bunx steganography-mcp --tool img_detect '{"file_path":"image.png"}'
```

---

## Kullanim Alanlari

### CTF Yarismalar
Bayrak yakalama yarismalrinda steganografi gorevlerini cozun. AI ajani sistematik olarak tum tespit tekniklerini uygulayabilir &mdash; LSB analizi, meta veri incelemesi, eklenmis veriler, kodlama tespiti ve sifre tanima &mdash; goruntuler, ses dosyalari, belgeler ve metinde gizli bayraklari bulmak icin.

### Dijital Adli Bilisim
Adli bilisim sorusturmalarinda gizli iletisim kanallarini tespit edin. Supheli dosyalari istatistiksel steganaliz (ki-kare, RS analizi) kullanarak gizli veriler icin analiz edin, EOF isaretcilerinden sonra eklenmis verileri kontrol edin, gomulu dosyalari tarayin ve steganografi araci imzalarini tanimlayin.

### Guvenlik Arastirmasi
Steganografi araclarini ve tekniklerini analiz edin. Orijinal ve stego goruntulerini piksel piksel karsilastirin, JPEG stego'da DCT katsayi dagilimlarini inceleyin, gomme isleminden kaynaklanan entropi degisikliklerini olcun ve kodlama semalarini tersine muhendislik ile cozumleyin.

### Egitim
Steganografi tekniklerinin nasil calistigini ogrenin. LSB mesajlarini gomun ve cikarin, sifir genislikli karakterlerle metin kodlayin, bit duzlemlerini ve entropi haritalarini goruntuleyin, hex dump'larla dosya yapilarini analiz edin ve frekans analiziyle sifre kaliplarini inceleyin.

### Olay Mudahale
Olay mudahalesi sirasinda belgeleri ve goruntuleri gizli veri sizintisi kanallari icin kontrol edin. PDF'leri gizli JavaScript ve gomulu dosyalar icin tarayin, e-postalarda sifir genislikli karakter kodlamasini tespit edin, poliglot dosyalari tanimlayin ve supheli kodlamalari analiz edin.

---

## Mimari

```
src/
  index.ts                    # CLI giris noktasi (--help, --list, --tool, stdio sunucu)
  protocol/
    mcp-server.ts             # MCP sunucu kurulumu (stdio tasima)
    tools.ts                  # Arac kaydi — tum 60 arac burada birlestirildi
  types/
    index.ts                  # Paylasllan tipler (ToolDef, ToolContext, ToolResult)
  utils/
    binary.ts                 # Ikili dosya okuma, hex dump, format tespiti
    stats.ts                  # Shannon entropi, ki-kare, bayt frekansi
    cache.ts                  # TTL onbellek
    png-parser.ts             # Saf TS PNG ayristirici (IHDR, chunk'lar, piksel verileri)
    jpeg-parser.ts            # Saf TS JPEG ayristirici (isaretciler, EXIF, niceleme)
    wav-parser.ts             # Saf TS WAV ayristirici (RIFF chunk'lar, PCM ornekleri)
    bmp-parser.ts             # Saf TS BMP ayristirici (baslik, piksel verileri)
  image/                      # Goruntu steganaliz araclari (14)
  jpeg/                       # JPEG analiz araclari (7)
  audio/                      # Ses steganaliz araclari (7)
  text/                       # Metin & Unicode araclari (10)
  file/                       # Dosya adli bilisim araclari (10)
  document/                   # Belge analiz araclari (5)
  crypto/                     # Kodlama & kripto araclari (7)
  data/
    encoding-patterns.ts      # Kodlama regex kaliplari + kod cozuculer
    magic-bytes.ts            # Dosya imza veritabani (100+ format)
    stego-signatures.ts       # Bilinen steganografi araci imzalari
    unicode-invisible.ts      # Gorunmez Unicode karakter veritabani
```

**Tasarim kararlari:**

- **4 bagimlilik, baska bir sey yok** &mdash; MCP protokolu icin `@modelcontextprotocol/sdk`, giris dogrulama icin `zod`, PNG piksel erisimi icin `pngjs`, JPEG kod cozme icin `jpeg-js`. Sismis bagimlilik agaci yok. Yerel modul yok. C baglantilari yok. Python yok. Java yok.
- **%100 cevrimdisi** &mdash; Her arac tamamen yerel olarak calisir. HTTP istegi yok. API cagrisi yok. Telemetri yok. Bulut bagimliligi yok. Dosyalariniz makineliizi asla terk etmez.
- **Saf TypeScript istatistiksel analiz** &mdash; Ki-kare testi, RS analizi (Fridrich-Goljan-Du), Ornek Cifti Analizi, Shannon entropisi, Uyum Indeksi ve frekans analizi tamamen saf TypeScript'te uygulanmistir. Dis matematik kutuphanesi yok.
- **Ozel format ayristiricilar** &mdash; PNG chunk'lari, JPEG isaretcileri/EXIF/niceleme tablolari, WAV RIFF chunk'lari ve BMP basliklari, `utils/` ayristiricilari kullanilarak sifir dis bagimlilikla ayristirilir. Bu, genel amacli kutuphanelerin saglayamadigi format-ozgu derin analiz imkani sunar.
- **7 saglayici, 1 sunucu** &mdash; Her analiz kategorisi bagimsiz bir moduldur. AI ajan, sorusturma baglaminsa gore hangi araclari kullanacagini secer.
- **Temiz ToolDef kalip** &mdash; Her arac ayni `{ name, description, schema, execute }` kalibini takip eder. Yeni arac eklemek, uygun moduldeki tek bir nesnedir.
- **Her alanda Zod dogrulamasi** &mdash; Her sema alani AI ajan baglami icin `.describe()` iceriri. Gecersiz girisler, yurUtme oncesi acik hata mesajlariyla yakalanir.

---

## MCP Security Suite'in Parcasi

| Proje | Alan | Araclar |
|---|---|---|
| [hackbrowser-mcp](https://github.com/badchars/hackbrowser-mcp) | Tarayici tabanli guvenlik testi | 39 arac |
| [cloud-audit-mcp](https://github.com/badchars/cloud-audit-mcp) | Bulut guvenligi (AWS/Azure/GCP) | 38 arac |
| [github-security-mcp](https://github.com/badchars/github-security-mcp) | GitHub guvenlik durumu | 39 arac |
| [cve-mcp](https://github.com/badchars/cve-mcp) | Zafiyet istihbarati | 23 arac |
| [osint-mcp-server](https://github.com/badchars/osint-mcp-server) | OSINT ve keşif | 37 arac |
| [darknet-mcp-server](https://github.com/badchars/darknet-mcp-server) | Karanlik ag ve tehdit istihbarati | 66 arac |
| [dns-security-mcp](https://github.com/badchars/dns-security-mcp) | DNS guvenlik istihbarati | 103 arac |
| **steganography-mcp** | **Steganografi analizi** | **60 arac** |

---

## Katki

Katkilar memnuniyetle karsilanir. Yonergeler icin [CONTRIBUTING.md](../../CONTRIBUTING.md) dosyasina bakin.

---

<p align="center">
<b>Yalnizca yetkili guvenlik arastirmasi ve egitim amaclari icin.</b><br>
Size ait olmayan dosyalarda steganografi analizi yapmadan once her zaman uygun yetkiye sahip oldugunuzdan emin olun.
</p>

<p align="center">
  <a href="../../LICENSE">MIT Lisansi</a> &bull; <a href="https://orhanyildirim.us">Orhan Yildirim</a> tarafindan yapildi &bull; <a href="mailto:contact@orhanyildirim.us">contact@orhanyildirim.us</a>
</p>
