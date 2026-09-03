
const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('episode')
    .setDescription('Yeni bölüm bildirimi gönder'),

  async execute(interaction) {

    const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);

if (!isAdmin) {
  return interaction.reply({
    content: '❌ Bu komutu kullanmak için yetkin yok.',
    ephemeral: true,
  });
}


    const modal = new ModalBuilder()
      .setCustomId('episodeModal')
      .setTitle('Yeni Bölüm Bildirimi');


    const malLinkInput = new TextInputBuilder()
      .setCustomId('malLink')
      .setLabel('MyAnimeList Linki')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('https://myanimelist.net/anime/16498/...')
      .setRequired(true);


    const seasonInput = new TextInputBuilder()
      .setCustomId('season')
      .setLabel('Sezon')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('1')
      .setRequired(true);


    const episodeInput = new TextInputBuilder()
      .setCustomId('episode')
      .setLabel('Bölüm')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('12')
      .setRequired(true);


    const linksInput = new TextInputBuilder()
      .setCustomId('releaseLinks')
      .setLabel('Yayın Linkleri (site=url, satır başı)')
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('animecix=https://...\nanizm=https://...')
      .setRequired(true);


    const roleInput = new TextInputBuilder()
  .setCustomId('roleMention')
  .setLabel('Rol Mention (opsiyonel, sadece rol adı)')
  .setStyle(TextInputStyle.Short)
  .setPlaceholder('Güncel Bölüm...')
  .setRequired(false);


    modal.addComponents(
      new ActionRowBuilder().addComponents(malLinkInput),
      new ActionRowBuilder().addComponents(seasonInput),
      new ActionRowBuilder().addComponents(episodeInput),
      new ActionRowBuilder().addComponents(linksInput),
      new ActionRowBuilder().addComponents(roleInput),
    );


    await interaction.showModal(modal);
  },
};