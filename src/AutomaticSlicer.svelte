<script>
  import dayjs from 'dayjs';
  import duration from 'dayjs/plugin/duration';
  import relativeTime from 'dayjs/plugin/relativeTime';
  dayjs.extend(duration);
  dayjs.extend(relativeTime);

  import { processDataAutomatically } from "./AutomaticDataProcessor";
  import { dataSourceUrl } from "./stores";

  let automaticSlicingStats;

  $: processDataAutomatically($dataSourceUrl).then((result) => {
      automaticSlicingStats = result;
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
              <td>{dayjs.duration(automaticSlicingStats.threshold, "seconds").humanize()}</td>
            </tr>
            <tr>
              <td>Median within-slice distance</td>
              <td>{dayjs.duration(automaticSlicingStats.medianWithinSliceDistance, "seconds").humanize()}</td>
            </tr>
            <tr>
              <td>Median between-slice distance</td>
              <td>{dayjs.duration(automaticSlicingStats.medianBetweenSliceDistance, "seconds").humanize()}</td>
            </tr>
          </tbody>
        </table>
        Number of total slices: {automaticSlicingStats.nTotalSlices}
      {/if}
    </div>
    <div><button uk-tooltip="Back to slicing methods" type="button" uk-close></button></div>
  </div>
</div>

<style>
  .uk-table td, .uk-table th {
    padding: 3px;
    font-size: .85rem;
  }
  .uk-table caption {
    font-size: .8rem;
  }
</style>
