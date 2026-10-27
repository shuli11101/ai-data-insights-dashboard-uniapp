<template>
	<!-- 工作经验范围：双把手滑块 -->
	<view class="experience-range">
		<view class="range-head">
			<image class="range-icon" :src="icon" mode="aspectFit" />
			<text class="range-title">{{ title }}</text>
			<text class="range-value">{{ text }}</text>
		</view>

		<view class="range-track" @touchstart="onStart" @touchmove.stop.prevent="onMove">
			<view class="range-fill" :style="{ left: percentOf(min), width: percentOf(max - min) }"></view>
			<view class="range-thumb" :style="{ left: percentOf(min) }"></view>
			<view class="range-thumb" :style="{ left: percentOf(max) }"></view>
		</view>

		<view class="range-scale">
			<text class="range-scale-text">0 年</text>
			<text class="range-scale-text">{{ maxYear }} 年以上</text>
		</view>
	</view>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, nextTick, onMounted, ref } from 'vue'

const props = withDefaults(
	defineProps<{
		/** 区间下限（年） */
		min: number
		/** 区间上限（年），等于 maxYear 表示「以上」 */
		max: number
		/** 行标题 */
		title: string
		/** 行图标 */
		icon: string
		/** 滑块最大刻度 */
		maxYear?: number
	}>(),
	{
		maxYear: 10
	}
)

const emit = defineEmits<{
	(e: 'update:min', value: number): void
	(e: 'update:max', value: number): void
}>()

const instance = getCurrentInstance()

// 轨道在屏幕中的位置与宽度，用于把触摸坐标换算成刻度
const track = ref({ left: 0, width: 0 })

// 当前拖动的把手：下限或上限
const dragging = ref<'min' | 'max'>('min')

// 刻度换算成百分比，用于把手与选中段的定位
const percentOf = (year: number) => `${(year / props.maxYear) * 100}%`

// 选中区间文案：全范围显示「不限」
const text = computed(() => {
	const { min, max, maxYear } = props
	if (min === 0 && max === maxYear) return '不限'
	if (min === max) return `${min} 年`
	return max === maxYear ? `${min} 年以上` : `${min}-${max} 年`
})

const measure = () => {
	uni.createSelectorQuery()
		.in(instance?.proxy as object)
		.select('.range-track')
		.boundingClientRect((rect) => {
			if (!rect || Array.isArray(rect)) return
			track.value = { left: rect.left ?? 0, width: rect.width ?? 0 }
		})
		.exec()
}

onMounted(() => nextTick(measure))

// 触摸位置换算成整数年限
const yearFromTouch = (event: TouchEvent) => {
	const { left, width } = track.value
	if (!width) return props.min
	const ratio = (event.touches[0].clientX - left) / width
	return Math.min(props.maxYear, Math.max(0, Math.round(ratio * props.maxYear)))
}

const moveThumb = (year: number) => {
	if (dragging.value === 'min') {
		emit('update:min', Math.min(year, props.max))
	} else {
		emit('update:max', Math.max(year, props.min))
	}
}

// 按下：离触点更近的把手跟随手指
const onStart = (event: TouchEvent) => {
	const year = yearFromTouch(event)
	dragging.value = Math.abs(year - props.min) <= Math.abs(year - props.max) ? 'min' : 'max'
	moveThumb(year)
}

const onMove = (event: TouchEvent) => moveThumb(yearFromTouch(event))
</script>

<style lang="scss" scoped>
.experience-range {
	.range-head {
		display: flex;
		align-items: center;
		height: 112rpx;
	}

	.range-icon {
		flex-shrink: 0;
		width: 30rpx;
		height: 30rpx;
	}

	.range-title {
		flex: 1;
		min-width: 0;
		margin-left: 20rpx;
		font-size: 27rpx;
		line-height: 1.2;
		color: #3d4b54;
	}

	.range-value {
		flex-shrink: 0;
		margin-left: 16rpx;
		font-size: 25rpx;
		font-weight: 500;
		line-height: 1.2;
		color: #007c77;
	}

	.range-track {
		position: relative;
		height: 72rpx;

		&::before {
			position: absolute;
			top: 50%;
			right: 0;
			left: 0;
			height: 8rpx;
			margin-top: -4rpx;
			background-color: #eef4f3;
			border-radius: 4rpx;
			content: '';
		}

		// 已选中的年限区间
		.range-fill {
			position: absolute;
			top: 50%;
			height: 8rpx;
			margin-top: -4rpx;
			background-color: #007c77;
			border-radius: 4rpx;
		}

		// 把手：left 是百分比刻度，左移自身半径让圆心落在刻度上
		.range-thumb {
			position: absolute;
			top: 50%;
			box-sizing: border-box;
			width: 40rpx;
			height: 40rpx;
			margin: -20rpx 0 0 -20rpx;
			background-color: #ffffff;
			border: 4rpx solid #007c77;
			border-radius: 50%;
			box-shadow: 0 2rpx 8rpx rgba(0, 124, 119, 0.28);
		}
	}

	.range-scale {
		display: flex;
		justify-content: space-between;
		margin-top: 8rpx;
	}

	.range-scale-text {
		font-size: 21rpx;
		line-height: 1.2;
		color: #8a979e;
	}
}
</style>
