<script>
  import * as d3 from "d3";
  import HeatStripes from "./HeatStripes.svelte";
  import Heatmap from "./Heatmap.svelte";
  import Sparkboxes from "./Sparkboxes.svelte";
  import SteppedAreaChart from "./SteppedAreaChart.svelte";
  import MultiSeriesLineChart from "./MultiSeriesLineChart.svelte";
  import ConfidenceBandLineChart from "./ConfidenceBandLineChart.svelte";
  import ChartSettings from "./ChartSettings.svelte";
  import { onMount } from "svelte";
  import { slicedData, dataSourceUrl, selectedVisType } from "./stores";

  let d3data;

  $: if ($slicedData) {
    d3data = $slicedData;
    console.log("d3data: ", d3data);
  }
</script>

<div class="uk-padding-small">
  {#if $selectedVisType}
    <div class="vis-container">
      <!-- I don't know why this is not working 
      {#if $selectedVisType}
        <svelte:component this={$selectedVisType.component} data={d3data} />
      {/if}
      -->
      <ChartSettings />

      {#if $selectedVisType.key === "sparkboxes"}
        <Sparkboxes data={d3data} />
      {:else if $selectedVisType.key === "steppedAreaChart"}
        <SteppedAreaChart data={d3data} />
      {:else if $selectedVisType.key === "heatStripes"}
        <HeatStripes data={d3data} />
      {:else if $selectedVisType.key === "heatmap"}
        <Heatmap data={d3data} />
      {:else if $selectedVisType.key === "multiSeriesLineChart"}
        <MultiSeriesLineChart data={d3data} />
      {:else if $selectedVisType.key === "confidenceBandLineChart"}
        <ConfidenceBandLineChart data={d3data} />
      {/if}
    </div>
  {:else}
    <img src="images/data_source_arrow.png" alt="Choose slicing method next" />
  {/if}
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
