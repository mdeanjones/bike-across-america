#!/usr/bin/env node
const fetch = require('node-fetch');
const fs    = require('fs');
const path  = require('path');

// https://www.flickr.com/services/api/explore/flickr.people.getPublicPhotos
// https://www.flickr.com/services/api/explore/flickr.photosets.getPhotos

function getFlickrUrl(apiKey, userId, photoSetId) {
  let url = 'https://www.flickr.com/services/rest/?'

  url += typeof photoSetId === 'string'
    ? `method=flickr.photosets.getPhotos&photoset_id=${photoSetId}`
    : 'method=flickr.people.getPublicPhotos';

  return url + `&api_key=${apiKey}&user_id=${userId}&extras=url_o,url_n,date_upload,geo&format=json&nojsoncallback=1`;
}

/**
 * @typedef {Object} FlickrPhoto
 *
 * @property {string} id
 * @property {string} title
 * @property {string} latitude
 * @property {string} longitude
 * @property {string} url_n
 * @property {string} url_o
 * @property {number} dateupload
 * @property {number} height_n
 * @property {number} width_n
 * @property {number} height_o
 * @property {number} width_o
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
 * @property {number} date
 * @property {{ h: number, w: number }} txy
 * @property {{ h: number, w: number }} ixy
 */

/**
 * @typedef {Object} LatestRecord
 *
 * @property {string} userId
 * @property {string} idTimestamp
 */

/**
 * @typedef {Object} Gallery
 *
 * @property {LatestRecord[]} latest
 * @property {GalleryPhoto[]} images
 */

/**
 * @param {Gallery} gallery
 * @param {string} apiKey
 * @param {string} userId
 * @param {string} [photoSetId]
 *
 * @returns {Promise<Gallery>}
 */
async function loadNewImages(gallery, apiKey, userId, photoSetId) {
  const url  = getFlickrUrl(apiKey, userId, photoSetId);
  const json = await fetch(url).then(response => response.json());

  /** @type {FlickrPhoto[]} */
  const images = json.photoset.photo || json.photos.photo;

  // Pull the unique ID of the last recorded "newest" image for the user
  let latest = gallery.latest?.find(item => item.userId === userId);

  // Find the index of the last recorded "newest" image within the new list
  const endAt = latest?.idTimestamp
    ? images.findIndex((item) => `${ item.id }-${ item.dateupload }` === latest.idTimestamp)
    : images.length;

  // The ID of the new "newest" image will always be derived from the first
  // object of the response. In this way, it is very easy to determine whether
  // any new images have been added.
  const newIdTimestamp = images.length ? `${ images[0].id }-${ images[0].dateupload }` : '';

  if (!latest) {
    latest = { userId, idTimestamp: '' };
    gallery.latest.push(latest);
  }

  latest.idTimestamp = newIdTimestamp;

  const newImages = [];

  for (let i = 0; i < endAt; i += 1) {
    newImages.push({
      owner: userId,
      id:    images[i].id,
      title: images[i].title,
      lat:   images[i].latitude,
      lng:   images[i].longitude,
      date:  images[i].dateupload,
      thumb: images[i].url_n.replace('https://live.staticflickr.com/', ''),
      image: images[i].url_o.replace('https://live.staticflickr.com/', ''),
      txy:   { h: images[i].height_n, w: images[i].width_n },
      ixy:   { h: images[i].height_o, w: images[i].width_o },
    });
  }

  gallery.images = [...newImages, ...gallery.images];

  return gallery;
}

(async () => {
  const apiKey   = process.env.API_KEY;
  const rootPath = path.normalize(path.join(__dirname, '..'));
  const filePath = path.join(rootPath, 'site', '_data', 'gallery-wall.json');

  const photoSources = [
    { userId: '196280425@N04', photoSetId: '72177720301304392' }, // Mike
    { userId: '196280101@N05', photoSetId: '72177720301383100' }, // Julie
  ];

  /** @type {Gallery} */
  let gallery = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let count   = gallery.images.length;

  for (let { userId, photoSetId } of photoSources) {
    gallery = await loadNewImages(gallery, apiKey, userId, photoSetId);
  }

  gallery.images = gallery.images.sort((a, b) => b.date - a.date);

  fs.writeFileSync(filePath, JSON.stringify(gallery), 'utf8');

  console.log(`Added ${gallery.images.length - count} new image(s).`);
})();
