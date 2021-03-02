<script>
  import * as d3 from "d3";
  import { onMount } from "svelte";
  import { slicedData } from "./stores";

  var data = [30, 86, 168, 281, 303, 365]; // dummy data from a svelte d3 example

  export let showDataSourcePage = false;

  let el;

  onMount(() => {
    d3.select(el)
      .selectAll("div")
      .data(data)
      .enter()
      .append("div")
      .style("width", function (d) {
        return d + "px";
      })
      .text(function (d) {
        return d;
      });
  });
</script>

<div class="uk-padding-small">
  <div bind:this={el} class="chart" />
  <button on:click={() => (showDataSourcePage = true)}>
    <p>{$slicedData.length}</p>

    Other data source
  </button>
</div>

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
