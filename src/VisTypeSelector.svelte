<script>
  import VisThumbnail from "./VisThumbnail.svelte";

  let visTypes = [
    { key: "sparkboxes", component: "Sparkboxes" },
    { key: "steppedAreaChart", component: "SteppedAreaChart" },
    { key: "confidenceBandLineChart" },
    { key: "multiSeriesLineChart" },
    { key: "colourHeatmap" },
    { key: "dotHeatmap" },
  ];

  export let disabled;
</script>

<div class="sidebar-block uk-height-medium" class:disabled>
  <h2 class="uk-width-1-1">Select visualization type</h2>
  <div>
    <div class="uk-child-width-1-2 uk-grid-small" uk-grid>
      {#each visTypes as visType}
        <VisThumbnail bind:visType {disabled} />
      {/each}
    </div>
  </div>
</div>

<style>
</style>
