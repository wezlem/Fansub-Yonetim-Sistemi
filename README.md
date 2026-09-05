<div align="center">

# Fansub Yönetim Sistemi

![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![Node.js](https://img.shields.io/badge/node.js-%23323330.svg?style=for-the-badge&logo=node.js&logoColor=white)
![discord.js](https://img.shields.io/badge/discord.js-%23323330.svg?style=for-the-badge&logo=discord&logoColor=5865F2)

</div>


Discord üzerinden çalışan bir fansub ekip yönetim botu. Yeni bölüm çıktığında otomatik olarak
haber verir, çeviri → redakte → encode akışını takip eder ve her aşamada doğru dosyanın doğru
kişi tarafından teslim edilip edilmediğini kontrol eder.

## Ne yapar?

- **Otomatik bölüm takibi** — SubsPlease'i düzenli aralıklarla kontrol eder, tanımlı bir ekibi
  olan animelerden yeni bölüm çıkınca çevirmeni etiketleyip görev açar.
- **Dosya eşleştirme** — Çevirmen ve redaktörler `.ass` dosyasını ilgili kanala attığında, bot
  dosyanın içeriğine bakıp hangi göreve ait olduğunu anlar ve bir sonraki aşamaya geçirir.
- **Bölüm bildirimi** — `/episode` komutuyla MyAnimeList linkinden otomatik bilgi çekilip
  (afiş, stüdyo, yıl, puan) hazır bir duyuru gönderilir.
- **Manuel müdahale** — Otomatik eşleştirme başarısız olursa `/gorevbitir` komutuyla açık
  görevler elle tamamlanabilir.

## Kurulum

```bash
npm install
cp .env.example .env
```

`.env` dosyasını aç ve aşağıdaki değerleri doldur:

| Değişken | Ne işe yarar |
|---|---|
| `DISCORD_TOKEN` | Botun Discord'a giriş yapmasını sağlayan token |
| `CLIENT_ID` | Botun uygulama ID'si (slash komutlarını kaydetmek için) |
| `GUILD_ID` | Komutların kaydedileceği sunucu ID'si (boş bırakılırsa global kaydedilir) |
| `CEVIRI_KANAL_ID` | Çevirmenlerin `.ass` dosyası attığı kanal |
| `REDAKTE_KANAL_ID` | Redaktörlerin `.ass` dosyası attığı kanal (aynı zamanda encode aşamasına geçiş haberi de buradan verilir) |
| `YETKILI_ROL_ID` | Manuel görev müdahalesi yapabilecek rol |
| `YENI_BOLUM_KANAL_ID` | Yeni bölüm çıktığında duyurunun gideceği kanal |

Komutları Discord'a kaydet ve botu başlat:

```bash
node deploy-commands.js
npm start
```

## Komutlar

- **`/gorev`** — Bir anime için ekip tanımlar (çevirmen, redaktör, encode & upload). Sadece
  sunucu yöneticileri kullanabilir. Aynı anime için tekrar çalıştırılırsa ekip günceller.
- **`/episode`** — Yeni bölüm duyurusu açar. MAL linki, sezon/bölüm no ve yayın linkleri istenir.
  Açık bir encode görevi bulursa otomatik olarak tamamlandı işaretler.
- **`/gorevbitir`** — Encode aşamasında bekleyen bir görevi elle tamamlandı olarak işaretler.
  Otomatik eşleştirme bir görevi bulamadığında kullanılır.

## Akış nasıl işliyor?

Yeni bölüm algılanır
→ Çevirmen etiketlenir
→ .ass dosyası çeviri kanalına atılır → bot redakteye geçirir
→ .ass dosyası redakte kanalına atılır → bot encode & upload'a geçirir
→ /episode komutu çalıştırılınca görev otomatik (ya da /gorevbitir ile elle) kapanır

Bot, `.ass` dosyasının içindeki `Video File:` satırından anime adını ve bölüm numarasını
çıkarır — dosyanın adına değil, içeriğine bakar (şu an yalnızca SubsPlease'in yazdığı format
tanınıyor). Bu yüzden anime adının
`/gorev`'e SubsPlease'te göründüğü haliyle (sezon eki dahil) girilmesi önemlidir.

## Not

- Şu an yalnızca SubsPlease formatındaki `.ass` dosyaları tanınıyor.
- `/episode` otomatik eşleştirmesi hiçbir görev bulamazsa sessizce geçer — bu durumda
  `/gorevbitir` ile elle kapatmak gerekir.
- Bir kişinin görevini başka birine devretmesi şu an desteklenmiyor.
- Yeni sezon başladığında `/gorev`'in o animenin yeni adıyla tekrar çalıştırılması gerekir.

## Klasör yapısı

```
commands/ — Slash komutları (/gorevekle, /episode, /gorevbitir)
events/ — Discord olaylarına tepki veren kodlar (mesaj geldiğinde, buton tıklandığında vb.)
services/ — Arka planda çalışan sürekli işler (bölüm kontrol döngüsü)
utils/ — Ortak yardımcı fonksiyonlar (dosya okuma, veri saklama, API çağrıları)
data/ — Ekip ve görev bilgilerinin saklandığı JSON dosyaları
```