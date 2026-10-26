<template>
	<view class="about-page">
		<!-- ===== 顶部导航 ===== -->
		<view class="appbar" :style="{ marginTop: statusBarHeight + 'px' }">
			<view class="back" @click="goBack"></view>
			<text class="appbar-title">关于</text>
		</view>

		<!-- ===== 品牌 ===== -->
		<view class="brand">
			<image class="brand-mark" src="/static/icon/auth/brand-mark.svg" mode="aspectFit" />
			<text class="brand-name">AI 分析</text>
			<text class="brand-version">版本 1.4.2 · 2026.09</text>

			<view class="latest">
				<view class="latest-check"></view>
				<text class="latest-text">已是最新版本</text>
			</view>
		</view>

		<!-- ===== 支持 ===== -->
		<text class="group-label">支持</text>

		<view class="support-card">
			<view class="list-row">
				<image class="row-icon" src="/static/icon/user/activity.svg" mode="aspectFit" />
				<text class="row-title">检查更新</text>
				<view class="row-right">
					<text class="row-value">已是最新</text>
					<view class="chevron"></view>
				</view>
			</view>

			<view class="row-divider"></view>

			<view class="list-row">
				<image class="row-icon" src="/static/icon/user/document.svg" mode="aspectFit" />
				<text class="row-title">用户协议与隐私</text>
				<view class="row-right">
					<view class="chevron"></view>
				</view>
			</view>

			<view class="row-divider"></view>

			<view class="list-row">
				<image class="row-icon" src="/static/icon/user/info.svg" mode="aspectFit" />
				<text class="row-title">开源许可</text>
				<view class="row-right">
					<view class="chevron"></view>
				</view>
			</view>
		</view>

		<!-- ===== 页脚 ===== -->
		<text class="footer">© 2026 AI 分析 · 保留所有权利</text>
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
	display: flex;
	flex-direction: column;
	box-sizing: border-box;
	width: 100%;
	min-height: 100vh;
	padding: 32rpx 40rpx 40rpx;

	// ===== 顶部导航 =====
	.appbar {
		position: relative;
		display: flex;
		align-items: center;
		box-sizing: border-box;
		height: 88rpx;

		/* 返回：白色圆钮 + 描边箭头 */
		.back {
			display: flex;
			align-items: center;
			justify-content: center;
			flex-shrink: 0;
			box-sizing: border-box;
			width: 74rpx;
			height: 74rpx;
			background-color: #ffffff;
			border: 2rpx solid #d8e2e3;
			border-radius: 50%;

			&::after {
				content: '';
				width: 18rpx;
				height: 18rpx;
				border-left: 3rpx solid #3d4b54;
				border-bottom: 3rpx solid #3d4b54;
				transform: rotate(45deg);
			}
		}

		.appbar-title {
			position: absolute;
			left: 50%;
			font-size: 30rpx;
			font-weight: 600;
			line-height: 1;
			letter-spacing: -0.4rpx;
			color: #17252b;
			transform: translateX(-50%);
		}
	}

	// ===== 品牌 =====
	.brand {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-top: 32rpx;

		.brand-mark {
			width: 128rpx;
			height: 128rpx;
		}

		.brand-name {
			margin-top: 24rpx;
			font-size: 46rpx;
			font-weight: 700;
			line-height: 1.1;
			letter-spacing: -1.2rpx;
			color: #17252b;
		}

		.brand-version {
			margin-top: 12rpx;
			font-size: 21rpx;
			line-height: 1.2;
			color: #8a979e;
		}

		/* 已是最新版本：小对勾 + 文字，不使用胶囊 */
		.latest {
			display: flex;
			align-items: center;
			margin-top: 16rpx;

			.latest-check {
				width: 16rpx;
				height: 9rpx;
				margin-right: 10rpx;
				border-left: 2rpx solid #487c77;
				border-bottom: 2rpx solid #487c77;
				transform: rotate(-45deg);
			}

			.latest-text {
				font-size: 21rpx;
				line-height: 1;
				color: #487c77;
			}
		}
	}

	// ===== 支持 =====
	.group-label {
		display: block;
		margin: 48rpx 0 16rpx;
		font-size: 24rpx;
		font-weight: 600;
		line-height: 1.2;
		letter-spacing: 0.4rpx;
		color: #78868f;
	}

	.support-card {
		box-sizing: border-box;
		padding: 0 40rpx;
		background-color: #ffffff;
		border: 2rpx solid #dde8e7;
		border-radius: 32rpx;
	}

	.list-row {
		display: flex;
		align-items: center;
		height: 110rpx;

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

		.row-right {
			display: flex;
			align-items: center;
			flex-shrink: 0;
			margin-left: 12rpx;
		}

		.row-value {
			font-size: 21rpx;
			line-height: 1;
			color: #8a979e;
		}
	}

	.row-divider {
		height: 2rpx;
		margin-left: 50rpx;
		background-color: #edf2f2;
	}

	.chevron {
		width: 12rpx;
		height: 12rpx;
		margin-left: 12rpx;
		border-top: 2rpx solid #9aa6ac;
		border-right: 2rpx solid #9aa6ac;
		transform: rotate(45deg);
	}

	// ===== 品牌宣言 =====
	.statement {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-top: auto;
		padding-top: 80rpx;

		.statement-title {
			display: block;
			font-size: 42rpx;
			font-weight: 600;
			line-height: 1.5;
			letter-spacing: -0.6rpx;
			text-align: center;
			color: #17252b;
		}

		.statement-desc {
			display: block;
			margin-top: 32rpx;
			font-size: 23rpx;
			line-height: 1.4;
			text-align: center;
			color: #65747c;
		}
	}

	// ===== 页脚 =====
	.footer {
		display: block;
		margin-top: 40rpx;
		font-size: 20rpx;
		line-height: 1.4;
		text-align: center;
		color: #8a979e;
	}
}
</style>
