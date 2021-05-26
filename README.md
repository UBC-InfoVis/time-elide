<img src="./public/images/logo.png" height=50/>

### A tool for visualizing non-contiguous time series slices

TimeElide is a visual analysis tool developed by the UBC InfoViz Group for visualizing non-contiguous time series slices (i.e. time intervals that contain a sequence of time-value pairs but are not adjacent to each other). It is domain-agnostic and supports CSV upload, but also includes six sample datasets as part of its demo. Underpinning the tool is a visual encoding design space that includes a new sparkbox technique for visualizing fine and coarse grained temporal structures. For more information, you can read our paper (here).

## Demo

[Online demo](http://www.cs.ubc.ca/group/infovis/time-elide/)

## CSV Upload format

| timestamp        | value |
| ---------------- | ----- |
| 2021-07-12 22:30 | 59    |
| 2021-07-12 22:35 | 52    |
| 2021-07-12 22:40 | 63    |
| 2021-07-13 08:00 | 61    |
| 2021-07-13 08:05 | 56    |
| 2021-07-13 08:10 | 51    |
| 2021-07-13 08:15 | 59    |

Note that the timestamp must be in `YYYY-MM-DD HH:MM:SS` format and the value must be a number. The data does not need to be sampled at a regular interval (e.g. every 5 mins in the above example).

## Development

```
git clone https://github.com/UBC-InfoVis/time-slices.git
npm i
npm run dev
```

## License

??
