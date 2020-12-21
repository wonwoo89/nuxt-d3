import Vue from 'vue'

const zeroPadded = {
  install() {
    // eslint-disable-next-line no-extend-native
    Number.prototype.zeroPadded = function () {
      return this < 10 ? `0${this}` : this
    }
  },
}

Vue.use(zeroPadded)
