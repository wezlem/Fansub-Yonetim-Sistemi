const { tumAktifGorevleriGetir } = require('../utils/gorevInstanceStorage');
const { buildAktifGorevlerEmbed } = require('../utils/embed');

const GONDERIM_ARALIGI_MS = 3 * 60 * 60 * 1000; // 3 saat

async function aktifGorevleriGonder(client) {
  const gorevler = tumAktifGorevleriGetir();

  if (gorevler.length === 0) {
    console.log('[aktifGorevBildirim] Aktif görev yok, mesaj atlanıyor.');
    return;
  }

  const kanal = client.channels.cache.get(process.env.AKTIF_GOREV_KANAL_ID);
  if (!kanal) {
    console.error('[aktifGorevBildirim] Kanal bulunamadı, AKTIF_GOREV_KANAL_ID doğru mu kontrol et.');
    return;
  }

  const embed = buildAktifGorevlerEmbed(gorevler);
  kanal.send({ embeds: [embed] });
  console.log(`[aktifGorevBildirim] ${gorevler.length} aktif görev gönderildi.`);
}

function aktifGorevBildirimBaslat(client) {
    aktifGorevleriGonder(client); // bot açılır açılmaz bir kere gönder
  setInterval(() => aktifGorevleriGonder(client), GONDERIM_ARALIGI_MS);
}

module.exports = { aktifGorevBildirimBaslat };