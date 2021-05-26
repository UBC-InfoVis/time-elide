<img src="./public/images/logo.png" height=50/>

### A tool for visualizing non-contiguous time series slices

TimeElide is a visual analysis tool developed by the [UBC InfoVis Group](http://www.cs.ubc.ca/group/infovis/) for visualizing non-contiguous time series slices (i.e. time intervals that contain a sequence of time-value pairs but are not adjacent to each other). It is domain-agnostic and supports CSV upload, but also includes six sample datasets as part of its demo. Underpinning the tool is a visual encoding design space that includes a new sparkbox technique for visualizing fine and coarse grained temporal structures. For more information, you can read the preprint of our paper (here).

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

Copyright (c) 2021, [UBC InfoVis](http://www.cs.ubc.ca/group/infovis/) ([Michael Oppermann](http://michaeloppermann.com/), [Luce Liu](http://luceliu.com/), [Tamara Munzner](https://www.cs.ubc.ca/~tmm/))

This source code is licensed under the [BSD 3-Clause License](https://opensource.org/licenses/BSD-3-Clause).
