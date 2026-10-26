<template>
	<view class="personal-page">
		<!-- ===== 顶部导航 ===== -->
		<view class="appbar" :style="{ marginTop: statusBarHeight + 'px' }">
			<view class="back" @click="goBack"></view>
			<text class="appbar-title">求职意向</text>
		</view>

		<!-- ===== 意向表单纸 ===== -->
		<view class="sheet">
			<!-- 引导提示 -->
			<view class="guide">
				<view class="guide-icon"></view>
				<view class="guide-text">
					<text class="guide-title">填写后，推荐会更贴近你的期望</text>
					<text class="guide-desc">城市、技术栈与薪资都会参与岗位排序</text>
				</view>
			</view>

			<!-- 基本意向 -->
			<view class="group">
				<text class="group-label">基本意向</text>

				<view class="row">
					<image class="row-icon" src="/static/icon/user/briefcase.svg" mode="aspectFit" />
					<text class="row-title">工作经验</text>
					<text class="row-value">3–5 年</text>
				</view>

				<view class="row-divider"></view>

				<view class="row">
					<image class="row-icon" src="/static/icon/user/pin.svg" mode="aspectFit" />
					<text class="row-title">意向城市</text>
					<text class="row-value">上海 · 杭州</text>
				</view>

				<view class="row-divider"></view>

				<view class="row">
					<image class="row-icon" src="/static/icon/user/graduation.svg" mode="aspectFit" />
					<text class="row-title">学历</text>
					<text class="row-value">本科</text>
				</view>
			</view>

			<!-- 技术栈 -->
			<view class="group">
				<view class="group-head">
					<text class="group-label">技术栈</text>
					<text class="group-note">最多 8 项</text>
				</view>

				<view class="stack-tags">
					<view class="stack-tag" v-for="skill in skills" :key="skill">
						<text class="stack-tag-text">{{ skill }}</text>
						<view class="stack-tag-close"></view>
					</view>
				</view>

				<view class="stack-add">
					<view class="stack-add-icon">
						<view class="plus-line plus-line--h"></view>
						<view class="plus-line plus-line--v"></view>
					</view>
					<text class="stack-add-text">添加技术栈</text>
					<text class="stack-add-note">支持自定义</text>
				</view>
			</view>

			<!-- 薪资情况 -->
			<view class="group">
				<view class="group-head">
					<text class="group-label">薪资情况</text>
					<text class="group-note">均为税前</text>
				</view>

				<view class="segmented">
					<view class="segment segment--active">月薪</view>
					<view class="segment">年薪</view>
				</view>

				<view class="salary-row">
					<text class="salary-label">当前薪资</text>
					<text class="salary-value">20–30K · 14薪</text>
				</view>

				<view class="row-divider row-divider--full"></view>

				<view class="salary-row">
					<text class="salary-label">期望薪资</text>
					<text class="salary-value salary-value--accent">30–40K · 14薪</text>
				</view>

				<text class="salary-hint">按 14 薪计算，期望年薪包约 42–56 万</text>
			</view>
		</view>

		<!-- ===== 固定保存栏 ===== -->
		<view class="save-bar">
			<view class="save-btn">
				<text class="save-text">保存求职意向</text>
			</view>

			<view class="privacy-note">
				<image class="privacy-icon" src="/static/icon/user/lock.svg" mode="aspectFit" />
				<text class="privacy-text">求职意向仅用于岗位匹配，不会公开</text>
			</view>
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
	padding: 32rpx 0 calc(220rpx + env(safe-area-inset-bottom));

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

	// ===== 表单纸 =====
	.sheet {
		box-sizing: border-box;
		margin-top: 24rpx;
		padding: 28rpx 40rpx 40rpx;
		background-color: #ffffff;
		border-radius: 44rpx 44rpx 0 0;
	}

	// ===== 引导提示 =====
	.guide {
		display: flex;
		align-items: center;
		box-sizing: border-box;
		padding: 20rpx 28rpx;
		background-color: #f1f9f7;
		border-radius: 24rpx;

		.guide-icon {
			position: relative;
			flex-shrink: 0;
			box-sizing: border-box;
			width: 28rpx;
			height: 28rpx;
			border: 2rpx solid #487c77;
			border-radius: 50%;

			&::after {
				content: '';
				position: absolute;
				top: 50%;
				left: 50%;
				width: 8rpx;
				height: 8rpx;
				margin: -4rpx 0 0 -4rpx;
				background-color: #487c77;
				border-radius: 50%;
			}
		}

		.guide-text {
			min-width: 0;
			margin-left: 16rpx;
		}

		.guide-title {
			display: block;
			font-size: 23rpx;
			font-weight: 600;
			line-height: 1.3;
			color: #17252b;
		}

		.guide-desc {
			display: block;
			margin-top: 4rpx;
			font-size: 20rpx;
			line-height: 1.3;
			color: #65747c;
		}
	}

	// ===== 分组 =====
	.group {
		margin-top: 44rpx;

		&:first-of-type {
			margin-top: 36rpx;
		}
	}

	.group-label {
		display: block;
		font-size: 24rpx;
		font-weight: 600;
		line-height: 1.2;
		letter-spacing: 0.4rpx;
		color: #78868f;
	}

	.group-head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
	}

	.group-note {
		font-size: 21rpx;
		line-height: 1.2;
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
		}

		.row-value {
			flex-shrink: 0;
			margin-left: 16rpx;
			font-size: 25rpx;
			font-weight: 500;
			line-height: 1.2;
			color: #3d4b54;
		}
	}

	.row-divider {
		height: 2rpx;
		margin-left: 50rpx;
		background-color: #edf2f2;

		&--full {
			margin-left: 0;
		}
	}

	// ===== 技术栈 =====
	.stack-tags {
		display: flex;
		flex-wrap: wrap;
		column-gap: 12rpx;
		row-gap: 14rpx;
		margin-top: 18rpx;

		.stack-tag {
			display: flex;
			align-items: center;
			box-sizing: border-box;
			height: 60rpx;
			padding: 0 20rpx;
			background-color: #f1f9f7;
			border-radius: 14rpx;

			.stack-tag-text {
				font-size: 23rpx;
				line-height: 1;
				color: #3d4b54;
			}

			/* 关闭：两条 45° 细线组成的叉 */
			.stack-tag-close {
				position: relative;
				width: 16rpx;
				height: 16rpx;
				margin-left: 12rpx;

				&::before,
				&::after {
					content: '';
					position: absolute;
					top: 50%;
					left: 0;
					width: 16rpx;
					height: 2rpx;
					background-color: #7b8d89;
					border-radius: 1rpx;
				}

				&::before {
					transform: rotate(45deg);
				}

				&::after {
					transform: rotate(-45deg);
				}
			}
		}
	}

	.stack-add {
		display: flex;
		align-items: center;
		margin-top: 24rpx;

		.stack-add-icon {
			position: relative;
			flex-shrink: 0;
			box-sizing: border-box;
			width: 48rpx;
			height: 48rpx;
			background-color: #f1f9f7;
			border-radius: 50%;

			.plus-line {
				position: absolute;
				top: 50%;
				left: 50%;
				background-color: #007c77;
				border-radius: 1rpx;
				transform: translate(-50%, -50%);

				&--h {
					width: 20rpx;
					height: 2rpx;
				}

				&--v {
					width: 2rpx;
					height: 20rpx;
				}
			}
		}

		.stack-add-text {
			margin-left: 16rpx;
			font-size: 25rpx;
			font-weight: 500;
			line-height: 1;
			color: #007c77;
		}

		.stack-add-note {
			margin-left: auto;
			font-size: 21rpx;
			line-height: 1;
			color: #8a979e;
		}
	}

	// ===== 薪资情况 =====
	.segmented {
		display: flex;
		box-sizing: border-box;
		width: 280rpx;
		height: 68rpx;
		margin-top: 18rpx;
		padding: 6rpx;
		background-color: #f2f7f6;
		border-radius: 20rpx;

		.segment {
			display: flex;
			align-items: center;
			justify-content: center;
			flex: 1;
			font-size: 24rpx;
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

	.salary-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 88rpx;

		&:first-of-type {
			margin-top: 12rpx;
		}

		.salary-label {
			font-size: 27rpx;
			line-height: 1.2;
			color: #3d4b54;
		}

		.salary-value {
			font-size: 26rpx;
			font-weight: 500;
			line-height: 1.2;
			color: #3d4b54;

			&--accent {
				font-weight: 600;
				color: #007c77;
			}
		}
	}

	.salary-hint {
		display: block;
		margin-top: 8rpx;
		font-size: 21rpx;
		line-height: 1.4;
		color: #8a979e;
	}

	// ===== 固定保存栏 =====
	.save-bar {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		box-sizing: border-box;
		padding: 24rpx 40rpx calc(24rpx + env(safe-area-inset-bottom));
		background-color: #ffffff;
		border-top: 2rpx solid #e3ebec;

		.save-btn {
			display: flex;
			align-items: center;
			justify-content: center;
			height: 92rpx;
			background-image: linear-gradient(180deg, #007c77 0%, #00746f 100%);
			border-radius: 24rpx;

			.save-text {
				font-size: 30rpx;
				font-weight: 600;
				line-height: 1;
				letter-spacing: 0.6rpx;
				color: #ffffff;
			}
		}

		.privacy-note {
			display: flex;
			align-items: center;
			justify-content: center;
			margin-top: 20rpx;

			.privacy-icon {
				width: 24rpx;
				height: 24rpx;
				margin-right: 10rpx;
			}

			.privacy-text {
				font-size: 20rpx;
				line-height: 1.2;
				color: #8a979e;
			}
		}
	}
}
</style>
