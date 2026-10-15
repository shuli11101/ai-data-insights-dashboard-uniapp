<template>
	<view class="search-wrap">
		<!-- 页面内搜索栏：正常占据文档流，点击后展开搜索浮层 -->
		<view class="search-bar" v-if="showBar">
			<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
			<view class="navbar">
				<view class="search" @click="onOpen">
					<view class="search-icon"></view>
					<text class="search-tip">搜索岗位、公司</text>
				</view>
			</view>
		</view>

		<!-- 搜索浮层：收起时停在屏幕右侧外，展开时滑入 -->
		<view class="search-overlay" :class="{ 'search-overlay-active': isActive }">
			<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
			<view class="navbar">
				<image class="back-btn" src="/static/icon/aiAnalyse/back.svg" mode="aspectFit" @click="onClose" />
				<view class="search">
					<view class="search-icon"></view>
					<input class="search-input" v-model="keyword" type="text" confirm-type="search" :focus="isActive"
						placeholder="搜索岗位、公司" placeholder-class="search-placeholder" @confirm="onSearch" />
					<!-- 关键词非空时显示清除按钮 -->
					<view class="search-clear" v-if="keyword" @click="keyword = ''"></view>
				</view>
				<text class="search-action" @click="onSearch">搜索</text>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{ search: [keyword: string] }>()

// showBar：是否渲染文档流里的入口栏。搜索结果页只借用浮层，传 false
withDefaults(defineProps<{ showBar?: boolean }>(), { showBar: true })

// 搜索关键词
const keyword = ref('')

// 搜索浮层是否展开
const isActive = ref(false)

const statusBarHeight = uni.getSystemInfoSync().statusBarHeight ?? 0

// 点击搜索框：展开浮层
const onOpen = () => {
	isActive.value = true
}

// 返回：收起浮层
const onClose = () => {
	isActive.value = false
}

// 搜索：抛出关键词并收起浮层（父组件会刷新列表）
const onSearch = () => {
	emit('search', keyword.value.trim())
	isActive.value = false
}

// 供父页面主动展开 / 收起浮层（搜索结果页点自己的搜索框时会调用 open）
defineExpose({ open: onOpen, close: onClose })
</script>

<style lang="scss" scoped>
// 页面内搜索栏：高度与浮层保持一致，展开前后下方内容不会跳动
.search-bar {
	width: 100%;
}

// 搜索浮层：收起时整体移出屏幕右侧，展开时滑入
.search-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 999;
	// border-box：左右内边距才算在 100% 里，否则盒子会宽出屏幕
	box-sizing: border-box;
	padding: 0 24rpx;
	background-color: #f8f8f8;
	transform: translateX(100%);
	transition: transform 0.3s ease;
}

.search-overlay-active {
	transform: translateX(0);
}


// 搜索栏
.navbar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 12rpx 0 20rpx;
	height: 120rpx;

	// 返回按钮：收起浮层
	.back-btn {
		flex-shrink: 0;
		width: 64rpx;
		height: 64rpx;
		margin-right: 12rpx;
	}

	// 搜索框：撑满标题栏；展开时能压缩，给右侧「搜索」让位
	.search {
		display: flex;
		align-items: center;
		box-sizing: border-box;
		flex: 1;
		min-width: 0;
		height: 76rpx;
		padding: 0 24rpx;
		background-color: #f5f5f5;
		border-radius: 38rpx;

		// 放大镜：圆 + 45° 手柄
		.search-icon {
			position: relative;
			flex-shrink: 0;
			width: 18rpx;
			height: 18rpx;
			border: 3rpx solid #737373;
			border-radius: 50%;

			&::after {
				content: '';
				position: absolute;
				right: -6rpx;
				bottom: -5rpx;
				width: 9rpx;
				height: 3rpx;
				background-color: #737373;
				border-radius: 3rpx;
				transform: rotate(45deg);
			}
		}

		// 未展开时冒充占位文字，视觉与 input 的 placeholder 一致
		.search-tip {
			margin-left: 20rpx;
			font-size: 28rpx;
			line-height: 1;
			color: #9aa0a6;
		}

		.search-input {
			flex: 1;
			min-width: 0;
			margin-left: 20rpx;
			font-size: 28rpx;
			color: #0a0a0a;
		}

		// 清除按钮：两条 45° 线拼成 ×
		.search-clear {
			position: relative;
			flex-shrink: 0;
			width: 26rpx;
			height: 26rpx;
			margin-left: 16rpx;

			&::before,
			&::after {
				content: '';
				position: absolute;
				top: 50%;
				left: 50%;
				width: 26rpx;
				height: 3rpx;
				background-color: #a3a3a3;
				border-radius: 3rpx;
			}

			&::before {
				transform: translate(-50%, -50%) rotate(45deg);
			}

			&::after {
				transform: translate(-50%, -50%) rotate(-45deg);
			}
		}
	}

	// 搜索按钮：仅浮层里有
	.search-action {
		flex-shrink: 0;
		margin-left: 20rpx;
		font-size: 28rpx;
		line-height: 1;
		color: #0a0a0a;
	}
}
</style>
