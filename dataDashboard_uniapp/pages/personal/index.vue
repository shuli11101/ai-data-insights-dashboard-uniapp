<template>
	<view class="personal-page">
		<!-- ===== 顶部导航 ===== -->
		<view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="back-btn" @click="goBack">
				<image class="back-icon" src="/static/icon/user/back.svg" mode="aspectFit" />
			</view>
			<text class="page-title">求职意向</text>
		</view>

		<text class="page-desc">填写后，AI 会优先推荐更符合你期望的岗位。</text>

		<!-- ===== AI 提示 ===== -->
		<view class="tip-card">
			<view class="tip-icon">
				<image class="tip-icon-img" src="/static/icon/user/sparkles-white.svg" mode="aspectFit" />
			</view>
			<view class="tip-text">
				<text class="tip-title">让 AI 更懂你的下一步</text>
				<text class="tip-desc">城市、技术栈与薪资会直接影响推荐排序</text>
			</view>
		</view>

		<!-- ===== 基本意向 ===== -->
		<view class="section-head">
			<text class="section-title">基本意向</text>
		</view>

		<view class="list-card">
			<view class="list-row">
				<view class="row-icon">
					<image class="row-icon-img" src="/static/icon/user/briefcase.svg" mode="aspectFit" />
				</view>
				<text class="row-title">工作经验</text>
				<view class="row-right">
					<text class="row-value">3–5 年</text>
					<view class="chevron"></view>
				</view>
			</view>

			<view class="row-divider"></view>

			<view class="list-row">
				<view class="row-icon">
					<image class="row-icon-img" src="/static/icon/user/pin.svg" mode="aspectFit" />
				</view>
				<text class="row-title">意向城市</text>
				<view class="row-right">
					<text class="row-value">上海 · 杭州</text>
					<view class="chevron"></view>
				</view>
			</view>

			<view class="row-divider"></view>

			<view class="list-row">
				<view class="row-icon">
					<image class="row-icon-img" src="/static/icon/user/graduation.svg" mode="aspectFit" />
				</view>
				<text class="row-title">学历</text>
				<view class="row-right">
					<text class="row-value">本科</text>
					<view class="chevron"></view>
				</view>
			</view>
		</view>

		<!-- ===== 技术栈 ===== -->
		<view class="section-head">
			<text class="section-title">技术栈</text>
		</view>

		<view class="stack-card">
			<view class="stack-meta">
				<text class="stack-meta-text">已选 {{ skills.length }} 项</text>
				<text class="stack-meta-text">最多 8 项</text>
			</view>

			<view class="stack-tags">
				<view class="stack-tag" v-for="skill in skills" :key="skill">
					<text class="stack-tag-text">{{ skill }}</text>
					<image class="stack-tag-close" src="/static/icon/user/close.svg" mode="aspectFit" />
				</view>

				<view class="stack-tag stack-tag--add">
					<image class="stack-tag-plus" src="/static/icon/user/plus.svg" mode="aspectFit" />
					<text class="stack-add-text">添加技术栈</text>
				</view>
				<text class="stack-hint">支持自定义</text>
			</view>
		</view>

		<!-- ===== 薪资情况 ===== -->
		<view class="section-head">
			<text class="section-title">薪资情况</text>
		</view>

		<view class="salary-card">
			<view class="salary-top">
				<view class="segmented">
					<view class="segment segment--active">月薪</view>
					<view class="segment">年薪</view>
				</view>
				<text class="tax-note">均为税前</text>
			</view>

			<view class="salary-row">
				<text class="salary-label">当前薪资</text>
				<text class="salary-value">20–30K · 14 薪</text>
			</view>

			<view class="salary-row salary-row--divided">
				<text class="salary-label">期望薪资</text>
				<text class="salary-value">30–40K · 14 薪</text>
			</view>

			<text class="salary-hint">按 14 薪计算，期望年包约 42–56 万</text>
		</view>

		<!-- ===== 保存 ===== -->
		<view class="save-btn">
			<text class="save-text">保存求职意向</text>
		</view>

		<!-- 隐私说明 -->
		<view class="privacy-note">
			<image class="privacy-icon" src="/static/icon/user/lock.svg" mode="aspectFit" />
			<text class="privacy-text">求职意向仅用于岗位匹配，不会公开</text>
		</view>
	</view>
</template>

<script setup lang="ts">
// 自定义导航栏需自行避开状态栏
const statusBarHeight = uni.getSystemInfoSync().statusBarHeight ?? 0

// 静态展示数据，后续接入接口时替换
const skills = ['React', 'TypeScript', 'Vue 3', 'Node.js']

// 返回上一页
const goBack = () => {
	uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.personal-page {
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

	.page-desc {
		display: block;
		margin-top: 12rpx;
		font-size: 22rpx;
		line-height: 1.3;
		color: #8a8a91;
	}

	// ===== AI 提示 =====
	.tip-card {
		display: flex;
		align-items: center;
		box-sizing: border-box;
		margin-top: 24rpx;
		padding: 22rpx 24rpx;
		background-color: #f6f6f8;
		border-radius: 24rpx;

		.tip-icon {
			display: flex;
			align-items: center;
			justify-content: center;
			flex-shrink: 0;
			width: 64rpx;
			height: 64rpx;
			background-color: #0a0a0a;
			border-radius: 50%;
		}

		.tip-icon-img {
			width: 30rpx;
			height: 30rpx;
		}

		.tip-text {
			min-width: 0;
			margin-left: 18rpx;
		}

		.tip-title {
			display: block;
			font-size: 27rpx;
			font-weight: 600;
			line-height: 1.2;
			color: #0a0a0a;
		}

		.tip-desc {
			display: block;
			margin-top: 8rpx;
			font-size: 20rpx;
			line-height: 1.3;
			color: #8a8a91;
		}
	}

	// ===== 分组标题 =====
	.section-head {
		margin: 34rpx 0 16rpx;

		.section-title {
			font-size: 30rpx;
			font-weight: 600;
			line-height: 1.1;
			color: #0a0a0a;
		}
	}

	// ===== 基本意向列表 =====
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

	// ===== 技术栈 =====
	.stack-card {
		box-sizing: border-box;
		padding: 22rpx 24rpx 24rpx;
		background-color: #ffffff;
		border: 2rpx solid #e8ecf3;
		border-radius: 28rpx;
		box-shadow: 0 6rpx 24rpx rgba(15, 23, 42, 0.04);

		.stack-meta {
			display: flex;
			align-items: center;
			justify-content: space-between;

			.stack-meta-text {
				font-size: 20rpx;
				line-height: 1;
				color: #a8a8ae;
			}
		}

		.stack-tags {
			display: flex;
			flex-wrap: wrap;
			align-items: center;
			column-gap: 12rpx;
			row-gap: 14rpx;
			margin-top: 18rpx;
		}

		.stack-tag {
			display: flex;
			align-items: center;
			box-sizing: border-box;
			height: 56rpx;
			padding: 0 18rpx;
			background-color: #f5f5f7;
			border-radius: 28rpx;
		}

		.stack-tag-text {
			font-size: 23rpx;
			font-weight: 500;
			line-height: 1;
			color: #0a0a0a;
		}

		.stack-tag-close {
			width: 20rpx;
			height: 20rpx;
			margin-left: 10rpx;
		}

		// 添加项：虚线描边 + 加号
		.stack-tag--add {
			background-color: #ffffff;
			border: 2rpx dashed #dddde2;
		}

		.stack-tag-plus {
			width: 24rpx;
			height: 24rpx;
			margin-right: 8rpx;
		}

		.stack-add-text {
			font-size: 22rpx;
			line-height: 1;
			color: #8a8a91;
		}

		.stack-hint {
			font-size: 19rpx;
			line-height: 1;
			color: #a8a8ae;
		}
	}

	// ===== 薪资情况 =====
	.salary-card {
		box-sizing: border-box;
		padding: 20rpx 24rpx 22rpx;
		background-color: #ffffff;
		border: 2rpx solid #e8ecf3;
		border-radius: 28rpx;
		box-shadow: 0 6rpx 24rpx rgba(15, 23, 42, 0.04);

		.salary-top {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding-bottom: 18rpx;
			border-bottom: 2rpx solid #f0f0f2;
		}

		// 月薪 / 年薪分段控件：仅静态展示
		.segmented {
			display: flex;
			box-sizing: border-box;
			width: 216rpx;
			height: 56rpx;
			padding: 4rpx;
			background-color: #f6f6f8;
			border-radius: 14rpx;
		}

		.segment {
			display: flex;
			align-items: center;
			justify-content: center;
			flex: 1;
			font-size: 21rpx;
			line-height: 1;
			color: #8a8a91;
			border-radius: 10rpx;
		}

		.segment--active {
			font-weight: 600;
			color: #0a0a0a;
			background-color: #ffffff;
			box-shadow: 0 2rpx 6rpx rgba(10, 10, 10, 0.1);
		}

		.tax-note {
			font-size: 19rpx;
			line-height: 1;
			color: #a8a8ae;
		}

		.salary-row {
			display: flex;
			align-items: center;
			justify-content: space-between;
			height: 88rpx;
		}

		.salary-row--divided {
			border-top: 2rpx solid #f0f0f2;
		}

		.salary-label {
			font-size: 28rpx;
			font-weight: 500;
			line-height: 1.2;
			color: #0a0a0a;
		}

		.salary-value {
			font-size: 25rpx;
			font-weight: 500;
			line-height: 1.2;
			color: #0a0a0a;
		}

		.salary-hint {
			display: block;
			padding-bottom: 2rpx;
			font-size: 20rpx;
			line-height: 1.3;
			color: #a8a8ae;
		}
	}

	// ===== 保存按钮 =====
	.save-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 88rpx;
		margin-top: 32rpx;
		background-color: #0a0a0a;
		border-radius: 44rpx;

		.save-text {
			font-size: 27rpx;
			font-weight: 600;
			line-height: 1;
			color: #ffffff;
		}
	}

	// ===== 隐私说明 =====
	.privacy-note {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-top: 26rpx;

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
