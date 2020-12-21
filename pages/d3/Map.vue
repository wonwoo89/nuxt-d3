<template>
  <div class="container">
    <MapChart :data="mapData" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import MapChart from '~/components/MapChart.vue'
import * as koreaMapJson from '~/assets/korea-provinces-2018.json'
import { MapJson } from '~/interfaces/Map'

@Component({
  components: { MapChart },
})
export default class Map extends Vue {
  get mapData() {
    return this.mapJson
  }

  asyncData() {
    const mapJson: MapJson = koreaMapJson
    return { mapJson }
  }
}
</script>
