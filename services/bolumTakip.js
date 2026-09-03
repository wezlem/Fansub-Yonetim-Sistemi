const { ekipGetir } = require('../utils/gorevStorage');
const { gorevVarMi, yeniGorevOlustur } = require('../utils/gorevInstanceStorage');
const { EmbedBuilder } = require('discord.js');

const KONTROL_ARALIGI_MS = 15 * 60 * 1000; // 15 dakika

// SubsPlease'in herkese açık (resmi olmayan ama kararlı) uç noktasından
// en son çıkan bölümleri çeker
async function subsPleaseSonBolumleriGetir() {
  const yanit = await fetch('https://subsplease.org/api/?f=latest&tz=Europe/Istanbul');
  const veri = await yanit.json();

  return Object.values(veri).map(kayit => {
    // Birden fazla kalite seçeneği geliyor (1080p, 720p, 480p) — 1080p'yi tercih ediyoruz,
    // yoksa listedeki ilk seçeneği kullanıyoruz
    const indirmeSecenegi = kayit.downloads.find(d => d.res === '1080') || kayit.downloads[0];

    return {
      animeAdi: kayit.show,
      bolum: parseInt(kayit.episode, 10),
            magnet: indirmeSecenegi ? indirmeSecenegi.magnet : null,
      sayfa: kayit.page ? `https://subsplease.org/shows/${kayit.page}/` : null,
    };
  });
}

async function kontrolEt(client) {
  let sonBolumler;

  try {
    sonBolumler = await subsPleaseSonBolumleriGetir();
  } catch (hata) {
    console.error('SubsPlease kontrolünde hata:', hata);
    return;
  }

  for (const { animeAdi, bolum, magnet, sayfa } of sonBolumler) {
    const ekip = ekipGetir(animeAdi);

    // Bu animenin tanımlı bir ekibi yoksa hiç ilgilenmiyoruz
    if (!ekip) continue;

    // Bu bölüm için zaten görev açılmışsa tekrar açma
    if (gorevVarMi(animeAdi, bolum)) continue;

    yeniGorevOlustur(animeAdi, bolum, ekip);

    const duyuruKanal = client.channels.cache.get(process.env.YENI_BOLUM_KANAL_ID);
    if (duyuruKanal) {
      const embed = new EmbedBuilder()
        .setColor(0x2b6cb0)
        .setThumbnail(client.user.displayAvatarURL())
        .setDescription(
          [
            sayfa ? `[Sayfa (Torrent)](${sayfa})` : null,
            magnet ? `Magnet:\n\`\`\`${magnet}\`\`\`` : null,
          ]
            .filter(Boolean)
            .join(' • '),
        );

      duyuruKanal.send({
        content: `📥 **${animeAdi}** - Bölüm ${bolum} çıktı! <@${ekip.cevirmen}> çeviri senin görevin.`,
        embeds: [embed],
      });
    } else {
      console.error('Duyuru kanalı bulunamadı, YENI_BOLUM_KANAL_ID doğru mu kontrol et.');
    }
  }
}

// Botu başlatan yerden çağrılacak fonksiyon
function bolumTakibiBaslat(client) {
  kontrolEt(client); // bot açılır açılmaz bir kere kontrol et
  setInterval(() => kontrolEt(client), KONTROL_ARALIGI_MS);
}

module.exports = { bolumTakibiBaslat };