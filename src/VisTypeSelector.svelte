<script>
  import VisThumbnail from "./VisThumbnail.svelte";
  import { validSlicingSelection } from "./stores";

  let visTypes = [
    { key: "sparkboxes", component: "Sparkboxes", title: "Sparkboxes" },
    { key: "steppedAreaChart", component: "SteppedAreaChart", title: "Stepped area chart" },
    { key: "dotHeatmap", title: "2D Heatmap" },
    { key: "colourHeatmap", title: "Heat stripes" },
    { key: "multiSeriesLineChart", title: "Multi-series line chart" },
    { key: "confidenceBandLineChart", title: "Confidence-band line chart" },
  ];

  $: disabled = !$validSlicingSelection;
</script>

<div class="sidebar-block uk-height-medium" class:disabled>
  <h2 class="uk-width-1-1">Select visualization type</h2>
  <div>
    <div class="uk-child-width-1-2 uk-grid-small" uk-grid>
      {#each visTypes as visType}
        <VisThumbnail bind:visType />
      {/each}
    </div>
  </div>
</div>

<style>
  .uk-height-medium {
    height: 275px;
  }
  .disabled {
    opacity: 0.4;
  }
</style>
