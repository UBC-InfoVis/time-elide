<script>
  import * as d3 from "d3";
  import HeatStripes from "../HeatStripes.svelte";
  import Heatmap from "../Heatmap.svelte";
  import Sparkboxes from "../Sparkboxes.svelte";
  import SteppedAreaChart from "../SteppedAreaChart.svelte";
  import MultiSeriesLineChart from "../MultiSeriesLineChart.svelte";
  import BandedMultiSeriesLineChart from "../BandedMultiSeriesLineChart.svelte";
  import ChartSettings from "../ChartSettings.svelte";
  import { slicedData, selectedVisType } from "../stores/ui";
  import { globalSettings } from "../stores/chartConfig";

  let d3data;

  $: if ($slicedData) {
    if ($globalSettings.showMissingData.selectedValue) {
      d3data = $slicedData;
    } else {
      // Filter empty slices without any data points and update xPos attribute
      d3data = $slicedData.filter((d) => d.values.length > 0);
    }
    let xPos = 0;
    d3data.forEach((d, index) => {
      d.xPos = xPos;
      xPos += d.duration;
    });
  }
</script>

<div class="uk-padding-small">
  {#if $selectedVisType}
    <div class="vis-container">
      <h3>{$selectedVisType.title}</h3>
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
      {:else if $selectedVisType.key === "bandedMultiSeriesLineChart"}
        <BandedMultiSeriesLineChart data={d3data} />
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
