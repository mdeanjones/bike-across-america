#!/usr/bin/env node
const fs         = require('fs');
const path       = require('path');
const { Client } = require("@googlemaps/google-maps-services-js");

(async function() {
  const [lat, lng, accuracy, altitude] = process.argv.slice(2);

  if (!(lat && lng)) {
    throw new Error('latitude and longitude are required');
  }

  const projectRoot  = path.normalize(path.join(__dirname, '..'));
  const checkinsPath = path.join(projectRoot, 'site', '_data', 'location-checkin.json');
  const checkins     = JSON.parse(fs.readFileSync(checkinsPath, 'utf8'));

  const newCheckin = {
    idx:   checkins.length + 1,
    lat:   parseFloat(lat),
    lng:   parseFloat(lng),
    acc:   accuracy ? parseFloat(accuracy) : null,
    alt:   altitude ? parseFloat(altitude) : null,
    dist:  null,
    speed: null,
    time:  Date.now(),
  };

  try {
    const config = {
      params: {
        origins:      [checkins[checkins.length - 1]],
        destinations: [newCheckin],
        key:          process.env.API_KEY,
        travel_mode:  'BICYCLING',
      },
    }

    const client = new Client();
    const result = await client.distancematrix(config);

    const { distance, duration } = result.data.rows?.[0]?.elements?.[0] ?? {};

    newCheckin.dist  = distance?.value ?? null;
    newCheckin.speed = duration?.value ?? null;

    console.log('Distance Lookup Result:\n' + JSON.stringify(result.data, null, 2));
  }
  catch (e) {
    console.error(`A Distance Lookup Error Occurred: ${ e.code } - ${ e.message }`);
  }

  checkins.push(newCheckin);

  fs.writeFileSync(checkinsPath, JSON.stringify(checkins), 'utf8');

  console.log(`New Checkin Recorded: ${ JSON.stringify(newCheckin, null, 2) }`);
})();
