<template>
    <div class="chart">
        <component :is="pages[page]" />
    </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import Iot from './views/Iot.vue'
import type { ChartType } from './chart.d'

const route = useRoute()
const page = route.params.page as ChartType

const pages = {
  iot: Iot
}

</script>

<style lang="scss" scoped src="./chart.scss"></style>