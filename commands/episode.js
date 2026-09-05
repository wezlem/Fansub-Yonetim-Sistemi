const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('episode')
    .setDescription('Yeni bölüm bildirimi gönder')
    .addRoleOption((option) =>
      option.setName('rol').setDescription('Bildirimde etiketlenecek rol (opsiyonel)').setRequired(false)
    ),

  async execute(interaction) {

    const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);

if (!isAdmin) {
  return interaction.reply({
    content: '❌ Bu komutu kullanmak için yetkin yok.',
    ephemeral: true,
  });
}

    const secilenRol = interaction.options.getRole('rol');
    const rolIdParcasi = secilenRol ? secilenRol.id : 'none';

    const modal = new ModalBuilder()
      .setCustomId(`episodeModal_${rolIdParcasi}`)
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


    modal.addComponents(
      new ActionRowBuilder().addComponents(malLinkInput),
      new ActionRowBuilder().addComponents(seasonInput),
      new ActionRowBuilder().addComponents(episodeInput),
      new ActionRowBuilder().addComponents(linksInput),
    );


    await interaction.showModal(modal);
  },
};