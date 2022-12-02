<script>
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
  var data = [30, 144, 168, 281, 303, 365];
	var data1 = d3.csv("./data/unafford_housing2011_2015.csv");
  var data2 = d3.csv("./data/unafford_housing2015_2015.csv");
  var land_data = d3.csv("./data/landmarks.csv");

  console.log(data1);

	let el;

	onMount(() => {
		d3.select(el)
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

<div bind:this={el} class="chart"></div>