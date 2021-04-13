<script>
  import "uikit/dist/css/uikit.min.css";
  import UIkit from "uikit";
  import Icons from "uikit/dist/js/uikit-icons";

  import { csv } from "d3-fetch";
  import { fullData, dataSourceUrl, pageWidth, globalSettings } from "./stores";

  import Sidebar from "./Sidebar.svelte";
  import DataSourcePage from "./DataSourcePage.svelte";
  import VisPage from "./VisPage.svelte";
  import Tooltip from "./Tooltip.svelte";

  // Loads the Icon plugin
  UIkit.use(Icons);

  // Define page visibility status
  let showDataSourcePage = true;

  let rawData;

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
    dataSourceUrl.set(undefined);
  }

  function loadData() {
    csv($dataSourceUrl).then((data) => {
      data.forEach((d) => {
        d.value = +d.value;
      });
      rawData = data;
      fullData.set(rawData);
      showDataSourcePage = false;
      sidebarConfig.dataSlicingSelectorDisabled = false;
    });
  }

  let pagePadding = 30;
  $: globalSettings.update((prev) => ({
      ...prev,
      width: {
        ...prev.width,
        default: $pageWidth-pagePadding,
        selectedValue: $pageWidth-pagePadding
      },
    }));
</script>

<main>
  <div class="uk-flex uk-flex-row">
    <div>
      <Sidebar {...sidebarConfig} bind:showDataSourcePage />
    </div>
    <div class="uk-width-expand" bind:clientWidth={$pageWidth}>
      {#if showDataSourcePage}
        <DataSourcePage bind:$dataSourceUrl />
      {:else}
        <VisPage />
      {/if}
    </div>
  </div>
</main>

<Tooltip />
