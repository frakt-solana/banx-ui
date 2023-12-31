//? Single bar options
const defaulSingleBarAxisOptions = {
  border: {
    display: false,
  },
  stacked: true,
  ticks: {
    display: false,
  },
  grid: {
    display: false,
  },
}

export const singleBarOptions = {
  plugins: {
    legend: {
      display: false,
    },
  },
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: defaulSingleBarAxisOptions,
    y: defaulSingleBarAxisOptions,
  },
}
