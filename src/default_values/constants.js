export const MANUAL_SELECT = "manual select";
export const DETECT_PERIODS = "detect periods";
export const NONE_SELECTED = "none selected";

export const RENDERING_ERROR =
  "Error: Visualization cannot be rendered with this slicing method.";

export const visTypes = [
  {
    key: "sparkboxes",
    component: "Sparkboxes",
    title: "Sparkboxes",
    desc: "High level of detail: raw data is shown in the foreground and aggregated data for each slice is shown in the background.",
  },
  {
    key: "steppedAreaChart",
    component: "SteppedAreaChart",
    title: "Stepped area chart",
    desc: "Low level of detail: The values of each slice are aggregated (average, min, max, or median) and shown as a stepped area curve.",
  },
  {
    key: "heatmap",
    title: "2D Heatmap",
    desc: "Medium level of detail: each column corresponds to one slice and the within-slice data is aggregated to bins and shown as coloured rectangles.",
  },
  {
    key: "heatStripes",
    title: "Heat stripes",
    desc: "Low level of detail: The values of each slice are aggregated (average, min, max, or median) and shown as vertical coloured stripes.",
  },
  {
    key: "multiSeriesLineChart",
    title: "Multi-series line chart",
    desc: "High degree of detail: Slices are superimposed to allow easier comparisons of within-slice patterns when the order of the slices is not important.",
  },
  {
    key: "bandedMultiSeriesLineChart",
    title: "Banded multi-series line chart",
    desc: "Low level of detail: All values are aggregated across slices to help you recognize general within-slice trends.",
  },
];
