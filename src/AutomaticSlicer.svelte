<script>
  import { onMount } from "svelte";
  import UIkit from "uikit";

  import dayjs from "dayjs";
  import duration from "dayjs/plugin/duration";
  import relativeTime from "dayjs/plugin/relativeTime";
  dayjs.extend(duration);
  dayjs.extend(relativeTime);

  import { processDataAutomatically } from "./AutomaticDataProcessor";
  import { dataSourceUrl } from "./stores";
  import AutomaticSlicingHistogram from "./AutomaticSlicingHistogram.svelte";

  let automaticSlicingStats;
  let showAutomaticSlicingDetails = false;

  export let handleXClick;

  $: processDataAutomatically($dataSourceUrl).then((result) => {
    automaticSlicingStats = result;
  });

  onMount(() => {
    UIkit.util.on('#automatic-slicing-modal', 'hide', function () {
      showAutomaticSlicingDetails = false;
    });
  });
  
</script>

<div class="sidebar-block-inner uk-padding-small">
  <div class="uk-flex">
    <div class="uk-flex-1">
      <h3>Detect periods automatically</h3>
      {#if automaticSlicingStats}
        <table class="uk-table">
          <caption>Based on 10,000 data points</caption>
          <tbody>
            <tr>
              <td>Threshold</td>
              <td
                >{dayjs
                  .duration(automaticSlicingStats.threshold, "seconds")
                  .humanize()}</td
              >
            </tr>
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
        <a 
          on:click={() => showAutomaticSlicingDetails = true }
          href="#automatic-slicing-modal" 
          uk-toggle
        >See details</a>
        <p>Number of total slices: {automaticSlicingStats.nTotalSlices}</p>
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
