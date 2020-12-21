import * as d3 from 'd3'
import dateFormat from '~/utils/dateFormat'

type ChartType = 'line' | 'bar' | 'pie'

class D3Chart {
  body: Element | string
  config: any
  colorSet: string[]
  type: string

  constructor(body: Element | string, config: any) {
    this.body = body
    this.config = this.assignConfig(config)
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
    this.type = ''

    this.init()
  }

  init() {
    const { body, config } = this
    const type: ChartType = config.type
    const func = this[type]

    this.type = type

    if (this.noElement(body)) {
      console.log('not defined chart element')
      return
    }

    if (this.noType(type) || !this.isFunction(func)) {
      console.log(`not defined chart type - ${type}`)
      return
    }

    const $body = document.querySelector(`${body} .wrapper`)
    const $svg = $body.querySelector('svg')

    if ($svg) {
      $body.removeChild($svg)
    }

    this[type]()
  }

  line() {
    this.setGlobal()
    const { left, top } = this.padding

    this.clipPath()

    // chart
    const chartBody = this.svg
      .append('g')
      .classed('chart', true)
      .attr('transform', `translate(${left}, ${top})`)

    // chart x axis
    chartBody
      .append('g')
      .classed('axis axis-x', true)
      .attr('transform', `translate(0, ${this.height})`)

    // chart y axis
    chartBody.append('g').classed('axis axis-y', true)

    // chart y grid
    chartBody.append('g').classed('grid grid-y', true)

    chartBody.append('g').attr('clip-path', 'url(#clip)')

    this.drawChart = this.drawLineChart
    this.drawChart('.chart')

    this.tooltipInit()
    this.brushInit()
  }

  // bar() {
  //   this.setGlobal();
  //   const { left, top } = this.padding;
  //
  //   this.clipPath();
  //
  //   // chart
  //   const chartBody = this.svg.append('g')
  //     .classed('chart', true)
  //     .attr('transform', `translate(${left}, ${top})`);
  //
  //   // chart x axis
  //   chartBody.append('g')
  //     .classed('axis axis-x', true)
  //     .attr('transform', `translate(0, ${this.height})`);
  //
  //   // chart y axis
  //   chartBody.append('g')
  //     .classed('axis axis-y', true);
  //
  //   // chart y grid
  //   chartBody.append('g')
  //     .classed('grid grid-y', true);
  //
  //   chartBody.append('g')
  //     .attr('clip-path', 'url(#clip)');
  //
  //   this.drawChart = this.drawBarChart;
  //   this.drawChart('.chart');
  //
  //   this.tooltipInit();
  //   this.brushInit();
  // }
  //
  // pie() {
  //   this.setGlobal();
  //   const { left, top } = this.padding;
  //
  //   // chart
  //   const chartBody = this.svg.append('g')
  //     .classed('chart', true)
  //     .attr('transform', `translate(${left}, ${top})`);
  //
  //   // chart x axis
  //   chartBody.append('g')
  //     .classed('axis axis-x', true)
  //     .attr('transform', `translate(0, ${this.height})`);
  //
  //   // chart y axis
  //   chartBody.append('g')
  //     .classed('axis axis-y', true);
  //
  //   chartBody.append('g')
  //     .attr('clip-path', 'url(#clip)');
  //
  //   this.drawChart = D3Chart.drawPieChart;
  //   this.drawChart('.chart');
  //
  //   // this.tooltipInit();
  // }

  // *******************
  // common util methods
  // *******************
  assignConfig(config) {
    const { options } = config

    if (!options) {
      Object.assign(config, {
        options: {},
      })
    }

    this.setDateFormatConfig(options, config)
    this.setLayoutConfig(options, config)

    return config
  }

  setDateFormatConfig(options, config) {
    const dateConfig = options && options.date
    const format = dateConfig && options.date.format

    if (!dateConfig) {
      Object.assign(config.options, {
        date: {},
      })
    }

    if (!format) {
      Object.assign(config.options.date, {
        format: '%m.%d',
      })
    }

    return config
  }

  setLayoutConfig(options, config) {
    const layoutConfig = options && options.layout

    if (!layoutConfig) {
      Object.assign(config.options, {
        layout: {},
      })
    }

    const padding = layoutConfig && options.layout.padding

    if (!padding) {
      Object.assign(config.options.layout, {
        padding: {
          top: 30,
          right: 30,
          bottom: 60,
          left: 60,
        },
      })
    }

    return config
  }

  noElement(body) {
    return !body
  }

  noType(type) {
    return !type
  }

  isFunction(func) {
    return func && typeof func === 'function'
  }

  setGlobal() {
    const { body, config } = this
    const { labels, datasets, options } = config
    const { date, layout, brush } = options
    const { format } = date
    const { top, right, bottom, left } = layout.padding

    this.svg = d3
      .select(body)
      .select('.wrapper')
      .append('svg')
      .attr('width', '100%')
      .attr('height', 300)

    const $chart = document.querySelector(`${body} .wrapper svg`)
    const sidePadding = right + left
    const upDownPadding = top + bottom
    const brushAreaHeight = brush ? brush.height - top + bottom + 10 : 0

    this.width = +$chart.clientWidth - sidePadding
    this.height = +$chart.clientHeight - upDownPadding - brushAreaHeight
    this.padding = layout.padding
    this.parseTime = d3.timeParse(format)
    this.formatTime = d3.timeFormat(format)
    this.labels = labels
    this.labelSelected = labels
    this.datasets = datasets
    this.brush = brush
  }

  clipPath() {
    this.svg
      .append('defs')
      .append('clipPath')
      .attr('id', 'clip')
      .append('rect')
      .attr('width', this.width)
      .attr('height', this.height + 10)
  }

  lineChartSetter(xAxis, yAxis) {
    return d3
      .line()
      .curve(d3.curveMonotoneX)
      .x((_, i) => xAxis(this.parseTime(this.labels[i])))
      .y((d) => yAxis(d))
  }

  drawLineChart(selector, brush) {
    const { labels, labelSelected, parseTime, svg, height, datasets } = this
    const xAxisDomain = d3.extent(brush ? labels : labelSelected, parseTime)
    const yAxisDomain = this.yAxisDomain(brush)
    const transition = d3.transition().duration(1500).ease(d3.easeLinear)
    const chartBody = svg.select(selector)
    let xAxis = null
    let yAxis = null

    if (brush) {
      this.xAxisBrush = this.timeScaleSetter(xAxisDomain)
      this.yAxisBrush = this.linearScaleSetter(yAxisDomain, brush.height)

      xAxis = this.xAxisBrush
      yAxis = this.yAxisBrush
    } else {
      this.xAxisChart = this.timeScaleSetter(xAxisDomain)
      this.yAxisChart = this.linearScaleSetter(yAxisDomain, height)

      xAxis = this.xAxisChart
      yAxis = this.yAxisChart

      chartBody.select('.grid-y').call(this.yGridConfig(yAxis, 5))
    }

    chartBody.select('.axis-x').call(this.xAxisConfig(xAxis, brush ? 0 : 10))
    chartBody.select('.axis-y').call(this.yAxisConfig(yAxis, brush ? 1 : 5))

    const line = this.lineChartSetter(xAxis, yAxis)

    datasets.forEach((dataSet, index) => {
      const { data, excluded, borderColor, borderWidth, pointStyle } = dataSet
      const pointer = this.pointer(pointStyle)
      const identifier = `.line[data-idx="${index}"]`
      const chart = chartBody.select(identifier)

      if (!chart.empty()) {
        chart.remove()
      }

      if (excluded) {
        return
      }

      const chartDataGroup = chartBody
        .append('g')
        .classed('line', true)
        .attr('data-idx', index)
        .attr('transform', 'translate(0, 0)')

      chartDataGroup
        .append('path')
        .datum(data)
        .attr('d', line)
        .attr('stroke', borderColor)
        .attr('stroke-width', borderWidth)
        .attr('fill', 'none')
        .attr('stroke-dasharray', this.getTotalLength(`${identifier} path`))
        .attr('stroke-dashoffset', this.getTotalLength(`${identifier} path`))

      if (pointStyle && !brush) {
        const point = chartDataGroup
          .append('g')
          .classed(`point-group ${pointStyle}`, true)
          .selectAll()
          .data(data)
          .enter()
          .append(pointer.tag)
          .classed('point', true)
          .attr('stroke', borderColor)

        this.eachPointSet(point, pointer, pointStyle)
      }

      chartBody
        .select(`${identifier} path`)
        .transition(transition)
        .attr('stroke-dashoffset', 0)
    })

    this.setTextFont()

    this.legend = this.legendSet()
  }

  drawBarChart(selector, brush) {
    const { labels, labelSelected, parseTime, svg, height, datasets } = this

    const keys = this.datasets.map((v) => v.label)
    const stackData = this.datasets.reduce((result, dataSet) => {
      const { label, data } = dataSet

      data.forEach((value, index) => {
        if (!result[index]) {
          result.push({})
        }

        Object.assign(result[index], {
          [label]: value.y,
        })
      })

      return result
    }, [])

    const stack = d3
      .stack()
      .keys(keys)
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetNone)

    this.series = stack(stackData)

    this.datasets = datasets.map((dataSet, index) =>
      Object.assign(dataSet, {
        series: this.series[index],
      })
    )

    const xAxisDomain = d3.extent(brush ? labels : labelSelected, parseTime)
    const yAxisDomain = [0, d3.max(this.series, (y) => d3.max(y, (d) => d[1]))]
    const chartBody = svg.select(selector)

    let xAxis = null
    let yAxis = null

    if (brush) {
      this.xAxisBrush = this.bandScaleSetter(xAxisDomain)
      this.yAxisBrush = this.linearScaleSetter(yAxisDomain, brush.height)

      xAxis = this.xAxisBrush
      yAxis = this.yAxisBrush
    } else {
      this.xAxisChart = this.bandScaleSetter(xAxisDomain)
      this.yAxisChart = this.linearScaleSetter(yAxisDomain, height)

      xAxis = this.xAxisChart
      yAxis = this.yAxisChart
    }

    chartBody.select('.axis-x').call(this.xAxisConfig(xAxis, brush ? 0 : 10))
    chartBody.select('.axis-y').call(this.yAxisConfig(yAxis, brush ? 1 : 5))
    chartBody.select('.grid-y').call(this.yGridConfig(yAxis, brush ? 1 : 5))

    this.setTextFont()

    this.legend = this.legendSet()
  }

  drawPieChart(selector) {
    console.log(selector)
  }

  brushInit() {
    const { brush, padding } = this

    if (brush) {
      const { left, top, bottom } = padding
      const brushX = d3
        .brushX()
        .extent([
          [0, 0],
          [this.width, brush.height],
        ])
        .on('brush end', () => this.brushEvent())

      const brushBody = this.svg
        .append('g')
        .classed('brush', true)
        .attr(
          'transform',
          `translate(${left}, ${this.height - top + bottom + 50})`
        )

      this.drawChart('.brush', brush)

      // brush x axis
      brushBody
        .append('g')
        .classed('axis axis-x', true)
        .attr('transform', `translate(0, ${brush.height})`)
        .call(this.xAxisConfig(this.xAxisBrush, 0))

      // brush y axis
      brushBody
        .append('g')
        .classed('axis axis-y', true)
        .call(this.yAxisConfig(this.yAxisBrush, 1))

      brushBody.append('g').attr('clip-path', 'url(#clip)')

      const maxRange = d3.max(this.xAxisBrush.range())
      const rangePerLabel = maxRange / this.labels.length
      const tenAgo = rangePerLabel * 9

      brushBody
        .append('g')
        .attr('class', 'focus')
        .call(brushX)
        .call(brushX.move, [maxRange - tenAgo, maxRange])

      brushBody
        .selectAll('.selection')
        .attr('fill', '#fff')
        .attr('fill-opacity', '0.1')
    }
  }

  brushEvent() {
    const { sourceEvent, selection } = d3.event

    if (sourceEvent && sourceEvent.type === 'zoom') {
      return
    }

    const { xAxisBrush, xAxisChart, yAxisChart, datasets, parseTime } = this

    this.labelSelected = this.labels.filter((d) => {
      const pos = xAxisBrush(parseTime(d))
      return pos >= d3.min(selection) && pos <= d3.max(selection)
    })

    const timestampLabels = this.labelSelected.map((d) =>
      new Date(this.parseTime(d)).getTime()
    )
    const selectRange = selection || xAxisBrush.range()
    const getValue = (labels, target) =>
      this.formatTime(d3[target](d3.extent(labels)))
    const minIndex = this.labels.indexOf(getValue(timestampLabels, 'min'))
    const maxIndex = this.labels.indexOf(getValue(timestampLabels, 'max'))

    xAxisChart.domain(selectRange.map(xAxisBrush.invert, xAxisBrush))
    yAxisChart.domain(this.yAxisDomain(false, minIndex, maxIndex + 1))

    const line = this.lineChartSetter(xAxisChart, yAxisChart)

    datasets.forEach((dataSet, index) => {
      const identifier = `.line[data-idx="${index}"]`
      const { pointStyle, excluded } = dataSet
      const pointer = this.pointer(pointStyle)

      if (excluded) {
        return
      }

      const chart = this.svg.select('.chart').select(identifier)

      const updatedLine = chart.select('path')
      const dashOffset = +updatedLine.attr('stroke-dashoffset')

      updatedLine
        .attr('d', line)
        .attr('stroke-dasharray', this.getTotalLength(`${identifier} path`))
        .attr(
          'stroke-dashoffset',
          !dashOffset ? 0 : this.getTotalLength(`${identifier} path`)
        )

      const point = chart.select('.point-group').selectAll('.point')

      this.eachPointSet(point, pointer, pointStyle)
    })

    this.svg.select('.axis-x').call(this.xAxisConfig(xAxisChart, 10))
    this.svg.select('.axis-y').call(this.yAxisConfig(yAxisChart, 5))
    this.svg.select('.grid-y').call(this.yGridConfig(yAxisChart, 5))

    this.setTextFont()
  }

  yAxisDomain(brush, begin, last) {
    const maxList = this.datasets.map((dataSet) => {
      const nullBegin = begin === null || begin === undefined
      const nullLast = last === null || last === undefined

      if (!nullBegin && !nullLast) {
        const renderData = dataSet.data.slice().slice(begin, last)

        Object.assign(dataSet, { renderData })
      }

      if (!dataSet.renderData) {
        Object.assign(dataSet, {
          renderData: dataSet.data.slice(),
        })
      }

      const chartData = brush ? dataSet.data : dataSet.renderData

      return dataSet.excluded ? 0 : d3.max(chartData)
    })

    const maxY = d3.max(maxList)

    return [0, maxY * 1.2]
  }

  tooltipInit() {
    const chartBody = this.svg.select('.chart')
    const tooltipBox = d3.select('.tooltip-box')
    const tooltipLine = chartBody.append('line').classed('tooltip-line', true)
    const tooltipArea = chartBody
      .append('rect')
      .classed('tooltip-area', true)
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('opacity', 0)

    const tooltipRemove = () => {
      if (tooltipBox) {
        tooltipBox.style('display', 'none')
      }

      if (tooltipLine) {
        tooltipLine.attr('stroke', 'none')
      }
    }

    tooltipArea
      .on('mousemove', () =>
        this.tooltipDraw(tooltipBox, tooltipLine, tooltipArea)
      )
      .on('mouseout', tooltipRemove)
  }

  tooltipDraw(tooltipBox, tooltipLine, tooltipArea) {
    if (!this.datasets.length) {
      return
    }

    const { format } = this.config.options.date
    const mousePosition = d3.mouse(tooltipArea.node())[0] + 5
    const invert = this.xAxisChart.invert(mousePosition)
    const date = dateFormat(invert, format)
    const xPos = this.xAxisChart(this.parseTime(date))

    if (xPos < 0) {
      return
    }

    tooltipLine
      .attr('stroke', '#ffffff')
      .attr('x1', xPos)
      .attr('x2', xPos)
      .attr('y1', 0)
      .attr('y2', this.height)

    const lx = d3.event.layerX
    const ly = d3.event.layerY

    tooltipBox
      .html(`<span class="tooltip-date font s18 bold">${date}</span><hr>`)
      .style('display', 'block')
      .style('top', `${ly}px`)

    setTimeout(() => {
      const chartSize = document.querySelector(`${this.body} .wrapper svg`)
        .clientWidth
      const tipSize = document.querySelector('.tooltip-box').clientWidth

      if (lx > chartSize / 2) {
        tooltipBox.style('left', `${lx - 20 - tipSize}px`)
      } else {
        tooltipBox.style('left', `${lx + 20}px`)
      }
    })

    tooltipBox
      .selectAll()
      .data(this.datasets)
      .enter()
      .append('div')
      .classed('tooltip-text', true)
      .html((dataSet, index) => this.tooltipText(dataSet, index, date))
  }

  tooltipText(dataSet, index, date) {
    const { renderData, label, pointStyle, excluded } = dataSet

    if (excluded) {
      return ''
    }

    const color = this.colorSet[index]
    const labelIndex = this.labelSelected.indexOf(date)
    const value = renderData[labelIndex]
    const style = `background: ${color}; border: 1px solid ${color}`
    const name = `<span class="name font">${label}</span>`
    const count = `<span class="count font bold">${value.toLocaleString()}</span>`

    return `<i class="symbol ${pointStyle}" style="${style}"></i>${name}: ${count}`
  }

  eachPointSet(point, pointer, pointStyle) {
    const xPos = (i) => this.xAxisChart(this.parseTime(this.labels[i]))

    switch (pointStyle) {
      case 'circle':
        point
          .attr('cx', (_, i) => xPos(i))
          .attr('cy', (d) => this.yAxisChart(d))
        break
      case 'rect':
      case 'rectangle':
        point
          .attr('x', (_, i) => xPos(i) - 5)
          .attr('y', (d) => this.yAxisChart(d) - 5)
        break
      default:
        point
          .attr('points', pointer.points)
          .attr(
            'transform',
            (d, i) => `translate(${xPos(i) - 5}, ${this.yAxisChart(d) - 5})`
          )
        break
    }
  }

  timeScaleSetter(domain) {
    return d3.scaleTime().range([0, this.width]).domain(domain)
  }

  bandScaleSetter(domain) {
    return d3.scaleBand().range([0, this.width]).domain(domain).padding(0.5)
  }

  linearScaleSetter(domain, height) {
    return d3.scaleLinear().range([height, 0]).domain(domain)
  }

  xAxisConfig(axis, size) {
    return d3.axisBottom(axis).tickSize(size).tickPadding(5)
  }

  yAxisConfig(axis, tick) {
    return d3.axisLeft(axis).ticks(tick).tickPadding(10).tickFormat(this.unit)
  }

  yGridConfig(axis, tick) {
    return d3.axisLeft(axis).ticks(tick).tickSize(-this.width).tickFormat('')
  }

  legendSet() {
    return this.datasets.reduce((obj, value, index) => {
      const color = this.colorSet[index]
      const symbol = value.pointStyle
      const { label, data, excluded } = value

      const count = d3.sum(this.type === 'bar' ? data.map((v) => v.y) : data)

      return Object.assign(obj, {
        [label]: {
          color,
          symbol,
          count,
          excluded,
        },
      })
    }, {})
  }

  exclude(label) {
    this.datasets.some((v) => {
      if (v.label === label) {
        return Object.assign(v, {
          excluded: !v.excluded,
        })
      }

      return false
    })

    this.drawChart('.chart')
    this.drawChart('.brush', this.brush)
  }

  unit(data) {
    const unit = ['K', 'M', 'G', 'T']
    const { length } = data.toString()
    const remainder = length % 3
    const squareRoot = Math.floor(length / 3) - (remainder ? 0 : 1)
    const unitString = unit[squareRoot - 1]
    const zeros = 1000 ** squareRoot

    return length > 3 ? data / zeros + unitString : data
  }

  pointer(type) {
    const pointList = {
      circle: {
        tag: 'circle',
      },
      rect: {
        tag: 'rect',
      },
      rectangle: {
        tag: 'rect',
      },
      cross: {
        tag: 'polygon',
        points: this.setPoints([
          [4.5, 0],
          [5.5, 0],
          [5.5, 4.5],
          [10, 4.5],
          [10, 5.5],
          [5.5, 5.5],
          [5.5, 10],
          [4.5, 10],
          [4.5, 5.5],
          [0, 5.5],
          [0, 4.5],
          [4.5, 4.5],
        ]),
      },
      crossRot: {
        tag: 'polygon',
        points: this.setPoints([
          [0, 0.5],
          [0.5, 0],
          [5, 4.5],
          [9.5, 0],
          [10, 0.5],
          [5.5, 5],
          [10, 9.5],
          [9.5, 10],
          [5, 5.5],
          [0.5, 10],
          [0, 9.5],
          [4.5, 5],
        ]),
      },
      rectRounded: {
        tag: 'polygon',
        points: this.setPoints([
          [3, 0],
          [7, 0],
          [8, 0.5],
          [9, 1],
          [9.5, 1.5],
          [10, 3],
          [10, 7],
          [9.5, 8],
          [9, 9],
          [8, 9.5],
          [7, 10],
          [3, 10],
          [2, 9.5],
          [1, 9],
          [0.5, 8],
          [0, 7],
          [0, 3],
          [0.5, 2],
          [1, 1],
          [2, 0.5],
        ]),
      },
      star: {
        tag: 'polygon',
        points: this.setPoints([
          [0.5, 0.5],
          [0.5, 0.5],
          [5, 4.5],
          [4.5, 0],
          [5.5, 0],
          [5.5, 4.5],
          [9.5, 0.5],
          [9.5, 0.5],
          [5.5, 5],
          [10, 4.5],
          [10, 5.5],
          [5.5, 5.5],
          [9.5, 9.5],
          [9.5, 9.5],
          [5, 5.5],
          [5.5, 10],
          [4.5, 10],
          [4.5, 5],
          [0.5, 9.5],
          [0.5, 9.5],
          [4.5, 5],
          [0, 4.5],
          [0, 5.5],
          [4.5, 4.5],
        ]),
      },
      rectRot: {
        tag: 'polygon',
        points: this.setPoints([
          [5, 0],
          [10, 5],
          [5, 10],
          [0, 5],
        ]),
      },
      dia: {
        tag: 'polygon',
        points: this.setPoints([
          [5, 0],
          [10, 5],
          [5, 10],
          [0, 5],
        ]),
      },
      diamond: {
        tag: 'polygon',
        points: this.setPoints([
          [5, 0],
          [10, 5],
          [5, 10],
          [0, 5],
        ]),
      },
      triangle: {
        tag: 'polygon',
        points: this.setPoints([
          [5, 0],
          [10, 10],
          [0, 10],
        ]),
      },
      pentagon: {
        tag: 'polygon',
        points: this.setPoints([
          [5, 0],
          [10, 3.5],
          [8, 10],
          [2, 10],
          [0, 3.5],
        ]),
      },
      hexagon: {
        tag: 'polygon',
        points: this.setPoints([
          [5, 0],
          [10, 3],
          [10, 9],
          [5, 12],
          [0, 9],
          [0, 3],
        ]),
      },
    }
    return pointList[type]
  }

  setPoints(points) {
    if (typeof points === 'object' && points.length > 1) {
      return points.map((v) => v.join(',')).join(' ')
    }

    return null
  }

  getTotalLength(selector) {
    const element = document.querySelector(selector)

    return element ? document.querySelector(selector).getTotalLength() : 0
  }

  setTextFont() {
    this.svg.selectAll('text').classed('font s16', true).attr('fill', '#ffffff')
  }
}

export default D3Chart
