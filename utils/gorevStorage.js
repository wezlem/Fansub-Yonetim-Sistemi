const fs = require('fs');
const path = require('path');

// Verinin saklanacağı klasör ve dosya
const dataKlasoru = path.join(__dirname, '..', 'data');
const dosyaYolu = path.join(dataKlasoru, 'gorevler.json');

// data/ klasörü yoksa oluştur (bot ilk defa çalışıyorsa)
if (!fs.existsSync(dataKlasoru)) {
  fs.mkdirSync(dataKlasoru);
}

// gorevler.json yoksa boş bir dosyayla başlat
if (!fs.existsSync(dosyaYolu)) {
  fs.writeFileSync(dosyaYolu, '{}');
}

// Dosyadaki tüm anime ekiplerini okur
function ekipleriOku() {
  const icerik = fs.readFileSync(dosyaYolu, 'utf-8');
  return JSON.parse(icerik);
}

// Tüm anime ekiplerini dosyaya yazar
function ekipleriKaydet(ekipler) {
  fs.writeFileSync(dosyaYolu, JSON.stringify(ekipler, null, 2));
}

// Tek bir anime için ekip bilgisini kaydeder/günceller
function ekipKaydet(animeAdi, ekip) {
  const ekipler = ekipleriOku();
  ekipler[animeAdi] = ekip;
  ekipleriKaydet(ekipler);
}

// Tek bir animenin ekibini getirir (yoksa undefined döner)
function ekipGetir(animeAdi) {
  const ekipler = ekipleriOku();
  return ekipler[animeAdi];
}

module.exports = {
  ekipleriOku,
  ekipleriKaydet,
  ekipKaydet,
  ekipGetir,
};