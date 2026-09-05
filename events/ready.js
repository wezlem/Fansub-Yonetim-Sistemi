const { setPresence } = require('../utils/presence');
const { bolumTakibiBaslat } = require('../services/bolumTakip');
const { aktifGorevBildirimBaslat } = require('../services/aktifGorevBildirim');

module.exports = {
  name: 'clientReady',
  once: true,
  execute(client) {

    console.log('');
    console.log('╔══════════════════════════════════════════╗');
    console.log('║                 WEZLEM                   ║');
    console.log('║          FANSUB YÖNETİM SİSTEMİ          ║');
    console.log('║                 v1.0.0                   ║');
    console.log('║                                          ║');
    console.log('╚══════════════════════════════════════════╝');
    console.log('');

    console.log(`Bot giriş yaptı: ${client.user.tag}`);

    setPresence(client);
    bolumTakibiBaslat(client);
    aktifGorevBildirimBaslat(client);
  },
};