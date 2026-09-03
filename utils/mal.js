function extractMalId(url) {
  const match = url.match(/myanimelist\.net\/anime\/(\d+)/);
  if (!match) return null;
  return match[1];
}

function bekle(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function jikanIstegiAt(malId, denemeSayisi = 2) {
  for (let i = 1; i <= denemeSayisi; i++) {
    const response = await fetch(`https://api.jikan.moe/v4/anime/${malId}`);

    if (response.ok) return response;

    console.error(`Jikan API hata: status ${response.status} (malId: ${malId}, deneme: ${i}/${denemeSayisi})`);

    if (i < denemeSayisi) {
      await bekle(1500);
    }
  }
  return null;
}

async function getAnimeInfo(malId) {

  try {
    const response = await jikanIstegiAt(malId);

    if (response) {
      const json = await response.json();
      const anime = json.data;

      if (anime) {
        const aniListData = await getAniListData(malId);

        return {
          title: anime.title || anime.title_english || 'Bilinmiyor',
          image: aniListData?.bannerImage || aniListData?.coverImage || anime.images?.jpg?.large_image_url || null,
          studio: anime.studios?.[0]?.name || null,
          year: anime.year || anime.aired?.prop?.from?.year || null,
          score: anime.score || null,
          url: anime.url || null,
        };
      }
    }
  } catch (error) {
    console.error('Jikan API isteğinde hata:', error);
  }


  console.error(`Jikan çalışmadı, AniList'e yedek olarak geçiliyor (malId: ${malId})`);
  const aniListData = await getAniListData(malId);

  if (!aniListData) return null;

  return {
    title: aniListData.title || 'Bilinmiyor',
    image: aniListData.bannerImage || aniListData.coverImage || null,
    studio: aniListData.studio || null,
    year: aniListData.year || null,
    score: aniListData.score || null,
    url: `https://myanimelist.net/anime/${malId}`,
  };
}


async function getAniListData(malId) {
  const query = `
    query ($malId: Int) {
      Media(idMal: $malId, type: ANIME) {
        title {
          romaji
          english
        }
        studios(isMain: true) {
          nodes {
            name
          }
        }
        seasonYear
        averageScore
        bannerImage
        coverImage {
          extraLarge
        }
      }
    }
  `;

  try {
    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        variables: { malId: Number(malId) },
      }),
    });

    if (!response.ok) return null;

    const json = await response.json();
    const media = json.data?.Media;
    if (!media) return null;

    return {
      title: media.title?.english || media.title?.romaji || null,
      bannerImage: media.bannerImage || null,
      coverImage: media.coverImage?.extraLarge || null,
      studio: media.studios?.nodes?.[0]?.name || null,
      year: media.seasonYear || null,
      
      score: media.averageScore ? (media.averageScore / 10).toFixed(1) : null,
    };
  } catch (error) {
    console.error('AniList API isteğinde hata:', error);
    return null;
  }
}

module.exports = { extractMalId, getAnimeInfo };