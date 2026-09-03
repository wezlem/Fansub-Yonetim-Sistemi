
const { extractMalId, getAnimeInfo } = require('../utils/mal');
const { parseReleaseLinks } = require('../utils/parseLinks');
const { buildEpisodeEmbed, buildLinkButtons } = require('../utils/embed');
const { StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'Komut çalıştırılırken bir hata oluştu.', ephemeral: true });
      }
      return;
    }

    if (interaction.isModalSubmit() && interaction.customId === 'episodeModal') {
      await interaction.deferReply({ ephemeral: true });


      const malLink = interaction.fields.getTextInputValue('malLink');
      const season = interaction.fields.getTextInputValue('season');
      const episode = interaction.fields.getTextInputValue('episode');
      const releaseLinksRaw = interaction.fields.getTextInputValue('releaseLinks');
      const roleNameInput = interaction.fields.getTextInputValue('roleMention');
let roleMention = null;

if (roleNameInput) {

  const matchedRole = interaction.guild.roles.cache.find(
    (role) => role.name.toLowerCase() === roleNameInput.toLowerCase(),
  );

  if (matchedRole) {
    roleMention = `<@&${matchedRole.id}>`;
  } else {
    await interaction.followUp({
      content: `⚠️ "${roleNameInput}" adında bir rol bulunamadı, bildirim rol etiketlemeden gönderildi.`,
      ephemeral: true,
    });
  }
}


      const malId = extractMalId(malLink);
      if (!malId) {
        return interaction.editReply('❌ Geçersiz MyAnimeList linki. Lütfen linki kontrol edip tekrar dene.');
      }


      const animeInfo = await getAnimeInfo(malId);
      if (!animeInfo) {
        return interaction.editReply('❌ Anime bilgisi alınamadı. MAL ID doğru mu ya da Jikan API şu an yanıt vermiyor olabilir.');
      }


      const releaseLinks = parseReleaseLinks(releaseLinksRaw);
      if (releaseLinks.length === 0) {
        return interaction.editReply('❌ Yayın linkleri okunamadı. Formatın "site=url" şeklinde olduğundan emin ol.');
      }


      const embed = buildEpisodeEmbed(animeInfo, season, episode);
      const buttonRow = buildLinkButtons(releaseLinks);


      const channel = interaction.channel; 

      await channel.send({
        content: roleMention || undefined,
        embeds: [embed],
        components: [buttonRow],
      });

            // Görev takibini kapatmayı dene (encode aşamasındaki eşleşen görevi bul)
      const { encodeGorevleriniAra, gorevGuncelle } = require('../utils/gorevInstanceStorage');
      const eslesenler = encodeGorevleriniAra(animeInfo.title, parseInt(episode, 10));

      if (eslesenler.length === 1) {
        gorevGuncelle(eslesenler[0].id, { asama: 'tamamlandi' });
      } else if (eslesenler.length > 1) {
        const menu = new StringSelectMenuBuilder()
          .setCustomId('tamamlanmaGorevSecimi')
          .setPlaceholder('Bu bölüm hangi göreve ait?')
          .addOptions(eslesenler.map(g => ({
            label: `${g.animeAdi} - Bölüm ${g.bolum}`,
            value: g.id,
          })));

        await interaction.followUp({
          content: '⚠️ Birden fazla eşleşen görev bulundu, lütfen doğrusunu seç:',
          components: [new ActionRowBuilder().addComponents(menu)],
          ephemeral: true,
        });
      }
      // eslesenler.length === 0 ise: bildirim yine de gönderildi, görev takibinde
      // eşleşme bulunamadı demektir, sessizce geçiliyor (elle takip edebilirsin)

      await interaction.editReply('✅ Bölüm bildirimi gönderildi!');
    }
                            if (interaction.isStringSelectMenu()) {
      if (interaction.customId === 'tamamlanmaGorevSecimi') {
        const { gorevGuncelle } = require('../utils/gorevInstanceStorage');
        gorevGuncelle(interaction.values[0], { asama: 'tamamlandi' });
        await interaction.update({ content: '✅ Görev tamamlandı olarak işaretlendi.', components: [] });
        return;
      }

      if (interaction.customId === 'elleGorevBitirSecimi') {
        const { gorevGuncelle } = require('../utils/gorevInstanceStorage');
        gorevGuncelle(interaction.values[0], { asama: 'tamamlandi' });
        await interaction.update({ content: '✅ Görev tamamlandı olarak işaretlendi.', components: [] });
        return;
      }

      const { ASAMA_YAPILANDIRMASI } = require('../utils/gorevAsamaYapilandirmasi');
      const asamaAyari = ASAMA_YAPILANDIRMASI.find(ayar => ayar.secimCustomId === interaction.customId);
      if (!asamaAyari) return;

      const yetkiliRolId = process.env.YETKILI_ROL_ID;
      if (yetkiliRolId && !interaction.member.roles.cache.has(yetkiliRolId)) {
        return interaction.reply({ content: '❌ Bu seçimi yapma yetkin yok.', ephemeral: true });
      }

      const { gorevIdIleBul } = require('../utils/gorevInstanceStorage');
      const { gorevSonrakiAsamayaGecir } = require('./messageCreate');

      const gorev = gorevIdIleBul(interaction.values[0]);
      if (!gorev) {
        return interaction.reply({ content: '❌ Görev bulunamadı, tekrar dener misin?', ephemeral: true });
      }

      await interaction.update({ content: '✅ Seçim alındı, görev işleniyor...', components: [] });
      await gorevSonrakiAsamayaGecir(interaction.message, gorev, asamaAyari);
    }
  },
};