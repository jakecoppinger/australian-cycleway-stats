import { calculateWayLength } from "./osm-geometry-utils";

describe('calculateWayLength', () => {
  it('return length of zero when only one node', () => {

    const length = calculateWayLength({
      "type": "way",
      "id": 2949895,
      "bounds": {
        "minlat": -33.8864800,
        "minlon": 151.1987383,
        "maxlat": -33.8864789,
        "maxlon": 151.2000516
      },
      "nodes": [
      ],
      "geometry": [
        { "lat": -33.8864800, "lon": 151.1987383 },
        // { "lat": -33.8864793, "lon": 151.1988250 },
        // { "lat": -33.8864789, "lon": 151.1988716 },
        // { "lat": -33.8864789, "lon": 151.1990728 },
        // { "lat": -33.8864795, "lon": 151.1999807 },
        // { "lat": -33.8864796, "lon": 151.2000516 }
      ],
      "tags": {
      }
    });
    expect(length).toBe(0);
  });

  it('return length of 385 when 385 metres apart', () => {
    const length = calculateWayLength({
      "type": "way",
      "id": 2949895,
      "bounds": {
        "minlat": -33.8864800,
        "minlon": 151.1987383,
        "maxlat": -33.8864789,
        "maxlon": 151.2000516
      },
      "nodes": [
      ],
      "geometry": [
        { "lat": -33.8657052, "lon": 151.2044854 },
        { "lat": -33.8671841, "lon": 151.2082512 },
      ],
      "tags": {
      }
    });
    expect(length).toBe(385);
  });
});
