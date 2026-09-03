const { StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
const { assDosyasiniOku } = require('../utils/assParser');
const { gorevBul, gorevGuncelle, acikGorevleriGetir, animeAdiylaGorevleriBul } = require('../utils/gorevInstanceStorage');
const { ASAMA_YAPILANDIRMASI } = require('../utils/gorevAsamaYapilandirmasi');

module.exports = {
  name: 'messageCreate',
  async execute(message) {
    if (message.author.bot) return;

    // Bu mesaj hangi aşamanın kanalına atılmış? (çeviri mi, redakte mi)
    const asamaAyari = ASAMA_YAPILANDIRMASI.find(
      ayar => message.channel.id === process.env[ayar.kanalEnvDegiskeni],
    );
    if (!asamaAyari) return;

    const assDosyasi = message.attachments.find(dosya => dosya.name.endsWith('.ass'));
    if (!assDosyasi) return;

        const sonuc = await assDosyasiniOku(assDosyasi.url);

    // Durum 1a: dosyanın içindeki "Video File:" satırı beklenen formatta değil
    if (!sonuc) {
      console.log(`[messageCreate] Format tanınmadı: ${assDosyasi.name} (kanal: ${message.channel.id}, gönderen: ${message.author.tag})`);
      await gorevSecimiSun(message, asamaAyari);
      return;
    }

    const gorev = gorevBul(sonuc.animeAdi, sonuc.bolum);

    // Durum 1b: anime tanındı ama bu bölüm için görev yok — muhtemelen yanlış bölüm
    if (!gorev) {
      const ayniAnimeGorevleri = animeAdiylaGorevleriBul(sonuc.animeAdi);

      if (ayniAnimeGorevleri.length > 0) {
        const beklenenBolumler = ayniAnimeGorevleri.map(g => g.bolum).join(', ');
        console.log(`[messageCreate] Bölüm uyuşmadı: ${sonuc.animeAdi} - Bölüm ${sonuc.bolum} (beklenen: ${beklenenBolumler})`);
        await message.reply(
          `❌ **${sonuc.animeAdi}** tanındı ama Bölüm ${sonuc.bolum} için sistemde bir görev yok. Beklenen bölüm(ler): ${beklenenBolumler}`,
        );
        return;
      }

      // Anime de sistemde hiç tanımlı değil → eski dropdown akışı
      console.log(`[messageCreate] Anime sistemde kayıtlı değil: ${sonuc.animeAdi}`);
      await gorevSecimiSun(message, asamaAyari);
      return;
    }

    // Durum 2: görev var ama bu kanalın beklediği aşamada değil (eski/yanlış dosya)
    if (gorev.asama !== asamaAyari.mevcutAsama) {
      console.log(`[messageCreate] Yanlış aşama: ${gorev.animeAdi} - Bölüm ${gorev.bolum} (görev aşaması: ${gorev.asama}, beklenen: ${asamaAyari.mevcutAsama})`);
      await message.reply('❌ Doğru dosya atılmadı.');
      return;
    }

    // Durum 3: aşama doğru ama dosyayı atan kişi bu aşamanın sorumlusu değil
    if (gorev[asamaAyari.sorumluAlan] !== message.author.id) {
      console.log(`[messageCreate] Yanlış kişi: ${gorev.animeAdi} - Bölüm ${gorev.bolum} (gönderen: ${message.author.tag}, beklenen: ${gorev[asamaAyari.sorumluAlan]})`);
      await message.reply('❌ Bu görev sana atanmamış.');
      return;
    }

    // Her şey doğru: görevi bir sonraki aşamaya geçir
    await gorevSonrakiAsamayaGecir(message, gorev, asamaAyari);
  },
};

// Eşleşme bulunamadığında: gönderen kişiye seçim menüsü göster, yetkiliyi haberdar et
async function gorevSecimiSun(message, asamaAyari) {
  const acikGorevler = acikGorevleriGetir(asamaAyari.mevcutAsama);

  if (acikGorevler.length === 0) {
    await message.reply('❌ Doğru dosya atılmadı. Şu an bu aşamada açık bir görev de bulunamadı.');
    return;
  }

  const secenekler = acikGorevler.map(g => ({
    label: `${g.animeAdi} - Bölüm ${g.bolum}`,
    value: g.id,
  }));

  const menu = new StringSelectMenuBuilder()
    .setCustomId(asamaAyari.secimCustomId)
    .setPlaceholder('Bu dosya hangi göreve ait?')
    .addOptions(secenekler);

  const satir = new ActionRowBuilder().addComponents(menu);

  await message.reply({
    content: '⚠️ Dosya otomatik eşleştirilemedi. Lütfen doğru görevi seç:',
    components: [satir],
  });

  const yetkiliRolId = process.env.YETKILI_ROL_ID;
  if (yetkiliRolId) {
    await message.channel.send(`<@&${yetkiliRolId}> bir dosya otomatik eşleştirilemedi, yukarıdaki mesaja bakabilir misiniz?`);
  }
}

// Görevi bir sonraki aşamaya geçirip ilgili kişiyi etiketler
async function gorevSonrakiAsamayaGecir(message, gorev, asamaAyari) {
  gorevGuncelle(gorev.id, { asama: asamaAyari.sonrakiAsama });

  await message.reply(`✅ ${asamaAyari.tamamlanmaMesaji}`);

  const haberKanali = message.client.channels.cache.get(process.env[asamaAyari.haberKanalEnvDegiskeni]);
  const sonrakiKisiId = gorev[asamaAyari.sonrakiSorumluAlan];

  if (haberKanali) {
    haberKanali.send(asamaAyari.haberMesaji(gorev.animeAdi, gorev.bolum, sonrakiKisiId));
  } else {
    console.error(`Haber verilecek kanal bulunamadı: ${asamaAyari.haberKanalEnvDegiskeni} doğru mu kontrol et.`);
  }
}

module.exports.gorevSonrakiAsamayaGecir = gorevSonrakiAsamayaGecir;