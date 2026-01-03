// IDW (Inverse Distance Weighting) interpolation for gridded radar tiles
// See COPILOT_PROMPT.md for methodology and requirements

export interface Point {
  lat: number;
  lon: number;
  value: number;
}

export interface Grid {
  width: number;
  height: number;
  lat0: number; // NW corner
  lon0: number; // NW corner
  lat1: number; // SE corner
  lon1: number; // SE corner
  data: number[][]; // [y][x] grid of interpolated values
}

export interface IDWOptions {
  power?: number; // IDW power parameter (default 2)
  radius?: number; // Max distance in km to consider (optional)
  minPoints?: number; // Minimum points to interpolate (default 1)
  nodata?: number; // Value to use if no points in radius (default NaN)
}

// Haversine distance in km
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) ** 2 + Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLon/2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// IDW interpolation for a grid
export function idwGrid(
  points: Point[],
  width: number,
  height: number,
  lat0: number,
  lon0: number,
  lat1: number,
  lon1: number,
  options: IDWOptions = {}
): Grid {
  const power = options.power ?? 2;
  const radius = options.radius ?? Infinity;
  const minPoints = options.minPoints ?? 1;
  const nodata = options.nodata ?? NaN;
  const data: number[][] = [];
  for (let y = 0; y < height; y++) {
    const row: number[] = [];
    const lat = lat0 + (lat1 - lat0) * (y / (height - 1));
    for (let x = 0; x < width; x++) {
      const lon = lon0 + (lon1 - lon0) * (x / (width - 1));
      // Compute weights
      let sumWeights = 0;
      let sumValues = 0;
      let used = 0;
      for (const pt of points) {
        const d = haversine(lat, lon, pt.lat, pt.lon);
        if (d === 0) {
          row.push(pt.value);
          used = -1;
          break;
        }
        if (d <= radius) {
          const w = 1 / Math.pow(d, power);
          sumWeights += w;
          sumValues += w * pt.value;
          used++;
        }
      }
      if (used === -1) continue;
      if (used >= minPoints && sumWeights > 0) {
        row.push(sumValues / sumWeights);
      } else {
        row.push(nodata);
      }
    }
    data.push(row);
  }
  return { width, height, lat0, lon0, lat1, lon1, data };
}
