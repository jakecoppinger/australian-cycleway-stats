export const config = {
  // See more endpoints at https://wiki.openstreetmap.org/wiki/Overpass_turbo,
  // or roll your own (much faster): https://github.com/wiktorn/Overpass-API
  // overpassApi: 'http://localhost:12351/api/interpreter',
  overpassApi: 'https://overpass-api.de/api/interpreter',
  regenerateAustralianData: true,
  regenerateInternationalData: true,
  // Only downloads one Australian council and renders that when enabled
  debug: false,
}