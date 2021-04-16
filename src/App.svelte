<script>
  import "uikit/dist/css/uikit.min.css";
  import UIkit from "uikit";
  import Icons from "uikit/dist/js/uikit-icons";

  import { csv } from "d3-fetch";
  import { fullData, dataSource, pageWidth, globalSettings, showWelcomeModal } from "./stores";

  import Sidebar from "./Sidebar.svelte";
  import DataSourcePage from "./DataSourcePage.svelte";
  import VisPage from "./VisPage.svelte";
  import Tooltip from "./Tooltip.svelte";
  import WelcomeModal from "./WelcomeModal.svelte";

  export let name;

  // Loads the Icon plugin
  UIkit.use(Icons);

  // Define page visibility status
  let showDataSourcePage = true;

  let rawData;

  const sidebarConfig = {
    dataSlicingSelectorDisabled: true
  };

  // When data source url changes
  $: if ($dataSource) {
    showDataSourcePage = false;
    sidebarConfig.dataSlicingSelectorDisabled = false;
    // loadData($dataSourceUrl);
  }

  $: if (showDataSourcePage) {
    sidebarConfig.dataSlicingSelectorDisabled = true;
    dataSource.set(undefined);
  }

  // function loadData() {
  //   csv($dataSourceUrl).then((data) => {
  //     data.forEach((d) => {
  //       d.value = +d.value;
  //     });
  //     rawData = data;
  //     fullData.set(rawData);
  //     showDataSourcePage = false;
  //     sidebarConfig.dataSlicingSelectorDisabled = false;
  //   });
  // }

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
        <DataSourcePage />
      {:else}
        <VisPage />
      {/if}
    </div>
  </div>
</main>

<span
  class="open-welcome-modal" 
  uk-icon="icon: question; ratio: 1"
  uk-tooltip="title: TimeElide introduction; pos: left; offset: -3"
  on:click={() => showWelcomeModal.set(true)}
></span>
<WelcomeModal />

<Tooltip />

<style>
  .open-welcome-modal {
    position: absolute;
    top: 0;
    right: 0;
    padding: 10px;
    color: #888;
    cursor: pointer;
    transition: color 150ms ease-in-out;
  }
  .open-welcome-modal:hover {
    color: #1e87f0;
  }
</style>