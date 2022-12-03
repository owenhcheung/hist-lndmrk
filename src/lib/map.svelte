<script>
	import { onMount } from 'svelte';
	import * as d3 from 'd3';

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
		const seattle_tracts = seattle_census.map(function(d) { return d.GEOID10 })

		// load 2011-2015 housing dataset -> apply filter to get seattle specific rows
		const hous1 = await d3.csv("/data/unafford_housing2011_2015.csv");
    const filtered_hous1 = hous1.filter(function(d,i){ return seattle_tracts.indexOf(d.CensusTract) >= 0 })
    
		// load 2015-2019 housing dataset -> apply filter to get seattle specific rows
		const hous2 = await d3.csv("/data/unafford_housing2015_2019.csv");
		const filtered_hous2 = hous2.filter(function(d,i){ return seattle_tracts.indexOf(d.CensusTract) >= 0 })
		
		// load seattle landmark designation dataset
		const landmarks = await d3.csv("/data/landmarks.csv");
		
		let height = 800;
    let width = 500;

		let svg = d3.select("#map")
      .append("svg")
      	.attr("width", width)
      	.attr("height", height)
				.call(d3.zoom().on("zoom", function () {
    			svg.attr("transform", d3.zoomTransform(this))
  			}))
			.append("g");
			

		// https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson
		// /data/censustracts_2010.geojson
		d3.json('/data/censustracts_2010.geojson').then(function (data) {
      console.log('seattle tracts', data);

			let projection = d3.geoMercator().fitSize([width, height], data);
			let path = d3.geoPath().projection(projection);

			svg.selectAll('path')
  			.data(data.features)
  			.enter()
  			.append('path')
  			.attr('d', path)
  			.style("fill", "#0a0a0a")
  			.style("stroke-width", "0.5")
  			.style("stroke", "#575757")
		});

	});
</script>

<div id="map"></div>

<style>

</style>