#!/usr/bin/env node
const fs   = require('fs');
const path = require('path');

const [lat, lng, accuracy, altitude] = process.argv.slice(2);

if (!(lat && lng)) {
  throw new Error('latitude and longitude are required');
}

const projectRoot  = path.normalize(path.join(__dirname, '..'));
const checkinsPath = path.join(projectRoot, '_data', 'location-checkin.json');
const checkins     = JSON.parse(fs.readFileSync(checkinsPath, 'utf8'));

const newCheckin = {
  lat: parseFloat(lat),
  lng: parseFloat(lng),
  acc: accuracy ? parseFloat(accuracy) : null,
  alt: altitude ? parseFloat(altitude) : null,
};

checkins.push(newCheckin);

fs.writeFileSync(checkinsPath, JSON.stringify(checkins), 'utf8');

console.log(`New Checkin Recorded: ${ JSON.stringify(newCheckin, null, 2) }`);
