// mettre de vrai coords

let positions = [
  [45.587725131422715, -73.69795128446846],
  [45.600811683645176, -73.72216324616511],
  [45.586618190213954, -73.60114280356063]
]

function avgCoord(){
  Cx = 0;
  Cy = 0;

  positions.forEach(pos => {
    Cx += pos[0]
    Cy += pos[1]
  })
  
  Cx = Cx / positions.length;
  Cy = Cy / positions.length;
  
  return [Cx, Cy];
}

let map = new L.map('map' ,  {center:avgCoord(), zoom:12});

let layer = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
map.addLayer(layer);

positions.forEach(position => {
  let marker = new L.Marker(position);
  marker.addTo(map);
})
