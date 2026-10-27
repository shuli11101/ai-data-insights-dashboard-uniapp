<template>
	<!-- 薪资：两列 picker（月薪 / 薪数） -->
	<picker class="salary-picker" mode="multiSelector" :range="ranges" :value="indexes" @change="onChange">
		<view class="salary-row">
			<text class="salary-label">{{ title }}</text>
			<text class="salary-value">{{ text }}</text>
			<view class="salary-arrow"></view>
		</view>
	</picker>
</template>

<script lang="ts">
/** 薪资：默认按月薪（单位 K）+ 薪数存储 */
export interface SalarySelection {
	salary: number
	months: number
}

/** 可选月薪档位：1K ~ 100K 的每一档 */
export const SALARY_OPTIONS = Array.from({ length: 100 }, (_, index) => index + 1)
/** 可选薪数 */
export const MONTH_OPTIONS = [12, 13, 14, 15, 16]

/** 取最接近的月薪档位：后端返回任意金额时也能对齐到 picker 档位 */
export const nearestSalaryOption = (value: number) =>
	SALARY_OPTIONS.reduce((best, option) =>
		Math.abs(option - value) < Math.abs(best - value) ? option : best
	)
</script>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
	/** 当前薪资 */
	modelValue: SalarySelection
	/** 行标题 */
	title: string
	/** 展示模式：月薪直接显示 K，年薪按月薪 × 薪数换算成万 */
	mode: 'month' | 'year'
}>()

const emit = defineEmits<{
	(e: 'update:modelValue', value: SalarySelection): void
}>()

// picker 两列：月薪 / 薪数
const ranges = computed(() => [
	SALARY_OPTIONS.map((value) => `${value}K`),
	MONTH_OPTIONS.map((value) => `${value}薪`)
])

// 当前值对应的列索引，取不到时用 0
const indexOf = (options: number[], value: number) => Math.max(options.indexOf(value), 0)

const indexes = computed(() => [
	indexOf(SALARY_OPTIONS, props.modelValue.salary),
	indexOf(MONTH_OPTIONS, props.modelValue.months)
])

// 年薪 = 月薪 × 薪数，单位换算成万（20K × 14 = 28 万）
const toWan = (value: number) => Number((value / 10).toFixed(1))

// 展示文案
const text = computed(() => {
	const { salary, months } = props.modelValue
	if (props.mode === 'year') {
		return `${toWan(salary * months)} 万/年`
	}
	return `${salary}K · ${months}薪`
})

const onChange = (e: { detail: { value: number[] } }) => {
	const [salaryIndex, monthIndex] = e.detail.value
	emit('update:modelValue', {
		salary: SALARY_OPTIONS[salaryIndex],
		months: MONTH_OPTIONS[monthIndex]
	})
}
</script>

<style lang="scss" scoped>
.salary-picker {
	display: block;
}

.salary-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 88rpx;

	.salary-label {
		font-size: 27rpx;
		line-height: 1.2;
		color: #3d4b54;
	}

	.salary-value {
		font-size: 26rpx;
		font-weight: 500;
		line-height: 1.2;
		color: #007c77;
	}

	.salary-arrow {
		flex-shrink: 0;
		width: 12rpx;
		height: 12rpx;
		margin-left: 14rpx;
		border-top: 2rpx solid #9aa6ac;
		border-right: 2rpx solid #9aa6ac;
		transform: rotate(45deg);
	}
}
</style>
