<script>
  import VisThumbnail from "./VisThumbnail.svelte";
  import {
    validSlicingSelection,
    slicedData,
    selectedVisType,
    pageWidth,
  } from "../../stores/ui";

  // Recommend vis type when data source changes
  export let recommendVis = true;

  const visTypes = [
    {
      key: "sparkboxes",
      component: "Sparkboxes",
      title: "Sparkboxes",
      desc: "High level of detail: raw data is shown in the foreground and aggregated data for each slice is shown in the background.",
    },
    {
      key: "steppedAreaChart",
      component: "SteppedAreaChart",
      title: "Stepped area chart",
      desc: "Low level of detail: The values of each slice are aggregated (average, min, max, or median) and shown as a stepped area curve.",
    },
    {
      key: "heatmap",
      title: "2D Heatmap",
      desc: "Medium level of detail: each column corresponds to one slice and the within-slice data is aggregated to bins and shown as coloured rectangles.",
    },
    {
      key: "heatStripes",
      title: "Heat stripes",
      desc: "Low level of detail: The values of each slice are aggregated (average, min, max, or median) and shown as vertical coloured stripes.",
    },
    {
      key: "multiSeriesLineChart",
      title: "Multi-series line chart",
      desc: "High degree of detail: Slices are superimposed to allow easier comparisons of within-slice patterns when the order of the slices is not important.",
    },
    {
      key: "bandedMultiSeriesLineChart",
      title: "Banded multi-series line chart",
      desc: "Low level of detail: All values are aggregated across slices to help you recognize general within-slice trends.",
    },
  ];

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
