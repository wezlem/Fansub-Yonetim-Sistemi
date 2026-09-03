
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');


const SITE_LABELS = {
  animecix: 'Animecix',
  anizm: 'Anizm',
  prax: 'AnimePrax',
  castle: 'AnimeCastle',
};

function formatSiteLabel(site) {
  if (SITE_LABELS[site]) return SITE_LABELS[site];
  return site.charAt(0).toUpperCase() + site.slice(1);
}


function buildEpisodeEmbed(animeInfo, season, episode) {
  const embed = new EmbedBuilder()
    .setColor(0x2f5d9f) // lacivert-mavi arası ton
    .setTitle(animeInfo.title)
    .setDescription(`${season}. Sezon ${episode}. Bölüm Yayında! <:emo3:1542999555241418792>\n-# -Butonlardan sitelere erişebilirsiniz.`)
    .setFooter({ text: 'wezlem' })
    .setTimestamp();

  if (animeInfo.image) {
  embed.setImage(animeInfo.image);
}


  const fields = [];

  if (animeInfo.studio) {
    fields.push({ name: 'Studio', value: animeInfo.studio, inline: true });
  }
  if (animeInfo.year) {
    fields.push({ name: 'Year', value: String(animeInfo.year), inline: true });
  }
  if (animeInfo.score) {
    fields.push({ name: 'MAL Score', value: `⭐ ${animeInfo.score}`, inline: true });
  }

  if (fields.length > 0) {
    embed.addFields(fields);
  }

  return embed;
}


function buildLinkButtons(releaseLinks) {
  const row = new ActionRowBuilder();

  for (const { site, url } of releaseLinks) {
    row.addComponents(
      new ButtonBuilder()
        .setLabel(formatSiteLabel(site))
        .setStyle(ButtonStyle.Link)
        .setURL(url),
    );
  }

  return row;
}

module.exports = { buildEpisodeEmbed, buildLinkButtons };