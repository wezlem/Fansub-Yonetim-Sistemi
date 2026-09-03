const { SlashCommandBuilder, StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
const { acikGorevleriGetir } = require('../utils/gorevInstanceStorage');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('gorevbitir')
    .setDescription('Encode aşamasındaki bir görevi elle "tamamlandı" olarak işaretle'),

  async execute(interaction) {
    const yetkiliRolId = process.env.YETKILI_ROL_ID;
    const yetkisiVar = yetkiliRolId && interaction.member.roles.cache.has(yetkiliRolId);

    if (!yetkisiVar) {
      return interaction.reply({
        content: '❌ Bu komutu kullanmak için yetkin yok.',
        ephemeral: true,
      });
    }

    const acikGorevler = acikGorevleriGetir('encode');

    if (acikGorevler.length === 0) {
      return interaction.reply({
        content: '✅ Şu an "encode" aşamasında bekleyen açık bir görev yok.',
        ephemeral: true,
      });
    }

    const menu = new StringSelectMenuBuilder()
      .setCustomId('elleGorevBitirSecimi')
      .setPlaceholder('Hangi görevi tamamlandı olarak işaretleyelim?')
      .addOptions(acikGorevler.map(g => ({
        label: `${g.animeAdi} - Bölüm ${g.bolum}`,
        value: g.id,
      })));

    await interaction.reply({
      content: 'Tamamlandı olarak işaretlemek istediğin görevi seç:',
      components: [new ActionRowBuilder().addComponents(menu)],
      ephemeral: true,
    });
  },
};