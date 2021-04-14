<script>
  import DataSlicingSelector from "./DataSlicingSelector.svelte";
  import VisTypeSelector from "./VisTypeSelector.svelte";
  import { 
    dataSourceUrl, 
    dataSlicingSelection, 
    slicedData, 
    validSlicingSelection, 
    selectedVisType
  } from "./stores";

  // Define page visibility status
  export let dataSlicingSelectorDisabled = true;
  export let showDataSourcePage = true;

</script>

<div id="sidebar" class="uk-padding-small">
  <div class="uk-margin-medium-bottom">
    <img alt="Non-contiguous time series" id="logo" src="images/logo.png" />
  </div>

  <div class="sidebar-block">
    <h2>Select data</h2>
    {#if $dataSourceUrl}
      <span class="data-source-name">{$dataSourceUrl.split("/").pop()}</span>
        <button
        class="uk-button uk-button-link"
        on:click={() => {
          showDataSourcePage = true;
          dataSourceUrl.set(undefined);
          selectedVisType.set(undefined);
          validSlicingSelection.set(false);
          dataSlicingSelection.set("none selected");
          slicedData.set([]);
        }}
      >
        Other data source
      </button>
    {:else}
      <span class="uk-text-meta">No data selected</span>
    {/if}
  </div>

  <DataSlicingSelector disabled={dataSlicingSelectorDisabled} />
  <VisTypeSelector />
</div>

<style>
  #sidebar {
    background: #ebf2f7;
    width: 40vw;
    height: 100vh;
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
    margin-bottom: 25px;
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

  @media only screen and (min-width: 1280px) {
    /* while testing only!! fix the input element css!! */
    #sidebar {
      width: 30vw;
    }
  }
</style>
