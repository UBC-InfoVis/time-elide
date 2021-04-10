const layersObj = {
  key: "layers",
  type: "multi-select",
  options: ["min-max", "iqr", "avg", "median"],
  default: ["min-max", "iqr", "avg"],
  selectedValue: ["min-max", "iqr", "avg"],
};

const showTimelineObj = {
  key: "showTimeline",
  type: "boolean",
  default: true,
  selectedValue: true,
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
  default: "normalized duration",
  selectedValue: "normalized duration",
};

const binsObj = {
  key: "bins",
  type: "number",
  default: 10,
  range: [1, 100],
  selectedValue: 10,
};

const aggregationObj = {
  key: "aggregation",
  type: "select",
  default: "avg",
  options: ["avg", "median", "min", "max"], // (none) ?
  selectedValue: "avg",
};

export const chartSpecificSettingsObj = {
  sparkboxes: {
    layers: layersObj,
    showTimeline: showTimelineObj,
    colourScheme: colourSchemeObj,
    normalizeSliceWidths: normalizeSliceWidthsObj,
  },
  multiSeriesLineChart: {
    showTimeline: showTimelineObj,
    lineOpacity: lineOpacityObj,
    xScaleMode: xScaleModeObj,
  },
  confidenceBandLineChart: {
    layers: layersObj,
    colourScheme: colourSchemeObj,
    xScaleMode: xScaleModeObj,
    bins: binsObj,
  },
  steppedAreaChart: {
    showTimeline: showTimelineObj,
    normalizeSliceWidths: normalizeSliceWidthsObj,
    aggregation: aggregationObj,
  },
  colourHeatmap: {
    showTimeline: showTimelineObj,
    normalizeSliceWidths: normalizeSliceWidthsObj,
    aggregation: aggregationObj,
  },
  dotHeatmap: {
    showTimeline: showTimelineObj,
    aggregation: aggregationObj,
    bins: binsObj,
  },
};

export const globalSettingsObj = {
  width: {
    key: "width",
    type: "number",
    default: 700,
    range: [500, 1200],
    selectedValue: 700,
  },
  height: {
    key: "height",
    type: "number",
    default: 500,
    range: [500, 1200],
    selectedValue: 500,
  },
  showTooltip: {
    key: "showTooltip",
    type: "boolean",
    default: true,
    selectedValue: null,
  },
};
