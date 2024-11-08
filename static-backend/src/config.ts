export const config = {
  // See more endpoints at https://wiki.openstreetmap.org/wiki/Overpass_turbo,
  // or roll your own with a simple docker server (much faster):
  // https://github.com/wiktorn/Overpass-API

  /** Default is required, everything else is optional */
  overpassApiEndpoints: {
    'australia':'http://localhost:12351/api/interpreter',
    'default': 'https://overpass-api.de/api/interpreter',
  },
  skipRegeneratingAustralianData: false,
  skipRegeneratingInternationalData: false,

  // Only downloads one Australian council and renders that when enabled
  debug: false,
}
