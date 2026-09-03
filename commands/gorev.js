const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { ekipKaydet, ekipGetir } = require('../utils/gorevStorage');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('gorev')
    .setDescription('Bir anime için ekip tanımla (çevirmen, redaktör, encode&upload)')
    .addStringOption(option =>
      option.setName('anime')
        .setDescription('Anime adı (SubsPlease isimlendirmesiyle birebir aynı olmalı)')
        .setRequired(true))
    .addUserOption(option =>
      option.setName('cevirmen')
        .setDescription('Çevirmen')
        .setRequired(true))
    .addUserOption(option =>
      option.setName('redaktor')
        .setDescription('Redaktör')
        .setRequired(true))
    .addUserOption(option =>
      option.setName('encode_upload')
        .setDescription('Encode & Upload yapan kişi')
        .setRequired(true)),

  async execute(interaction) {
    const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);

    if (!isAdmin) {
      return interaction.reply({
        content: '❌ Bu komutu kullanmak için yetkin yok.',
        ephemeral: true,
      });
    }

    const animeAdi = interaction.options.getString('anime');
    const cevirmen = interaction.options.getUser('cevirmen');
    const redaktor = interaction.options.getUser('redaktor');
    const encodeUpload = interaction.options.getUser('encode_upload');

    // Bu anime için daha önce bir ekip tanımlanmış mı diye bakıyoruz,
    // sadece kullanıcıya "yeni eklendi" mi "güncellendi" mi demek için
    const mevcutEkip = ekipGetir(animeAdi);

    ekipKaydet(animeAdi, {
      cevirmen: cevirmen.id,
      redaktor: redaktor.id,
      encodeUpload: encodeUpload.id,
    });

    const durum = mevcutEkip ? 'güncellendi' : 'kaydedildi';

    await interaction.reply({
      content:
        `✅ **${animeAdi}** için ekip ${durum}:\n` +
        `Çevirmen: ${cevirmen}\n` +
        `Redaktör: ${redaktor}\n` +
        `Encode & Upload: ${encodeUpload}`,
      ephemeral: true,
    });
  },
};