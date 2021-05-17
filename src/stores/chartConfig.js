import { writable } from "svelte/store";

import {
  chartSpecificSettingsObj,
  globalSettingsObj,
} from "../default_values/chartSettings";

export const chartSpecificSettings = writable(chartSpecificSettingsObj);
export const globalSettings = writable(globalSettingsObj);
