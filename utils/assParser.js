// .ass dosyası içeriğinden "Video File: ..." satırını bulup
// anime adı ve bölüm numarasını çıkarır
function videoFileSatirindanCikar(dosyaIcerigi) {
  const eslesme = dosyaIcerigi.match(/\[SubsPlease\] (.+?) - (\d+) \(\d+p\) \[\w+\]\.mkv/);

  if (!eslesme) return null;

  return {
    animeAdi: eslesme[1],
    bolum: parseInt(eslesme[2], 10),
  };
}

// Discord'a atılan .ass dosyasını indirip parse eder
async function assDosyasiniOku(attachmentUrl) {
  const yanit = await fetch(attachmentUrl);
  const icerik = await yanit.text();
  return videoFileSatirindanCikar(icerik);
}

module.exports = { assDosyasiniOku, videoFileSatirindanCikar };