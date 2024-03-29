const layersObj = {
  key: "layers",
  type: "multi-select",
  options: ["min-max", "quartiles", "average", "median"],
  default: ["min-max", "quartiles", "average"],
  selectedValue: ["min-max", "quartiles", "average"],
};

const layersObjSparkboxes = {
  key: "layers",
  type: "multi-select",
  options: ["raw data", "min-max", "quartiles", "average", "median"],
  default: ["raw data", "min-max", "quartiles", "average"],
  selectedValue: ["raw data", "min-max", "quartiles", "median"],
};

const colourSchemeObj = {
  key: "colourScheme",
  type: "select",
  default: "lines",
  options: ["lines", "boxes"],
  selectedValue: "lines",
};

const normalizeSliceWidthsObj = {
  key: "normalizeSliceWidths",
  type: "boolean",
  default: false,
  selectedValue: null,
};

const showGridLinesObj = {
  key: "showGridLines",
  type: "boolean",
  default: false,
  selectedValue: null,
};

const lineOpacityObj = {
  key: "lineOpacity",
  type: "number",
  default: 0.3,
  range: [0.1, 1.0],
  selectedValue: 0.3,
};

const xScaleModeObj = {
  key: "xScaleMode",
  type: "select",
  options: ["normalized duration", "absolute duration", "absolute time"],
  default: "absolute time",
  selectedValue: "absolute time",
};

const binsObj = {
  key: "bins",
  type: "number",
  default: 10,
  range: [2, 100],
  selectedValue: 10,
};

const aggregationObj = {
  key: "aggregation",
  type: "select",
  default: "average",
  options: ["average", "median", "min", "max"], // (none) ?
  selectedValue: "average",
};

export const chartSpecificSettingsObj = {
  sparkboxes: {
    layers: layersObjSparkboxes,
    colourScheme: colourSchemeObj,
    normalizeSliceWidths: normalizeSliceWidthsObj,
    showGridLines: showGridLinesObj,
  },
  multiSeriesLineChart: {
    lineOpacity: lineOpacityObj,
    xScaleMode: xScaleModeObj,
  },
  bandedMultiSeriesLineChart: {
    layers: layersObj,
    colourScheme: colourSchemeObj,
    xScaleMode: xScaleModeObj,
    bins: binsObj,
  },
  steppedAreaChart: {
    normalizeSliceWidths: normalizeSliceWidthsObj,
    aggregation: aggregationObj,
    showGridLines: showGridLinesObj,
  },
  heatStripes: {
    normalizeSliceWidths: normalizeSliceWidthsObj,
    aggregation: aggregationObj,
  },
  heatmap: {
    aggregation: aggregationObj,
    bins: binsObj,
    xScaleMode: xScaleModeObj,
  },
};

export const globalSettingsObj = {
  width: {
    key: "width",
    type: "number",
    default: 0, // set in App.svelte based on window size
    range: [400, 1200],
    selectedValue: 0, // set in App.svelte based on window size
  },
  height: {
    key: "height",
    type: "number",
    default: 400,
    range: [150, 1200],
    selectedValue: 400,
  },
  showMissingData: {
    key: "showMissingData",
    type: "boolean",
    default: true,
    selectedValue: true,
  },
  showTooltip: {
    key: "showTooltip",
    type: "boolean",
    default: true,
    selectedValue: true,
  },
  showTimeline: {
    key: "showTimeline",
    type: "boolean",
    default: true,
    selectedValue: true,
  },
};
