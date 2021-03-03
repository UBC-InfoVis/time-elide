<script>
  // import "../node_modules/uikit/dist/css/uikit.min.css";

  import DataSlicingSelector from "./DataSlicingSelector.svelte";
  import VisTypeSelector from "./VisTypeSelector.svelte";

  // Define page visibility status
  export let dataSlicingSelectorDisabled = true;
  export let visTypeSelectorDisabled = true;
</script>

<div id="sidebar">
  <div>Time Slices App</div>

  <DataSlicingSelector disabled={dataSlicingSelectorDisabled} />
  <VisTypeSelector disabled={visTypeSelectorDisabled} />
</div>

<style>
  #sidebar {
    background: #ebf2f7;
    width: 40vw;
    height: 100vh;
  }

  @media only screen and (min-width: 1280px) {
    /* while testing only!! fix the input element css!! */
    #sidebar {
      width: 25vw;
    }
  }
</style>
