const { setPresence } = require('../utils/presence');
const { bolumTakibiBaslat } = require('../services/bolumTakip'); 

module.exports = {
  name: 'clientReady',
  once: true,
  execute(client) {
    console.log(`Bot giriş yaptı: ${client.user.tag}`);
    setPresence(client);
    bolumTakibiBaslat(client); 
  },
};