<script>
  import "uikit/dist/css/uikit.min.css";
  import UIkit from "uikit";
  import Icons from "uikit/dist/js/uikit-icons";

  import {
    loadedData,
    dataSource,
    pageWidth,
    showWelcomeModal,
    loading,
  } from "./stores/ui";
  import { globalSettings } from "./stores/chartConfig";
  import { loadData } from "./DataLoader";

  import Sidebar from "./Sidebar.svelte";
  import DataSourcePage from "./pages/DataSourcePage.svelte";
  import VisPage from "./pages/VisPage.svelte";
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
    dataSlicingSelectorDisabled: true,
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

  let pagePadding = 30;
  $: globalSettings.update((prev) => ({
    ...prev,
    width: {
      ...prev.width,
      default: $pageWidth - pagePadding,
      selectedValue: $pageWidth - pagePadding,
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

<div id="about-footer">
  <a href="http://www.cs.ubc.ca/group/infovis">UBC InfoVis</a> |
  <a href="https://github.com/UBC-InfoVis/time-slices">
    <span uk-icon="icon: github; ratio:0.8" />
    Open Source
  </a>
</div>

<span
  class="open-welcome-modal"
  uk-icon="icon: question; ratio: 1"
  uk-tooltip="title: TimeElide introduction; pos: left; offset: -3"
  on:click={() => showWelcomeModal.set(true)}
/>
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
  #about-footer {
    position: fixed;
    bottom: 10px;
    left: 10px;
    font-size: 0.85rem;
    font-weight: 500;
    color: #ccc;
  }
  #about-footer a {
    color: #8ca5b7;
    margin-right: 5px;
    margin-left: 5px;
  }
  .spinner-bg {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.7);
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
