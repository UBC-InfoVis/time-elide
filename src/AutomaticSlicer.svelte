<script>
  import { onMount } from "svelte";
  import UIkit from "uikit";

  import dayjs from "dayjs";
  import duration from "dayjs/plugin/duration";
  import relativeTime from "dayjs/plugin/relativeTime";
  dayjs.extend(duration);
  dayjs.extend(relativeTime);

  import { processDataAutomatically } from "./AutomaticDataProcessor";
  import { loadedData } from "./stores";
  import AutomaticSlicingHistogram from "./AutomaticSlicingHistogram.svelte";

  let automaticSlicingStats;
  let showAutomaticSlicingDetails = false;
  let customDistanceThreshold;

  export let handleXClick;

  $: if ($loadedData) {
    processDataAutomatically($loadedData, customDistanceThreshold).then((result) => {
      if (!customDistanceThreshold) automaticSlicingStats = result;
    });
  }

  $: if (!customDistanceThreshold && automaticSlicingStats) {
    resetThreshold();
  }

  onMount(() => {
    UIkit.util.on('#automatic-slicing-modal', 'hide', function () {
      showAutomaticSlicingDetails = false;
    });
  });

  function resetThreshold() {
    customDistanceThreshold = automaticSlicingStats.threshold;
  }
  
</script>

<div class="sidebar-block-inner uk-padding-small">
  <div class="uk-flex">
    <div class="uk-flex-1">
      <h3>Detect periods automatically</h3>
      {#if automaticSlicingStats}
        <table class="uk-table">
          <caption>Number of total slices: {automaticSlicingStats.nTotalSlices}</caption>
          <tbody>
            <tr>
              <td>Median within-slice distance</td>
              <td
                >{dayjs
                  .duration(
                    automaticSlicingStats.medianWithinSliceDistance,
                    "seconds"
                  )
                  .humanize()}</td
              >
            </tr>
            <tr>
              <td>Median between-slice distance</td>
              <td
                >{dayjs
                  .duration(
                    automaticSlicingStats.medianBetweenSliceDistance,
                    "seconds"
                  )
                  .humanize()}</td
              >
            </tr>
          </tbody>
        </table>
        <div>
          <div class="uk-grid-small" uk-grid>
            <div class="uk-width-expand">
              <label class="uk-form-label">
                Threshold: 
                {dayjs
                  .duration(customDistanceThreshold, "seconds")
                  .humanize()}
              </label>
            </div>
            <div class="uk-width-auto">
              <input
                class="uk-range"
                type="range"
                min={automaticSlicingStats.threshold/2}
                max={automaticSlicingStats.threshold*2}
                bind:value={customDistanceThreshold}
              />
            </div>
            <div class="uk-width-auto">
              <button
                class="uk-button uk-button-xsmall btn btn-secondary"
                on:click={resetThreshold}
              >Reset</button>
            </div>
          </div>
        </div>
        <a 
          class="uk-text-small link-secondary"
          on:click={() => showAutomaticSlicingDetails = true }
          href="#automatic-slicing-modal" 
          uk-toggle
        >See details</a>
      {/if}
    </div>
    <div>
      <button
        uk-tooltip="Back to slicing methods"
        type="button"
        uk-close
        on:click={handleXClick}
      />
    </div>
  </div>
</div>

<div id="automatic-slicing-modal" uk-modal>
  <div class="uk-modal-dialog uk-modal-body">
    <h4 class="uk-modal-title">Determine slices based on timestamps</h4>
    {#if showAutomaticSlicingDetails}
      <AutomaticSlicingHistogram data={automaticSlicingStats.distances} />
    {/if}
  </div>
</div>


<style>
  .uk-table td,
  .uk-table th {
    padding: 3px;
    font-size: 0.85rem;
  }
  .uk-table caption {
    font-size: 0.8rem;
  }
  h4 {
    font-size: 1.3rem;
  }
</style>
