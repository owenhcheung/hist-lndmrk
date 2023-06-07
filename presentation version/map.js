// function to turn long form census tract ids -> short form (unused)
// returns a string
function long_to_short(id) {
  // store in a temp variable
  let temp = id;
  // strip state + county -> turn into int to divide by 100 to get decimals
  let temp2 = parseInt(temp.slice(5, id.length)) / 100;
  // turn back into string to strip any leading 0s
  return temp2.toString().replace(/^0+/, "");
}

async function testfunc() {

  // load census tracts for seattle -> strip census tract id column for filter
  const seattle_census = await d3.csv("data/censustracts_2010.csv");
  const seattle_tracts = seattle_census.map(function (d) {
    return d.GEOID10;
  });

  // load 2011-2015 housing dataset -> apply filter to get seattle specific rows
  const hous1 = await d3.csv("data/unafford_housing2011_2015.csv");
  const filtered_hous1 = hous1.filter(function (d, i) {
    return seattle_tracts.indexOf(d.CensusTract) >= 0;
  });

  console.log(filtered_hous1["0"].CensusTract);

  // load 2015-2019 housing dataset -> apply filter to get seattle specific rows
  const hous2 = await d3.csv("data/unafford_housing2015_2019.csv");
  const filtered_hous2 = hous2.filter(function (d, i) {
    return seattle_tracts.indexOf(d.CensusTract) >= 0;
  });

  // load seattle landmark designation dataset
  const landmarks = await d3.csv("data/landmarks.csv");

  //let width = document.getElementById('map').clientWidth;
  //let height = document.getElementById('map').clientHeight;

  // public access token for mapbox
  mapboxgl.accessToken = "pk.eyJ1Ijoib2NoZXVuIiwiYSI6ImNrb2Rnc2JnaDAxdG0ydXFmMWhhZDhoeHUifQ.GROwzRtlaKfeL-48Xbgsyg";
  let map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/dark-v9", //mapbox theme
    center: [-122.3321, 47.6062], // center on seattle
    zoom: 11.5, // zoom level
    maxZoom: 14,
    minZoom: 11,
    maxPitch: 65,
  });

  d3.selectAll(".mapboxgl-canvas")
    .style("opacity", 1)
    .style("position", "absolute")
    .style("left", 0)

  // https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson test file
  // /data/censustracts_2010.geojson
  const data = await d3.json("data/censustracts_2010.geojson");
  // console.log("seattle tracts", data);

  //let projection = d3.geoMercator().fitSize([width, height], data);
  //let path = d3.geoPath().projection(projection);

  const unitperc1 = filtered_hous1.map(function (d) {
    return d.uh_unit_perc;
  });

  let min = parseFloat(d3.min(unitperc1));
  let max = parseFloat(d3.max(unitperc1));
  console.log(min);
  console.log(max);

  /*
  console.log(unitperc1)
  console.log(d3.max(unitperc1))

  const colors = d3.scaleLinear([d3.min(unitperc1), d3.max(unitperc1)], ["#fff", "#002837"],d3.interpolateLab);
    .domain([d3.min(unitperc1), d3.max(unitperc1)])
    .range(["#fff", "#002837"])
    .interpolate(d3.interpolateLab);
  
  svg
    .selectAll("path")
    .data(data.features)
    .enter()
    .append("path")
    .attr("d", path)
    .style("fill", d => colors(d.properties.GEOID10))
    .style("stroke-width", "0.5")
    .style("stroke", "#575757");
  */

  for (let i = 0; i < data.features.length; i++) {
    let tract = data.features[i].properties.GEOID10;
    if (filtered_hous1.filter(obj => {
        return obj.CensusTract === tract || false
      })) {
      data.features[i].properties.UH_TEMP = parseFloat(filtered_hous1.filter(obj => {
        return obj.CensusTract === tract
      })["0"].uh_unit_perc)
    } else {
      data.features[i].properties.UH_TEMP = 0;
    }
  }

  for (let i = 0; i < data.features.length; i++) {
    let tract = data.features[i].properties.GEOID10;
    if (filtered_hous2.filter(obj => {
        return obj.CensusTract === tract || false
      })) {
      data.features[i].properties.UH_TEMP2 = parseFloat(filtered_hous2.filter(obj => {
        return obj.CensusTract === tract
      })["0"].uh_unit_perc)
    } else {
      data.features[i].properties.UH_TEMP2 = 0;
    }
  }
  console.log(data);

  // start mapbox
  map.addSource("data", {
    type: "geojson",
    data: data,
  });

  //console.log(temp_data)
  //console.log(temp_data.properties.GEOID10)
  // filtered_hous1.filter(obj => { return obj.CensusTract === data.CensusTract || "0" })["0"].uh_unit_perc

  // draw choropleth layer
  map.addLayer({
    id: "data",
    type: "fill",
    source: "data",
    layout: {},
    paint: {
      "fill-color": {
        property: "UH_TEMP",
        stops: [
          [0, "#fff"],
          [50, "#002837"],
          [100, "#000"],
        ],
      },
      "fill-opacity": 0.5,
    },
  });

  // draw outline of census tracts
  map.addLayer({
    id: "outline",
    type: "line",
    source: "data",
    layout: {},
    paint: {
      "line-color": "#fff",
      "line-width": 0.5,
    },
  });

  map.addSource("data2", {
    type: "geojson",
    data: data,
  });

  map.addLayer({
    id: "data2",
    type: "fill",
    source: "data2",
    layout: {},
    paint: {
      "fill-color": {
        property: "UH_TEMP2",
        stops: [
          [0, "#fff"],
          [50, "#002837"],
          [100, "#000"],
        ],
      },
      "fill-opacity": 0.5,
    },
  });

  // draw outline of census tracts
  map.addLayer({
    id: "outline2",
    type: "line",
    source: "data2",
    layout: {},
    paint: {
      "line-color": "#fff",
      "line-width": 0.5,
    },
  });

  // legend
  let legend_svg = d3.select("#leg")

  let defs = legend_svg.append("defs");

  let linearGradient = defs.append("linearGradient")
    .attr("id", "linear-gradient");

  let colorScale = d3.scaleLinear()
    .range(["#fff", "#002837", "#000"]);

  linearGradient.selectAll("stop")
    .data(colorScale.range())
    .enter().append("stop")
    .attr("offset", function (d, i) {
      return i / (colorScale.range().length - 1);
    })
    .attr("stop-color", function (d) {
      return d;
    });

  legend_svg.append("rect")
    .attr("width", 300)
    .attr("height", 30)
    .attr("transform", "translate(5,0)")
    .style("stroke", "#fff")
    .style("stroke-width", "1.5")
    .style("fill", "url(#linear-gradient)");

  var x = d3.scaleLinear()
    .domain([0, 100])
    .range([0, 300]);

  var axis = d3.axisBottom(x);

  d3.select("#leg")
    .attr("class", "axis")
    .attr("width", 300)
    .attr("height", 40)
    .append("g")
    .attr("id", "g-runoff")
    .attr("transform", "translate(5,30)")
    .call(axis);

  const landmark_data = await d3.json("data/landmarks.geojson")
  //const filtered_ld = landmark_data.filter(function(d){ return (parseInt(d.features.properties.EFF_DATE.slice(0, 4)) > 2000) })

  console.log(parseInt(landmark_data.features[0].properties.EFF_DATE.slice(0, 4)))

  let filtered_ld = [];
  count = 0
  for (let i = 0; i < landmark_data.features.length; i++) {
    //console.log(landmark_data.features[i].properties.EFF_DATE)
    if (landmark_data.features[i].properties.EFF_DATE != null) {
      let date = landmark_data.features[i].properties.EFF_DATE.slice(0, 4);
      if (parseInt(date) >= 2000) {
        filtered_ld[count] = landmark_data.features[i];
        count += 1;
      }
    }
  }
  console.log(landmark_data)
  console.log(filtered_ld)

  function project(d) {
    return map.project(new mapboxgl.LngLat(d[0], d[1]));
  }

  function render() {
    d3.selectAll(".circle")
      .attr("cx", function (d) {
        return project(d.geometry.coordinates).x;
      })
      .attr("cy", function (d) {
        return project(d.geometry.coordinates).y;
      });
  }

  // console.log(landmark_data.features["0"].geometry)

  let container = map.getCanvasContainer();

  let svg = d3
    .select(container)
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .style("position", "absolute")
    .style("left", "0")
    .style("z-index", 20);

  console.log(container)

  svg
    .selectAll("circle")
    .data(landmark_data.features)
    .enter()
    .append("circle")
    .attr("class", "circle")
    .attr("r", 5)
    .style("opacity", 0.7)
    .style("fill", "#fff");

  let svg2 = d3
    .select(container)
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .style("position", "absolute")
    .style("left", "0")
    .style("z-index", 22);

  svg2
    .selectAll("circle")
    .data(filtered_ld)
    .enter()
    .append("circle")
    .attr("class", "circle")
    .attr("r", 5)
    .style("opacity", 0.7)
    .style("fill", "#fff");

  render();

  map.on('idle', () => {
    let testval = document.querySelector('input[name="dates"]:checked').value;
    console.log(testval);
    if (testval == "2011") {
      map.setLayoutProperty("data2", 'visibility', 'none');
      map.setLayoutProperty("data", 'visibility', 'visible');
    } else if (testval == "2015") {
      map.setLayoutProperty("data", 'visibility', 'none');
      map.setLayoutProperty("data2", 'visibility', 'visible');
    }

    let testval2 = document.querySelector('input[name="loc"]:checked').value;
    if (testval2 == "showall") {
      svg.style("display", "block");
      svg2.style("display", "none");
    } else if (testval2 == "filtered") {
      svg.style("display", "none");
      svg2.style("display", "block");
    }
  });

  map.on("viewreset", render);
  map.on("move", render);
  map.on("moveend", render);
};


testfunc();