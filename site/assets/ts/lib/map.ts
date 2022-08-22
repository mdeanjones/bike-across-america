import { formatDate, convertMetersToMiles, toFixedPrecision } from "./utilities";

type LocationPin = {
  idx:   number,
  lat:   number,
  lng:   number,
  time:  number,
  alt:   number | null,
  dist:  number | null,
  speed: number | null,
};

declare global {
  interface Window {
    readonly locationPins: LocationPin[];
    readonly googleMapsKey: string;
    initMap: typeof initMap;
  }
}

export default function setupMaps() {
  window.initMap = initMap;

  const script = document.createElement('script');
  script.src   = `https://maps.googleapis.com/maps/api/js?key=${ window.googleMapsKey }&callback=initMap&v=weekly`;

  document.body.append(script);
}

function buildInfoWindowContent(pin: LocationPin, cumulativeDistance: number) {
  return `
    <p class="fw-bold mb-1">Checkin ${ pin.idx }</p>
    <p class="text-muted mb-1">(${ formatDate(pin.time) ?? 'No Timestamp Provided' })</p>

    <hr class="mt-0" />

    <table class="table table-striped table-sm mb-0">
      <tbody>
        <tr>
          <th scope="row">Distance (From Previous)</th>
          <td>${ convertMetersToMiles(pin.dist, 'No Distance Info') }</td>
        </tr>

        <tr>
          <th scope="row">Distance (To Date)</th>
          <td>${ convertMetersToMiles(cumulativeDistance + (pin.dist ?? 0), 'No Distance Info') }</td>
        </tr>

        <tr>
          <th scope="row">Latitude</th>
          <td>${ toFixedPrecision(pin.lat, 5, 'No Latitude Info') }</td>
        </tr>

        <tr>
          <th scope="row">Longitude</th>
          <td>${ toFixedPrecision(pin.lng, 5, 'No Longitude Info') }</td>
        </tr>
      </tbody>
    </table>
  `;
}

/**
 * Creates a single Marker instance using the provided Location pin's data.
 */
function generateMapMarker(pin: LocationPin, map: google.maps.Map) {
  return new google.maps.Marker({
    map,
    position:  pin,
    title:     `Checkin ${ pin.idx }`,
    animation: google.maps.Animation.DROP,
    icon:      { url: 'https://maps.google.com/mapfiles/ms/micons/orange.png' },
  });
}

/**
 * The callback executed by the Google Maps API when it loads.
 */
function initMap() {
  const mapEl  = document.getElementById("map") as HTMLElement;
  const pins   = window.locationPins;
  const map    = new google.maps.Map(mapEl, { mapTypeId: 'terrain' });
  const bounds = new google.maps.LatLngBounds();
  const info   = new google.maps.InfoWindow();

  new google.maps.BicyclingLayer().setMap(map);

  for (let pin of pins) {
    bounds.extend(pin);
  }

  // Defaults, before any checkins have occurred
  if (!pins.length) {
    bounds.extend({ lat: 37.774203, lng: -122.512961 }); // Ocean Beach, San Francisco
    bounds.extend({ lat: 37.229877, lng: -76.497523 }); // Yorktown, Virginia
  }

  map.fitBounds(bounds);

  // Cause the markers to drop in a staggered wave
  function nextMarker(pins: LocationPin[], distance: number) {
    const pin = pins.shift();

    if (!pin) {
      return;
    }

    const marker = generateMapMarker(pin, map);

    marker.addListener('click', () => {
      info.setContent(buildInfoWindowContent(pin, distance));
      info.open({ map, anchor: marker });
    });

    setTimeout(() => nextMarker(pins, distance + (pin.dist ?? 0)), 350);
  }

  nextMarker(pins.slice(), 0);
}
