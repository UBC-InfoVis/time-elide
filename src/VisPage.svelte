<script>
  import * as d3 from "d3";
  import ColorHeatmap from "./ColorHeatmap.svelte";
  import Sparkboxes from "./Sparkboxes.svelte";
  import SteppedAreaChart from "./SteppedAreaChart.svelte";
  import { onMount } from "svelte";
  import { slicedData, dataSourceUrl, selectedVisType } from "./stores";

  export let showDataSourcePage = false;

  let d3data;

  $: if ($slicedData) {
    d3data = $slicedData;
    console.log("d3data: ", d3data);
  }
</script>

<div class="uk-padding-small">
  <div class="uk-margin-bottom">
    {#if $dataSourceUrl}
      <span class="data-source-name">{$dataSourceUrl.split('/').pop()}</span>
    {/if}
    <button class="uk-button uk-button-link"
      on:click={() => {
        showDataSourcePage = true;
        dataSourceUrl.set(undefined);
        selectedVisType.set(undefined);
        slicedData.set([]);
      }}
    >
      Other data source
    </button>
  </div>

  {#if $selectedVisType}
    <div class="vis-container">
      <!-- I don't know why this is not working 
      {#if $selectedVisType}
        <svelte:component this={$selectedVisType.component} data={d3data} />
      {/if}
      -->

      {#if $selectedVisType.key === 'sparkboxes'}
        <Sparkboxes data={d3data} />
      {:else if $selectedVisType.key === 'stepped-area-chart'}
        <SteppedAreaChart data={d3data} />
      {:else if $selectedVisType.key === 'colour-heatmap'}
        <ColorHeatmap data={d3data} />
      {/if}
    </div>
  {:else}
    <img src="images/data_source_arrow.png" alt="Choose slicing method next" />
  {/if}

</div>

<style>
  .data-source-name {
    font-weight: 500;
    font-size: .875rem;
    border-right: 1px solid #ddd;
    margin-right: 10px;
    padding-right: 15px;
  }
  .uk-button-link {
    text-transform: none;
  }
  .chart :global(div) {
    font: 10px sans-serif;
    background-color: steelblue;
    text-align: right;
    padding: 3px;
    margin: 1px;
    color: white;
  }
</style>
