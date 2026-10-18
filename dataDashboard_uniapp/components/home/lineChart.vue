<template>
	<view class="line-chart">
		<canvas class="line-chart-canvas" :id="canvasId" :canvas-id="canvasId"></canvas>
	</view>
</template>

<script setup lang="ts">
import { getCurrentInstance, nextTick, onMounted, watch } from 'vue'

// 实例自增 id：同一页面出现多个折线图时，避免 canvas-id 冲突
let uid = 0

const props = withDefaults(
	defineProps<{
		// 折线数据：label 作为横轴刻度，value 决定纵向位置
		items?: { label: string; value: number }[]
		// 数值单位，用于纵轴刻度与数据点标注
		unit?: string
		// 折线颜色
		lineColor?: string
		// 折线下方面积的渐变：从上到下
		areaFrom?: string
		areaTo?: string
		// 折线宽度（px）
		lineWidth?: number
	}>(),
	{
		items: () => [],
		unit: '',
		lineColor: '#0a0a0a',
		areaFrom: 'rgba(10, 10, 10, 0.10)',
		areaTo: 'rgba(10, 10, 10, 0)',
		lineWidth: 2
	}
)

const instance = getCurrentInstance()
const canvasId = `line-chart-${++uid}`

// 纵轴等分数：4 段网格，刻度值依次为 axisMax、3/4、1/2、1/4、0
const AXIS_SPLITS = 4

const draw = () => {
	if (!props.items.length) return

	uni.createSelectorQuery()
		.in(instance?.proxy)
		.select(`#${canvasId}`)
		.boundingClientRect((rect) => {
			// 单节点查询也可能返回数组，这里只取单个节点的结果
			if (!rect || Array.isArray(rect)) return
			if (!rect.width || !rect.height) return

			const { width, height } = rect
			const ctx = uni.createCanvasContext(canvasId, instance?.proxy)

			// 绘图区留白：左侧放纵轴刻度、右侧防末点被裁、上下放点标注与横轴刻度
			const paddingLeft = 30
			const paddingRight = 18
			const paddingTop = 20
			const paddingBottom = 22
			const plotWidth = width - paddingLeft - paddingRight
			const plotHeight = height - paddingTop - paddingBottom
			if (plotWidth <= 0 || plotHeight <= 0) return

			const max = Math.max(...props.items.map(({ value }) => value))
			// 纵轴上限向上取整到 4 的倍数，保证刻度是整数
			const axisMax = Math.max(AXIS_SPLITS, Math.ceil(max / AXIS_SPLITS) * AXIS_SPLITS)

			// 网格线与纵轴刻度
			ctx.setLineWidth(1)
			ctx.setFontSize(9)
			ctx.setTextAlign('right')
			ctx.setTextBaseline('middle')
			for (let index = 0; index <= AXIS_SPLITS; index++) {
				const y = paddingTop + (plotHeight / AXIS_SPLITS) * index
				const tick = axisMax - (axisMax / AXIS_SPLITS) * index

				ctx.beginPath()
				ctx.setStrokeStyle('#eef1f5')
				ctx.moveTo(paddingLeft, y)
				ctx.lineTo(width - paddingRight, y)
				ctx.stroke()

				ctx.setFillStyle('#9ca3af')
				ctx.fillText(`${tick}${props.unit}`, paddingLeft - 6, y)
			}

			// 数据点坐标：横轴等距分布，纵轴按占纵轴上限的比例定位
			const points = props.items.map(({ value }, index) => ({
				x:
					props.items.length === 1
						? paddingLeft + plotWidth / 2
						: paddingLeft + (plotWidth * index) / (props.items.length - 1),
				y: paddingTop + (1 - value / axisMax) * plotHeight
			}))

			// 折线下方的渐变面积
			const baseline = paddingTop + plotHeight
			ctx.beginPath()
			ctx.moveTo(points[0].x, baseline)
			points.forEach((point) => ctx.lineTo(point.x, point.y))
			ctx.lineTo(points[points.length - 1].x, baseline)
			ctx.closePath()
			const area = ctx.createLinearGradient(0, paddingTop, 0, baseline)
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

			// 数据点：白色描边圆 + 黑色实心，避免与面积重叠后看不清
			points.forEach((point) => {
				ctx.beginPath()
				ctx.arc(point.x, point.y, 4, 0, Math.PI * 2)
				ctx.setFillStyle('#ffffff')
				ctx.fill()

				ctx.beginPath()
				ctx.arc(point.x, point.y, 2.5, 0, Math.PI * 2)
				ctx.setFillStyle(props.lineColor)
				ctx.fill()
			})

			// 数据点上方标注数值
			ctx.setTextAlign('center')
			ctx.setTextBaseline('bottom')
			ctx.setFillStyle('#0a0a0a')
			ctx.setFontSize(10)
			props.items.forEach(({ value }, index) => {
				ctx.fillText(`${value}${props.unit}`, points[index].x, points[index].y - 6)
			})

			// 横轴刻度：经验区间
			ctx.setTextBaseline('top')
			ctx.setFillStyle('#9ca3af')
			ctx.setFontSize(9)
			props.items.forEach(({ label }, index) => {
				ctx.fillText(label, points[index].x, baseline + 7)
			})

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
.line-chart {
	width: 100%;
	height: 100%;

	.line-chart-canvas {
		width: 100%;
		height: 100%;
	}
}
</style>
