<template>
	<view class="job-detail" :style="{ paddingTop: statusBarHeight + 'px' }">

		<!-- ===== 顶部导航：返回 + 收藏 / 分享 ===== -->
		<view class="navbar">
			<image class="back-btn" src="/static/icon/aiAnalyse/back.svg" mode="aspectFit" @click="onBack" />
			<view class="navbar-actions">
				<image class="action-icon icon-collect" src="/static/icon/detail/detail-collect.svg" mode="aspectFit" />
				<image class="action-icon icon-share" src="/static/icon/detail/detail-share.svg" mode="aspectFit" />
			</view>
		</view>

		<view class="content">
			<!-- ===== 岗位标题 / 薪资 / 基本信息 ===== -->
			<text class="job-title">{{ jobDetail.job_name }}</text>
			<text class="job-salary">{{ jobDetail.salaryMin }}-{{ jobDetail.salaryMax }}K·{{ jobDetail.experience
			}}</text>
			<text class="job-meta">{{ jobDetail.city }} · {{ jobDetail.district }}</text>

			<!-- ===== 公司信息 ===== -->
			<view class="company-card">
				<view class="company-logo">
					<text class="company-logo-text">{{ jobDetail.company?.slice(0, 1) }}</text>
				</view>
				<view class="company-info">
					<text class="company-name">{{ jobDetail.company }}</text>
					<text class="company-desc">(公司情况)</text>
				</view>
				<view class="arrow"></view>
			</view>

			<!-- ===== 技能标签 ===== -->
			<view class="tags">
				<text class="tag" v-for="skill in jobDetail.skill_tags" :key="skill">{{ skill }}</text>
			</view>

			<!-- ===== 职位描述 ===== -->
			<text class="section-title">职位描述</text>
			<view class="jd-list">
				<view class="jd-item" v-for="(text, index) in jobDesc" :key="index">
					<text class="jd-index">{{ index + 1 }}.</text>
					<text class="jd-text">{{ text }}</text>
				</view>
			</view>

			<!-- ===== 任职要求 ===== -->
			<text class="section-title">任职要求</text>
			<view class="jd-list">
				<view class="jd-item" v-for="(text, index) in jobDetail.skill_tags" :key="index">
					<text class="jd-index">{{ index + 1 }}.</text>
					<text class="jd-text">{{ text }}</text>
				</view>
			</view>

			<!-- ===== 工作地址 ===== -->
			<text class="section-title">工作地址</text>
			<view class="address-card">
				<image class="address-pin" src="/static/icon/detail/detail-pin.svg" mode="aspectFit" />
				<view class="address-info">
					<text class="address-name">{{ jobDetail.company }}</text>
					<text class="address-desc">(暂无详细数据)</text>
				</view>
				<view class="arrow"></view>
			</view>
		</view>

		<!-- ===== 底部操作栏 ===== -->
		<view class="bottom-bar">
			<view @click="navigateToAI" class="btn btn-ai">
				<image class="btn-ai-star" src="/static/icon/detail/detail-ai-black.svg" mode="aspectFit" />
				<text class="btn-text">AI 分析匹配度</text>
			</view>
			<view class="btn btn-chat">
				<text class="btn-text btn-text-light">JD 岗位描述</text>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { getJobDetail, type JobDetail } from '@/api/server'
import { onLoad } from '@dcloudio/uni-app'
// 状态栏高度：自定义导航栏用它做顶部留白（H5 端没有状态栏，取 12px 保底）
const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 12

// 静态数据：技能标签
const skills = ["(暂无数据)"]

// 静态数据：职位描述
const jobDesc = [
	'暂无数据'
]


// 获取岗位详情
const jobDetail = ref({} as JobDetail)
const getJob = async (id: number) => {
	try {
		const res = await getJobDetail(id)
		console.log(res)
		jobDetail.value = res
	} catch (error) {
		console.log(error)
	}
}

// 跳转 AI 分析匹配度页面
const navigateToAI = () => {
	uni.navigateTo({
		url: '/pages/aiAnalyse/index'
	})
}

onLoad((options) => {
	// 列表页通过 ?id= 传入岗位 id
	const id = Number(options?.id)
	if (id) getJob(id)
})

// 返回上一页
const onBack = () => {
	uni.navigateBack()
}
</script>

<style lang="scss">
.job-detail {
	box-sizing: border-box;
	min-height: 100vh;
	padding-bottom: 200rpx;
	background-color: #ffffff;
	font-family: Inter, -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif;

	/* ===== 顶部导航 ===== */
	.navbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		box-sizing: border-box;
		height: 88rpx;
		margin-top: 16rpx;
		padding: 0 40rpx;

		.back-btn {
			flex-shrink: 0;
			width: 64rpx;
			height: 64rpx;
		}

		.navbar-actions {
			display: flex;
			align-items: center;
			gap: 28rpx;

			.icon-collect {
				width: 38rpx;
				height: 36rpx;
			}

			.icon-share {
				width: 38rpx;
				height: 46rpx;
			}
		}
	}

	.content {
		padding: 0 40rpx;

		/* ===== 岗位标题 / 薪资 / 基本信息 ===== */
		.job-title {
			display: block;
			margin-top: 16rpx;
			font-size: 48rpx;
			font-weight: 700;
			line-height: 1.25;
			color: #0a0a0a;
		}

		.job-salary {
			display: block;
			margin-top: 4rpx;
			font-size: 36rpx;
			font-weight: 700;
			line-height: 1.25;
			color: #0a0a0a;
		}

		.job-meta {
			display: block;
			margin-top: 10rpx;
			font-size: 26rpx;
			line-height: 1.3;
			color: #737373;
		}

		/* ===== 公司信息 ===== */
		.company-card {
			display: flex;
			align-items: center;
			box-sizing: border-box;
			margin-top: 26rpx;
			padding: 0 28rpx;
			height: 128rpx;
			background-color: #f5f5f5;
			border-radius: 24rpx;

			.company-logo {
				display: flex;
				align-items: center;
				justify-content: center;
				flex-shrink: 0;
				width: 76rpx;
				height: 76rpx;
				background-color: #0a0a0a;
				border-radius: 50%;

				.company-logo-text {
					font-size: 30rpx;
					font-weight: 700;
					line-height: 1;
					color: #ffffff;
				}
			}

			.company-info {
				flex: 1;
				min-width: 0;
				margin-left: 24rpx;

				.company-name {
					display: block;
					font-size: 30rpx;
					font-weight: 700;
					line-height: 1.2;
					color: #0a0a0a;
				}

				.company-desc {
					display: block;
					margin-top: 8rpx;
					font-size: 23rpx;
					line-height: 1.2;
					color: #737373;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}
			}
		}

		/* ===== AI 匹配分析 ===== */
		.ai-card {
			display: flex;
			align-items: center;
			box-sizing: border-box;
			margin-top: 24rpx;
			padding: 28rpx;
			background-color: #0a0a0a;
			border-radius: 24rpx;

			.ai-left {
				flex: 1;
				min-width: 0;

				.ai-head {
					display: flex;
					align-items: center;

					.ai-star {
						flex-shrink: 0;
						width: 24rpx;
						height: 24rpx;
						margin-right: 12rpx;
					}

					.ai-title {
						font-size: 26rpx;
						font-weight: 700;
						line-height: 1.2;
						color: #ffffff;
					}
				}

				.ai-line {
					display: block;
					margin-top: 8rpx;
					font-size: 24rpx;
					line-height: 1.3;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}

				.ai-good {
					color: #d4d4d4;
				}

				.ai-weak {
					color: #a3a3a3;
				}
			}

			/* 匹配度进度环：86% → 309.6deg（360 * 0.86） */
			.ai-ring {
				position: relative;
				display: flex;
				align-items: center;
				justify-content: center;
				flex-shrink: 0;
				box-sizing: border-box;
				width: 96rpx;
				height: 96rpx;
				margin-left: 24rpx;
				border: 8rpx solid rgba(255, 255, 255, 0.25);
				border-radius: 50%;
				background: conic-gradient(#ffffff 309.6deg, rgba(255, 255, 255, 0.25) 309.6deg);

				&::before {
					content: '';
					position: absolute;
					top: 50%;
					left: 50%;
					width: 68rpx;
					height: 68rpx;
					margin: -34rpx 0 0 -34rpx;
					background-color: #0a0a0a;
					border-radius: 50%;
				}

				.ai-ring-text {
					position: relative;
					font-size: 28rpx;
					font-weight: 700;
					line-height: 1;
					color: #ffffff;
				}
			}
		}

		/* ===== 技能标签 ===== */
		.tags {
			display: flex;
			flex-wrap: wrap;
			gap: 16rpx;
			margin-top: 24rpx;
			margin-bottom: 36rpx;

			.tag {
				display: flex;
				align-items: center;
				justify-content: center;
				height: 52rpx;
				padding: 0 28rpx;
				font-size: 24rpx;
				line-height: 1;
				color: #525252;
				background-color: #f5f5f5;
				border-radius: 999rpx;
			}
		}

		/* ===== 段落标题 ===== */
		.section-title {
			display: block;
			margin-top: 24rpx;
			font-size: 32rpx;
			font-weight: 700;
			line-height: 1.25;
			color: #0a0a0a;
		}

		/* ===== 描述 / 要求列表 ===== */
		.jd-list {
			margin-top: 16rpx;

			.jd-item {
				display: flex;
				margin-top: 10rpx;

				&:first-child {
					margin-top: 0;
				}

				.jd-index {
					flex-shrink: 0;
					width: 34rpx;
					font-size: 26rpx;
					line-height: 1.45;
					color: #525252;
				}

				.jd-text {
					flex: 1;
					min-width: 0;
					font-size: 26rpx;
					line-height: 1.45;
					color: #525252;
				}
			}
		}

		/* ===== 工作地址 ===== */
		.address-card {
			display: flex;
			align-items: center;
			box-sizing: border-box;
			margin-top: 20rpx;
			padding: 0 28rpx;
			height: 128rpx;
			background-color: #f5f5f5;
			border-radius: 24rpx;

			.address-pin {
				flex-shrink: 0;
				width: 40rpx;
				height: 50rpx;
			}

			.address-info {
				flex: 1;
				min-width: 0;
				margin-left: 24rpx;

				.address-name {
					display: block;
					font-size: 26rpx;
					font-weight: 700;
					line-height: 1.2;
					color: #0a0a0a;
				}

				.address-desc {
					display: block;
					margin-top: 8rpx;
					font-size: 23rpx;
					line-height: 1.2;
					color: #737373;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}
			}
		}
	}

	/* 右箭头：旋转 45° 的直角边框 */
	.arrow {
		flex-shrink: 0;
		width: 16rpx;
		height: 16rpx;
		margin-left: 16rpx;
		border-right: 3rpx solid #a3a3a3;
		border-bottom: 3rpx solid #a3a3a3;
		transform: rotate(-45deg);
	}

	/* ===== 底部操作栏 ===== */
	.bottom-bar {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		align-items: center;
		box-sizing: border-box;
		padding: 32rpx 40rpx;
		padding-bottom: calc(32rpx + env(safe-area-inset-bottom));
		background-color: #ffffff;
		border-top: 2rpx solid #e5e5e5;

		.btn {
			display: flex;
			align-items: center;
			justify-content: center;
			height: 88rpx;
			border-radius: 999rpx;

			.btn-text {
				font-size: 28rpx;
				font-weight: 700;
				line-height: 1;
				color: #0a0a0a;
			}

			.btn-text-light {
				color: #ffffff;
			}
		}

		/* 左：AI 分析匹配度 */
		.btn-ai {
			flex-shrink: 0;
			width: 320rpx;
			background-color: #f5f5f5;

			.btn-ai-star {
				width: 22rpx;
				height: 22rpx;
				margin-right: 12rpx;
			}
		}

		/* 右：立即沟通 */
		.btn-chat {
			flex: 1;
			min-width: 0;
			margin-left: 24rpx;
			background-color: #0a0a0a;
		}
	}
}
</style>
