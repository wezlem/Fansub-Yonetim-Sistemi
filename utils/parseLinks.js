
function parseReleaseLinks(rawText) {
  const lines = rawText.split('\n');
  const links = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue; 

    const equalIndex = trimmed.indexOf('=');
    if (equalIndex === -1) continue; 

    const site = trimmed.slice(0, equalIndex).trim();
    const url = trimmed.slice(equalIndex + 1).trim();


    if (site && url && url.startsWith('http')) {
      links.push({ site, url });
    }
  }

  return links;
}

module.exports = { parseReleaseLinks };