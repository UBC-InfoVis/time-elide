<script>
  import { onMount } from "svelte";
  import UIkit from "uikit";
  import { dataSourceUrl } from "./stores";

  // export let dataSourceUrl;

  let dataSamples = [
    { url: "data/sleepcycle_data_subset.csv", title: "Sleep cycles" },
    { url: "data/ocupado_NEST_Fridays_18_24.csv", title: "Building occupancy" },
    { url: "data/bakery_15min.csv", title: "Sales at a bakery" },
    { url: "data/us_gdp_sliced_data.csv", title: "U.S. Recessions and Recoveries" },
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

  <!-- <button on:click={() => (dataSourceUrl = "data/us_gdp_sliced_data.csv")}> -->

  <div class="uk-grid-divider uk-grid-large" uk-grid>
    <div class="uk-width-2-5">
      <h3>Or select a sample dataset</h3>
      <div class="uk-flex uk-flex-column">
        {#each dataSamples as dataSample }
          <div class="data-sample">
            <span class="uk-icon" uk-icon="database"></span> <button
              on:click={() => dataSourceUrl.set(dataSample.url)}
              class="uk-button uk-button-link uk-margin-auto-right"
              >{dataSample.title}</button
            >
          </div>
        {/each}

        
        <!--
        <button
          on:click={() => dataSourceUrl.set("data/ocupado_NEST_Fridays_18_24.csv")}
          class="uk-button uk-button-link uk-margin-auto-right"
          >Building occupancy</button
        >
         <button class="uk-button uk-button-link uk-margin-auto-right"
          >Running pace</button
        >
        <button
          on:click={() => dataSourceUrl.set("data/bakery_15min.csv")}
          class="uk-button uk-button-link uk-margin-auto-right"
          >Sales at a bakery</button
        >
        <button 
          on:click={() => dataSourceUrl.set("data/us_gdp_sliced_data.csv")}
          class="uk-button uk-button-link uk-margin-auto-right"
          >U.S. Recessions and Recoveries</button
        >-->
      </div>
    </div>
    <!--<hr class="uk-divider-vertical uk-margin-small-left uk-margin-small-right" />-->
    <div class="uk-width-3-5">
      <h3>Required CSV format</h3>
      <div>
        <span>YYYY-MM-DD HH:MM:SS</span>
        <span># Numeric</span>
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
  h3 {
    font-size: 1.2rem;
  }
  .uk-table {
    font-size: .75rem;
    font-family: "Lucida Console", Monaco, monospace;
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