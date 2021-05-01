<script>
  import { processData } from "./ManualDataProcessor";
  import { loadedData, validSlicingSelection } from "./stores";

  export let handleXClick;
  let selectedSlices = []; // Will contain chosen time slice filters

  function addRow() {
    selectedSlices = [...selectedSlices, newRow];
    resetNewRow();
  }

  function deleteRow(rowToBeDeleted) {
    selectedSlices = selectedSlices.filter((row) => row != rowToBeDeleted);
  }

  function resetNewRow() {
    newRow = { day: 1, startTime: "08:00", endTime: "18:00" };
  }

  let dayOptions = [
    { id: "1", value: "Monday" },
    { id: "2", value: "Tuesday" },
    { id: "3", value: "Wednesday" },
    { id: "4", value: "Thursday" },
    { id: "5", value: "Friday" },
    { id: "6", value: "Saturday" },
    { id: "0", value: "Sunday" },
  ];

  let newRow = {};
  resetNewRow();

  // Disable add-button if input fields are empty
  $: newRowValid = newRow.startTime && newRow.endTime;
  $: if (selectedSlices.length > 0) {
    processData(selectedSlices, $loadedData);
    validSlicingSelection.set(true);
  } else {
    validSlicingSelection.set(false);
  }

  // Reset slice selection when data source changes
  $: if (!$loadedData) {
    selectedSlices = [];
  }
</script>

<div class="sidebar-block-inner uk-padding-small">
  <div class="uk-flex">
    <div class="uk-flex-1"><h3>Select periods manually</h3></div>
    <div>
      <button
        uk-tooltip="Back to slicing methods"
        type="button"
        uk-close
        on:click={() => {
          selectedSlices = [];
          handleXClick();
        }}
      />
    </div>
  </div>
  <table class="uk-table">
    <tr>
      <th>Day</th>
      <th>From</th>
      <th>To</th>
      <th />
    </tr>

    {#each selectedSlices as row}
      <tr>
        <td>
          <select class="uk-select uk-form-small" bind:value={row.day}>
            {#each dayOptions as option}
              <option value={option.id} selected={row.day === option.id}
                >{option.value}</option
              >
            {/each}
          </select>
        </td>
        <td
          ><input
            class="uk-input uk-form-small"
            type="time"
            step="300"
            bind:value={row.startTime}
            required
          /></td
        >
        <td
          ><input
            class="uk-input uk-form-small"
            type="time"
            step="300"
            bind:value={row.endTime}
            required
          /></td
        >
        <td>
          <button
            class="uk-button uk-button-link"
            on:click={() => deleteRow(row)}
            ><span uk-icon="minus-circle" /></button
          >
        </td>
      </tr>
    {/each}

    <tr class="new">
      <td>
        <select class="uk-select uk-form-small" bind:value={newRow.day}>
          {#each dayOptions as option}
            <option value={option.id} selected={newRow.day === option.id}
              >{option.value}</option
            >
          {/each}
        </select>
      </td>
      <td
        ><input
          class="uk-input uk-form-small"
          type="time"
          step="300"
          bind:value={newRow.startTime}
          required
        /></td
      >
      <td
        ><input
          class="uk-input uk-form-small"
          type="time"
          step="300"
          bind:value={newRow.endTime}
          required
        /></td
      >
      <td
        ><button
          class="uk-button uk-button-small btn"
          on:click={addRow}
          disabled={!newRowValid}>Add</button
        ></td
      >
    </tr>
  </table>
</div>

<style>
  .uk-table td,
  .uk-table th {
    padding: 3px;
  }
</style>
