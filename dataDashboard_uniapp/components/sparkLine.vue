<template>
	<view class="spark-line">
		<canvas class="spark-line-canvas" :id="canvasId" :canvas-id="canvasId"></canvas>
	</view>
</template>

<script setup lang="ts">
import { getCurrentInstance, nextTick, onMounted, watch } from 'vue'

// 实例自增 id：同一页面出现多个迷你折线图时，避免 canvas-id 冲突
let uid = 0

const props = withDefaults(
	defineProps<{
		// 折线数据，按时间先后排列；少于 2 个点不绘制
		values?: number[]
		// 折线颜色
		lineColor?: string
		// 折线下方面积的渐变：从上到下
		areaFrom?: string
		areaTo?: string
		// 折线宽度（px）
		lineWidth?: number
	}>(),
	{
		values: () => [],
		lineColor: '#ffffff',
		areaFrom: 'rgba(255, 255, 255, 0.55)',
		areaTo: 'rgba(255, 255, 255, 0)',
		lineWidth: 2
	}
)

const instance = getCurrentInstance()
const canvasId = `spark-line-${++uid}`

// 取出 canvas 的实际像素尺寸后绘制：坐标统一按 px 计算，避免 rpx 换算误差
const draw = () => {
	if (props.values.length < 2) return

	uni.createSelectorQuery()
		.in(instance?.proxy)
		.select(`#${canvasId}`)
		.boundingClientRect((rect) => {
			// 单节点查询也可能返回数组，这里只取单个节点的结果
			if (!rect || Array.isArray(rect)) return
			if (!rect.width || !rect.height) return

			const { width, height } = rect
			const ctx = uni.createCanvasContext(canvasId, instance?.proxy)

			const max = Math.max(...props.values)
			const min = Math.min(...props.values)
			// 数据全相同时跨度为 0，按 1 处理，避免除零
			const span = max - min || 1
			// 留出半个线宽的边距，防止首尾点被裁掉
			const padding = props.lineWidth
			const stepX = (width - padding * 2) / (props.values.length - 1)
			const points = props.values.map((value, index) => ({
				x: padding + stepX * index,
				y: padding + (1 - (value - min) / span) * (height - padding * 2)
			}))

			// 折线下方的渐变面积
			ctx.beginPath()
			ctx.moveTo(points[0].x, height)
			points.forEach((point) => ctx.lineTo(point.x, point.y))
			ctx.lineTo(points[points.length - 1].x, height)
			ctx.closePath()
			const area = ctx.createLinearGradient(0, 0, 0, height)
			area.addColorStop(0, props.areaFrom)
			area.addColorStop(1, props.areaTo)
			ctx.setFillStyle(area as unknown as string)
			ctx.fill()

			// 折线本体
			ctx.beginPath()
			points.forEach((point, index) => {
				if (index === 0) {
					ctx.moveTo(point.x, point.y)
				} else {
					ctx.lineTo(point.x, point.y)
				}
			})
			ctx.setStrokeStyle(props.lineColor)
			ctx.setLineWidth(props.lineWidth)
			ctx.setLineCap('round')
			ctx.setLineJoin('round')
			ctx.stroke()

			ctx.draw()
		})
		.exec()
}

onMounted(() => nextTick(draw))

// 数据变化后重绘（含父组件直接替换数组的情况）
watch(() => props.values, () => nextTick(draw), { deep: true })
</script>

<style lang="scss" scoped>
// 外层尺寸由使用方决定，组件只负责撑满
.spark-line {
	width: 100%;
	height: 100%;

	.spark-line-canvas {
		width: 100%;
		height: 100%;
	}
}
</style>
