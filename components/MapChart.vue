<template>
  <div id="korea"></div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'nuxt-property-decorator'
import * as d3 from 'd3'
import { feature as mapFeature } from 'topojson'
import { MapJson } from '~/interfaces/Map'

@Component
export default class Map extends Vue {
  @Prop() readonly data: MapJson

  width: number = window.innerWidth
  height: number = window.innerHeight
  projection = null
  path = null
  svg = null
  map = null
  places = null
  centered = ''

  get mapData() {
    return this.data?.default
  }

  get metroCities() {
    return [
      '서울특별시',
      '인천광역시',
      '대전광역시',
      '대구광역시',
      '부산광역시',
      '울산광역시',
      '광주광역시',
      '세종특별자치시',
      '제주특별자치도',
    ]
  }

  drawMapSvg() {
    this.projection = d3
      .geoMercator()
      .translate([this.width / 2, this.height / 2])
    this.path = d3.geoPath().projection(this.projection)
    this.svg = d3
      .select('#korea')
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
    this.map = this.svg.append('g').attr('id', 'map')
    this.places = this.svg.append('g').attr('id', 'places')
  }

  initMapData() {
    const geo = this.mapData.objects.korea_provinces_2018_geo
    const map = mapFeature(this.mapData, geo)

    if (!map) return

    const { features } = map
    const bounds = d3.geoBounds(map)
    const center = d3.geoCentroid(map)
    const distance = d3.geoDistance(...bounds)
    const scale = (this.height / distance / Math.sqrt(2)) * 1.2

    this.projection.scale(scale).center(center)
    this.map
      .selectAll('path')
      .data(features)
      .enter()
      .append('path')
      .attr('class', (d) => `municipality c ${d.properties.code}`)
      .attr('d', this.path)
      .on('click', this.handleClickMap.bind(this))
  }

  handleClickMap(_, data) {
    let x = this.width / 2
    let y = this.height / 2
    let zoom = 1

    if (data && this.centered !== data.properties.name) {
      const { name } = data.properties
      const centroid = this.path.centroid(data)
      const [cx, cy] = centroid

      x = cx
      y = cy

      if (/제주특별자치도|인천광역시/gi.test(name)) {
        zoom = 5
      } else if (this.metroCities.includes(name)) {
        zoom = 15
      } else {
        zoom = 3
      }

      this.centered = name
    } else {
      this.centered = ''
    }

    this.map
      .selectAll('path')
      .classed(
        'active',
        (d) => this.centered && d.properties.name === this.centered
      )
    this.map
      .transition()
      .duration(500)
      .attr(
        'transform',
        `translate(${this.width / 2}, ${
          this.height / 2
        })scale(${zoom})translate(${-x}, ${-y})`
      )
      .style('stroke-width', `${1.5 / zoom}px`)
  }

  mounted() {
    this.drawMapSvg()
    this.initMapData()
  }
}
</script>

<style scoped lang="scss">
#korea {
  padding: 0;
  margin: 0;
  background: lightsteelblue;
  ::v-deep {
    path {
      fill: #f9f9f9;
      stroke: #929292;
      stroke-width: 1px;
      cursor: pointer;
      transition: fill 0.3s ease;

      &:hover,
      &.active {
        fill: #ffac57;
      }
    }
  }
}
</style>
