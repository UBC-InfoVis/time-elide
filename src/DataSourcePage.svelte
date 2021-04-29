<script>
  import * as d3 from "d3";
  import Dropzone from "svelte-file-dropzone";
  import { onMount } from "svelte";
  import UIkit from "uikit";
  import { dataSource, loading } from "./stores";

  let activeDragover = false;

  let dataSamples = [
    { url: "data/ocupado_NEST_Fridays_18_24.csv", title: "Building occupancy (sliced)", variable: "Occupancy" },
    { url: "data/ocupado_NEST_2018_30min.csv", title: "Building occupancy (all)", variable: "Occupancy" },
    { url: "data/bakery_15min.csv", title: "Sales at a bakery", variable: "# Transactions" },
    { url: "data/soccer_player.csv", title: "Soccer player", variable: "# Actions" },
    { url: "data/bike_rides.csv", title: "Bike rides", variable: "Speed (km/hour)" },
  ];

  function loadFile(e) {
    loading.set(true);
    const files = e.detail.acceptedFiles;
    if (files.length > 0) {
      const reader = new FileReader();
      reader.readAsText(files[0]);
      reader.onload = () => {
        const binaryStr = reader.result;
        dataSource.set({
          sample: false, 
          content: d3.csvParse(binaryStr),
          name: files[0].name
        });
        loading.set(false);
      };
    }
  }

</script>

<div class="uk-padding-small">
  <h2>Load data</h2>

  <Dropzone 
    multiple={false}
    on:drop={loadFile}
    on:dragenter={() => activeDragover = true} 
    on:dragleave={() => activeDragover = false} 
    accept=".csv"
    disableDefaultStyles={true}
    containerClasses="uk-dropzone uk-placeholder uk-text-center {activeDragover ? 'uk-dragover' : ''}" 
  >
    <span uk-icon="icon: cloud-upload" class="uk-margin-small-right" />
    <span class="uk-text-middle">Drag CSV file here or</span>
    <div uk-form-custom>
      <span class="uk-link">select one</span>
    </div>
  </Dropzone>

  <!-- <button on:click={() => (dataSourceUrl = "data/us_gdp_sliced_data.csv")}> -->

  <div class="uk-grid-divider uk-grid-large" uk-grid>
    <div class="uk-width-2-5">
      <h3>Or select a sample dataset</h3>
      <div class="uk-flex uk-flex-column">
        {#each dataSamples as dataSample }
          <div class="data-sample">
            <span class="uk-icon" uk-icon="database"></span> <button
              on:click={() => dataSource.set({sample: true, url: dataSample.url, variable: dataSample.variable })}
              class="uk-button uk-button-link uk-margin-auto-right"
              >{dataSample.title}</button
            >
          </div>
        {/each}
      </div>
    </div>
    <!--<hr class="uk-divider-vertical uk-margin-small-left uk-margin-small-right" />-->
    <div class="uk-width-3-5">
      <h3>Required CSV format</h3>
      <div>
        <div class="csv-format">
          <span class="csv-format-time">YYYY-MM-DD HH:MM:SS</span>
          <span># Numeric</span>
        </div>
        <table class="uk-table uk-width-medium">
          <thead>
            <tr>
              <th>timestamp</th>
              <th>value</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>2021-07-12 22:50</td><td>59</td></tr>
            <tr><td>2021-07-12 22:45</td><td>66</td></tr>
            <tr><td>2021-07-12 22:40</td><td>66</td></tr>
            <tr><td>2021-07-12 22:35</td><td>69</td></tr>
            <tr><td>2021-07-12 22:30</td><td>75</td></tr>
            <tr><td>2021-07-12 22:25</td><td>78</td></tr>
            <tr><td>2021-07-12 22:20</td><td>77</td></tr>
            <tr><td>2021-07-12 22:15</td><td>87</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>

<style>
  :global(.uk-dropzone.uk-placeholder) {
    margin-bottom: 40px;
    padding: 50px;
  }
  h3 {
    font-size: 1.2rem;
  }
  .csv-format {
    font-size: .8rem;
    font-style: italic;
    font-family: "Lucida Console", Monaco, monospace;
  }
  .csv-format-time {
    width: 214px;
    display: inline-block;
  }
  .uk-table {
    font-size: .75rem;
    font-family: "Lucida Console", Monaco, monospace;
    margin-top: 8px;
  }
  .uk-table td, .uk-table th {
    padding: 4px 4px;
    border: 1px solid #e5e5e5;
    text-transform: none;
  }
  .uk-table th {
    font-size: .7rem;
    background: #F7F7FA;
    color: #676767;
  }
  .data-sample .uk-icon {
    margin-right: 5px;
    color: #7993ad;
  }
  .data-sample .uk-button-link {
    text-transform: none;
    padding: 8px 0;
  }
</style>