<template>
	<!-- 原生底部选择器 + 表单行 -->
	<picker class="picker-row" mode="selector" :range="options" :value="selectedIndex" @change="onChange">
		<view class="row">
			<image class="row-icon" :src="icon" mode="aspectFit" />
			<text class="row-title">{{ title }}</text>
			<text class="row-value" :class="{ 'is-placeholder': !modelValue }">
				{{ modelValue || placeholder }}
			</text>
			<view class="row-arrow"></view>
		</view>
	</picker>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
	defineProps<{
		/** 当前选中的值 */
		modelValue: string
		/** 可选项，顺序即 picker 的索引 */
		options: string[]
		/** 行标题 */
		title: string
		/** 行图标 */
		icon: string
		/** 未选择时的占位文案 */
		placeholder?: string
	}>(),
	{
		placeholder: '请选择'
	}
)

const emit = defineEmits<{
	(e: 'update:modelValue', value: string): void
}>()

// 未选择或值不在选项里时默认第一项
const selectedIndex = computed(() => Math.max(props.options.indexOf(props.modelValue), 0))

const onChange = (e: { detail: { value: string | number } }) => {
	emit('update:modelValue', props.options[Number(e.detail.value)])
}
</script>

<style lang="scss" scoped>
.picker-row {
	display: block;
}

.row {
	display: flex;
	align-items: center;
	height: 112rpx;

	.row-icon {
		flex-shrink: 0;
		width: 30rpx;
		height: 30rpx;
	}

	.row-title {
		flex: 1;
		min-width: 0;
		margin-left: 20rpx;
		font-size: 27rpx;
		line-height: 1.2;
		color: #3d4b54;
	}

	.row-value {
		flex-shrink: 0;
		margin-left: 16rpx;
		font-size: 25rpx;
		font-weight: 500;
		line-height: 1.2;
		color: #3d4b54;

		// 未选择时用浅色提示
		&.is-placeholder {
			font-weight: 400;
			color: #a1acb3;
		}
	}

	// 右箭头：提示可点击展开
	.row-arrow {
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
