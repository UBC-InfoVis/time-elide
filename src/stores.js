import { writable } from "svelte/store";

export const dataSourceUrl = writable(undefined);
export const fullData = writable([]);
export const slicedData = writable([]);

export const containerWidth = writable(1000);
export const containerHeight = writable(400);
