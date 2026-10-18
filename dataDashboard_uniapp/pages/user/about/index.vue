<template>
	<view class="about-page">
		<!-- ===== 顶部导航 ===== -->
		<view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="back-btn" @click="goBack">
				<image class="back-icon" src="/static/icon/user/back.svg" mode="aspectFit" />
			</view>
			<text class="page-title">关于</text>
		</view>

		<!-- ===== 品牌信息 ===== -->
		<view class="brand">
			<view class="brand-logo">
				<image class="brand-logo-icon" src="/static/icon/user/users-white.svg" mode="aspectFit" />
			</view>
			<text class="brand-name">关于我们</text>
			<text class="brand-version">版本 1.4.2（2026.09）</text>

			<view class="latest-pill">
				<image class="latest-icon" src="/static/icon/user/check.svg" mode="aspectFit" />
				<text class="latest-text">已是最新版本</text>
			</view>
		</view>

		<!-- ===== 支持 ===== -->
		<view class="section-head">
			<text class="section-title">支持</text>
		</view>

		<view class="list-card">
			<view class="list-row">
				<view class="row-icon">
					<image class="row-icon-img" src="/static/icon/user/activity.svg" mode="aspectFit" />
				</view>
				<text class="row-title">检查更新</text>
				<view class="row-right">
					<text class="row-value">已是最新</text>
					<view class="chevron"></view>
				</view>
			</view>

			<view class="row-divider"></view>

			<view class="list-row">
				<view class="row-icon">
					<image class="row-icon-img" src="/static/icon/user/document.svg" mode="aspectFit" />
				</view>
				<text class="row-title">用户协议与隐私</text>
				<view class="chevron"></view>
			</view>

			<view class="row-divider"></view>

			<view class="list-row">
				<view class="row-icon">
					<image class="row-icon-img" src="/static/icon/user/info.svg" mode="aspectFit" />
				</view>
				<text class="row-title">开源许可</text>
				<view class="chevron"></view>
			</view>
		</view>

		<!-- ===== 页脚 ===== -->
		<view class="footer">
			<text class="footer-text">© 2026 AI 分析 · 保留所有权利</text>
			<text class="footer-text">为认真打磨技术的人而设计</text>
		</view>
	</view>
</template>

<script setup lang="ts">
// 自定义导航栏需自行避开状态栏
const statusBarHeight = uni.getSystemInfoSync().statusBarHeight ?? 0

// 返回上一页
const goBack = () => {
	uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.about-page {
	box-sizing: border-box;
	width: 100%;
	min-height: 100vh;
	padding: 36rpx 24rpx 40rpx;
	background-color: #ffffff;

	// ===== 顶部导航 =====
	.header {
		display: flex;
		align-items: center;
		padding-bottom: 16rpx;

		.back-btn {
			display: flex;
			align-items: center;
			justify-content: center;
			flex-shrink: 0;
			box-sizing: border-box;
			width: 68rpx;
			height: 68rpx;
			background-color: #ffffff;
			border: 2rpx solid #e8ecf3;
			border-radius: 50%;
		}

		.back-icon {
			width: 30rpx;
			height: 30rpx;
		}

		.page-title {
			margin-left: 16rpx;
			font-size: 34rpx;
			font-weight: 600;
			line-height: 1.1;
			letter-spacing: 0.2rpx;
			color: #0a0a0a;
		}
	}

	// ===== 品牌信息 =====
	.brand {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-top: 24rpx;

		.brand-logo {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 124rpx;
			height: 124rpx;
			background-color: #0a0a0a;
			border-radius: 38rpx;
			box-shadow: 0 16rpx 36rpx rgba(10, 10, 10, 0.18);
		}

		.brand-logo-icon {
			width: 52rpx;
			height: 52rpx;
		}

		.brand-name {
			margin-top: 20rpx;
			font-size: 38rpx;
			font-weight: 700;
			line-height: 1.1;
			letter-spacing: 0.2rpx;
			color: #0a0a0a;
		}

		.brand-version {
			margin-top: 10rpx;
			font-size: 19rpx;
			line-height: 1.2;
			color: #a8a8ae;
		}

		// 已是最新版本胶囊
		.latest-pill {
			display: flex;
			align-items: center;
			box-sizing: border-box;
			height: 38rpx;
			margin-top: 14rpx;
			padding: 0 16rpx;
			background-color: #f5f5f7;
			border-radius: 19rpx;
		}

		.latest-icon {
			width: 17rpx;
			height: 17rpx;
			margin-right: 7rpx;
		}

		.latest-text {
			font-size: 18rpx;
			line-height: 1;
			color: #8a8a91;
		}
	}

	// ===== 分组标题 =====
	.section-head {
		margin: 36rpx 0 16rpx;

		.section-title {
			font-size: 30rpx;
			font-weight: 600;
			line-height: 1.1;
			color: #0a0a0a;
		}
	}

	// ===== 支持列表 =====
	.list-card {
		box-sizing: border-box;
		padding: 0 24rpx;
		background-color: #ffffff;
		border: 2rpx solid #e8ecf3;
		border-radius: 28rpx;
		box-shadow: 0 6rpx 24rpx rgba(15, 23, 42, 0.04);
		overflow: hidden;

		.list-row {
			display: flex;
			align-items: center;
			height: 100rpx;
		}

		.row-icon {
			display: flex;
			align-items: center;
			justify-content: center;
			flex-shrink: 0;
			width: 64rpx;
			height: 64rpx;
			background-color: #f5f5f7;
			border-radius: 50%;
		}

		.row-icon-img {
			width: 30rpx;
			height: 30rpx;
		}

		.row-title {
			flex: 1;
			min-width: 0;
			margin-left: 18rpx;
			font-size: 28rpx;
			font-weight: 500;
			line-height: 1.2;
			color: #0a0a0a;
		}

		.row-right {
			display: flex;
			align-items: center;
			flex-shrink: 0;
			margin-left: 12rpx;
		}

		.row-value {
			font-size: 22rpx;
			line-height: 1;
			color: #8a8a91;
		}

		.row-divider {
			height: 2rpx;
			margin-left: 82rpx;
			background-color: #f0f0f2;
		}

		.chevron {
			flex-shrink: 0;
			width: 10rpx;
			height: 10rpx;
			margin-left: 10rpx;
			border-top: 2rpx solid #a8a8ae;
			border-right: 2rpx solid #a8a8ae;
			transform: rotate(45deg);
		}
	}

	// ===== 页脚 =====
	.footer {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-top: 32rpx;

		.footer-text {
			font-size: 19rpx;
			line-height: 1.9;
			color: #a8a8ae;
		}
	}
}
</style>
