// Inicializar mapa
const map = L.map('map').setView([42.6, -5.57], 10);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

let userMarker;

// Obtener ubicación del usuario
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude, longitude } = pos.coords;
    map.setView([latitude, longitude], 14);
    userMarker = L.marker([latitude, longitude])
      .addTo(map)
      .bindPopup("Tu ubicación")
      .openPopup();
  });
}

// Elementos del DOM
const form = document.getElementById("census-form");
const zonaSelect = document.getElementById("zona");
const filtroZona = document.getElementById("filtro-zona");
const filtroFecha = document.getElementById("filtro-fecha");
const sightingsList = document.getElementById("sightings");

// Cargar zonas desde JSON
fetch('zonas.json')
  .then(res => res.json())
  .then(data => {
    data.forEach(z => {
      const option = document.createElement("option");
      option.value = z.nombre;
      option.textContent = z.nombre;
      zonaSelect.appendChild(option);

      const filterOption = document.createElement("option");
      filterOption.value = z.nombre;
      filterOption.textContent = z.nombre;
      filtroZona.appendChild(filterOption);
    });
  });

// Manejo del formulario
form.addEventListener("submit", e => {
  e.preventDefault();
  const animal = document.getElementById("animal").value;
  const zona = zonaSelect.value;

  const coords = map.getCenter();
  const sighting = {
    animal,
    zona,
    lat: coords.lat,
    lon: coords.lng,
    date: new Date().toISOString()
  };

  saveSighting(sighting);
  showSightings();
});

// Guardar en localStorage y marcar en mapa
function saveSighting(s) {
  let data = JSON.parse(localStorage.getItem("sightings")) || [];
  data.push(s);
  localStorage.setItem("sightings", JSON.stringify(data));

  L.marker([s.lat, s.lon])
    .addTo(map)
    .bindPopup(`${s.animal} - ${s.zona} (${new Date(s.date).toLocaleString()})`);
}

// Mostrar lista de avistamientos con filtros
function showSightings() {
  sightingsList.innerHTML = "";
  let data = JSON.parse(localStorage.getItem("sightings")) || [];
  const zonaFiltro = filtroZona.value;
  const fechaFiltro = filtroFecha.value;

  data.forEach(s => {
    const fechaS = s.date.split("T")[0];
    if ((zonaFiltro === "todas" || s.zona === zonaFiltro) &&
        (!fechaFiltro || fechaS === fechaFiltro)) {
      const li = document.createElement("li");
      li.textContent = `${s.animal} - ${s.zona} en (${s.lat.toFixed(4)}, ${s.lon.toFixed(4)}) - ${new Date(s.date).toLocaleString()}`;
      sightingsList.appendChild(li);
    }
  });
}

// Aplicar filtros al cambiar
filtroZona.addEventListener("change", showSightings);
filtroFecha.addEventListener("change", showSightings);

showSightings();

// Registrar service worker (PWA)
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}
