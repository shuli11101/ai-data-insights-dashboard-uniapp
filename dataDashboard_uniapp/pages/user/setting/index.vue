<template>
	<view class="setting-page">
		<!-- ===== 顶部导航 ===== -->
		<view class="appbar" :style="{ marginTop: statusBarHeight + 'px' }">
			<view class="back" @click="goBack"></view>
			<text class="appbar-title">设置</text>
		</view>

		<!-- ===== 设置纸 ===== -->
		<view class="sheet">
			<!-- 外观 -->
			<view class="group">
				<text class="group-label">外观</text>
				<view class="segmented">
					<view class="segment segment--active">浅色</view>
					<view class="segment">深色</view>
					<view class="segment">跟随系统</view>
				</view>
				<text class="appearance-hint">深色模式仍在打磨中，欢迎反馈</text>
			</view>

			<!-- 通知 -->
			<view class="group">
				<text class="group-label">通知</text>

				<view class="row">
					<image class="row-icon" src="/static/icon/user/bell.svg" mode="aspectFit" />
					<text class="row-title">允许通知</text>
					<view class="toggle toggle--on">
						<view class="toggle-knob"></view>
					</view>
				</view>

				<view class="row-divider"></view>

				<view class="row">
					<image class="row-icon" src="/static/icon/user/chart-bars.svg" mode="aspectFit" />
					<text class="row-title">分析完成提醒</text>
					<view class="toggle toggle--on">
						<view class="toggle-knob"></view>
					</view>
				</view>

				<view class="row-divider"></view>

				<view class="row">
					<image class="row-icon" src="/static/icon/user/briefcase.svg" mode="aspectFit" />
					<text class="row-title">岗位更新提醒</text>
					<view class="toggle toggle--on">
						<view class="toggle-knob"></view>
					</view>
				</view>
			</view>

			<!-- 通用 -->
			<view class="group">
				<text class="group-label">通用</text>

				<view class="row">
					<image class="row-icon" src="/static/icon/user/trash.svg" mode="aspectFit" />
					<text class="row-title">清除缓存</text>
					<view class="row-right">
						<text class="row-value">18.6 MB</text>
						<view class="chevron"></view>
					</view>
				</view>
			</view>

			<!-- 隐私 -->
			<view class="group">
				<text class="group-label">隐私</text>

				<view class="row">
					<image class="row-icon" src="/static/icon/user/sparkles.svg" mode="aspectFit" />
					<text class="row-title">个性化推荐</text>
					<view class="toggle toggle--on">
						<view class="toggle-knob"></view>
					</view>
				</view>

				<view class="row-divider"></view>

				<view class="row">
					<image class="row-icon" src="/static/icon/user/activity.svg" mode="aspectFit" />
					<text class="row-title">改进产品体验</text>
					<view class="toggle">
						<view class="toggle-knob"></view>
					</view>
				</view>
			</view>

			<!-- 账号 -->
			<view class="group">
				<text class="group-label">账号</text>

				<view class="row">
					<image class="row-icon" src="/static/icon/user/logout.svg" mode="aspectFit" />
					<text class="row-title row-title--danger" @click="logout">退出登录</text>
					<view class="chevron chevron--danger"></view>
				</view>
			</view>

			<text class="footer-version">AI 分析 · v1.4.2</text>
		</view>
	</view>
</template>

<script setup lang="ts">
// 自定义导航栏需自行避开状态栏
const statusBarHeight = uni.getSystemInfoSync().statusBarHeight ?? 0

// 退出登录：清空 token 并跳转登录页
const logout = () => {
	uni.removeStorageSync('token')
	uni.navigateTo({ url: '/pages/login/index' })
}

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
	padding: 32rpx 0 40rpx;

	// ===== 顶部导航 =====
	.appbar {
		position: relative;
		display: flex;
		align-items: center;
		box-sizing: border-box;
		height: 88rpx;
		padding: 0 40rpx;

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

	// ===== 设置纸 =====
	.sheet {
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
		min-height: 70vh;
		margin-top: 24rpx;
		padding: 28rpx 40rpx 48rpx;
		background-color: #ffffff;
		border-radius: 44rpx 44rpx 0 0;
	}

	// ===== 分组 =====
	.group {
		margin-top: 48rpx;

		&:first-child {
			margin-top: 0;
		}

		.group-label {
			display: block;
			margin-bottom: 16rpx;
			font-size: 24rpx;
			font-weight: 600;
			line-height: 1.2;
			letter-spacing: 0.4rpx;
			color: #78868f;
		}
	}

	// ===== 外观分段控件 =====
	.segmented {
		display: flex;
		box-sizing: border-box;
		height: 76rpx;
		padding: 7rpx;
		background-color: #f2f7f6;
		border-radius: 20rpx;

		.segment {
			display: flex;
			align-items: center;
			justify-content: center;
			flex: 1;
			font-size: 25rpx;
			line-height: 1;
			color: #78868f;
			border-radius: 16rpx;
		}

		.segment--active {
			font-weight: 600;
			color: #17252b;
			background-color: #ffffff;
			border: 2rpx solid #d8e4e3;
		}
	}

	.appearance-hint {
		display: block;
		margin-top: 20rpx;
		font-size: 21rpx;
		line-height: 1.3;
		text-align: center;
		color: #8a979e;
	}

	// ===== 列表行 =====
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

			&--danger {
				color: #b94a4a;
			}
		}

		.row-right {
			display: flex;
			align-items: center;
			flex-shrink: 0;
			margin-left: 12rpx;
		}

		.row-value {
			font-size: 23rpx;
			line-height: 1;
			color: #8a979e;
		}
	}

	.row-divider {
		height: 2rpx;
		margin-left: 50rpx;
		background-color: #edf2f2;
	}

	// ===== 开关：仅静态展示 =====
	.toggle {
		position: relative;
		flex-shrink: 0;
		box-sizing: border-box;
		width: 76rpx;
		height: 44rpx;
		background-color: #dde6e7;
		border-radius: 22rpx;

		.toggle-knob {
			position: absolute;
			top: 6rpx;
			left: 6rpx;
			width: 32rpx;
			height: 32rpx;
			background-color: #ffffff;
			border-radius: 50%;
			box-shadow: 0 2rpx 6rpx rgba(10, 10, 10, 0.18);
		}

		&--on {
			background-color: #007c77;

			.toggle-knob {
				left: auto;
				right: 6rpx;
			}
		}
	}

	// ===== 右箭头 =====
	.chevron {
		width: 12rpx;
		height: 12rpx;
		margin-left: 12rpx;
		border-top: 2rpx solid #9aa6ac;
		border-right: 2rpx solid #9aa6ac;
		transform: rotate(45deg);

		&--danger {
			border-color: #bc8d8d;
		}
	}

	// ===== 底部版本号 =====
	.footer-version {
		display: block;
		margin-top: auto;
		padding-top: 48rpx;
		font-size: 20rpx;
		line-height: 1.2;
		text-align: center;
		color: #94a1a7;
	}
}
</style>
