<template>
	<!-- 首页搜索入口栏：正常占据文档流，点击后由父页面滑入搜索页 -->
	<view class="search-bar">
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

		<!-- 筛选框 -->
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
const emit = defineEmits<{ open: []; filter: [] }>()

const statusBarHeight = uni.getSystemInfoSync().statusBarHeight ?? 0
</script>

<style lang="scss" scoped>
.search-bar {
	width: 100%;

	// 页面标题行
	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 8rpx 0 20rpx;

		.page-title {
			font-size: 44rpx;
			font-weight: 700;
			line-height: 1.1;
			letter-spacing: 0.2rpx;
			color: #0a0a0a;
		}
	}

	// 筛选按钮：黑色圆形 + 白色滑杆图标
	.filter-btn {
		position: relative;
		flex-shrink: 0;
		width: 72rpx;
		height: 72rpx;
		background-color: #0a0a0a;
		border-radius: 50%;
		box-shadow: 0 8rpx 18rpx rgba(10, 10, 10, 0.18);
	}

	.filter-line {
		position: absolute;
		left: 20rpx;
		width: 32rpx;
		height: 2rpx;
		background-color: #ffffff;
		border-radius: 2rpx;

		&--top {
			top: 27rpx;
		}

		&--bottom {
			top: 43rpx;
		}
	}

	.filter-knob {
		position: absolute;
		box-sizing: border-box;
		width: 10rpx;
		height: 10rpx;
		background-color: #0a0a0a;
		border: 2rpx solid #ffffff;
		border-radius: 50%;

		&--top {
			top: 23rpx;
			left: 24rpx;
		}

		&--bottom {
			top: 39rpx;
			right: 24rpx;
		}
	}

	.navbar {
		padding-bottom: 24rpx;

		.search {
			display: flex;
			align-items: center;
			box-sizing: border-box;
			width: 100%;
			height: 72rpx;
			padding: 0 24rpx;
			background-color: #ffffff;
			border: 2rpx solid #e8ecf3;
			border-radius: 26rpx;
			box-shadow: 0 4rpx 16rpx rgba(15, 23, 42, 0.03);

			/* 放大镜：圆 + 45° 手柄 */
			.search-icon {
				position: relative;
				flex-shrink: 0;
				width: 18rpx;
				height: 18rpx;
				border: 3rpx solid #9da5b2;
				border-radius: 50%;

				&::after {
					content: '';
					position: absolute;
					right: -6rpx;
					bottom: -5rpx;
					width: 9rpx;
					height: 3rpx;
					background-color: #9da5b2;
					border-radius: 3rpx;
					transform: rotate(45deg);
				}
			}

			/* 占位文字：视觉与搜索页 input 的 placeholder 一致 */
			.search-tip {
				margin-left: 20rpx;
				font-size: 26rpx;
				line-height: 1;
				color: #a6adb8;
			}
		}
	}
}
</style>
