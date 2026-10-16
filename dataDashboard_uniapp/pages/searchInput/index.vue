<template>
	<view class="search-page" :style="{ paddingTop: statusBarHeight + 'px' }">
		<view class="navbar">
			<!-- 返回上一页（首页） -->
			<image class="back-btn" src="/static/icon/aiAnalyse/back.svg" mode="aspectFit" @click="onBack" />

			<view class="search">
				<view class="search-icon"></view>
				<input class="search-input" v-model="keyword" type="text" confirm-type="search" :focus="true"
					placeholder="搜索岗位、公司" placeholder-class="search-placeholder" @confirm="onSearch" />
				<!-- 关键词非空时显示清除按钮 -->
				<view class="search-clear" v-if="keyword" @click="keyword = ''"></view>
			</view>

			<text class="search-action" @click="onSearch">搜索</text>
		</view>
	</view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 状态栏高度：自定义导航栏用它做顶部留白（H5 端没有状态栏，取 12px 保底）
const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 12

// 搜索关键词
const keyword = ref('')

// 返回上一页（首页）
const onBack = () => {
	uni.navigateBack()
}

// 搜索：带关键词跳到搜索结果页，保留本页在栈里，结果页返回时能回到这里
const onSearch = () => {
	uni.navigateTo({
		url: '/pages/searchList/index?keyword=' + encodeURIComponent(keyword.value.trim())
	})
}
</script>

<style lang="scss">
/* 搜索框占位符：placeholder-class 需为独立类名，不能嵌套在页面根类里 */
.search-placeholder {
	font-size: 28rpx;
	color: #9aa0a6;
}

.search-page {
	box-sizing: border-box;
	min-height: 100vh;
	padding: 0 24rpx;
	background-color: #f8f8f8;

	/* 搜索栏：与首页入口栏同高，跳转前后视觉不跳 */
	.navbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12rpx 0 20rpx;
		height: 120rpx;

		.back-btn {
			flex-shrink: 0;
			width: 64rpx;
			height: 64rpx;
			margin-right: 12rpx;
		}

		/* 搜索框：撑满标题栏，展开时能压缩，给右侧「搜索」让位 */
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

			.search-input {
				flex: 1;
				min-width: 0;
				margin-left: 20rpx;
				font-size: 28rpx;
				color: #0a0a0a;
			}

			/* 清除按钮：两条 45° 线拼成 × */
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

		/* 搜索按钮 */
		.search-action {
			flex-shrink: 0;
			margin-left: 20rpx;
			font-size: 28rpx;
			line-height: 1;
			color: #0a0a0a;
		}
	}
}
</style>
