<script>
  import DataSlicingSelector from "./DataSlicingSelector.svelte";
  import VisTypeSelector from "./VisTypeSelector.svelte";
  import { 
    dataSource, 
    dataSlicingSelection, 
    slicedData,
    loadedData,
    validSlicingSelection, 
    selectedVisType
  } from "./stores";

  // Define page visibility status
  export let dataSlicingSelectorDisabled = true;
  export let showDataSourcePage = true;

  // Recommend vis only when data source changes
  let recommendVis = true;

  function resetDataSource() {
    showDataSourcePage = true;
    dataSource.set(undefined);
    selectedVisType.set(undefined);
    validSlicingSelection.set(false);
    dataSlicingSelection.set("none selected");
    slicedData.set([]);
    loadedData.set([]);
    recommendVis = true;
  }

  let dataSourceName;
  $: if ($dataSource && $dataSource.sample) {
    dataSourceName = $dataSource.url.split("/").pop();
  } else if ($dataSource && $dataSource.name) {
    dataSourceName = $dataSource.name;
  } else {
    dataSourceName = undefined;
  }

</script>

<div id="sidebar" class="uk-padding-small" uk-height-viewport>
  <div>
    <img 
      alt="Non-contiguous time series"
      id="logo"
      src="images/logo.png"
      on:click={() => resetDataSource()}
    />
  </div>

  <div class="sidebar-block">
    <h2>Select data</h2>
    {#if dataSourceName}
      <span class="data-source-name">{dataSourceName}</span>
        <button
        class="uk-button uk-button-link"
        on:click={() => resetDataSource()}
      >
        Other data source
      </button>
      <div class="variable-of-interest-container">
        Title for variable of interest: 
        <input 
          class="uk-input variable-of-interest-input" 
          type="text"
          placeholder="Value"
          bind:value="{$dataSource.variable}"
        />
      </div>
    {:else}
      <span class="uk-text-meta">No data selected</span>
    {/if}
  </div>

  <DataSlicingSelector disabled={dataSlicingSelectorDisabled} />
  <VisTypeSelector bind:recommendVis />
</div>

<style>
  #sidebar {
    background: #ebf2f7;
    width: 40vw;
    /*height: 100%;*/
    overflow-y: scroll;
  }

  #sidebar :global(h2) {
    font-size: 1rem;
    color: #9fa2b4;
    margin: 0 0 10px 0;
  }
  #sidebar :global(h3) {
    font-size: 1.2rem;
    margin-bottom: 0;
  }

  :global(.sidebar-block) {
    margin-top: 0;
    margin-bottom: 30px;
  }

  :global(.sidebar-block-inner) {
    border-radius: 8px;
    border: 1px solid #dfe0eb;
    background: #fff;
  }

  #logo {
    width: 100%;
    max-width: 210px;
    display: block;
    margin-bottom: 30px;
  }

  .data-source-name {
    font-weight: 500;
    font-size: 0.875rem;
    border-right: 1px solid #ddd;
    margin-right: 10px;
    padding-right: 15px;
  }

  .uk-button-link {
    text-transform: none;
  }

  .variable-of-interest-container {
    font-size: .7rem;
    line-height: 20px;
  }
  .variable-of-interest-input {
    font-size: .7rem;
    height: 20px;
    width: 120px;
    margin-left: 5px;
    padding-left: 4px;
    padding-right: 4px;
    color: #333;
    background: #ebf2f7;
    border: 1px solid #d8d5d5;
  }

  @media only screen and (min-width: 1280px) {
    /* while testing only!! fix the input element css!! */
    #sidebar {
      width: 30vw;
    }
  }
</style>
