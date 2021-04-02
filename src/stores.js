import { writable } from "svelte/store";

export const dataSourceUrl = writable(undefined);
export const fullData = writable([]);
export const slicedData = writable([]);

export const tooltipData = writable(undefined);

export const selectedVisType = writable(undefined);

export const containerWidth = writable(1000);
export const containerHeight = writable(400);

export const dataSlicingSelection = writable("none selected");
export const haveTimeSlice = writable(true);
