<script>
  // import "../node_modules/uikit/dist/css/uikit.min.css";
  import ManualSlicer from "./ManualSlicer.svelte";

  export let disabled;
  const MANUAL_SELECT = "manual select";
  const DETECT_PERIODS = "detect periods";
  const NONE_SELECTED = "none selected";
  let slicerMode = NONE_SELECTED;

  const handleManualSelectClick = () => {
    console.log("clicked MANUAL SELECT");
    slicerMode = MANUAL_SELECT;
  };

  const handleDetectClick = () => {
    console.log("detect period automatically");
    slicerMode = DETECT_PERIODS;
  };
</script>

<div class:disabled>
  <p>Select slicing method</p>
  {#if slicerMode === NONE_SELECTED}
    <button
      on:click={handleManualSelectClick}
      class="uk-button uk-button-default uk-button-large option"
      {disabled}
      >Option 1
      <h3>Select periods manually</h3>
    </button>
    <button
      on:click={handleDetectClick}
      class="uk-button uk-button-default uk-button-large option"
      {disabled}
      >Option 2
      <h3>Detect periods automatically</h3>
    </button>
  {:else if slicerMode === MANUAL_SELECT}
    <!-- Slicer component -->
    <ManualSlicer />
  {:else}
    <div>
      <p>Automatic slicer goes here</p>
    </div>
  {/if}
</div>

<style>
  .disabled {
    opacity: 0.6;
  }

  .option {
    border-radius: 8px;
    border: 1px solid #dfe0eb;
    padding: 11px 25px;
    color: #ffffff;
    height: 134px;
    width: 80%;
    text-align: left;
  }
</style>
