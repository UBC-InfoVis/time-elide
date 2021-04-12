<script>
  // import "../node_modules/uikit/dist/css/uikit.min.css";

  import DataSlicingSelector from "./DataSlicingSelector.svelte";
  import VisTypeSelector from "./VisTypeSelector.svelte";
  import GlobalChartSettings from "./GlobalChartSettings.svelte";
  import { validSlicingSelection } from "./stores";
  // Define page visibility status
  export let dataSlicingSelectorDisabled = true;
  export let visTypeSelectorDisabled = true;

</script>

<div id="sidebar" class="uk-padding-small">
  <div class="uk-margin-medium-bottom">
    <img alt="Non-contiguous time series" id="logo" src="images/logo.png" />
  </div>

  <DataSlicingSelector disabled={dataSlicingSelectorDisabled} />
  <VisTypeSelector />
  <GlobalChartSettings />
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

  @media only screen and (min-width: 1280px) {
    /* while testing only!! fix the input element css!! */
    #sidebar {
      width: 30vw;
    }
  }
</style>
