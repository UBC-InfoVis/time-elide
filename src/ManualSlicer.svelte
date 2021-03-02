<script>
  import { processData } from "./DataProcessor";

  let data = []; // Will contain chosen time slice filters

  function addRow() {
    data = [...data, newRow];
    resetNewRow();
  }

  function deleteRow(rowToBeDeleted) {
    data = data.filter((row) => row != rowToBeDeleted);
  }

  function resetNewRow() {
    newRow = { day: 1, startTime: "", endTime: "" };
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
  $: if (data.length > 0) {
    console.log(data);
    processData(data);
  } else {
    console.log("return visualization of all slices");
  }
</script>

<div>
  <br />
  <br />
  <br />
  <p>Select periods manually</p>
  <table>
    <tr>
      <th>Day</th>
      <th>From</th>
      <th>To</th>
    </tr>

    {#each data as row}
      <tr>
        <td>
          <select bind:value={row.day}>
            {#each dayOptions as option}
              <option value={option.id} selected={row.day === option.id}
                >{option.value}</option
              >
            {/each}
          </select>
        </td>
        <td
          ><input
            type="time"
            step="300"
            bind:value={row.startTime}
            required
          /></td
        >
        <td
          ><input
            type="time"
            step="300"
            bind:value={row.endTime}
            required
          /></td
        >
        <button on:click={() => deleteRow(row)}> X </button>
      </tr>
    {/each}

    <tr class="new">
      <td>
        <select bind:value={newRow.day}>
          {#each dayOptions as option}
            <option value={option.id} selected={newRow.day === option.id}
              >{option.value}</option
            >
          {/each}
        </select>
      </td>
      <td
        ><input
          type="time"
          step="300"
          bind:value={newRow.startTime}
          required
        /></td
      >
      <td
        ><input
          type="time"
          step="300"
          bind:value={newRow.endTime}
          required
        /></td
      >
      <button on:click={addRow} disabled={!newRowValid}>Add</button>
    </tr>
  </table>
</div>

<style>
  /* table {
    table-layout: fixed;
    width: 100%;
  } */
</style>
