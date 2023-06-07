<script>
	import { onMount } from "svelte";
	import * as d3 from "d3";
	import * as mapboxgl from "mapbox-gl";
	// import * as colorbrewer from "colorbrewer";

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

	onMount(async () => {
		// load census tracts for seattle -> strip census tract id column for filter
		const seattle_census = await d3.csv("/data/censustracts_2010.csv");
		const seattle_tracts = seattle_census.map(function (d) {
			return d.GEOID10;
		});

		// load 2011-2015 housing dataset -> apply filter to get seattle specific rows
		const hous1 = await d3.csv("/data/unafford_housing2011_2015.csv");
		const filtered_hous1 = hous1.filter(function (d, i) {
			return seattle_tracts.indexOf(d.CensusTract) >= 0;
		});

		console.log(filtered_hous1["0"].CensusTract);

		// load 2015-2019 housing dataset -> apply filter to get seattle specific rows
		const hous2 = await d3.csv("/data/unafford_housing2015_2019.csv");
		const filtered_hous2 = hous2.filter(function (d, i) {
			return seattle_tracts.indexOf(d.CensusTract) >= 0;
		});

		// load seattle landmark designation dataset
		const landmarks = await d3.csv("/data/landmarks.csv");

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
		const data = await d3.json("/data/censustracts_2010.geojson");
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

		for(let i = 0; i < data.features.length; i++) {
    	let tract = data.features[i].properties.GEOID10;
    	if(filtered_hous1.filter(obj => { return obj.CensusTract === tract || false })) {
      	data.features[i].properties.UH_TEMP = parseFloat(filtered_hous1.filter(obj => { return obj.CensusTract === tract})["0"].uh_unit_perc)
    	}
			else {
				data.features[i].properties.UH_TEMP = 0;
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

		const landmark_data = await d3.json("/data/landmarks.geojson")

		function project(d) {
			return map.project(new mapboxgl.LngLat(d[0], d[1]));
		}
			
		function render() {
			d3.selectAll(".circle")
				.attr("cx", function(d) {
					return project(d.geometry.coordinates).x;
				})
				.attr("cy", function(d) {
					return project(d.geometry.coordinates).y;
				});
		}

		// console.log(landmark_data.features["0"].geometry)

		
			let container = map.getCanvasContainer();

			var svg = d3
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

			render();
		

		
		map.on("viewreset", render);
    map.on("move", render);
    map.on("moveend", render);

		
	});
</script>

<div id="map" />

<style>
	#map {
		position: relative;
		width: 100%;
		height: 100%;
		z-index: 0;
		border-right: 1px black solid;
	}
</style>
