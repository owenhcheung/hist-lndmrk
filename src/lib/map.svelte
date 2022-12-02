<script>
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
  var data = [30, 144, 168, 281, 303, 365];
	const data1 = d3.csv("/data/unafford_housing2011_2015.csv").then(function(cities) {
  const data2 = d3.csv("/data/unafford_housing2015_2019.csv");
  const land_data = d3.csv("/data/landmarks.csv");


  Promise.all([
    d3.csv("/data/unafford_housing2011_2015.csv"),
    d3.csv("/data/unafford_housing2015_2019.csv"),
  ]).then(function(loadData) {   
    var hous1 = loadData[0] //1
    var hous2 = loadData[1] //2
  });

  // filter for king county
  //let test = data1.filter(function(d){ return d.CountyName == "King" });

  //console.log(data1);


	let map;

	onMount(() => {
		d3.select(map)
			.selectAll("div")
			.data(data)
			.enter()
			.append("div")
			.style("width", function(d) {
				return d + "px";
			})
			.text(function(d) {
				return d;
			});
	});
</script>

<div bind:this={map} class="chart" />

<style>
  .chart :global(div) {
    font: 10px sans-serif;
    background-color: steelblue;
    text-align: right;
    padding: 3px;
    margin: 1px;
    color: white;
  }
</style>