// Map Attributes
var wfsCasosViolencia = new L.layerGroup();
var wfsDepartamentos = new L.layerGroup();

// GeoServer Settings
var url_geoserver_wfs = "/geoserver/wfs?";
var url_geoserver_wms = "/geoserver/wms?";

// WMS
//capa casos de violencia WMS
var WmsCasosViolencia = new L.tileLayer.wms(url_geoserver_wms, {
  layers: "violencia:caso_violencia",
  format: "image/png8",
  transparent: true,
  opcity: 0.6,
  zIndex: 100,
  attribution: "Data from https://www.datos.gov.co/",
});

// capa departamento WMS
var WmsDepartamento = new L.tileLayer.wms(url_geoserver_wms, {
  layers: "violencia:Departamentos",
  format: "image/png8",
  transparent: true,
  opcity: 0.6,
  zIndex: 100,
  attribution: "Data from https://www.datos.gov.co/",
});

// WFS
//Get WFS layers from GeoServer
var wfsURL_CasosViolencia =
  url_geoserver_wfs +
  "version=1.0.0&request=GetFeature&typeName=violencia:caso_violencia&outputFormat=application/json";
var wfsURL_departamentos =
  url_geoserver_wfs +
  "version=1.0.0&request=GetFeature&typeName=violencia:Departamentos&outputFormat=application/json";

// Styles

function Estilolinea(feature) {
  return {
    fillColor: "#600be0",
    weight: 2,
    opacity: 2,
    color: "green",
    dashArray: "3",
    fillOpacity: 0.8,
  };
}

var Estilodepartamento = {
  color: "#16c702",
  weight: 3,
  opacity: 0.8,
};

var grupoMarcadores = L.markerClusterGroup();

function EstiloCasos(marker) {
  return {
    icon: greenIcon,
    color: "#232424",
    radius: 7,
  };
}

// Marker
const LeafIcon = L.Icon.extend({
  options: {
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [38, 95],
    shadowSize: [50, 64],
    iconAnchor: [22, 94],
    shadowAnchor: [4, 62],
    popupAnchor: [-3, -76],
  },
});

const greenIcon = new LeafIcon({ iconUrl: "./img/marcador.png" });

//--------------------------------------------------------------------------------------------------------------------

function getButtonHTML(popupContent) {
  return (
    '<button id="actionButton" class="btn btn-info action-button" onclick="obtenerdatos(\'' +
    popupContent +
    '\')"> <i class="fas fa-search"></i> Visitar</button>'
  );
}

function accioncasos(feature, layer) {
  const idCaso = feature.properties.id_caso;
  const idtable = feature.properties.idtable;
  const municipio = feature.properties.municipio;
  const departamento = feature.properties.departamen;
  const sexo = feature.properties.sexo;
  const ocupacion = feature.properties.ocupacion;
  const situacion = feature.properties.situacion;
  const calidad_victima = feature.properties.calidad_victima;

  datos = {
    idtable,
    idCaso,
  };

  const popupContent =
    "Municipio: " +
    municipio +
    "<br>" +
    "Departamento: " +
    departamento +
    "<br>" +
    "Sexo: " +
    sexo +
    "<br>" +
    "Ocupacion: " +
    ocupacion +
    "<br>" +
    "Situacion: " +
    situacion +
    "<br>" +
    "Calidad Victima: " +
    calidad_victima +
    "<br>";

  const buttonHTML = getButtonHTML(popupContent);
  const popupContentWithButton = popupContent + buttonHTML;

  layer.bindPopup(popupContentWithButton);
}

function obtenerdatos(popupContent) {
  Swal.fire({
    title: "Ingrese su nombre",
    input: "text",
    inputAttributes: {
      autocapitalize: "off",
    },
    showCancelButton: true,
    confirmButtonText: "Aceptar",
    cancelButtonText: "Cancelar",
  }).then((result) => {
    if (result.isConfirmed) {
      const nombre = result.value;
      console.log("IDtabla: ", datos.idtable);
      console.log("IDcaso: ", datos.idCaso);
      console.log("Nombre: ",nombre);
    }
  });
}

//--------------------------------------------------------------------------------------------------------------------

//360614
const mark = (feature, latlng) => {
  const circleMarker = L.circleMarker(latlng, {
    style: EstiloCasos,
    onEachFeature: accioncasos,
  });
  grupoMarcadores.addLayer(circleMarker);
};

// Interaccion
function InteraccionDep(feature, layer) {
  if (feature.properties && feature.properties.NOM_DEPART) {
    var shapeareaFormatted =
      feature.properties.SHAPE_AREA.toLocaleString("es-CO");
    layer.bindPopup(
      "Departamento: " +
        feature.properties.NOM_DEPART +
        "<br>" +
        "Area: " +
        shapeareaFormatted
    );
  }
}

async function getWFSgeoJson_CasosViolencia11() {
  try {
    var response = await fetch(wfsURL_MyLayer);
    var r = await response.json();
    console.log(r);
    return r;
  } catch (err) {
    console.log(err);
  }
}

async function getWFSgeoJson_CasosViolencia() {
  try {
    var response = await fetch(wfsURL_CasosViolencia);
    var r = await response.json();
    return r;
  } catch (err) {
    console.log(err);
  }
}

// Capas DEPARTAMENTOS WFS
fetch(wfsURL_departamentos)
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    // Crear capa L.geoJSON con los datos cargados
    L.geoJSON(data, {
      style: Estilodepartamento,
      onEachFeature: InteraccionDep,
    }).addTo(wfsDepartamentos);
  })
  .catch(function (error) {
    console.log(error);
  });

// capa casos de violencia WFS

wfsCasosViolencia.addLayer(grupoMarcadores);

getWFSgeoJson_CasosViolencia().then((data) => {
  L.geoJSON(data, {
    pointToLayer: mark,
  }).addTo(wfsCasosViolencia);
});

// --------------------------------------------------------------------------------------------------

var osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>' +
    "contributors",
  maxZoom: 18,
});

// OSM Mapa
var map = L.map("map", {
  center: [1.6202, -75.6043],
  zoom: 6,
  layers: [osm],
});

// Map Attributers
var mAttr = "";

// CartoDB titles
var cartodbUrl = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png";
var cartodb = L.tileLayer(cartodbUrl, { attribution: mAttr });

// MapBox
var streets = L.tileLayer(
  "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
  {
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
      '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: "mapbox/streets-v11",
    tileSize: 512,
    zoomOffset: -1,
    accessToken:
      "pk.eyJ1IjoidG9xdWlub3ZpYyIsImEiOiJjbGdiZ3VhZmMwaGdnM2Vud2Z2aWJjbnBiIn0.0D301Nbyl2uxrRs5Iic0mA",
  }
);

var minimapa = L.tileLayer(
  "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
  {
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
      '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: "mapbox/streets-v11",
    tileSize: 512,
    zoomOffset: -1,
    accessToken:
      "pk.eyJ1IjoidG9xdWlub3ZpYyIsImEiOiJjbGdiZ3VhZmMwaGdnM2Vud2Z2aWJjbnBiIn0.0D301Nbyl2uxrRs5Iic0mA",
  }
);

//web services layers
var baseLayers = {
  "Openstreet Map": osm,
  "CartoDB Light": cartodb,
  MapBox: streets,
};

// add Ovelay Layers
var overlaymaps = {
  "Casos de Violencia (WMS)": WmsCasosViolencia,
  "Casos de Violencia (WFS)": wfsCasosViolencia,
  "Departamentos (WMS)": WmsDepartamento,
  "Departamentos (WFS)": wfsDepartamentos,
};

// add base layers
var controlLayers = L.control
  .layers(baseLayers, overlaymaps, { collapse: false })
  .addTo(map);

// Insertando un título en el mapa
var title = L.control();
title.onAdd = function (map) {
  var div = L.DomUtil.create("div", "info");
  div.innerHTML += "<h2>Casos de Violencia</h2>";
  return div;
};
title.addTo(map);

// Insertando una leyenda en el mapa
var legend = L.control();
legend.onAdd = function (map) {
  var div = L.DomUtil.create("div", "info legend");
  div.innerHTML +=
    '<img src="./img/leyenda.jpg" alt="legend" width="101" height="60">';
  return div;
};
legend.addTo(map);

// Add SCALEBAR TO MAP
L.control
  .scale({
    metric: true,
    imperial: false,
    maxWindth: 100,
  })
  .addTo(map);

// Re.order map z-index
map.on("overlayadd", function (e) {
  if (e.name === "Casos de Violencia (WFS)") {
    wfsCasosViolencia.addTo(map);
  }
});

map.on("overlayremove", function (e) {
  if (e.name === "Casos de Violencia (WFS)") {
    wfsCasosViolencia.removeFrom(map);
  }
});

//Minimapa
var minimap = new L.control.minimap(minimapa, {
  toggleDisplay: true,
  minimized: false,
  position: "bottomleft",
}).addTo(map);

//-----------------------------------------------------------------------------------------
// SELECT DEPARTAMENTO - MUNICIPIO
const departmentSelect = document.getElementById("department");
const municipalitySelect = document.getElementById("municipality");

// Variable global para almacenar la capa de puntos
let pointsLayer;

// Función para quitar los puntos del mapa
function removePointsFromMap() {
  if (pointsLayer) {
    pointsLayer.remove();
  }
}

function addPointsToMap(features) {
  // Crea una capa de puntos con los features
  const layer = L.geoJSON(features, {
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, {
        radius: 8,
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8,
      });
    },
  });

  // Almacena la capa de puntos en la variable global
  pointsLayer = layer;

  // Agrega la capa al mapa
  layer.addTo(map);
}

// Arreglo para almacenar los municipios únicos
var uniqueMunicipalities = [];

// Función asincrónica para obtener los datos del servicio WFS
async function getWFSgeoJson_CasosViolencia() {
  try {
    var response = await fetch(wfsURL_CasosViolencia);
    var r = await response.json();
    return r.features; // devuelve el arreglo de features
  } catch (err) {
    console.log(err);
  }
}

// Carga los departamentos desde GeoJson
fetch(wfsURL_CasosViolencia)
  .then((response) => {
    if (
      response.ok &&
      response.headers.get("content-type").startsWith("application/json")
    ) {
      return response.json();
    } else {
      throw new Error("Los datos no están en formato GeoJSON");
    }
  })
  .then((data) => {
    const features = data.features;
    const departments = Array.from(
      new Set(features.map((item) => item.properties.departamen))
    ).map((department) => ({ name: department }));
    departments.forEach((department) => {
      const option = document.createElement("option");
      option.value = department.name;
      option.textContent = department.name;
      departmentSelect.appendChild(option);
    });

    // Añade el valor por defecto al select de municipios
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Seleccione el Municipio...";
    municipalitySelect.appendChild(defaultOption);
  })
  .catch((error) => {
    console.error(error);
  });

departmentSelect.addEventListener("change", (event) => {
  const departmentName = event.target.value;

  // Selecciona el valor por defecto del select de municipios
  municipalitySelect.value = "";

  // Quita los puntos del municipio anterior
  removePointsFromMap();

  // Limpia la variable de municipios únicos
  uniqueMunicipalities = [];

  // Limpia el select de municipios
  municipalitySelect.innerHTML = "";

  // Agrega el valor por defecto al select de municipios
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Seleccione el Municipio...";
  municipalitySelect.appendChild(defaultOption);

  // Actualiza el valor del select de departamentos con el departamento seleccionado
  departmentSelect.value = departmentName;

  // Carga los municipios del departamento seleccionado
  fetch(wfsURL_CasosViolencia)
    .then((response) => response.json())
    .then((data) => {
      const features = data.features;
      const municipalities = features
        .filter((item) => item.properties.departamen === departmentName)
        .map((item) => ({ name: item.properties.municipio }));
      municipalities.forEach((municipality) => {
        if (!uniqueMunicipalities.includes(municipality.name)) {
          uniqueMunicipalities.push(municipality.name);
          const option = document.createElement("option");
          option.value = municipality.name;
          option.textContent = municipality.name;
          municipalitySelect.appendChild(option);
        }
      });

      municipalitySelect.disabled = false;

      const selectedFeatures = features.filter(
        (item) =>
          item.properties.departamen === departmentName &&
          municipalities.some(
            (municipality) => municipality.name === item.properties.municipio
          )
      );
      addPointsToMap(selectedFeatures);
    });
});

function popupConInformacion(feature) {
  const idCaso = feature.properties.id_caso;
  const municipio = feature.properties.municipio;
  return `${idCaso} - ${municipio}`;
}

function addPointsToMap(features) {
  const grupoMarcadores = L.markerClusterGroup();

  features.forEach((feature) => {
    const latlng = [
      feature.geometry.coordinates[1],
      feature.geometry.coordinates[0],
    ];
    L.circleMarker(latlng, EstiloCasos(feature))
      .bindPopup(popupConInformacion(feature))
      .addTo(grupoMarcadores);
  });

  grupoMarcadores.addTo(map);
}

municipalitySelect.addEventListener("change", (event) => {
  const municipalityName = event.target.value;

  // Limpia el select de departamentos
  departmentSelect.value = "";

  // Quita los puntos del departamento seleccionado
  removePointsFromMap();

  // Carga los puntos del municipio seleccionado
  fetch(wfsURL_CasosViolencia)
    .then((response) => response.json())
    .then((data) => {
      const features = data.features;
      const selectedFeatures = features.filter(
        (item) => item.properties.municipio === municipalityName
      );

      addPointsToMap(selectedFeatures);
    });
});

//-----------------------------------------------------------------------------------------

// Funtion to clear
function clearResult() {
  document.getElementById("search-value").value = "";
  removePointsFromMap();
}

// Función Search - Codigo Caso
const searchInput = document.getElementById("search-value");
const search = document.getElementById("search");

const searchProductor = (caso) => {
  return fetch(wfsURL_CasosViolencia)
    .then((res) => res.json())
    .then((data) => {
      return data.features.find(
        ({ properties }) => (properties.id_capo = caso)
      );
    });
};

search.addEventListener("click", async () => {
  const geoJSONLayer = L.geoJSON(await searchProductor(searchInput.value), {
    style: EstiloCasos,
    onEachFeature: accioncasos,
  }).addTo(map);

  map.fitBounds(geoJSONLayer.getBounds());
});
