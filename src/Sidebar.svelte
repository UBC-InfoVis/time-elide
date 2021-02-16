<script>
  import DataSlicingSelector from './DataSlicingSelector.svelte';
  import VisTypeSelector from './VisTypeSelector.svelte';

  // Define page visibility status
  export let dataSlicingSelectorDisabled = true;
  export let visTypeSelectorDisabled = true;
  
</script>

<style>
  #sidebar {
    background: #ebf2f7;
    width: 380px;
  }
</style>

<div id="sidebar">
    
  <div>
    Time Slices App
  </div>

  <DataSlicingSelector disabled={dataSlicingSelectorDisabled} />
  <VisTypeSelector disabled={visTypeSelectorDisabled} />

</div>
