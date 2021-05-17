<script>
  import VisThumbnail from "./VisThumbnail.svelte";
  import {
    validSlicingSelection,
    slicedData,
    selectedVisType,
    pageWidth,
  } from "../../stores/ui";
  import { visTypes } from "../../default_values/constants";
  // Recommend vis type when data source changes
  export let recommendVis = true;

  // Automatically select sparkboxes or 2d heatmap based on the number of slices
  $: if (validSlicingSelection && recommendVis && $slicedData.length > 0) {
    if ($pageWidth / $slicedData.length > 20) {
      selectedVisType.set(visTypes.filter((d) => d.key == "sparkboxes")[0]);
    } else {
      selectedVisType.set(visTypes.filter((d) => d.key == "heatmap")[0]);
    }
    recommendVis = false;
  }

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
