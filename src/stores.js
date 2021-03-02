import { writable } from "svelte/store";

// export const dataSlicingSelectorDisabled = writable(true);
// export const visTypeSelectorDisabled = writable(true);

export const fullData = writable([]);
export const slicedData = writable([]);
/*
export const store = writable({
  foo: true,
  bar: true
})
*/
