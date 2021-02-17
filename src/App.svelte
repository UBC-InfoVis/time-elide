<script>
  import 'uikit/dist/css/uikit.min.css';
  import 'uikit/dist/js/uikit.min.js';

  import { csv } from 'd3-fetch';
  
  import Sidebar from './Sidebar.svelte';
  import DataSourcePage from './DataSourcePage.svelte';
  import VisPage from './VisPage.svelte';
  
  //import { dataSlicingSelectorDisabled, visTypeSelectorDisabled } from './stores.js';
  
  // Define page visibility status
  let showDataSourcePage = true
  
  let rawData;
  let dataSourceUrl;

  const sidebarConfig = {
    dataSlicingSelectorDisabled: true,
    visTypeSelectorDisabled: true
  }

  // When data source url changes
  $: if (dataSourceUrl) {
    loadData(dataSourceUrl);
  }

  $: if (showDataSourcePage) {
    sidebarConfig.dataSlicingSelectorDisabled = true;
    sidebarConfig.visTypeSelectorDisabled = true;
  }

  function loadData() {
    csv(dataSourceUrl).then(data => {
      data.forEach(d => {
        d.value = +d.value;
      });
      rawData = data;

      console.log(rawData);

      showDataSourcePage = false;
      
      sidebarConfig.dataSlicingSelectorDisabled = false;
    });
  }

  export let name;
</script>

<main>
    
  <div uk-height-viewport class="uk-grid-match uk-grid-collapse" uk-grid>
    <Sidebar {...sidebarConfig} />
    {#if showDataSourcePage}
      <DataSourcePage bind:dataSourceUrl />
    {:else}
      <VisPage bind:showDataSourcePage />
    {/if}
  </div>
  
</main>
