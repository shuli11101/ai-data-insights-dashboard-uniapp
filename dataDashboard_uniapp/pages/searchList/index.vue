<template>
	<view class="search-list" :style="{ paddingTop: statusBarHeight + 'px' }">

		<!-- ===== 顶部：返回 + 搜索框 ===== -->
		<view class="top-bar">
			<image class="back-btn" src="/static/icon/aiAnalyse/back.svg" mode="aspectFit" @click="onBack" />
			<view class="search-box">
				<view class="search-icon"></view>
				<input class="search-input" v-model="keyword" type="text" confirm-type="search" placeholder="搜索岗位、公司"
					placeholder-class="search-placeholder" />
				<!-- 关键词非空时显示清除按钮 -->
				<view class="search-clear" v-if="keyword" @click="keyword = ''"></view>
			</view>
			<text @click="onSearch(keyword)" class="search-action">搜索</text>
		</view>

		<!-- ===== 筛选条件 ===== -->
		<view class="filters">
			<view class="chip" :class="{ 'is-active': item.active }" v-for="item in filters" :key="item.id">
				<text class="chip-text">{{ item.label }}</text>
				<view class="chip-caret"></view>
			</view>
		</view>

		<!-- ===== 结果数量 ===== -->
		<view class="result-count">
			<text class="result-count-text">找到 {{ pagination.total }} 个相关岗位</text>
		</view>

		<!-- ===== 岗位列表 ===== -->
		<view class="jobs">
			<view class="job-card" v-for="item in jobList" :key="item.id" @click="toDetail(item)">
				<!-- 岗位名称 + 薪资 -->
				<view class="card-head">
					<text class="job-title">{{ item.job_name }}</text>
					<text class="job-salary">{{ item.salary_min }} - {{ item.salary_max }}</text>
				</view>

				<!-- 公司信息 -->
				<text class="job-company">{{ item.company }}</text>

				<!-- 技能标签 -->
				<view class="job-tags">
					<text class="tag" v-if="!item.isDescription" v-for="tag in item.skill_tags" :key="tag">{{ tag
					}}</text>
					<text class="tag" v-else>{{ item.skill_tags[0] }}</text>
				</view>

				<view class="divider"></view>

				<!-- 工作地点 + 发布时间 -->
				<view class="card-foot">
					<view class="pin"></view>
					<text class="job-address">{{ item.company }}</text>
					<text class="job-time">{{ item.experience }}</text>
				</view>
			</view>
		</view>

		<!-- ===== 已全部加载 ===== -->
		<view class="load-end" v-if="finished && jobList.length">已经到底啦~</view>
	</view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onReachBottom } from '@dcloudio/uni-app'
import searchInput from '@/components/searchInput.vue'
import { useJobList } from '@/utils/useJobList'

// 状态栏高度：自定义导航栏用它做顶部留白（H5 端没有状态栏，取 12px 保底）
const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 12

// 首页通过 URL 参数传来的搜索关键词
const keyword = ref('')

// 搜索浮层组件：点顶部搜索框时展开它
const searchInputRef = ref<{ open: () => void } | null>(null)

/** 筛选项：active 表示已选中的深色态 */
interface FilterChip {
	id: number
	label: string
	active: boolean
}

/** 岗位卡片 */
interface JobCard {
	id: number
	job_name: string
	company: string
	salary_min: number
	salary_max: number
	experience: string
	skill_tags: string[]
	// 有超长标签，卡片上只显示「查看详情」
	isDescription: boolean
}

// 静态数据：筛选项
const filters: FilterChip[] = [
	{ id: 1, label: '城市选择', active: false },
	{ id: 2, label: '经验', active: false },
	{ id: 3, label: '薪资', active: false },
	{ id: 4, label: '学历', active: false }
]

// 静态数据：岗位列表
const jobList = ref<JobCard[]>([])

// 获取岗位，整理数据
const { list, pagination, finished, refresh, loadMore } = useJobList(() => ({ keyword: keyword.value }))
const getList = async () => {
	await refresh()
	console.log("获取岗位，整理数据", list.value)
	jobList.value = list.value
}

onLoad((options) => {
	keyword.value = decodeURIComponent(options?.keyword ?? '')
	jobList.value = []
	getList()
})

// 返回上一页
const onBack = () => {
	uni.navigateBack()
}

// 浮层里点了搜索：换关键词后在本页重新查询
const onSearch = (kw: string) => {
	keyword.value = kw
	getList()
}

// 进入岗位详情
const toDetail = (item: JobCard) => {
	uni.navigateTo({ url: '/pages/detail/index?id=' + item.id })
}

// 下滑加载更多岗位
onReachBottom(() => {
	loadMore()
})
</script>

<style lang="scss">
/* 搜索框占位符：placeholder-class 需为独立类名，不能嵌套在页面根类里 */
.search-placeholder {
	font-size: 28rpx;
	color: #9aa0a6;
}

.search-list {
	box-sizing: border-box;
	min-height: 100vh;
	padding: 0 40rpx 40rpx;
	background-color: #ffffff;
	font-family: Inter, -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif;

	/* ===== 顶部：返回 + 搜索框 ===== */
	.top-bar {
		display: flex;
		align-items: center;
		margin-top: 24rpx;

		.back-btn {
			flex-shrink: 0;
			width: 64rpx;
			height: 64rpx;
			margin-right: 12rpx;
		}

		.search-box {
			display: flex;
			align-items: center;
			box-sizing: border-box;
			flex: 1;
			min-width: 0;
			height: 76rpx;
			padding: 0 24rpx;
			background-color: #f5f5f5;
			border-radius: 38rpx;

			/* 放大镜：圆 + 45° 手柄 */
			.search-icon {
				position: relative;
				flex-shrink: 0;
				width: 18rpx;
				height: 18rpx;
				border: 3rpx solid #737373;
				border-radius: 50%;

				&::after {
					content: '';
					position: absolute;
					right: -6rpx;
					bottom: -5rpx;
					width: 9rpx;
					height: 3rpx;
					background-color: #737373;
					border-radius: 3rpx;
					transform: rotate(45deg);
				}
			}

			.search-input {
				flex: 1;
				min-width: 0;
				margin-left: 20rpx;
				font-size: 28rpx;
				color: #0a0a0a;
			}

			/* 清除按钮：两条 45° 线拼成 × */
			.search-clear {
				position: relative;
				flex-shrink: 0;
				width: 26rpx;
				height: 26rpx;
				margin-left: 16rpx;

				&::before,
				&::after {
					content: '';
					position: absolute;
					top: 50%;
					left: 50%;
					width: 26rpx;
					height: 3rpx;
					background-color: #a3a3a3;
					border-radius: 3rpx;
				}

				&::before {
					transform: translate(-50%, -50%) rotate(45deg);
				}

				&::after {
					transform: translate(-50%, -50%) rotate(-45deg);
				}
			}
		}

		/* 搜索按钮：与搜索框同排的文字按钮 */
		.search-action {
			flex-shrink: 0;
			margin-left: 20rpx;
			font-size: 28rpx;
			line-height: 1;
			color: #0a0a0a;
		}
	}

	/* ===== 筛选条件 ===== */
	.filters {
		display: flex;
		justify-content: space-around;
		gap: 16rpx;
		margin-top: 24rpx;

		.chip {
			display: flex;
			align-items: center;
			justify-content: center;
			box-sizing: border-box;
			height: 60rpx;
			padding: 0 28rpx;
			background-color: #f5f5f5;
			border-radius: 999rpx;

			.chip-text {
				font-size: 26rpx;
				font-weight: 700;
				line-height: 1;
				color: #525252;
			}

			/* 下拉箭头：旋转 45° 的直角边框 */
			.chip-caret {
				width: 12rpx;
				height: 12rpx;
				margin-left: 12rpx;
				margin-bottom: 5rpx;
				border-right: 3rpx solid #525252;
				border-bottom: 3rpx solid #525252;
				transform: rotate(45deg);
			}

			/* 已选中：深色底 + 白字 */
			&.is-active {
				background-color: #0a0a0a;

				.chip-text {
					color: #ffffff;
				}

				.chip-caret {
					border-color: #ffffff;
				}
			}
		}
	}

	/* ===== 结果数量 ===== */
	.result-count {
		margin-top: 24rpx;

		.result-count-text {
			font-size: 24rpx;
			line-height: 1;
			color: #a3a3a3;
		}
	}

	/* ===== 岗位列表 ===== */
	.jobs {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
		margin-top: 18rpx;

		.job-card {
			box-sizing: border-box;
			padding: 20rpx 32rpx 14rpx;
			background-color: #ffffff;
			border: 1px solid #e5e5e5;
			border-radius: 24rpx;

			/* 岗位名称 + 薪资 */
			.card-head {
				display: flex;
				align-items: center;
				justify-content: space-between;
				height: 38rpx;

				.job-title {
					flex: 1;
					min-width: 0;
					font-size: 32rpx;
					font-weight: 700;
					line-height: 1.2;
					color: #0a0a0a;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}

				.job-salary {
					flex-shrink: 0;
					margin-left: 16rpx;
					font-size: 30rpx;
					font-weight: 700;
					line-height: 1.2;
					color: #0a0a0a;
				}
			}

			.job-company {
				display: block;
				margin-top: 8rpx;
				font-size: 25rpx;
				line-height: 1.2;
				color: #737373;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}

			/* 技能标签：浅灰小胶囊 */
			.job-tags {
				display: flex;
				flex-wrap: nowrap;
				gap: 16rpx;
				margin-top: 16rpx;
				overflow: hidden;
				height: 44rpx;

				.tag {
					display: flex;
					align-items: center;
					flex-shrink: 0;
					padding: 0 20rpx;
					font-size: 22rpx;
					line-height: 1;
					color: #525252;
					background-color: #f5f5f5;
					border-radius: 22rpx;
				}
			}

			.divider {
				height: 2rpx;
				margin-top: 16rpx;
				background-color: #f5f5f5;
			}

			/* 工作地点 + 发布时间 */
			.card-foot {
				display: flex;
				align-items: center;
				margin-top: 6rpx;
				height: 30rpx;

				.pin {
					flex-shrink: 0;
					width: 10rpx;
					height: 10rpx;
					margin-right: 10rpx;
					background-color: #737373;
					border-radius: 50%;
				}

				.job-address {
					flex: 1;
					min-width: 0;
					font-size: 24rpx;
					line-height: 1.2;
					color: #737373;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}

				.job-time {
					flex-shrink: 0;
					margin-left: 16rpx;
					font-size: 22rpx;
					line-height: 1;
					color: #a3a3a3;
				}
			}
		}
	}

	/* ===== 已全部加载：到底提示 ===== */
	.load-end {
		margin-top: 32rpx;
		font-size: 24rpx;
		line-height: 1;
		text-align: center;
		color: #a3a3a3;
	}
}
</style>
