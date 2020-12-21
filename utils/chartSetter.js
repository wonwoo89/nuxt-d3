import dateFormat from '~/utils/dateFormat'

class ChartSetter {
  constructor(type) {
    this.oneDay = 60 * 60 * 24 * 1000
    this.pointStyles = [
      'circle',
      'cross',
      'crossRot',
      'rect',
      'rectRounded',
      'rectRot',
      'star',
      'triangle',
    ]
    this.colorSet = [
      '#FFBE5A',
      '#ff5abe',
      '#5abeff',
      '#5aff5a',
      '#e664ff',
      '#ffb450',
      '#ff50b4',
      '#50b4ff',
      '#50ff50',
      '#dc5aff',
      '#ffaa46',
      '#ff46aa',
      '#46aaff',
      '#46ff46',
      '#d250ff',
      '#ffa03c',
      '#ff3ca0',
      '#3ca0ff',
      '#3cff3c',
      '#c846ff',
      '#ff9632',
      '#ff3296',
      '#3296ff',
      '#32ff32',
      '#be3cff',
      '#ff8c28',
      '#ff288c',
      '#288cff',
      '#28ff28',
      '#b432ff',
      '#ff821e',
      '#ff1e82',
      '#1e82ff',
      '#1eff1e',
      '#aa28ff',
      '#ff7814',
      '#ff1478',
      '#1478ff',
      '#14ff14',
      '#a01eff',
    ]

    this.type = type
    this.set = this[type]
    this.reset()
  }

  reset() {
    this.dataSet = {
      labels: [],
      datasets: [],
      options: {},
    }
  }

  line(result) {
    return this.lineData(result)
  }

  bar(result) {
    return this.barData(result)
  }

  pie(result) {
    const data = result[0]
    return this.pieData(data)
  }

  lineData(data) {
    const format = '%b %d %Y'
    const result = { ...this.timeSeriesLabels(data, format) }

    data.forEach(({ label, output }, i) => {
      const color = this.colorSet[i]
      const point = this.pointStyles[i]
      const dateKeyArray = output.reduce(ChartSetter.dateKeyValue, [])
      const dataPreset = {
        label,
        backgroundColor: 'transparent',
        borderWidth: 1,
        data: [],
      }

      const dataWithZero = result.originLabels.reduce(
        ChartSetter.lineDataSetter(color, point, dateKeyArray),
        dataPreset
      )

      result.datasets.push(dataWithZero)
      result.type = this.type
    })

    return result
  }

  barData(data) {
    const format = '%b %d %Y'
    const result = { ...this.timeSeriesLabels(data, format) }

    data.forEach(({ label, output }, i) => {
      const color = this.colorSet[i]
      const dateKeyArray = output.reduce(ChartSetter.dateKeyValue, [])
      const dataPreset = {
        label,
        data: [],
      }

      const dataWithZero = result.originLabels.reduce(
        ChartSetter.barDataSetter(color, result, dateKeyArray),
        dataPreset
      )

      result.datasets.push(dataWithZero)
      result.type = this.type
    })

    return result
  }

  pieData(data) {
    const result = { ...this.pieLabels(data) }
    const pieData = {
      borderWidth: 3,
      borderColor: '#2F2F2F',
      backgroundColor: this.colorSet,
      data: data.output.map(({ value }) => value),
    }

    result.datasets.push(pieData)
    result.type = this.type

    return result
  }

  timeSeriesLabels(data, format) {
    const { xMinAxes, xMaxAxes } = ChartSetter.minAndMax(data)
    const dateGap = this.dateGap(xMinAxes, xMaxAxes)
    const labels = this.labels(dateGap, xMinAxes, format)
    const originLabels = this.originLabels(dateGap, xMinAxes)

    return Object.assign(this.dataSet, {
      labels,
      originLabels,
    })
  }

  labels(dateGap, xMinAxes, format) {
    const result = []

    for (let i = 0; i < dateGap; i += 1) {
      const labelData = xMinAxes + this.oneDay * i

      result.push(dateFormat(labelData, format))
    }

    return result
  }

  originLabels(dateGap, xMinAxes) {
    const result = []

    for (let i = 0; i < dateGap; i += 1) {
      const labelData = xMinAxes + this.oneDay * i

      result.push(labelData)
    }

    return result
  }

  pieLabels({ output }) {
    return Object.assign(this.dataSet, {
      labels: output.map(ChartSetter.pathname()),
    })
  }

  dateGap(start, end) {
    return Math.abs(start - end) / this.oneDay + 1
  }

  static minAndMax(array) {
    const minAndMax = array.reduce((acc, { output }) => {
      const xAxes = output.map(({ label }) => ChartSetter.timestamp(label))
      const minAxes = Math.min(...xAxes)
      const maxAxes = Math.max(...xAxes)

      acc.push(minAxes)
      acc.push(maxAxes)

      return acc
    }, [])

    const xMinAxes = Math.min(...minAndMax)
    const xMaxAxes = Math.max(...minAndMax)

    return {
      xMinAxes,
      xMaxAxes,
    }
  }

  static dateKeyValue(acc, { label, value }) {
    return Object.assign(acc, { [ChartSetter.timestamp(label)]: value })
  }

  static lineDataSetter(color, point, dateKeyArray) {
    return (acc, value) =>
      Object.assign(acc, {
        borderColor: color,
        // backgroundColor: `${color}22`,
        pointBackgroundColor: color,
        pointStyle: point,
        data: acc.data.concat([dateKeyArray[value] || 0]),
      })
  }

  static barDataSetter(color, dataSet, dateKeyArray) {
    return (acc, value, idx) =>
      Object.assign(acc, {
        borderColor: color,
        backgroundColor: color,
        data: acc.data.concat([
          {
            x: dataSet.labels[idx],
            y: dateKeyArray[value] || 0,
          },
        ]),
      })
  }

  static pathname() {
    const originReg = /(http[s]?:\/\/)?(www[0-9]?\.)?(\/[^/:]+)/gi

    return ({ label }) => {
      const pathAndSearch = label.match(originReg)
      return pathAndSearch ? pathAndSearch.join('') : '/'
    }
  }

  static timestamp(date) {
    return new Date(date).getTime()
  }
}

export default ChartSetter
