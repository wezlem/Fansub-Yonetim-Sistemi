const ASAMA_YAPILANDIRMASI = [
  {
    kanalEnvDegiskeni: 'CEVIRI_KANAL_ID',
    mevcutAsama: 'ceviri',
    sonrakiAsama: 'redakte',
    sorumluAlan: 'cevirmen',           // bu aşamayı kimin teslim etmesi bekleniyor
    sonrakiSorumluAlan: 'redaktor',     // teslimden sonra kim etiketlenecek
    haberKanalEnvDegiskeni: 'REDAKTE_KANAL_ID', // sonraki kişiye nerede haber verilecek
    secimCustomId: 'ceviriGorevSecimi',
    tamamlanmaMesaji: 'Çeviri teslim alındı, redakteye geçti.',
    haberMesaji: (animeAdi, bolum, kisiId) =>
      `📥 **${animeAdi}** - Bölüm ${bolum} çeviri tamamlandı! <@${kisiId}> redakte senin görevin.`,
  },
  {
    kanalEnvDegiskeni: 'REDAKTE_KANAL_ID',
    mevcutAsama: 'redakte',
    sonrakiAsama: 'encode',
    sorumluAlan: 'redaktor',
    sonrakiSorumluAlan: 'encodeUpload',
    haberKanalEnvDegiskeni: 'REDAKTE_KANAL_ID', // ayrı bir encode kanalı yok, aynı kanalda haber veriliyor
    secimCustomId: 'redakteGorevSecimi',
    tamamlanmaMesaji: 'Redakte teslim alındı, encode & upload aşamasına geçti.',
    haberMesaji: (animeAdi, bolum, kisiId) =>
      `📥 **${animeAdi}** - Bölüm ${bolum} redakte tamamlandı! <@${kisiId}> encode & upload senin görevin.`,
  },
];

module.exports = { ASAMA_YAPILANDIRMASI };