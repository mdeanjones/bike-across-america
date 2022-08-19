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

function getImageSubset({ ownername, photo }, tailId) {
  const results    = [];
  const imageArray = consistentSort(photo);

  for (let i = 0; i < imageArray.length; i += 1) {
    const item = imageArray[i];

    if (item.id === tailId) {
      break;
    }

    results.push({
      id: item.id,
      owner: ownername,
      title: item.title,
      lat: item.latitude,
      lng: item.longitude,
      date: item.dateupload,
      thumb: item.url_n.replace('https://live.staticflickr.com/', ''),
      image: item.url_o.replace('https://live.staticflickr.com/', ''),
      txy: { h: item.height_n, w: item.width_n },
      ixy: { h: item.height_o, w: item.width_o },
    });
  }

  return results;
}

async function loadNewImages(currentImages, apiKey, userId, photoSetId) {
  const json = await fetch(
    getFlickrUrl(apiKey, userId, photoSetId),
  ).then(response => response.json());

  const newImages = getImageSubset(json.photoset || json.photos, currentImages[0]?.id);

  return [...newImages, ...currentImages];
}

function consistentSort(imageArray) {
  return imageArray.sort((a, b) => {
    const dateA = a.date || a.dateupload;
    const dateB = b.date || b.dateupload;

    return dateA === dateB
      ? a.id.localeCompare(b.id)
      : dateB - dateA;
  });
}

(async () => {
  const flickrApiKey  = process.env.API_KEY;
  const projectRoot   = path.normalize(path.join(__dirname, '..'));
  const filePath      = path.join(projectRoot, 'site', '_data', 'gallery-wall.json');
  const currentImages = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  const photoSources = [
    { userId: '196280425@N04', photoSetId: '72177720301304392' }, // Mike
    { userId: '196280101@N05', photoSetId: '72177720301383100' }, // Julie
  ];

  let updatedGallery = currentImages;

  for (let { userId, photoSetId } of photoSources) {
    updatedGallery = await loadNewImages(updatedGallery, flickrApiKey, userId, photoSetId);
  }

  updatedGallery = consistentSort(updatedGallery);

  fs.writeFileSync(filePath, JSON.stringify(updatedGallery), 'utf8');

  console.log(`Added ${updatedGallery.length - currentImages.length} new image(s).`);
})();
