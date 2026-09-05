const { ActivityType } = require('discord.js');

function setPresence(client) {
  client.user.setPresence({
    activities: [
      {
        name: 'wezlem /help',
        type: ActivityType.Watching,
      },
    ],
    status: 'online',
  });
}

module.exports = { setPresence };