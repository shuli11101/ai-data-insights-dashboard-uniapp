<template>
	<!-- 首页搜索入口栏：正常占据文档流，点击后由父页面滑入搜索页 -->
	<view class="search-bar">
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
		<view class="navbar">
			<view class="search" @click="emit('open')">
				<view class="search-icon"></view>
				<text class="search-tip">搜索岗位、公司</text>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
// 点击入口栏时抛出 open，跳转逻辑交给父页面
const emit = defineEmits<{ open: [] }>()

const statusBarHeight = uni.getSystemInfoSync().statusBarHeight ?? 0
</script>

<style lang="scss" scoped>
.search-bar {
	width: 100%;

	.navbar {
		display: flex;
		align-items: center;
		padding: 12rpx 0 20rpx;
		height: 120rpx;

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

			/* 放大镜：圆 + 45° 手柄 */
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

			/* 占位文字：视觉与搜索页 input 的 placeholder 一致 */
			.search-tip {
				margin-left: 20rpx;
				font-size: 28rpx;
				line-height: 1;
				color: #9aa0a6;
			}
		}
	}
}
</style>
