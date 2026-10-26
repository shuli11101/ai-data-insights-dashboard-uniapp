<template>
	<view class="user-page">
		<!-- ===== 页头：标题 + 设置入口 ===== -->
		<view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="header-text">
				<text class="page-title">个人中心</text>
				<text class="page-subtitle">管理资料、偏好与账号</text>
			</view>

			<view @click="navigateToSettings" class="settings-btn">
				<image class="settings-icon" src="/static/icon/user/settings.svg" mode="aspectFit" />
			</view>
		</view>

		<!-- ===== 资料卡 ===== -->
		<view class="profile-card">
			<view class="profile-top">
				<view class="avatar">
					<text class="avatar-text">陈</text>
				</view>

				<view class="profile-info">
					<view class="name-row">
						<text class="name">陈默</text>
						<view class="status-pill">
							<view class="status-dot"></view>
							<text class="status-text">求职中</text>
						</view>
					</view>
					<text class="profile-meta">前端工程师 · 3–5 年 · 上海</text>
				</view>

				<view class="edit-pill">
					<image class="edit-icon" src="/static/icon/user/edit.svg" mode="aspectFit" />
					<text class="edit-text">编辑</text>
				</view>
			</view>

			<view class="stats">
				<view class="stat">
					<text class="stat-value">7</text>
					<text class="stat-label">分析报告</text>
				</view>
				<view class="stat-divider"></view>
				<view class="stat">
					<text class="stat-value stat-value--accent">84<text class="stat-unit">%</text></text>
					<text class="stat-label">平均匹配</text>
				</view>
				<view class="stat-divider"></view>
				<view class="stat">
					<text class="stat-value">8</text>
					<text class="stat-label">收藏职位</text>
				</view>
			</view>
		</view>

		<!-- ===== 快捷入口 ===== -->
		<view class="quick-actions">
			<view class="action">
				<view class="action-icon">
					<image class="action-icon-img" src="/static/icon/user/edit.svg" mode="aspectFit" />
				</view>
				<view class="action-text">
					<text class="action-title">编辑资料</text>
					<text class="action-desc">头像、昵称与联系方式</text>
				</view>
			</view>

			<view class="action-divider"></view>

			<view @click="navigateToPersonal" class="action">
				<view class="action-icon">
					<image class="action-icon-img" src="/static/icon/user/sliders.svg" mode="aspectFit" />
				</view>
				<view class="action-text">
					<text class="action-title">偏好设置</text>
					<text class="action-desc">求职意向与个人信息</text>
				</view>
			</view>
		</view>

		<!-- ===== 设置 ===== -->
		<view class="section-head">
			<text class="section-title">设置</text>
		</view>

		<view class="list-card">
			<view class="list-row">
				<image class="row-icon" src="/static/icon/user/bell.svg" mode="aspectFit" />
				<text class="row-title">通知提醒</text>
				<view class="toggle toggle--on">
					<view class="toggle-knob"></view>
				</view>
			</view>

			<view class="row-divider"></view>

			<view class="list-row">
				<image class="row-icon" src="/static/icon/user/moon.svg" mode="aspectFit" />
				<text class="row-title">深色模式</text>
				<view class="toggle">
					<view class="toggle-knob"></view>
				</view>
			</view>

			<view class="row-divider"></view>

			<view class="list-row">
				<image class="row-icon" src="/static/icon/user/globe.svg" mode="aspectFit" />
				<text class="row-title">语言</text>
				<view class="row-right">
					<text class="row-value">简体中文</text>
					<view class="chevron"></view>
				</view>
			</view>

			<view class="row-divider"></view>

			<view class="list-row">
				<image class="row-icon" src="/static/icon/user/trash.svg" mode="aspectFit" />
				<text class="row-title">清除缓存</text>
				<view class="row-right">
					<text class="row-value">18.6 MB</text>
					<view class="chevron"></view>
				</view>
			</view>
		</view>

		<!-- ===== 关于 ===== -->
		<view class="section-head">
			<text class="section-title">关于</text>
		</view>

		<view class="list-card">
			<view class="list-row">
				<image class="row-icon" src="/static/icon/user/info.svg" mode="aspectFit" />
				<text class="row-title">版本</text>
				<text class="row-value">1.4.2</text>
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

			<view @click="navigateToAbout" class="list-row">
				<image class="row-icon" src="/static/icon/user/sparkles.svg" mode="aspectFit" />
				<text class="row-title">关于我们</text>
				<view class="row-right">
					<view class="chevron"></view>
				</view>
			</view>
		</view>

		<!-- ===== 隐私说明 ===== -->
		<view class="privacy-note">
			<image class="privacy-icon" src="/static/icon/user/lock.svg" mode="aspectFit" />
			<text class="privacy-text">账号信息仅用于求职分析与服务</text>
		</view>
	</view>
</template>

<script setup lang="ts">
// 自定义导航栏需自行避开状态栏
const statusBarHeight = uni.getSystemInfoSync().statusBarHeight ?? 0

// 跳转偏好设置
const navigateToPersonal = () => {
	uni.navigateTo({
		url: '/pages/personal/index'
	})
}

// 跳转设置
const navigateToSettings = () => {
	uni.navigateTo({
		url: '/pages/user/setting/index'
	})
}

// 跳转关于
const navigateToAbout = () => {
	uni.navigateTo({
		url: '/pages/user/about/index'
	})
}
</script>

<style lang="scss" scoped>
.user-page {
	box-sizing: border-box;
	width: 100%;
	min-height: 100vh;
	padding: 24rpx 40rpx 160rpx;

	// ===== 页头 =====
	.header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		padding-bottom: 40rpx;

		.header-text {
			min-width: 0;
		}

		.page-title {
			display: block;
			font-size: 54rpx;
			font-weight: 700;
			line-height: 1.1;
			letter-spacing: -1.8rpx;
			color: #17252b;
		}

		.page-subtitle {
			display: block;
			margin-top: 10rpx;
			font-size: 23rpx;
			line-height: 1.2;
			color: #65747c;
		}

		// 设置入口：白色描边圆钮
		.settings-btn {
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
		}

		.settings-icon {
			width: 32rpx;
			height: 32rpx;
		}
	}

	// ===== 资料卡 =====
	.profile-card {
		box-sizing: border-box;
		padding: 36rpx 32rpx 0;
		background-color: #ffffff;
		border: 2rpx solid #e3ebec;
		border-radius: 32rpx;

		.profile-top {
			display: flex;
			align-items: flex-start;
			box-sizing: border-box;
			padding-bottom: 36rpx;
		}

		// 头像：浅青底 + 姓名首字
		.avatar {
			display: flex;
			align-items: center;
			justify-content: center;
			flex-shrink: 0;
			box-sizing: border-box;
			width: 116rpx;
			height: 116rpx;
			background-color: #e8f7f4;
			border: 2rpx solid #d3eae6;
			border-radius: 50%;

			.avatar-text {
				font-size: 46rpx;
				font-weight: 600;
				line-height: 1;
				color: #007c77;
			}
		}

		.profile-info {
			flex: 1;
			min-width: 0;
			margin-left: 28rpx;
			padding-top: 6rpx;
		}

		.name-row {
			display: flex;
			align-items: center;
		}

		.name {
			font-size: 40rpx;
			font-weight: 700;
			line-height: 1.1;
			letter-spacing: -0.8rpx;
			color: #17252b;
		}

		// 求职状态胶囊
		.status-pill {
			display: flex;
			align-items: center;
			flex-shrink: 0;
			height: 38rpx;
			margin-left: 14rpx;
			padding: 0 16rpx;
			background-color: #e8f7f4;
			border-radius: 19rpx;

			.status-dot {
				width: 8rpx;
				height: 8rpx;
				background-color: #00b7ad;
				border-radius: 50%;
			}

			.status-text {
				margin-left: 8rpx;
				font-size: 19rpx;
				font-weight: 500;
				line-height: 1;
				color: #007c77;
			}
		}

		.profile-meta {
			display: block;
			margin-top: 12rpx;
			font-size: 23rpx;
			line-height: 1.2;
			color: #65747c;
		}

		// 编辑胶囊
		.edit-pill {
			display: flex;
			align-items: center;
			flex-shrink: 0;
			box-sizing: border-box;
			height: 56rpx;
			margin-left: 16rpx;
			padding: 0 18rpx;
			background-color: #f8fbfa;
			border: 2rpx solid #dce7e6;
			border-radius: 16rpx;
		}

		.edit-icon {
			width: 24rpx;
			height: 24rpx;
		}

		.edit-text {
			margin-left: 8rpx;
			font-size: 23rpx;
			font-weight: 500;
			line-height: 1;
			color: #3d4b54;
		}

		// 数据统计
		.stats {
			display: flex;
			align-items: center;
			padding: 26rpx 0 30rpx;
			border-top: 2rpx solid #e9eff0;
		}

		.stat {
			display: flex;
			flex-direction: column;
			align-items: center;
			flex: 1;
			min-width: 0;
		}

		.stat-divider {
			width: 2rpx;
			height: 58rpx;
			background-color: #e9eff0;
		}

		.stat-value {
			font-size: 42rpx;
			font-weight: 700;
			line-height: 1.1;
			letter-spacing: -0.4rpx;
			color: #17252b;

			&--accent {
				color: #007c77;
			}
		}

		.stat-unit {
			font-size: 24rpx;
			font-weight: 600;
		}

		.stat-label {
			margin-top: 12rpx;
			font-size: 21rpx;
			line-height: 1.2;
			color: #78868f;
		}
	}

	// ===== 快捷入口 =====
	.quick-actions {
		display: flex;
		align-items: center;
		box-sizing: border-box;
		height: 157rpx;
		margin-top: 30rpx;
		background-color: #ffffff;
		border: 2rpx solid #e3ebec;
		border-radius: 28rpx;

		.action {
			display: flex;
			align-items: center;
			flex: 1;
			min-width: 0;
			padding: 0 28rpx;
		}

		.action-icon {
			display: flex;
			align-items: center;
			justify-content: center;
			flex-shrink: 0;
			width: 64rpx;
			height: 64rpx;
			background-color: #e8f7f4;
			border-radius: 18rpx;
		}

		.action-icon-img {
			width: 32rpx;
			height: 32rpx;
		}

		.action-text {
			min-width: 0;
			margin-left: 20rpx;
		}

		.action-title {
			display: block;
			font-size: 27rpx;
			font-weight: 600;
			line-height: 1.2;
			color: #17252b;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}

		.action-desc {
			display: block;
			margin-top: 6rpx;
			font-size: 21rpx;
			line-height: 1.2;
			color: #78868f;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}

		.action-divider {
			flex-shrink: 0;
			width: 2rpx;
			height: 46rpx;
			background-color: #edf2f2;
		}
	}

	// ===== 分组标题 =====
	.section-head {
		display: flex;
		align-items: center;
		margin: 40rpx 0 16rpx;

		.section-title {
			font-size: 31rpx;
			font-weight: 700;
			line-height: 1.1;
			letter-spacing: -0.5rpx;
			color: #17252b;
		}
	}

	// ===== 列表卡片 =====
	.list-card {
		box-sizing: border-box;
		overflow: hidden;
		padding: 0 48rpx;
		background-color: #ffffff;
		border: 2rpx solid #e3ebec;
		border-radius: 32rpx;

		.list-row {
			display: flex;
			align-items: center;
			height: 108rpx;
		}

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
			font-size: 23rpx;
			line-height: 1;
			color: #78868f;
		}

		.row-divider {
			height: 2rpx;
			margin-left: 50rpx;
			background-color: #edf2f2;
		}
	}

	// 开关：仅静态展示
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

	// 右箭头
	.chevron {
		width: 12rpx;
		height: 12rpx;
		margin-left: 12rpx;
		border-top: 2rpx solid #9aa6ac;
		border-right: 2rpx solid #9aa6ac;
		transform: rotate(45deg);
	}

	// ===== 隐私说明 =====
	.privacy-note {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-top: 36rpx;

		.privacy-icon {
			width: 26rpx;
			height: 26rpx;
			margin-right: 10rpx;
		}

		.privacy-text {
			font-size: 21rpx;
			line-height: 1.2;
			color: #8a979e;
		}
	}
}
</style>
