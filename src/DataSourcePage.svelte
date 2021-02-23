<script>
  import { onMount } from "svelte";
  import UIkit from "uikit";
  import { processData } from "./DataProcessor.js";

  export let dataSourceUrl;

  let dataSamples = [
    { id: 1, url: "data/us_gdp_sliced_data.csv" },
    { id: 2, url: "data/us_gdp_sliced_data.csv" },
  ];

  onMount(() => {
    UIkit.upload(".js-upload", {
      url: "",
      multiple: false,

      beforeSend: function (environment) {
        console.log("beforeSend", arguments);

        // The environment object can still be modified here.
        // var {data, method, headers, xhr, responseType} = environment;
      },
      beforeAll: function () {
        console.log("beforeAll", arguments);
      },
      load: function () {
        console.log("load", arguments);
      },
      error: function () {
        console.log("error", arguments);
      },
      complete: function () {
        console.log("complete", arguments);
      },

      loadStart: function (e) {
        console.log("loadStart", arguments);

        bar.removeAttribute("hidden");
        bar.max = e.total;
        bar.value = e.loaded;
      },

      progress: function (e) {
        console.log("progress", arguments);

        bar.max = e.total;
        bar.value = e.loaded;
      },

      loadEnd: function (e) {
        console.log("loadEnd", arguments);

        bar.max = e.total;
        bar.value = e.loaded;
      },

      completeAll: function () {
        console.log("completeAll", arguments);

        setTimeout(function () {
          bar.setAttribute("hidden", "hidden");
        }, 1000);

        alert("Upload Completed");
      },
    });
  });
</script>

<div class="uk-padding-small">
  <h2>Load data</h2>

  <div class="js-upload uk-placeholder uk-text-center">
    <span uk-icon="icon: cloud-upload" />
    <span class="uk-text-middle">Drag CSV file here or</span>
    <div uk-form-custom>
      <input type="file" />
      <span class="uk-link">select one</span>
    </div>
  </div>

  <button on:click={processData}>process data</button>
  <button on:click={() => (dataSourceUrl = "data/us_gdp_sliced_data.csv")}>
    US GDP
  </button>
  <button on:click={() => (dataSourceUrl = "data/test.csv")}> test </button>
</div>

<div class="uk-flex uk-flex-row">
  <div class="uk-width-2-5">
    <p>Or select a sample dataset</p>
    <div class="uk-flex uk-flex-column">
      <button class="uk-button uk-button-link uk-margin-auto-right"
        >Sleep cycles</button
      >
      <button class="uk-button uk-button-link uk-margin-auto-right"
        >Building occupancy</button
      >
      <button class="uk-button uk-button-link uk-margin-auto-right"
        >Running pace</button
      >
      <button class="uk-button uk-button-link uk-margin-auto-right"
        >Sales at a bakery</button
      >
      <button class="uk-button uk-button-link uk-margin-auto-right"
        >U.S. Recessions and Recoveries</button
      >
    </div>
  </div>
  <hr class="uk-divider-vertical uk-margin-small-left uk-margin-small-right" />
  <div class="uk-width-2-5">
    <p>Required CSV format</p>
    <div>
      <span>YYYY-MM-DD HH:MM:SS</span>
      <span># Numeric</span>
      <table>table goes here</table>
    </div>
  </div>
</div>

<style>
</style>
