<template>
	<view class="setting-page">
		<!-- ===== 顶部导航 ===== -->
		<view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="back-btn" @click="goBack">
				<image class="back-icon" src="/static/icon/user/back.svg" mode="aspectFit" />
			</view>
			<text class="page-title">设置</text>
		</view>

		<!-- ===== 外观 ===== -->
		<view class="section-head section-head--first">
			<text class="section-title">外观</text>
		</view>

		<view class="appearance-card">
			<view class="segmented">
				<view class="segment segment--active">浅色</view>
				<view class="segment">深色</view>
				<view class="segment">跟随系统</view>
			</view>
			<text class="appearance-hint">深色模式仍在打磨中，欢迎反馈</text>
		</view>

		<!-- ===== 通知 ===== -->
		<view class="section-head">
			<text class="section-title">通知</text>
		</view>

		<view class="list-card">
			<view class="list-row">
				<view class="row-icon">
					<image class="row-icon-img" src="/static/icon/user/bell.svg" mode="aspectFit" />
				</view>
				<text class="row-title">允许通知</text>
				<view class="toggle toggle--on">
					<view class="toggle-knob"></view>
				</view>
			</view>

			<view class="row-divider"></view>

			<view class="list-row">
				<view class="row-icon">
					<image class="row-icon-img" src="/static/icon/user/chart-bars.svg" mode="aspectFit" />
				</view>
				<text class="row-title">分析完成提醒</text>
				<view class="toggle toggle--on">
					<view class="toggle-knob"></view>
				</view>
			</view>

			<view class="row-divider"></view>

			<view class="list-row">
				<view class="row-icon">
					<image class="row-icon-img" src="/static/icon/user/briefcase.svg" mode="aspectFit" />
				</view>
				<text class="row-title">岗位更新提醒</text>
				<view class="toggle toggle--on">
					<view class="toggle-knob"></view>
				</view>
			</view>
		</view>

		<!-- ===== 通用 ===== -->
		<view class="section-head">
			<text class="section-title">通用</text>
		</view>

		<view class="list-card">
			<view class="row-divider"></view>

			<view class="list-row">
				<view class="row-icon">
					<image class="row-icon-img" src="/static/icon/user/trash.svg" mode="aspectFit" />
				</view>
				<text class="row-title">清除缓存</text>
				<view class="row-right">
					<text class="row-value">18.6 MB</text>
					<view class="chevron"></view>
				</view>
			</view>
		</view>

		<!-- ===== 隐私 ===== -->
		<view class="section-head">
			<text class="section-title">隐私</text>
		</view>

		<view class="list-card">
			<view class="list-row">
				<view class="row-icon">
					<image class="row-icon-img" src="/static/icon/user/sparkles.svg" mode="aspectFit" />
				</view>
				<text class="row-title">个性化推荐</text>
				<view class="toggle toggle--on">
					<view class="toggle-knob"></view>
				</view>
			</view>

			<view class="row-divider"></view>

			<view class="list-row">
				<view class="row-icon">
					<image class="row-icon-img" src="/static/icon/user/activity.svg" mode="aspectFit" />
				</view>
				<text class="row-title">改进产品体验</text>
				<view class="toggle">
					<view class="toggle-knob"></view>
				</view>
			</view>
		</view>

		<!-- ===== 账号 ===== -->
		<view class="section-head">
			<text class="section-title">账号</text>
		</view>

		<view class="list-card">
			<view class="list-row">
				<view class="row-icon">
					<image class="row-icon-img" src="/static/icon/user/logout.svg" mode="aspectFit" />
				</view>
				<text class="row-title row-title--danger">退出登录</text>
				<view class="chevron"></view>
			</view>
		</view>

		<text class="footer-version">AI 分析 · v1.4.2</text>
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
.setting-page {
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

	// ===== 分组标题 =====
	.section-head {
		margin: 32rpx 0 16rpx;

		&--first {
			margin-top: 24rpx;
		}

		.section-title {
			font-size: 30rpx;
			font-weight: 600;
			line-height: 1.1;
			color: #0a0a0a;
		}
	}

	// ===== 外观 =====
	.appearance-card {
		box-sizing: border-box;
		padding: 18rpx 20rpx 20rpx;
		background-color: #ffffff;
		border: 2rpx solid #e8ecf3;
		border-radius: 28rpx;
		box-shadow: 0 6rpx 24rpx rgba(15, 23, 42, 0.04);

		.segmented {
			display: flex;
			box-sizing: border-box;
			height: 64rpx;
			padding: 5rpx;
			background-color: #f6f6f8;
			border-radius: 18rpx;
		}

		.segment {
			display: flex;
			align-items: center;
			justify-content: center;
			flex: 1;
			font-size: 21rpx;
			line-height: 1;
			color: #8a8a91;
			border-radius: 14rpx;
		}

		.segment--active {
			font-weight: 600;
			color: #0a0a0a;
			background-color: #ffffff;
			box-shadow: 0 2rpx 6rpx rgba(10, 10, 10, 0.1);
		}

		.appearance-hint {
			display: block;
			margin-top: 14rpx;
			font-size: 19rpx;
			line-height: 1.3;
			text-align: center;
			color: #a8a8ae;
		}
	}

	// ===== 设置列表 =====
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

			&--danger {
				color: #c53b32;
			}
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
	}

	// 开关：仅静态展示
	.toggle {
		position: relative;
		flex-shrink: 0;
		box-sizing: border-box;
		width: 84rpx;
		height: 48rpx;
		background-color: #e9e9ec;
		border-radius: 24rpx;

		.toggle-knob {
			position: absolute;
			top: 4rpx;
			left: 4rpx;
			width: 40rpx;
			height: 40rpx;
			background-color: #ffffff;
			border-radius: 50%;
			box-shadow: 0 2rpx 6rpx rgba(10, 10, 10, 0.22);
		}

		&--on {
			background-color: #0a0a0a;

			.toggle-knob {
				left: auto;
				right: 4rpx;
			}
		}
	}

	// 右箭头
	.chevron {
		width: 10rpx;
		height: 10rpx;
		margin-left: 10rpx;
		border-top: 2rpx solid #a8a8ae;
		border-right: 2rpx solid #a8a8ae;
		transform: rotate(45deg);
	}

	// ===== 底部版本号 =====
	.footer-version {
		display: block;
		margin-top: 30rpx;
		font-size: 19rpx;
		line-height: 1.2;
		text-align: center;
		color: #a8a8ae;
	}
}
</style>
