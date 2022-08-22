#!/usr/bin/env node
const fetch = require('node-fetch');
const fs    = require('fs');
const path  = require('path');

// https://www.flickr.com/services/api/explore/flickr.people.getPublicPhotos
// https://www.flickr.com/services/api/explore/flickr.photosets.getPhotos

function getFlickrUrl(apiKey, userId, photoSetId, page) {
  const url = 'https://www.flickr.com/services/rest/'

  const queryParams = [
    typeof photoSetId === 'string'
      ? `method=flickr.photosets.getPhotos&photoset_id=${photoSetId}`
      : 'method=flickr.people.getPublicPhotos',
    `api_key=${apiKey}`,
    `user_id=${userId}`,
    `extras=url_o,url_n,date_upload,geo`,
    `format=json`,
    `nojsoncallback=1`,
    `per_page=500`,
  ];

  if (typeof page === 'number') {
    queryParams.push(`page=${ page }`);
  }

  return `${ url }?${ queryParams.join('&') }`;
}

/**
 * @typedef {object} FlickrPhoto
 *
 * @property {string} id
 * @property {string} title
 * @property {string} latitude
 * @property {string} longitude
 * @property {string} url_n
 * @property {string} url_o
 * @property {string} dateupload
 * @property {number} height_n
 * @property {number} width_n
 * @property {number} height_o
 * @property {number} width_o
 */

/**
 * @typedef {object} FlickrApiResponse
 *
 * @property {string} id
 * @property {string} primary
 * @property {string} owner
 * @property {string} ownername
 * @property {number | string} page
 * @property {number | string} pages
 * @property {number} total
 * @property {string} perpage
 * @property {FlickrPhoto[]} photo
 */

/**
 * @typedef {Object} GalleryPhoto
 *
 * @property {string} id
 * @property {string} title
 * @property {string} lat
 * @property {string} lng
 * @property {string} thumb
 * @property {string} image
 * @property {string} date
 * @property {{ h: number, w: number }} txy
 * @property {{ h: number, w: number }} ixy
 */

/**
 * @param {GalleryPhoto[]} gallery
 * @param {string} apiKey
 * @param {string} userId
 * @param {string} [photoSetId]
 * @param {number} [page]
 * @param {number} [callDepth]
 *
 * @returns {Promise<GalleryPhoto[]>}
 */
async function loadNewImages(gallery, apiKey, userId, photoSetId, page, callDepth = 1) {
  const url  = getFlickrUrl(apiKey, userId, photoSetId, page);
  const json = await fetch(url).then(response => response.json());

  /** @type {FlickrApiResponse} */
  const response = json.photoset || json.photos;

  console.log(`---------------
${ userId }

      PhotoSet: ${ photoSetId }
  Result Count: ${ response.photo.length }
          Page: ${ response.page } of ${ response.pages }
---------------`);

  for (let i = 0; i < response.photo.length; i += 1) {
    const img = response.photo[i];

    gallery.push({
      owner: userId,
      id:    img.id,
      title: img.title,
      lat:   img.latitude,
      lng:   img.longitude,
      date:  img.dateupload,
      thumb: img.url_n.replace('https://live.staticflickr.com/', ''),
      image: img.url_o.replace('https://live.staticflickr.com/', ''),
      txy:   { h: img.height_n, w: img.width_n },
      ixy:   { h: img.height_o, w: img.width_o },
    });
  }

  const integerPage  = typeof response.page === 'string'  ? parseInt(response.page) : response.page;
  const integerPages = typeof response.pages === 'string' ? parseInt(response.pages) : response.pages;

  if (integerPage < integerPages) {
    if (callDepth >= 5) {
      console.log('Maximum API Call Depth Reached. Stopping.')
    }
    else {
      await loadNewImages(gallery, apiKey, userId, photoSetId, integerPage + 1, callDepth + 1);
    }
  }

  return gallery;
}

(async () => {
  const apiKey   = process.env.API_KEY;
  const rootPath = path.normalize(path.join(__dirname, '..'));
  const filePath = path.join(rootPath, 'site', '_data', 'gallery-wall.json');

  const photoSources = [
    { userId: '196280425@N04', photoSetId: '72177720301304392' }, // Mike
    { userId: '196280101@N05', photoSetId: '72177720301383100' }, // Julie
    { userId: '196326181@N04', photoSetId: '72177720301436252' }, // Kelly
    { userId: '196316248@N03', photoSetId: '72177720301465755' }, // Jordan
  ];

  /** @type {GalleryPhoto[]} */
  let gallery = [];

  for (let { userId, photoSetId } of photoSources) {
    gallery = await loadNewImages(gallery, apiKey, userId, photoSetId);
  }

  gallery.images = gallery.sort((a, b) => b.date - a.date);

  fs.writeFileSync(filePath, JSON.stringify(gallery), 'utf8');

  console.log(`Done. The gallery contains ${gallery.length} image(s).`);
})();
