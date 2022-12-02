<script>
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	//var data = [30, 144, 168, 281, 303, 365];
	let data1
  //var data2 = d3.csv("./data/unafford_housing2015_2015.csv");
  //var land_data = d3.csv("./data/landmarks.csv");

	console.log();

	let map;

	function map2(data) {
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
	}

	onMount(async () => {
		data1 = await d3.csv("./unafford_housing2011_2015.csv");
		const test = data1.filter(d=> d["County Name"] === "King")
		console.log(test)
			
			
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