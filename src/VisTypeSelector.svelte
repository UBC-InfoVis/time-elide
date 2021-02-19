<script>
  import VisThumbnail from "./VisThumbnail.svelte";

  export let disabled;
</script>

<div class:disabled class="container">
  <h3>Select visualization type</h3>
  <VisThumbnail />
  <VisThumbnail />
  <VisThumbnail />
  <VisThumbnail />
</div>

<style>
  .container {
    display: flex;
    flex-wrap: wrap;
  }
</style>
