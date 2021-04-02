<script>
  import "uikit/dist/css/uikit.min.css";
  import UIkit from "uikit";
  import Icons from "uikit/dist/js/uikit-icons";

  import { csv } from "d3-fetch";
  import { fullData, dataSourceUrl } from "./stores";

  import Sidebar from "./Sidebar.svelte";
  import DataSourcePage from "./DataSourcePage.svelte";
  import VisPage from "./VisPage.svelte";
  import Tooltip from "./Tooltip.svelte";

  // loads the Icon plugin
  UIkit.use(Icons);

  // Define page visibility status
  let showDataSourcePage = true;

  let rawData;
  // let dataSourceUrl;

  const sidebarConfig = {
    dataSlicingSelectorDisabled: true,
    visTypeSelectorDisabled: true,
  };

  // When data source url changes
  $: if ($dataSourceUrl) {
    loadData($dataSourceUrl);
  }

  $: if (showDataSourcePage) {
    sidebarConfig.dataSlicingSelectorDisabled = true;
    sidebarConfig.visTypeSelectorDisabled = true;
    // dataSourceUrl = undefined;
    dataSourceUrl.set(undefined);
  }

  function loadData() {
    csv($dataSourceUrl).then((data) => {
      data.forEach((d) => {
        d.value = +d.value;
      });
      rawData = data;

      console.log(rawData);
      fullData.set(rawData);

      showDataSourcePage = false;

      sidebarConfig.dataSlicingSelectorDisabled = false;
      // sidebarConfig.visTypeSelectorDisabled = false;
    });
  }

  export let name;
</script>

<main>
  <div class="uk-flex uk-flex-row">
    <div>
      <Sidebar {...sidebarConfig} />
    </div>
    <div class="uk-width-expand">
      {#if showDataSourcePage}
        <DataSourcePage bind:$dataSourceUrl />
      {:else}
        <VisPage bind:showDataSourcePage />
      {/if}
    </div>
  </div>
</main>

<Tooltip />
