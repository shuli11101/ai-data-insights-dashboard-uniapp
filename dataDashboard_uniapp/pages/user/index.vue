<template>
	<view class="user-page">
		<!-- ===== 顶部标题 ===== -->
		<view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="header-text">
				<text class="page-title">个人中心</text>
				<text class="page-subtitle">管理资料、偏好与账号</text>
			</view>

			<view @click="navigateToSettings" class="settings-btn">
				<image class="settings-icon" src="/static/icon/user/settings-white.svg" mode="aspectFit" />
			</view>
		</view>

		<!-- ===== 资料卡 ===== -->
		<view class="profile-card">
			<view class="profile-top">
				<view class="avatar-wrap">
					<view class="avatar">
						<text class="avatar-text">陈</text>
					</view>
					<view class="avatar-badge">
						<image class="avatar-badge-icon" src="/static/icon/user/camera-white.svg" mode="aspectFit" />
					</view>
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
					<text class="stat-value">84<text class="stat-unit">%</text></text>
					<text class="stat-label">平均匹配</text>
				</view>
				<view class="stat-divider"></view>
				<view class="stat">
					<text class="stat-value">8</text>
					<text class="stat-label">收藏岗位</text>
				</view>
			</view>
		</view>

		<!-- ===== 快捷操作 ===== -->
		<view class="quick-actions">
			<view class="action-card">
				<view class="action-icon">
					<image class="action-icon-img" src="/static/icon/user/edit.svg" mode="aspectFit" />
				</view>
				<text class="action-title">编辑资料（待开发）</text>
				<text class="action-desc">头像、昵称与通知、外观</text>
			</view>

			<view @click="navigateToPersonal" class="action-card">
				<view class="action-icon">
					<image class="action-icon-img" src="/static/icon/user/sliders.svg" mode="aspectFit" />
				</view>
				<text class="action-title">偏好设置</text>
				<text class="action-desc">求职意向与个人信息</text>
			</view>
		</view>

		<!-- ===== 设置 ===== -->
		<view class="section-head">
			<text class="section-title">设置（待开发）</text>
		</view>

		<view class="list-card">
			<view class="list-row">
				<view class="row-icon">
					<image class="row-icon-img" src="/static/icon/user/bell.svg" mode="aspectFit" />
				</view>
				<text class="row-title">通知提醒</text>
				<view class="toggle toggle--on">
					<view class="toggle-knob"></view>
				</view>
			</view>

			<view class="row-divider"></view>

			<view class="list-row">
				<view class="row-icon">
					<image class="row-icon-img" src="/static/icon/user/moon.svg" mode="aspectFit" />
				</view>
				<text class="row-title">深色模式</text>
				<view class="toggle">
					<view class="toggle-knob"></view>
				</view>
			</view>

			<view class="row-divider"></view>

			<view class="list-row">
				<view class="row-icon">
					<image class="row-icon-img" src="/static/icon/user/globe.svg" mode="aspectFit" />
				</view>
				<text class="row-title">语言</text>
				<view class="row-right">
					<text class="row-value">简体中文</text>
					<view class="chevron"></view>
				</view>
			</view>

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

		<!-- ===== 关于 ===== -->
		<view class="section-head">
			<text class="section-title">关于</text>
		</view>

		<view class="list-card">
			<view class="list-row">
				<view class="row-icon">
					<image class="row-icon-img" src="/static/icon/user/info.svg" mode="aspectFit" />
				</view>
				<text class="row-title">版本</text>
				<view class="row-right">
					<text class="row-value">1.4.2</text>
				</view>
			</view>

			<view class="row-divider"></view>

			<view class="list-row">
				<view class="row-icon">
					<image class="row-icon-img" src="/static/icon/user/document.svg" mode="aspectFit" />
				</view>
				<text class="row-title">用户协议与隐私（待开发）</text>
				<view class="row-right">
					<view class="chevron"></view>
				</view>
			</view>

			<view class="row-divider"></view>

			<view @click="navigateToAbout" class="list-row">
				<view class="row-icon">
					<image class="row-icon-img" src="/static/icon/user/sparkles.svg" mode="aspectFit" />
				</view>
				<text class="row-title">关于我们</text>
				<view class="row-right">
					<view class="chevron"></view>
				</view>
			</view>
		</view>

		<!-- 隐私说明 -->
		<view class="privacy-note">
			<image class="privacy-icon" src="/static/icon/user/lock.svg" mode="aspectFit" />
			<text class="privacy-text">资料仅保存在本机，仅用于匹配分析</text>
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
	padding: 36rpx 24rpx 40rpx;
	background-color: #ffffff;

	// ===== 顶部标题 =====
	.header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		padding-bottom: 48rpx;

		.header-text {
			min-width: 0;
			padding-top: 12rpx;
		}

		.page-title {
			display: block;
			font-size: 44rpx;
			font-weight: 700;
			line-height: 1.1;
			letter-spacing: 0.2rpx;
			color: #0a0a0a;
		}

		.page-subtitle {
			display: block;
			margin-top: 8rpx;
			font-size: 22rpx;
			line-height: 1.2;
			color: #8a8a91;
		}

		// 设置入口：黑色圆形按钮
		.settings-btn {
			display: flex;
			align-items: center;
			justify-content: center;
			flex-shrink: 0;
			width: 72rpx;
			height: 72rpx;
			margin-top: 8rpx;
			background-color: #0a0a0a;
			border-radius: 50%;
			box-shadow: 0 8rpx 18rpx rgba(10, 10, 10, 0.18);
		}

		.settings-icon {
			width: 34rpx;
			height: 34rpx;
		}
	}

	// ===== 资料卡 =====
	.profile-card {
		box-sizing: border-box;
		padding: 28rpx;
		background-color: #ffffff;
		border: 2rpx solid #e8ecf3;
		border-radius: 28rpx;
		box-shadow: 0 6rpx 24rpx rgba(15, 23, 42, 0.04);

		.profile-top {
			display: flex;
			align-items: flex-start;
		}

		.avatar-wrap {
			position: relative;
			flex-shrink: 0;
			width: 120rpx;
			height: 120rpx;
		}

		// 头像：浅米色底 + 姓名首字，避免依赖网络图片
		.avatar {
			display: flex;
			align-items: center;
			justify-content: center;
			box-sizing: border-box;
			width: 120rpx;
			height: 120rpx;
			background-color: #ede7de;
			border: 2rpx solid rgba(10, 10, 10, 0.06);
			border-radius: 50%;

			.avatar-text {
				font-size: 46rpx;
				font-weight: 600;
				line-height: 1;
				color: #2a2320;
			}
		}

		// 相机角标
		.avatar-badge {
			position: absolute;
			right: -4rpx;
			bottom: -4rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			box-sizing: border-box;
			width: 44rpx;
			height: 44rpx;
			background-color: #0a0a0a;
			border: 4rpx solid #ffffff;
			border-radius: 50%;
		}

		.avatar-badge-icon {
			width: 22rpx;
			height: 22rpx;
		}

		.profile-info {
			flex: 1;
			min-width: 0;
			margin-left: 22rpx;
			padding-top: 8rpx;
		}

		.name-row {
			display: flex;
			align-items: center;
		}

		.name {
			font-size: 40rpx;
			font-weight: 700;
			line-height: 1.1;
			letter-spacing: 0.2rpx;
			color: #0a0a0a;
		}

		.status-pill {
			display: flex;
			align-items: center;
			flex-shrink: 0;
			height: 36rpx;
			margin-left: 14rpx;
			padding: 0 14rpx;
			background-color: #f5f5f7;
			border-radius: 18rpx;

			.status-dot {
				width: 8rpx;
				height: 8rpx;
				background-color: #0a0a0a;
				border-radius: 50%;
			}

			.status-text {
				margin-left: 8rpx;
				font-size: 19rpx;
				font-weight: 500;
				line-height: 1;
				color: #0a0a0a;
			}
		}

		.profile-meta {
			display: block;
			margin-top: 12rpx;
			font-size: 21rpx;
			line-height: 1.2;
			color: #8a8a91;
		}

		// 编辑胶囊
		.edit-pill {
			display: flex;
			align-items: center;
			flex-shrink: 0;
			box-sizing: border-box;
			height: 56rpx;
			margin-top: 10rpx;
			margin-left: 12rpx;
			padding: 0 18rpx;
			background-color: #ffffff;
			border: 2rpx solid #e9e9ee;
			border-radius: 28rpx;
		}

		.edit-icon {
			width: 26rpx;
			height: 26rpx;
		}

		.edit-text {
			margin-left: 8rpx;
			font-size: 22rpx;
			font-weight: 500;
			line-height: 1;
			color: #0a0a0a;
		}

		.bio {
			display: block;
			margin-top: 24rpx;
			font-size: 22rpx;
			line-height: 1.5;
			color: #8a8a91;
		}

		.stats {
			display: flex;
			align-items: center;
			margin-top: 24rpx;
			padding-top: 24rpx;
			border-top: 2rpx solid #ededf0;
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
			height: 56rpx;
			background-color: #ededf0;
		}

		.stat-value {
			font-size: 38rpx;
			font-weight: 700;
			line-height: 1.1;
			letter-spacing: 0.2rpx;
			color: #0a0a0a;
		}

		.stat-unit {
			font-size: 24rpx;
			font-weight: 600;
			color: #8a8a91;
		}

		.stat-label {
			margin-top: 10rpx;
			font-size: 20rpx;
			line-height: 1.2;
			color: #a8a8ae;
		}
	}

	// ===== 快捷操作 =====
	.quick-actions {
		display: flex;
		justify-content: space-between;
		margin-top: 24rpx;

		.action-card {
			display: flex;
			flex-direction: column;
			box-sizing: border-box;
			width: 48.5%;
			padding: 24rpx;
			background-color: #ffffff;
			border: 2rpx solid #e8ecf3;
			border-radius: 24rpx;
			box-shadow: 0 4rpx 16rpx rgba(15, 23, 42, 0.03);
		}

		.action-icon {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 68rpx;
			height: 68rpx;
			background-color: #f5f5f7;
			border-radius: 50%;
		}

		.action-icon-img {
			width: 32rpx;
			height: 32rpx;
		}

		.action-title {
			margin-top: 20rpx;
			font-size: 29rpx;
			font-weight: 600;
			line-height: 1.2;
			color: #0a0a0a;
		}

		.action-desc {
			margin-top: 8rpx;
			font-size: 20rpx;
			line-height: 1.3;
			color: #8a8a91;
		}
	}

	// ===== 分组标题 =====
	.section-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin: 36rpx 0 18rpx;

		.section-title {
			font-size: 32rpx;
			font-weight: 600;
			line-height: 1.1;
			color: #0a0a0a;
		}

		.section-action {
			display: flex;
			align-items: center;
		}

		.section-action-text {
			font-size: 21rpx;
			line-height: 1;
			color: #a8a8ae;
		}

		.section-version {
			font-size: 21rpx;
			line-height: 1;
			color: #a8a8ae;
		}
	}

	// ===== 列表卡片 =====
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
			height: 108rpx;
		}

		// 行内图标：浅灰圆底
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

	// ===== 隐私说明 =====
	.privacy-note {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-top: 32rpx;

		.privacy-icon {
			width: 24rpx;
			height: 24rpx;
			margin-right: 8rpx;
		}

		.privacy-text {
			font-size: 20rpx;
			line-height: 1.2;
			color: #a8a8ae;
		}
	}
}
</style>
