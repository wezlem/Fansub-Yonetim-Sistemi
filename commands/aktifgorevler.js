const { SlashCommandBuilder } = require('discord.js');
const { tumAktifGorevleriGetir } = require('../utils/gorevInstanceStorage');
const { buildAktifGorevlerEmbed } = require('../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('aktifgorevler')
    .setDescription('Tamamlanmamış tüm görevleri listeler'),

  async execute(interaction) {
    const gorevler = tumAktifGorevleriGetir();
    const embed = buildAktifGorevlerEmbed(gorevler);
    await interaction.reply({ embeds: [embed] });
  },
};