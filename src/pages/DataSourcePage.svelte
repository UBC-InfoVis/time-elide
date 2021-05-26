<script>
  import * as d3 from "d3";
  import Dropzone from "svelte-file-dropzone";
  import UIkit from "uikit";
  import { dataSource, loading } from "../stores/ui";

  let activeDragover = false;

  let dataSamples = [
    {
      url: "data/ocupado_lecture_building.csv",
      title: "Occupancy (Building 1, all)",
      variable: "Occupancy",
      datasetType: "manual",
    },
    {
      url: "data/ocupado_community_building.csv",
      title: "Occupancy (Building 2, all)",
      variable: "Occupancy",
      datasetType: "manual",
    },
    {
      url: "data/ocupado_community_building_fri_18_24.csv",
      title: "Occupancy (Building 2, sliced)",
      variable: "Occupancy",
      datasetType: "automatic",
    },
    {
      url: "data/bakery_15min.csv",
      title: "Sales at a bakery",
      variable: "# Transactions",
      datasetType: "manual",
    },
    {
      url: "data/soccer_player.csv",
      title: "Soccer player",
      variable: "# Actions",
      datasetType: "automatic",
    },
    {
      url: "data/bike_rides.csv",
      title: "Bike rides",
      variable: "Speed (km/hour)",
      datasetType: "automatic",
    },
  ];

  let csvData, csvFileName;
  let timestampColumn, valueColumn;

  function loadFile(e) {
    loading.set(true);
    const files = e.detail.acceptedFiles;
    if (files.length > 0) {
      const reader = new FileReader();
      reader.readAsText(files[0]);
      reader.onload = () => {
        UIkit.modal("#assign-columns-modal").show();
        const binaryStr = reader.result;
        csvData = d3.csvParse(binaryStr);
        csvFileName = files[0].name;
        loading.set(false);

        // Try to match columns from CSV file with 'timestamp' and 'value' attributes we need
        csvData.columns.forEach((columnName) => {
          if (columnName.toLowerCase() == "timestamp") {
            timestampColumn = columnName;
          } else if (!timestampColumn && columnName.toLowerCase() == "date") {
            timestampColumn = columnName;
          } else if (columnName.toLowerCase() == "value") {
            valueColumn = columnName;
          }
        });

        if (!valueColumn && timestampColumn) {
          valueColumn = csvData.columns.filter((d) => {
            return d.toLowerCase() != "timestamp" && d.toLowerCase() != "date";
          })[0];
        } else if (valueColumn && !timestampColumn) {
          timestampColumn = csvData.columns.filter(
            (d) => d.toLowerCase() != "value"
          )[0];
        } else if (!valueColumn && !timestampColumn) {
          timestampColumn = csvData.columns[0];
          valueColumn = csvData.columns[0];
        }
      };
    }
  }

  function setDataSource() {
    dataSource.set({
      sample: false,
      content: csvData,
      name: csvFileName,
      timestampCol: timestampColumn,
      valueCol: valueColumn,
      variable: valueColumn,
    });
  }
</script>

<div class="uk-padding-small">
  <h2>Load data</h2>

  <Dropzone
    multiple={false}
    on:drop={loadFile}
    on:dragenter={() => (activeDragover = true)}
    on:dragleave={() => (activeDragover = false)}
    accept=".csv"
    disableDefaultStyles={true}
    containerClasses="uk-dropzone uk-placeholder uk-text-center {activeDragover
      ? 'uk-dragover'
      : ''}"
  >
    <span uk-icon="icon: cloud-upload" class="uk-margin-small-right" />
    <span class="uk-text-middle">Drag CSV file here or</span>
    <div uk-form-custom>
      <span class="uk-link">select one</span>
    </div>
  </Dropzone>

  <div class="uk-grid-divider uk-grid-large" uk-grid>
    <div class="uk-width-2-5">
      <h3>Or select a sample dataset</h3>
      <div class="uk-flex uk-flex-column">
        {#each dataSamples as dataSample}
          <div class="data-sample">
            <span class="uk-icon" uk-icon="database" />
            <button
              on:click={() =>
                dataSource.set({
                  sample: true,
                  url: dataSample.url,
                  variable: dataSample.variable,
                  datasetType: dataSample.datasetType,
                })}
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

<div id="assign-columns-modal" uk-modal="bg-close:false;">
  <div class="uk-modal-dialog">
    <div class="uk-modal-body">
      <h3>Assign column names</h3>
      {#if csvData}
        <table class="uk-table uk-table-divider">
          <thead>
            <tr>
              <th>Variable</th>
              <th>CSV file</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>timestamp</td>
              <td>
                <select
                  class="uk-select uk-form-small"
                  bind:value={timestampColumn}
                >
                  {#each csvData.columns as option}
                    <option value={option} selected={timestampColumn === option}
                      >{option}</option
                    >
                  {/each}
                </select>
              </td>
            </tr>
            <tr>
              <td>value</td>
              <td>
                <select
                  class="uk-select uk-form-small"
                  bind:value={valueColumn}
                >
                  {#each csvData.columns as option}
                    <option value={option} selected={valueColumn === option}
                      >{option}</option
                    >
                  {/each}
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      {/if}
    </div>
    <div class="uk-modal-footer uk-text-right">
      <button class="uk-button uk-button-default uk-modal-close" type="button"
        >Cancel</button
      >
      <button
        class="uk-button uk-button-primary"
        type="button"
        on:click={() => setDataSource()}>Save</button
      >
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
    font-size: 0.8rem;
    font-style: italic;
    font-family: "Lucida Console", Monaco, monospace;
  }
  .csv-format-time {
    width: 214px;
    display: inline-block;
  }
  .uk-table {
    font-size: 0.75rem;
    font-family: "Lucida Console", Monaco, monospace;
    margin-top: 8px;
  }
  .uk-table td,
  .uk-table th {
    padding: 4px 4px;
    border: 1px solid #e5e5e5;
    text-transform: none;
  }
  .uk-table th {
    font-size: 0.7rem;
    background: #f7f7fa;
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
  #assign-columns-modal .uk-table {
    font-size: 0.875rem;
  }
  #assign-columns-modal .uk-table th {
    font-size: 0.875rem;
  }
</style>
