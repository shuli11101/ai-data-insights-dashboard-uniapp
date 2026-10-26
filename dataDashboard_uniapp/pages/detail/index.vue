<template>
	<view class="job-detail" :style="{ paddingTop: statusBarHeight + 'px' }">
		<!-- ===== 顶部导航：返回 + 收藏 / 分享 ===== -->
		<view class="navbar">
			<view class="back" @click="onBack"></view>
			<view class="navbar-actions">
				<image class="icon-collect" src="/static/icon/detail/detail-collect.svg" mode="aspectFit" />
				<image class="icon-share" src="/static/icon/detail/detail-share.svg" mode="aspectFit" />
			</view>
		</view>

		<!-- ===== 岗位摘要 ===== -->
		<view class="summary">
			<text class="job-title">{{ jobDetail.job_name }}</text>

			<view class="salary-row">
				<text class="job-salary">{{ jobDetail.salaryMin }}-{{ jobDetail.salaryMax }}K</text>
				<text class="job-exp">· {{ jobDetail.experience }}</text>
			</view>

			<view class="meta-row">
				<image class="meta-pin" src="/static/icon/detail/detail-pin.svg" mode="aspectFit" />
				<text class="meta-text">{{ jobDetail.city }} · {{ jobDetail.district }}</text>
			</view>
		</view>

		<!-- ===== 公司信息 ===== -->
		<view class="company-card">
			<view class="company-logo">
				<text class="company-logo-text">{{ jobDetail.company?.slice(0, 1) }}</text>
			</view>
			<view class="company-info">
				<text class="company-name">{{ jobDetail.company }}</text>
			</view>
			<view class="chevron"></view>
		</view>

		<view class="content">
			<!-- ===== 职位描述 ===== -->
			<text class="section-title">职位描述</text>
			<view class="jd-list">
				<view class="jd-item" v-for="(text, index) in jobDesc" :key="index">
					<text class="jd-index">{{ index + 1 }}</text>
					<text class="jd-text">{{ text }}</text>
				</view>
			</view>

			<view class="divider"></view>

			<!-- ===== 任职要求 ===== -->
			<text class="section-title">任职要求</text>
			<view class="jd-list">
				<view class="jd-item" v-for="(text, index) in jobDetail.skill_tags" :key="index">
					<text class="jd-index">{{ index + 1 }}</text>
					<text class="jd-text">{{ text }}</text>
				</view>
			</view>

			<text class="updated" v-if="jobDetail.publish_date">职位信息更新于 {{ jobDetail.publish_date }}</text>
		</view>

		<!-- ===== 底部操作栏 ===== -->
		<view class="bottom-bar">
			<view class="btn btn-jd">
				<text class="btn-text">JD 岗位描述</text>
			</view>
			<view class="btn btn-ai" @click="navigateToAI">
				<text class="btn-text btn-text-light">AI 分析匹配度</text>
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

// 静态数据：职位描述（接口暂未返回）
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
	padding-bottom: calc(180rpx + env(safe-area-inset-bottom));
	font-family: Inter, -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', Helvetica, Arial,
		sans-serif;

	/* ===== 顶部导航 ===== */
	.navbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		box-sizing: border-box;
		height: 88rpx;
		margin-top: 8rpx;
		padding: 0 40rpx;

		/* 返回箭头：左 + 下描边旋转 45°，指向左侧 */
		.back {
			flex-shrink: 0;
			width: 20rpx;
			height: 20rpx;
			border-left: 3rpx solid #3d4b54;
			border-bottom: 3rpx solid #3d4b54;
			transform: rotate(45deg);
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

	/* ===== 岗位摘要 ===== */
	.summary {
		padding: 8rpx 40rpx 0;

		.job-title {
			display: block;
			font-size: 52rpx;
			font-weight: 700;
			line-height: 1.25;
			letter-spacing: -1.6rpx;
			color: #17252b;
		}

		.salary-row {
			display: flex;
			align-items: baseline;
			margin-top: 16rpx;

			.job-salary {
				font-size: 38rpx;
				font-weight: 700;
				line-height: 1.2;
				letter-spacing: -0.6rpx;
				color: #007c77;
			}

			.job-exp {
				margin-left: 12rpx;
				font-size: 25rpx;
				line-height: 1.2;
				color: #65747c;
			}
		}

		.meta-row {
			display: flex;
			align-items: center;
			margin-top: 20rpx;

			.meta-pin {
				flex-shrink: 0;
				width: 24rpx;
				height: 30rpx;
			}

			.meta-text {
				margin-left: 12rpx;
				font-size: 25rpx;
				line-height: 1.2;
				color: #65747c;
			}
		}
	}

	/* ===== 公司信息 ===== */
	.company-card {
		display: flex;
		align-items: center;
		box-sizing: border-box;
		height: 150rpx;
		margin: 32rpx 40rpx 0;
		padding: 0 28rpx;
		background-color: #ffffff;
		border: 2rpx solid #e3ebec;
		border-radius: 28rpx;

		.company-logo {
			display: flex;
			align-items: center;
			justify-content: center;
			flex-shrink: 0;
			width: 88rpx;
			height: 88rpx;
			background-color: #26363d;
			border-radius: 24rpx;

			.company-logo-text {
				font-size: 32rpx;
				font-weight: 600;
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
				font-size: 28rpx;
				font-weight: 600;
				line-height: 1.2;
				letter-spacing: -0.3rpx;
				color: #17252b;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}
		}

		/* 右箭头：旋转 45° 的直角边框 */
		.chevron {
			flex-shrink: 0;
			width: 14rpx;
			height: 14rpx;
			margin-left: 16rpx;
			border-right: 3rpx solid #8a979e;
			border-bottom: 3rpx solid #8a979e;
			transform: rotate(-45deg);
		}
	}

	/* ===== 正文 ===== */
	.content {
		padding: 0 40rpx;

		.section-title {
			display: block;
			margin-top: 36rpx;
			font-size: 36rpx;
			font-weight: 700;
			line-height: 1.25;
			letter-spacing: -0.7rpx;
			color: #17252b;
		}

		.jd-list {
			margin-top: 20rpx;

			.jd-item {
				display: flex;
				margin-top: 24rpx;

				&:first-child {
					margin-top: 0;
				}

				.jd-index {
					flex-shrink: 0;
					width: 36rpx;
					font-size: 21rpx;
					line-height: 1.65;
					color: #93a0a7;
				}

				.jd-text {
					flex: 1;
					min-width: 0;
					font-size: 27rpx;
					line-height: 1.65;
					color: #3d4b54;
				}
			}
		}

		.divider {
			height: 2rpx;
			margin: 12rpx 0 0;
			background-color: #edf2f2;
		}

		.updated {
			display: block;
			margin-top: 28rpx;
			font-size: 20rpx;
			line-height: 1.4;
			color: #93a0a7;
		}
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
		padding: 24rpx 40rpx;
		padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
		background-color: #ffffff;
		border-top: 2rpx solid #e3ebec;

		.btn {
			display: flex;
			align-items: center;
			justify-content: center;
			height: 86rpx;
			border-radius: 22rpx;

			.btn-text {
				font-size: 27rpx;
				font-weight: 500;
				line-height: 1;
				color: #3d4b54;
			}

			.btn-text-light {
				font-size: 28rpx;
				font-weight: 600;
				color: #ffffff;
			}
		}

		/* 左：JD 岗位描述 */
		.btn-jd {
			flex: 1;
			box-sizing: border-box;
			background-color: #f7faf9;
			border: 2rpx solid #d7e2e2;
		}

		/* 右：AI 分析匹配度 */
		.btn-ai {
			flex: 1.2;
			margin-left: 24rpx;
			background-image: linear-gradient(180deg, #007c77 0%, #00746f 100%);
		}
	}
}
</style>
