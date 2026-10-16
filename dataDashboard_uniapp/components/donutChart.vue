<template>
	<view class="donut-chart">
		<canvas class="donut-canvas" :id="canvasId" :canvas-id="canvasId"></canvas>
	</view>
</template>

<script setup lang="ts">
import { getCurrentInstance, nextTick, onMounted, watch } from 'vue'

// 实例自增 id：同一页面出现多个环图时，避免 canvas-id 冲突
let uid = 0

const props = withDefaults(
	defineProps<{
		// 各扇区：占比由 value 自动换算，颜色由使用方给定
		items?: { value: number; color: string }[]
		// 圆环中心的主文案与下方说明
		centerValue?: string
		centerLabel?: string
		// 圆环厚度占圆环直径的比例
		thicknessRatio?: number
	}>(),
	{
		items: () => [],
		centerValue: '',
		centerLabel: '',
		thicknessRatio: 0.22
	}
)

const instance = getCurrentInstance()
const canvasId = `donut-chart-${++uid}`

// 相邻扇区之间留出的弧度空隙
const GAP = 0.04

const draw = () => {
	const total = props.items.reduce((sum, item) => sum + item.value, 0)
	if (!total) return

	uni.createSelectorQuery()
		.in(instance?.proxy)
		.select(`#${canvasId}`)
		.boundingClientRect((rect) => {
			// 单节点查询也可能返回数组，这里只取单个节点的结果
			if (!rect || Array.isArray(rect)) return
			if (!rect.width || !rect.height) return

			const { width, height } = rect
			const size = Math.min(width, height)
			const ctx = uni.createCanvasContext(canvasId, instance?.proxy)
			const cx = width / 2
			const cy = height / 2
			const thickness = size * props.thicknessRatio
			// 用描边画圆环：半径取内外径的中线
			const radius = size / 2 - thickness / 2

			// 从 12 点方向起顺时针依次画各扇区
			let start = -Math.PI / 2
			props.items.forEach((item) => {
				const angle = (item.value / total) * Math.PI * 2
				ctx.beginPath()
				ctx.arc(cx, cy, radius, start + GAP / 2, start + angle - GAP / 2)
				ctx.setStrokeStyle(item.color)
				ctx.setLineWidth(thickness)
				ctx.setLineCap('butt')
				ctx.stroke()
				start += angle
			})

			// 中心文案：主数值在上、说明在下
			ctx.setTextAlign('center')
			ctx.setTextBaseline('middle')
			ctx.setFillStyle('#ffffff')
			ctx.setFontSize(Math.round(size * 0.2))
			ctx.fillText(props.centerValue, cx, cy - size * 0.06)
			ctx.setFillStyle('rgba(255, 255, 255, 0.72)')
			ctx.setFontSize(Math.round(size * 0.115))
			ctx.fillText(props.centerLabel, cx, cy + size * 0.1)

			ctx.draw()
		})
		.exec()
}

onMounted(() => nextTick(draw))

// 数据变化后重绘（含父组件直接替换数组的情况）
watch(() => props.items, () => nextTick(draw), { deep: true })
</script>

<style lang="scss" scoped>
// 外层尺寸由使用方决定，组件只负责撑满
.donut-chart {
	width: 100%;
	height: 100%;

	.donut-canvas {
		width: 100%;
		height: 100%;
	}
}
</style>
