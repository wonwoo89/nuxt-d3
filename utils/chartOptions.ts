export default {
  line(data: any) {
    return {
      type: 'line',
      data,
      options: {
        maintainAspectRatio: false,
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
              },
            },
          ],
        },
        legend: {
          labels: {
            boxWidth: 10,
            fontColor: 'white',
            usePointStyle: true,
          },
        },
        tooltips: {
          mode: 'index',
        },
        layout: {
          padding: {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
          },
        },
      },
    }
  },
  bar(data: any) {
    return {
      type: 'bar',
      // type: 'horizontalBar',
      data,
      options: {
        maintainAspectRatio: false,
        scales: {
          xAxes: [
            {
              stacked: true,
            },
          ],
          yAxes: [
            {
              stacked: true,
              ticks: {
                beginAtZero: true,
              },
            },
          ],
        },
        legend: {
          labels: {
            boxWidth: 10,
            fontColor: 'white',
            usePointStyle: true,
          },
        },
        tooltips: {
          mode: 'index',
        },
        layout: {
          padding: {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
          },
        },
      },
    }
  },
  pie(data: any) {
    return {
      type: 'doughnut',
      data,
      options: {
        maintainAspectRatio: false,
        legend: {
          labels: {
            boxWidth: 10,
            fontColor: 'white',
            usePointStyle: true,
          },
        },
        tooltips: {
          mode: 'index',
        },
        layout: {
          padding: {
            top: 0,
            right: 0,
            bottom: 10,
            left: 0,
          },
        },
      },
    }
  },
}
