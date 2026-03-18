export const config = {
  // See more endpoints at https://wiki.openstreetmap.org/wiki/Overpass_API#Public_Overpass_API_instances
  // or roll your own with a simple docker server (much faster):
  // https://github.com/wiktorn/Overpass-API

  /** Default is required, everything else is optional */
  overpassApiEndpoints: {
    'australia':'http://localhost:54322/api/interpreter',
    default: "https://overpass-api.de/api/interpreter"
  },
  // Lage rate limits needed for overpass-api.de.
  internationalRateLimitBetweenRequests: 20000,
  skipRegeneratingAustralianData: false,
  skipRegeneratingInternationalData: false,

  // Only downloads one Australian council and renders that when enabled
  debug: false,
}
