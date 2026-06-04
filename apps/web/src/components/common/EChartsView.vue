<template>
  <div ref="chartRef" :style="{ width, height }"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'

/**
 * ECharts 通用图表组件
 * 支持权重雷达图、趋势折线图、舆情柱状图等
 */

const props = defineProps<{
  option: Record<string, unknown>
  width?: string
  height?: string
}>()

const chartRef = ref<HTMLDivElement>()
let chartInstance: echarts.ECharts | null = null

// 初始化图表
onMounted(() => {
  if (chartRef.value) {
    chartInstance = echarts.init(chartRef.value)
    chartInstance.setOption(props.option)
  }

  // 响应窗口大小变化
  window.addEventListener('resize', handleResize)
})

// 监听 option 变化
watch(
  () => props.option,
  (newOption) => {
    if (chartInstance) {
      chartInstance.setOption(newOption, true)
    }
  },
  { deep: true },
)

// 窗口大小变化处理
function handleResize() {
  chartInstance?.resize()
}

// 销毁图表
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance?.dispose()
  chartInstance = null
})
</script>
