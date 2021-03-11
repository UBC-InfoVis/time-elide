<script>
  import * as d3 from "d3";
  import ColorHeatmap from "./ColorHeatmap.svelte";
  import Sparkboxes from "./Sparkboxes.svelte";
  import SteppedAreaChart from "./SteppedAreaChart.svelte";
  import { onMount } from "svelte";
  import { slicedData, dataSourceUrl } from "./stores";

  export let showDataSourcePage = false;

  let d3data;

  $: if ($slicedData) {
    d3data = $slicedData;
    console.log("d3data: ", d3data);
  }
</script>

<div class="uk-padding-small">
  <div class="uk-margin-bottom">
    <button
      on:click={() => {
        showDataSourcePage = true;
        dataSourceUrl.set(undefined);
        slicedData.set([]);
      }}
    >
      Other data source
    </button>
  </div>

  <div>
    Colour heatmap
    <ColorHeatmap data={d3data} />
  </div>

  <div>
    Sparkboxes
    <Sparkboxes data={d3data} />
  </div>

  <div>
    Stepped area chart
    <SteppedAreaChart data={d3data} />
  </div>
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
