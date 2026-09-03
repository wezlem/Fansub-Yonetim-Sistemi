const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const dataKlasoru = path.join(__dirname, '..', 'data');
const dosyaYolu = path.join(dataKlasoru, 'gorevInstances.json');

if (!fs.existsSync(dataKlasoru)) {
  fs.mkdirSync(dataKlasoru);
}

if (!fs.existsSync(dosyaYolu)) {
  fs.writeFileSync(dosyaYolu, '[]');
}

function orneklerOku() {
  const icerik = fs.readFileSync(dosyaYolu, 'utf-8');
  return JSON.parse(icerik);
}

function orneklerKaydet(ornekler) {
  fs.writeFileSync(dosyaYolu, JSON.stringify(ornekler, null, 2));
}

function gorevVarMi(animeAdi, bolum) {
  const ornekler = orneklerOku();
  return ornekler.some(g => g.animeAdi === animeAdi && g.bolum === bolum);
}

function yeniGorevOlustur(animeAdi, bolum, ekip) {
  const ornekler = orneklerOku();

  const yeniGorev = {
    id: crypto.randomUUID(),
    animeAdi,
    bolum,
    asama: 'ceviri',
    cevirmen: ekip.cevirmen,
    redaktor: ekip.redaktor,
    encodeUpload: ekip.encodeUpload,
  };

  ornekler.push(yeniGorev);
  orneklerKaydet(ornekler);

  return yeniGorev;
}

// Anime + bölüme göre görev arar (aşamasına bakmadan) — "bu hiç sistemde yok mu
// yoksa yanlış aşamada mı" ayrımını yapmak için kullanılıyor
function gorevBul(animeAdi, bolum) {
  const ornekler = orneklerOku();
  return ornekler.find(g => g.animeAdi === animeAdi && g.bolum === bolum) || null;
}

// Anime adına göre (bölümden bağımsız) görev arar — bölüm eşleşmediğinde
// "bu anime tanınıyor ama farklı bölüm bekleniyor" ayrımını yapmak için kullanılıyor
function animeAdiylaGorevleriBul(animeAdi) {
  const ornekler = orneklerOku();
  return ornekler.filter(g => g.animeAdi === animeAdi);
}

// Dahili ID ile görev arar (dropdown'dan seçim yapıldığında kullanılıyor)
function gorevIdIleBul(id) {
  const ornekler = orneklerOku();
  return ornekler.find(g => g.id === id) || null;
}

// Bir görevin bilgilerini günceller (örn. aşamasını değiştirmek için)
function gorevGuncelle(id, degisiklik) {
  const ornekler = orneklerOku();
  const index = ornekler.findIndex(g => g.id === id);
  if (index === -1) {
    console.log(`[gorevInstanceStorage] gorevGuncelle: id bulunamadı (${id})`);
    return null;
  }

  const eskiGorev = ornekler[index];
  ornekler[index] = { ...eskiGorev, ...degisiklik };
  orneklerKaydet(ornekler);

  if (degisiklik.asama) {
    console.log(`[gorevInstanceStorage] Aşama değişti: ${eskiGorev.animeAdi} - Bölüm ${eskiGorev.bolum} (${eskiGorev.asama} → ${degisiklik.asama})`);
  }

  return ornekler[index];
}

// Belirli bir aşamadaki tüm görevleri getirir (dropdown listesi için)
function acikGorevleriGetir(asama) {
  const ornekler = orneklerOku();
  return ornekler.filter(g => g.asama === asama);
}


// "encode" aşamasındaki görevler arasında bölüm numarası eşleşen ve
// isim olarak benzeyen görevleri bulur (gevşek eşleştirme)
function encodeGorevleriniAra(animeBaslik, bolum) {
  const ornekler = orneklerOku();
  const baslikKucuk = animeBaslik.toLowerCase();

  return ornekler.filter(g => {
    if (g.asama !== 'encode') return false;
    if (g.bolum !== bolum) return false;

    const gorevAdiKucuk = g.animeAdi.toLowerCase();
    return gorevAdiKucuk.includes(baslikKucuk) || baslikKucuk.includes(gorevAdiKucuk);
  });
}

module.exports = {
  orneklerOku,
  orneklerKaydet,
  gorevVarMi,
  yeniGorevOlustur,
  gorevBul,
  animeAdiylaGorevleriBul,
  gorevIdIleBul,
  gorevGuncelle,
  acikGorevleriGetir,
  encodeGorevleriniAra,
};