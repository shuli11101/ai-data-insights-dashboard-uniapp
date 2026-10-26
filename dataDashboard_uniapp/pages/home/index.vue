<template>
	<view class="home">
		<!-- #ifdef APP-PLUS -->
		<appSplash />
		<!-- #endif -->

		<view class="main">
			<!-- 搜索栏：点击滑入搜索页 -->
			<searchInput @open="toSearchPage" @filter="toSearchListPage"></searchInput>

			<!-- 数据卡片轮播 -->
			<swiper class="hero-swiper" :autoplay="true" :interval="3000" :current="currentSlide"
				@change="currentSlide = $event.detail.current" :circular="true">
				<!-- 经验与平均薪资：折线图，数据为空时整块不渲染 -->
				<swiper-item>
					<view class="chart-card" v-if="experiencePoints.length">
						<view class="card-head">
							<text class="card-title">经验与平均薪资</text>
							<text class="card-subtitle">不同工作经验对应的平均月薪（单位：K）</text>
						</view>

						<view class="chart-body">
							<lineChart :items="experiencePoints" unit="K" />
						</view>
					</view>
				</swiper-item>

				<!-- 品牌与近 7 日趋势 -->
				<swiper-item>
					<view class="hero">
						<view class="hero-top">
							<view class="hero-icon">
								<view class="hero-icon-bar hero-icon-bar--sm"></view>
								<view class="hero-icon-bar hero-icon-bar--md"></view>
								<view class="hero-icon-bar hero-icon-bar--lg"></view>
							</view>
							<view class="hero-text">
								<text class="hero-title">JobVision</text>
								<text class="hero-subtitle">大数据招聘岗位分析平台</text>
							</view>
						</view>

						<view class="hero-bottom">
							<view class="hero-badge">
								<view class="hero-badge-dot"></view>
								<text class="hero-badge-text">实时数据更新</text>
							</view>
							<view class="hero-stat">
								<text class="hero-stat-label">近 7 日岗位总量</text>
								<text class="hero-stat-value">+23.6%</text>
								<!-- 迷你折线图：数据由 trendValues 驱动，无数据时不绘制 -->
								<sparkLine class="hero-stat-chart" :values="trendValues" line-color="#007C77"
									area-from="rgba(0, 124, 119, 0.16)" area-to="rgba(0, 124, 119, 0)" />
							</view>
						</view>
					</view>
				</swiper-item>

				<!-- 薪酬分布：柱状图，数据为空时整块不渲染 -->
				<swiper-item>
					<salaryChart v-if="salaryBars.length" :items="salaryBars" />
				</swiper-item>

				<!-- 技术栈热度：横向条形，取频次 Top 6，数据为空时整块不渲染 -->
				<swiper-item>
					<skillChart v-if="skillBars.length" :items="skillBars" />
				</swiper-item>

				<!-- 城市岗位分布：分段条 + 图例，数据为空时整块不渲染 -->
				<swiper-item>
					<districtChart v-if="districtSlices.length" :items="districtSlices" />
				</swiper-item>
			</swiper>

			<!-- 轮播切换点 -->
			<view class="hero-swiper-dots">
				<view :class="{ active: currentSlide === 0 }" class="swiper-dot"></view>
				<view :class="{ active: currentSlide === 1 }" class="swiper-dot"></view>
				<view :class="{ active: currentSlide === 2 }" class="swiper-dot"></view>
				<view :class="{ active: currentSlide === 3 }" class="swiper-dot"></view>
				<view :class="{ active: currentSlide === 4 }" class="swiper-dot"></view>
			</view>

			<!-- 列表标题 -->
			<view class="section-head" v-if="jobList.length">
				<text class="section-title">推荐职位</text>
				<text class="section-count">{{ pagination.total }} 个机会</text>
			</view>

			<!-- 岗位列表：单列信息流 -->
			<view class="content">
				<view class="job" v-for="item in jobList" :key="item.id" @click="toDetail(item)">
					<!-- 第一行：岗位名 + 薪资 -->
					<view class="job-top">
						<text class="job-name">{{ item.job_name }}</text>
						<text class="job-salary">{{ item.salary_min }}-{{ item.salary_max }}K</text>
					</view>

					<!-- 第二行：公司 -->
					<text class="job-company">{{ item.company }}</text>

					<!-- 第三行：经验 + 技能标签 -->
					<view class="job-tags">
						<text class="job-tag">{{ item.experience }}</text>
						<text class="job-tag" v-for="tag in item.skill_tags.slice(0, 2)" :key="tag">{{ tag }}</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { onLoad, onReachBottom } from '@dcloudio/uni-app'


import searchInput from '@/components/searchInput.vue'
// #ifdef APP-PLUS
import appSplash from '@/components/AppSplash.vue'
// #endif
import sparkLine from '@/components/home/sparkLine.vue'
import districtChart from '@/components/home/districtChart.vue'
import lineChart from '@/components/home/lineChart.vue'
import salaryChart from '@/components/home/salaryChart.vue'
import skillChart from '@/components/home/skillChart.vue'
import { getDistrict, getExperienceSalary, getSalaryRange, getSkillTags } from '@/api/server'
import { useJobList, type JobFilters, type JobRow } from '@/utils/useJobList'

// swiper 索引
const currentSlide = ref(0)

// 近 7 日岗位总量趋势：暂时用假数据（末值比首值 +23.6%，与卡片上写的涨幅对齐），
// 等后端提供按日聚合的接口后，把返回值赋给这里即可
const trendValues = ref<number[]>([1180, 1206, 1176, 1258, 1219, 1362, 1458])

// 岗位筛选参数
const query = reactive<JobFilters>({
	jobName: '',
	city: '',
	experienceMin: '',
	experienceMax: '',
	salaryMin: '',
	salaryMax: '',
	keyword: '',
})

// 岗位列表
const { list: jobList, pagination, refresh, loadMore } = useJobList(() => query)

onReachBottom(loadMore)

// 点击搜索栏：滑入搜索页
const toSearchPage = () => {
	uni.navigateTo({
		url: '/pages/searchInput/index',
		animationType: 'slide-in-right',
		animationDuration: 300
	})
}

// 点击筛选按钮：进入搜索结果页，可继续按条件筛选
const toSearchListPage = () => {
	uni.navigateTo({
		url: '/pages/searchList/index'
	})
}

// 点击跳转到详情页
const toDetail = (item: JobRow) => {
	uni.navigateTo({
		url: '/pages/detail/index?id=' + item.id
	})
}

// 薪资分布柱状图
interface SalaryBar {
	/** 区间文案：去掉结尾的 K，8 根柱子并排也不挤 */
	label: string
	/** 柱高百分比，相对轨道高度 */
	height: number
}

const salaryBars = ref<SalaryBar[]>([])

// 薪资分布数据：最高 15.5k、最低 105，差两个数量级，按比例画小柱子会看不见，
// 所以高度用开方压缩；想改成等比，把 sqrt 去掉即可
const getSalaryChartData = async () => {
	const res = await getSalaryRange()
	const max = Math.max(...res.map(({ jobCount }) => jobCount))
	salaryBars.value = res.map(({ salary_range, jobCount }) => ({
		label: salary_range.replace(/K$/, ''),
		// 下限 10%，保证最小的区间也能看到一根短柱
		height: Math.max(10, Math.sqrt(jobCount / max) * 100)
	}))
}

// 经验与平均薪资折线图
interface ExperiencePoint {
	label: string
	value: number
}

const experiencePoints = ref<ExperiencePoint[]>([])

// 经验薪资数据：接口已按经验从低到高排列，直接映射为折线点
const getExperienceChartData = async () => {
	const res = await getExperienceSalary()
	experiencePoints.value = res.map(({ experience, avg_salary }) => ({
		label: experience,
		value: avg_salary
	}))
}

// 技术栈热度横向条形图
interface SkillBar {
	label: string
	/** 相对最高频次的占比，同时决定条长和右侧百分比 */
	percent: number
}

const skillBars = ref<SkillBar[]>([])

// 技术栈热度数据：接口已按频次降序，取前 5 条
const getSkillChartData = async () => {
	const res = await getSkillTags()
	const max = res[0]?.hot_count || 1
	skillBars.value = res.slice(0, 5).map(({ skill_tag, hot_count }) => ({
		label: skill_tag,
		percent: Math.round((hot_count / max) * 100)
	}))
}

// 城市岗位分布分段条
interface DistrictSlice {
	name: string
	percent: number
}

const districtSlices = ref<DistrictSlice[]>([])

// 单独成段的城市数量，其余城市合并成「其他」
const DISTRICT_CITY_COUNT = 4

// 城市岗位分布数据：城市按岗位数降序取前 4，其余（含接口的兜底项「其他」）合并成一个段
const getDistrictChartData = async () => {
	const res = await getDistrict()
	// 接口里的「其他」是兜底汇总项，不参与城市排序
	const cities = res
		.filter(({ area_name }) => area_name !== '其他')
		.sort((a, b) => b.job_count - a.job_count)
	const top = cities.slice(0, DISTRICT_CITY_COUNT)
	const rest =
		cities.slice(DISTRICT_CITY_COUNT).reduce((sum, { job_count }) => sum + job_count, 0) +
		(res.find(({ area_name }) => area_name === '其他')?.job_count ?? 0)
	const total = top.reduce((sum, { job_count }) => sum + job_count, 0) + rest
	if (!total) return

	districtSlices.value = [
		...top.map(({ area_name, job_count }) => ({
			name: area_name,
			percent: Math.round((job_count / total) * 100)
		})),
		{
			name: '其他',
			percent: Math.round((rest / total) * 100)
		}
	]
}

onLoad(() => {
	// 首屏加载第 1 页
	refresh()
	// 薪资分布数据
	getSalaryChartData()
	// 经验薪资折线图数据
	getExperienceChartData()
	// 技术栈热度数据
	getSkillChartData()
	// 地方岗位数量数据
	getDistrictChartData()
})
</script>

<style lang="scss" scoped>
.home {
	width: 100%;
	min-height: 100vh;
	padding-top: 24rpx;

	.main {
		padding: 0 40rpx 40rpx;

		// 轮播高度与卡片一致；左右负边距让轮播比正文更宽
		.hero-swiper {
			height: 392rpx;
			margin: 0 -16rpx;
		}

		// ===== 卡片通用外观：白底 + 细描边 + 大圆角 =====
		.hero,
		.chart-card {
			display: flex;
			flex-direction: column;
			box-sizing: border-box;
			width: 100%;
			height: 392rpx;
			padding: 32rpx;
			background-color: #ffffff;
			border: 2rpx solid #e9eeec;
			border-radius: 32rpx;
		}

		// ===== 折线图卡片 =====
		.chart-card {
			.card-title {
				display: block;
				font-size: 32rpx;
				font-weight: 700;
				line-height: 1.15;
				color: #0a0a0a;
			}

			.card-subtitle {
				display: block;
				margin-top: 8rpx;
				font-size: 22rpx;
				line-height: 1.2;
				color: #a3a3a3;
			}

			// 图表占满剩余高度，尺寸由 canvas 自行量取
			.chart-body {
				flex: 1;
				min-height: 0;
				margin-top: 12rpx;
			}
		}

		// ===== 品牌与趋势卡片 =====
		.hero {
			justify-content: space-between;

			.hero-top {
				display: flex;
				align-items: center;
			}

			// 品牌图标：浅灰底 + 青色小柱子
			.hero-icon {
				display: flex;
				align-items: flex-end;
				justify-content: center;
				flex-shrink: 0;
				box-sizing: border-box;
				width: 96rpx;
				height: 96rpx;
				padding-bottom: 24rpx;
				background-color: #f5f5f5;
				border-radius: 24rpx;

				.hero-icon-bar {
					width: 8rpx;
					margin: 0 3rpx;
					background-color: #007c77;
					border-radius: 4rpx;

					&--sm {
						height: 14rpx;
					}

					&--md {
						height: 24rpx;
					}

					&--lg {
						height: 34rpx;
					}
				}
			}

			.hero-text {
				min-width: 0;
				margin-left: 24rpx;

				.hero-title {
					display: block;
					font-size: 40rpx;
					font-weight: 700;
					line-height: 1.1;
					color: #0a0a0a;
				}

				.hero-subtitle {
					display: block;
					margin-top: 8rpx;
					font-size: 22rpx;
					line-height: 1.2;
					color: #a3a3a3;
				}
			}

			.hero-bottom {
				display: flex;
				align-items: flex-end;
				justify-content: space-between;
				flex: 1;
				margin-top: 12rpx;
				margin-bottom: 12rpx;
			}

			// 实时更新徽章
			.hero-badge {
				display: flex;
				align-items: center;
				box-sizing: border-box;
				height: 44rpx;
				margin-bottom: 12rpx;
				padding: 0 18rpx;
				background-color: #f5f5f5;
				border-radius: 22rpx;

				.hero-badge-dot {
					width: 12rpx;
					height: 12rpx;
					background-color: #007c77;
					border-radius: 50%;
				}

				.hero-badge-text {
					margin-left: 10rpx;
					font-size: 20rpx;
					line-height: 1;
					color: #737373;
				}
			}

			// 右侧趋势小卡
			.hero-stat {
				box-sizing: border-box;
				width: 300rpx;
				height: 176rpx;
				padding: 20rpx 22rpx 0;
				background-color: #fafafa;
				border: 2rpx solid #eeeeee;
				border-radius: 20rpx;

				.hero-stat-label {
					display: block;
					font-size: 20rpx;
					line-height: 1.2;
					color: #a3a3a3;
				}

				.hero-stat-value {
					display: block;
					margin-top: 4rpx;
					font-size: 36rpx;
					font-weight: 700;
					line-height: 1.2;
					color: #0a0a0a;
				}

				// 迷你趋势图：只负责占位与定尺寸，折线由 sparkLine 组件用 canvas 绘制
				.hero-stat-chart {
					width: 100%;
					height: 72rpx;
					margin-top: 8rpx;
				}
			}
		}

		// 轮播切换点
		.hero-swiper-dots {
			display: flex;
			align-items: center;
			justify-content: center;
			margin-top: 24rpx;
			gap: 12rpx;

			.swiper-dot {
				width: 12rpx;
				height: 12rpx;
				background-color: #d8dddd;
				border-radius: 50%;
				transition: all 0.2s ease;
			}

			.active {
				width: 32rpx;
				border-radius: 6rpx;
				background-color: #007c77;
			}
		}

		// ===== 列表标题 =====
		.section-head {
			display: flex;
			align-items: flex-end;
			justify-content: space-between;
			margin: 48rpx 0 8rpx;

			.section-title {
				font-size: 36rpx;
				font-weight: 700;
				line-height: 1.1;
				letter-spacing: -0.4rpx;
				color: #17252b;
			}

			.section-count {
				font-size: 22rpx;
				line-height: 1.2;
				color: #78868f;
			}
		}

		// ===== 岗位列表：单列信息流，行间用浅色分隔线 =====
		.content {
			display: flex;
			flex-direction: column;

			.job {
				padding: 26rpx 0 30rpx;
				border-bottom: 2rpx solid #edf2f2;

				&:last-child {
					padding-bottom: 0;
					border-bottom: none;
				}

				// 第一行：岗位名 + 薪资
				.job-top {
					display: flex;
					align-items: baseline;
					justify-content: space-between;
				}

				.job-name {
					flex: 1;
					min-width: 0;
					margin-right: 20rpx;
					font-size: 30rpx;
					font-weight: 600;
					line-height: 1.2;
					letter-spacing: -0.3rpx;
					color: #17252b;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}

				.job-salary {
					flex-shrink: 0;
					font-size: 31rpx;
					font-weight: 700;
					line-height: 1.2;
					letter-spacing: -0.4rpx;
					color: #007c77;
				}

				// 第二行：公司
				.job-company {
					display: block;
					margin-top: 14rpx;
					font-size: 24rpx;
					line-height: 1.2;
					color: #65747c;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}

				// 第三行：经验 + 技能标签
				.job-tags {
					display: flex;
					flex-wrap: nowrap;
					margin-top: 16rpx;
					overflow: hidden;

					.job-tag {
						flex-shrink: 0;
						box-sizing: border-box;
						max-width: 220rpx;
						height: 40rpx;
						margin-right: 10rpx;
						padding: 0 12rpx;
						font-size: 20rpx;
						line-height: 40rpx;
						color: #627178;
						background-color: #f3f6f6;
						border-radius: 8rpx;
						white-space: nowrap;
						overflow: hidden;
						text-overflow: ellipsis;
					}
				}
			}
		}
	}
}
</style>
