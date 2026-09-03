const { ActivityType } = require('discord.js');

function setPresence(client) {
  client.user.setPresence({
    activities: [
      {
        name: 'Fansub',
        type: ActivityType.Watching,
      },
    ],
    status: 'online',
  });
}

module.exports = { setPresence };