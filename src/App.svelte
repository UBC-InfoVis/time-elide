<script>
  import "uikit/dist/css/uikit.min.css";
  import UIkit from "uikit";
  import Icons from "uikit/dist/js/uikit-icons";

  import { csv } from "d3-fetch";
  import { 
    loadedData,
    dataSource, 
    pageWidth, 
    globalSettings, 
    showWelcomeModal,
    loading 
  } from "./stores";
  import { loadData } from "./DataLoader";

  import Sidebar from "./Sidebar.svelte";
  import DataSourcePage from "./DataSourcePage.svelte";
  import VisPage from "./VisPage.svelte";
  import Tooltip from "./Tooltip.svelte";
  import WelcomeModal from "./WelcomeModal.svelte";
  import LoadingSpinner from "./LoadingSpinner.svelte";

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
    loadData($dataSource);
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

{#if $loading}
  <div class="spinner-bg">
    <div class="spinner-wrapper">
      <LoadingSpinner />
    </div>
  </div>
{/if}

<style>
  .spinner-bg {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255,255,255,0.7);
  }
  .spinner-wrapper {
    position: absolute;
    top: 50%;
    left: 50%;
    margin-left: -25px;
    margin-top: -25px;
  }
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