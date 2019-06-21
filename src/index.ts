import bbox from '@turf/bbox';
import bboxPolygon from '@turf/bbox-polygon';
import intersect from '@turf/intersect';
import {BBox} from '@turf/helpers/lib/geojson';

const lon2tile = (lon,zoom) => {
  return (Math.floor((lon+180)/360*Math.pow(2,zoom)));
}

const lat2tile = (lat, zoom) =>  {
  return (Math.floor((1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom)));
}

const sinh = function (arg) {
  return (Math.exp(arg) - Math.exp(-arg)) / 2;
}

const tileToLng = (x, z) => {
  return x * 360 / Math.pow(2,z) - 180;
}

const tileToLat = (y, z) => {
  return Math.atan(sinh(Math.PI - y * 2 * Math.PI / Math.pow(2,z))) * (180 / Math.PI);
}

const tileToBbox = (x, y, z) => {
  return <BBox>[tileToLng(x,z), tileToLat(y+1,z), tileToLng(x+1,z), tileToLat(y,z)]
}


export const fromPoint = (geojson, zoom) => {
  if (geojson.geometry.type === 'Point') {
    return [
      lon2tile(geojson.geometry.coordinates[0], zoom),
      lat2tile(geojson.geometry.coordinates[1], zoom)
    ]
  }
}

export const fromPolygon = (geojson, zoom, filter = false) => {
  const [minX, minY, maxX, maxY] = bbox(geojson)
  
  const top_tile    = lat2tile(maxY, zoom);
  const left_tile   = lon2tile(minX, zoom);
  const bottom_tile = lat2tile(minY, zoom);
  const right_tile  = lon2tile(maxX, zoom);
  const width       = Math.abs(left_tile - right_tile) + 1;
  const height      = Math.abs(top_tile - bottom_tile) + 1;
  
  const tiles = []
  
  for (let x = left_tile; x < left_tile + width; x++) {
    for (let y = top_tile; y < top_tile + height; y++) {
      if (
        filter === false || 
        intersect(geojson, bboxPolygon(tileToBbox(x, y, zoom)))
      ) {
        tiles.push([x, y])
      }
    }
  }
    
  return tiles
}
  