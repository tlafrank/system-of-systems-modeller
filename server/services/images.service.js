// server/services/images.service.js
const fs = require('fs/promises');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, '..', '..', '..', 'www', 'images');
const ALLOWED_EXT = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg']);

function filterName(name, prefix) {
  if (!prefix) return true;
  return name.toLowerCase().includes(prefix.toLowerCase());
}

async function listAllImages() {
  // flat directory; if you have nested folders, convert to a recursive walker
  const entries = await fs.readdir(IMAGES_DIR, { withFileTypes: true });
  return entries
    .filter(e => e.isFile())
    .map(e => e.name)
    .filter(name => ALLOWED_EXT.has(path.extname(name).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
}

/**
 * @param {{prefix:string, page:number, limit:number}}
 * @returns {{items: Array<{name:string,url:string}>, nextPage: number|null}}
 */
async function listImages({ prefix, page, limit }) {
  const all = await listAllImages();
  const filtered = all.filter(name => filterName(name, prefix));

  const start = (page - 1) * limit;
  const end   = start + limit;
  const slice = filtered.slice(start, end);

  const items = slice.map(name => ({
    name,
    url: `/images/${encodeURIComponent(name)}`
  }));

  const nextPage = end < filtered.length ? page + 1 : null;
  return { items, nextPage };
}

module.exports = { listImages };
