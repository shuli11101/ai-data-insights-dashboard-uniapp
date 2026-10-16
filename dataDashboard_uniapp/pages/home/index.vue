<template>
	<view class="home">
		<view class="main">
			<!-- 搜索栏：点击滑入搜索页 -->
			<searchInput @open="toSearchPage"></searchInput>

			<!-- 顶部 Hero 渐变卡片 -->
			<swiper class="hero-swiper" :autoplay="true" :interval="3000" :current="currentSlide"
				@change="currentSlide = $event.detail.current">
				<swiper-item>
					<view class="hero">
						<!-- 品牌图标 -->
						<view class="hero-icon">
							<view class="hero-icon-bar hero-icon-bar--sm"></view>
							<view class="hero-icon-bar hero-icon-bar--md"></view>
							<view class="hero-icon-bar hero-icon-bar--lg"></view>
						</view>
						<!-- 品牌文案 -->
						<view class="hero-text">
							<text class="hero-title">JobVision</text>
							<text class="hero-subtitle">大数据招聘岗位分析平台</text>
						</view>
						<!-- 实时更新徽章 -->
						<view class="hero-badge">
							<view class="hero-badge-dot"></view>
							<text class="hero-badge-text">实时数据更新</text>
						</view>
						<!-- 右侧数据小卡 -->
						<view class="hero-stat">
							<text class="hero-stat-label">近 7 日岗位总量</text>
							<text class="hero-stat-value">+23.6%</text>
							<!-- 迷你折线图：数据由 trendValues 驱动，无数据时不绘制 -->
							<sparkLine class="hero-stat-chart" :values="trendValues" />
						</view>
					</view>
				</swiper-item>
				<!-- 薪酬分布：柱状图，数据为空时整块不渲染 -->
				<swiper-item>
					<view class="salary-card" v-if="salaryBars.length">
						<view class="salary-head">
							<text class="salary-title">薪酬分布</text>
							<text class="salary-subtitle">近 7 日岗位薪资区间分布（单位：个）</text>
						</view>

						<view class="salary-bars">
							<view class="bar-col" v-for="bar in salaryBars" :key="bar.label">
								<!-- <text class="bar-value">{{ formatCount(bar.count) }}</text> -->
								<view class="bar-track">
									<view class="bar" :style="{ height: bar.height + '%' }"></view>
								</view>
								<text class="bar-label">{{ bar.label }}</text>
							</view>
						</view>
					</view>
				</swiper-item>
				<!-- 技术栈热度：横向条形，取频次 Top 6，数据为空时整块不渲染 -->
				<swiper-item>
					<view class="skill-card" v-if="skillBars.length">
						<view class="skill-head">
							<text class="skill-title">技术栈热度</text>
							<text class="skill-subtitle">岗位描述中出现频次 Top 6</text>
						</view>

						<view class="skill-rows">
							<view class="skill-row" v-for="item in skillBars" :key="item.label">
								<text class="skill-name">{{ item.label }}</text>
								<view class="skill-track">
									<view class="skill-fill" :style="{ width: item.percent + '%' }"></view>
									<text class="skill-percent">{{ item.percent }}%</text>
								</view>
							</view>
						</view>
					</view>
				</swiper-item>
				<!-- 城市岗位分布：环形图 + 图例，数据为空时整块不渲染 -->
				<swiper-item>
					<view class="district-card" v-if="districtSlices.length">
						<view class="district-head">
							<text class="district-title">城市岗位分布</text>
							<text class="district-subtitle">城市岗位数量占比</text>
						</view>

						<view class="district-body">
							<view class="district-donut">
								<donutChart :items="districtSlices" :center-value="formatCount(districtTotal)"
									center-label="岗位总量" :thickness-ratio="0.36" />
							</view>

							<view class="district-legend">
								<view class="legend-item" v-for="item in districtSlices" :key="item.name">
									<view class="legend-dot" :style="{ backgroundColor: item.color }"></view>
									<text class="legend-name">{{ item.name }}</text>
									<text class="legend-percent">{{ item.percent }}%</text>
								</view>
							</view>
						</view>
					</view>
				</swiper-item>
			</swiper>
			<!-- 底部切换点 -->
			<view class="hero-swiper-dots">
				<view :class="{ active: currentSlide === 0 }" class="swiper-dot"></view>
				<view :class="{ active: currentSlide === 1 }" class="swiper-dot"></view>
				<view :class="{ active: currentSlide === 2 }" class="swiper-dot"></view>
				<view :class="{ active: currentSlide === 3 }" class="swiper-dot"></view>
			</view>
			<!-- 岗位卡片：一行两个 -->
			<view class="content">
				<view class="card" :class="{ fullCard: index >= 8 && (index - 8) % 9 === 0 }" @click="toDetail(item)"
					v-for="(item, index) in jobList" :key="item.id">
					<!-- 主体信息区 -->
					<view class="card-body">
						<view class="header">
							<view class="header-title">
								<text class="title">{{ item.job_name }}</text>
							</view>
							<text class="company">{{ item.company }}</text>
						</view>
						<text class="salary">{{ item.salary_min }} - {{ item.salary_max }} K</text>
						<view class="skill-tags">
							<text class="tag tag-link" v-if="item.isDescription">查看详情</text>
							<template v-else>
								<text class="tag" v-for="tag in item.skill_tags" :key="tag">{{ tag }}</text>
							</template>
						</view>
					</view>
					<!-- 右侧信息区：仅整行卡片展示（见样式 .fullCard） -->
					<view class="card-side">
						<text class="card-side-exp">{{ item.experience }}</text>
						<text class="card-side-more">查看详情</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { onReachBottom } from '@dcloudio/uni-app'

import searchInput from '@/components/searchInput.vue'
import sparkLine from '@/components/sparkLine.vue'
import donutChart from '@/components/donutChart.vue'
import { getDistrict, getSalaryRange, getSkillTags } from '@/api/server'
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
const { list: jobList, refresh, loadMore } = useJobList(() => query)

onReachBottom(loadMore)

// 点击搜索栏：滑入搜索页
const toSearchPage = () => {
	uni.navigateTo({
		url: '/pages/searchInput/index',
		animationType: 'slide-in-right',
		animationDuration: 300
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
	count: number
	/** 柱高百分比，相对轨道高度 */
	height: number
}

const salaryBars = ref<SalaryBar[]>([])

// 柱顶数量文案：过千折成 15.5k，与参考图一致
const formatCount = (count: number) => (count >= 1000 ? (count / 1000).toFixed(1) + 'k' : String(count))

// 薪资分布数据：最高 15.5k、最低 105，差两个数量级，按比例画小柱子会看不见，
// 所以高度用开方压缩（数值仍在柱顶如实标注）；想改成等比，把 sqrt 去掉即可
const getSalaryChartData = async () => {
	const res = await getSalaryRange()
	const max = Math.max(...res.map(({ jobCount }) => jobCount))
	salaryBars.value = res.map(({ salary_range, jobCount }) => ({
		label: salary_range.replace(/K$/, ''),
		count: jobCount,
		// 下限 10%，保证最小的区间也能看到一根短柱
		height: Math.max(10, Math.sqrt(jobCount / max) * 100)
	}))
}

// 技术栈热度横向条形图
interface SkillBar {
	label: string
	/** 相对最高频次的占比，同时决定条长和右侧百分比 */
	percent: number
}

const skillBars = ref<SkillBar[]>([])

// 技术栈热度数据：接口已按频次降序，取前 6 条
const getSkillChartData = async () => {
	const res = await getSkillTags()
	const max = res[0]?.hot_count || 1
	skillBars.value = res.slice(0, 5).map(({ skill_tag, hot_count }) => ({
		label: skill_tag,
		percent: Math.round((hot_count / max) * 100)
	}))
}

// 城市岗位分布环形图
interface DistrictSlice {
	name: string
	/** 岗位数：环图按它算扇区角度 */
	value: number
	color: string
	percent: number
}

const districtSlices = ref<DistrictSlice[]>([])
const districtTotal = ref(0)

// 环图配色：蓝色由浅到深，末位「其他」用灰色
const DISTRICT_COLORS = ['#ffffff', '#c3d6ff', '#98b6f7', '#6b93ea', '#8b9bc0']
// 单独成扇区的城市数量，其余城市合并成「其他」
const DISTRICT_CITY_COUNT = 4

// 城市岗位分布数据：城市按岗位数降序取前 4，其余（含接口的兜底项「其他」）合并成一个扇区
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

	districtTotal.value = top.reduce((sum, { job_count }) => sum + job_count, 0) + rest
	districtSlices.value = [
		...top.map(({ area_name, job_count }, index) => ({
			name: area_name,
			value: job_count,
			color: DISTRICT_COLORS[index],
			percent: Math.round((job_count / districtTotal.value) * 100)
		})),
		{
			name: '其他',
			value: rest,
			color: DISTRICT_COLORS[DISTRICT_COLORS.length - 1],
			percent: Math.round((rest / districtTotal.value) * 100)
		}
	]
}

onMounted(() => {
	// 首屏加载第 1 页
	refresh()
	// 薪资分布数据
	getSalaryChartData()
	// 技术栈热度数据
	getSkillChartData()
	// 地方岗位数量数据
	getDistrictChartData()
})
</script>

<style lang="scss">
.home {
	width: 100%;
	min-height: 100vh;
	background-color: #f8f8f8;

	.main {
		padding: 0 24rpx;

		// ===== 顶部 Hero 渐变卡片 =====
		.hero {
			position: relative;
			width: 100%;
			height: 288rpx;
			background-image: linear-gradient(135deg, #3468f2 0%, #2350cc 52%, #16318f 100%);
			border-radius: 31rpx;
			overflow: hidden;

			// 品牌图标：白色小柱子拼成数据图标
			.hero-icon {
				position: absolute;
				left: 31rpx;
				top: 31rpx;
				display: flex;
				align-items: flex-end;
				justify-content: center;
				box-sizing: border-box;
				width: 81rpx;
				height: 81rpx;
				padding-bottom: 21rpx;
				background-color: #ffffff;
				border-radius: 50%;

				.hero-icon-bar {
					width: 8rpx;
					margin: 0 3rpx;
					background-color: #2350cc;
					border-radius: 3rpx;

					&--sm {
						height: 12rpx;
					}

					&--md {
						height: 20rpx;
					}

					&--lg {
						height: 27rpx;
					}
				}
			}

			// 品牌文案
			.hero-text {
				position: absolute;
				left: 135rpx;
				top: 34rpx;

				.hero-title {
					display: block;
					font-size: 42rpx;
					font-weight: bold;
					line-height: 1.1;
					color: #ffffff;
				}

				.hero-subtitle {
					display: block;
					margin-top: 10rpx;
					font-size: 22rpx;
					line-height: 1.2;
					color: #bccdf5;
				}
			}

			// 实时更新徽章
			.hero-badge {
				position: absolute;
				left: 31rpx;
				top: 162rpx;
				display: flex;
				align-items: center;
				box-sizing: border-box;
				height: 50rpx;
				padding: 0 20rpx;
				background-color: rgba(255, 255, 255, 0.18);
				border-radius: 25rpx;

				.hero-badge-dot {
					width: 13rpx;
					height: 13rpx;
					background-color: #4ade80;
					border-radius: 50%;
				}

				.hero-badge-text {
					margin-left: 12rpx;
					font-size: 21rpx;
					line-height: 1;
					color: #ffffff;
				}
			}

			// 右侧数据小卡
			.hero-stat {
				position: absolute;
				right: 35rpx;
				top: 27rpx;
				box-sizing: border-box;
				width: 231rpx;
				height: 177rpx;
				padding: 22rpx 22rpx 0;
				background-color: rgba(255, 255, 255, 0.16);
				border: 2rpx solid rgba(255, 255, 255, 0.28);
				border-radius: 23rpx;

				.hero-stat-label {
					display: block;
					font-size: 18rpx;
					line-height: 1.2;
					color: #ccdaf9;
				}

				.hero-stat-value {
					display: block;
					margin-top: 4rpx;
					font-size: 33rpx;
					font-weight: bold;
					line-height: 1.2;
					color: #ffffff;
				}

				// 迷你趋势图：只负责占位与定尺寸，折线由 sparkLine 组件用 canvas 绘制
				.hero-stat-chart {
					width: 100%;
					height: 60rpx;
					margin-top: 8rpx;
				}
			}
		}

		// ===== 薪酬分布柱状图 =====
		.salary-card {
			display: flex;
			flex-direction: column;
			box-sizing: border-box;
			width: 100%;
			height: 288rpx;
			padding: 24rpx 28rpx 16rpx;
			background-image: linear-gradient(135deg, #1b2a7a 0%, #2a55dd 100%);
			border-radius: 31rpx;
			overflow: hidden;

			.salary-title {
				display: block;
				font-size: 30rpx;
				font-weight: bold;
				line-height: 1.1;
				color: #ffffff;
			}

			.salary-subtitle {
				display: block;
				margin-top: 6rpx;
				font-size: 19rpx;
				line-height: 1.2;
				color: #b9c9f5;
			}

			// 柱区：等分若干列，整体贴着卡片底部
			.salary-bars {
				display: flex;
				flex: 1;
				align-items: flex-end;
				margin-top: 12rpx;

				.bar-col {
					display: flex;
					flex-direction: column;
					align-items: center;
					flex: 1;
					min-width: 0;
				}

				// 柱顶数值
				.bar-value {
					font-size: 18rpx;
					font-weight: bold;
					line-height: 1;
					color: #ffffff;
				}

				// 轨道：柱高百分比以此为基准，柱子从底部往上长
				.bar-track {
					display: flex;
					align-items: flex-end;
					justify-content: center;
					width: 100%;
					height: 112rpx;
					margin-top: 8rpx;
				}

				.bar {
					width: 40rpx;
					background-color: #ffffff;
					border-radius: 10rpx 10rpx 0 0;
				}

				// 区间刻度
				.bar-label {
					margin-top: 8rpx;
					font-size: 19rpx;
					line-height: 1;
					color: #d5dffa;
					white-space: nowrap;
				}
			}
		}

		// ===== 技术栈热度横向条形图 =====
		.skill-card {
			display: flex;
			flex-direction: column;
			box-sizing: border-box;
			width: 100%;
			height: 288rpx;
			padding: 24rpx 28rpx 20rpx;
			background-image: linear-gradient(135deg, #1b2a7a 0%, #2a55dd 100%);
			border-radius: 31rpx;
			overflow: hidden;

			.skill-title {
				display: block;
				font-size: 30rpx;
				font-weight: bold;
				line-height: 1.1;
				color: #ffffff;
			}

			.skill-subtitle {
				display: block;
				margin-top: 6rpx;
				font-size: 19rpx;
				line-height: 1.2;
				color: #b9c9f5;
			}

			// 条形区：6 行等距铺满剩余高度
			.skill-rows {
				display: flex;
				flex: 1;
				flex-direction: column;
				justify-content: space-between;
				margin-top: 12rpx;
			}

			.skill-row {
				display: flex;
				align-items: center;
			}

			// 技能名：定宽，保证所有条形起点对齐
			.skill-name {
				flex-shrink: 0;
				box-sizing: border-box;
				width: 120rpx;
				padding-right: 10rpx;
				font-size: 20rpx;
				line-height: 1;
				color: #e3ebff;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}

			// 轨道：浅色底 + 白色填充，百分比跟在填充末端
			.skill-track {
				display: flex;
				align-items: center;
				flex: 1;
				min-width: 0;
				height: 22rpx;
				background-color: rgba(255, 255, 255, 0.18);
				border-radius: 999rpx;
			}

			// 百分比文案放不下时，靠 flex 收缩让出宽度，条形不会顶出轨道
			.skill-fill {
				height: 100%;
				background-color: #ffffff;
				border-radius: 999rpx;
			}

			.skill-percent {
				flex-shrink: 0;
				margin-left: 8rpx;
				font-size: 18rpx;
				font-weight: bold;
				line-height: 1;
				color: #ffffff;
			}
		}

		// ===== 城市岗位分布环形图 =====
		.district-card {
			display: flex;
			flex-direction: column;
			box-sizing: border-box;
			width: 100%;
			height: 288rpx;
			padding: 24rpx 28rpx 20rpx;
			background-image: linear-gradient(135deg, #1b2a7a 0%, #2a55dd 100%);
			border-radius: 31rpx;
			overflow: hidden;

			.district-head {
				display: flex;
				gap: 12rpx;
			}

			.district-title {
				display: block;
				font-size: 30rpx;
				font-weight: bold;
				line-height: 1.1;
				color: #ffffff;
			}

			.district-subtitle {
				display: block;
				margin-top: 6rpx;
				font-size: 19rpx;
				line-height: 1.2;
				color: #b9c9f5;
			}

			// 左环图 + 右图例
			.district-body {
				display: flex;
				align-items: center;
				flex: 1;
				margin-top: 10rpx;
			}

			// 环形图：竖直方向随 .district-body 居中，水平靠左半区留白，
			// 使环图中心落在卡片中间偏左的位置（调整这个百分比即可左右挪动）
			.district-donut {
				flex-shrink: 0;
				width: 180rpx;
				height: 180rpx;
				margin-left: 22%;
			}

			.district-legend {
				display: flex;
				align-self: stretch;
				flex: 1;
				flex-direction: column;
				justify-content: center;
				align-items: center;
				margin-left: 20rpx;
				gap: 18rpx;
			}

			.legend-item {
				display: flex;
				align-items: center;
			}

			.legend-dot {
				flex-shrink: 0;
				width: 14rpx;
				height: 14rpx;
				border-radius: 50%;
			}

			.legend-name {
				flex: 1;
				margin-left: 12rpx;
				font-size: 21rpx;
				line-height: 1;
				color: #ffffff;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}

			.legend-percent {
				flex-shrink: 0;
				font-size: 21rpx;
				font-weight: bold;
				line-height: 1;
				color: #ffffff;
			}
		}

		// 切换图导航点
		.hero-swiper-dots {
			display: flex;
			align-items: center;
			justify-content: flex-start;
			margin-top: 16rpx;
			margin-left: 24rpx;
			gap: 12rpx;

			.swiper-dot {
				width: 12rpx;
				height: 12rpx;
				background-color: #c9cfdd;
				border-radius: 50%;


			}

			.active {
				width: 24rpx;
				background-color: #2e63e8;
				border-radius: 30%;
			}
		}

		// ===== 岗位卡片列表 =====
		.content {
			display: flex;
			flex-wrap: wrap;
			justify-content: space-between;
			margin-top: 24rpx;



			.card {
				box-sizing: border-box;
				width: 48%;
				margin-bottom: 16rpx;
				padding: 28rpx;
				background-color: #ffffff;
				border-radius: 16rpx;
				box-shadow: 0 8rpx 24rpx rgba(31, 60, 120, 0.08);

				// 主体信息区：整行卡片下与右侧信息区并排，负责占满剩余宽度
				.card-body {
					flex: 1;
					min-width: 0;
				}

				// 右侧信息区：默认隐藏，仅在整行卡片中展示
				.card-side {
					display: none;
				}

				.header {
					display: flex;
					flex-direction: column;

					.header-title {
						display: flex;
						align-items: center;
						justify-content: space-between;

						// 标题：黑色加粗，作为卡片视觉重心
						.title {
							font-size: 30rpx;
							font-weight: bold;
							line-height: 1.2;
							color: #222222;
							white-space: nowrap;
							overflow: hidden;
							text-overflow: ellipsis;
						}

						.experience {
							display: block;
							font-size: 24rpx;
							line-height: 1.2;
							color: #9aa0a6;
						}
					}

					.company {
						margin-top: 4rpx;
						font-size: 20rpx;
						line-height: 1.2;
						color: #9aa0a6;
						overflow: hidden;
						text-overflow: ellipsis;
						white-space: nowrap;
					}
				}

				// 薪资：蓝色加粗，作为卡片的关键信息
				.salary {
					display: block;
					margin-top: 10rpx;
					font-size: 26rpx;
					font-weight: bold;
					line-height: 1.2;
					color: #2e63e8;
				}

				// 技能标签：只保留一行，超出部分直接裁掉
				.skill-tags {
					display: flex;
					flex-wrap: nowrap;
					margin-top: 8rpx;
					overflow: hidden;

					// 技能标签：浅灰小胶囊
					.tag {
						// 单行布局下禁止压缩，超出部分由容器裁掉
						flex-shrink: 0;
						margin: 0 6rpx 0 0;
						padding: 4rpx 12rpx;
						font-size: 20rpx;
						line-height: 1.4;
						color: #8a9099;
						background-color: #f5f6f8;
						border-radius: 8rpx;
					}

					// 无技能标签时的“查看详情”：仅蓝色文字，不带底色
					.tag-link {
						font-weight: 500;
						color: #2e63e8;
						background-color: #eff6ff;
						border-radius: 40%;
					}
				}
			}

			// 一整行卡片：左右分栏把整行铺满，避免内容单薄
			.fullCard {
				display: flex;
				align-items: center;
				justify-content: space-between;
				width: 100%;

				// 整行卡片是视觉重心，标题适当放大
				.header .header-title .title {
					font-size: 34rpx;
				}

				// 薪资作为关键信息，整行卡片下用主色强调
				.salary {
					margin-top: 14rpx;
					font-size: 30rpx;
					font-weight: bold;
					color: #2e63e8;
				}

				// 横向空间充足，技能标签换行展示全部
				.skill-tags {
					flex-wrap: wrap;
					overflow: visible;
				}

				// 右侧信息区：经验标签 + 行动按钮，把右侧空间用满
				.card-side {
					display: flex;
					flex-direction: column;
					align-items: flex-end;
					flex-shrink: 0;
					margin-left: 28rpx;

					.card-side-exp {
						padding: 8rpx 22rpx;
						font-size: 22rpx;
						line-height: 1.2;
						color: #2e63e8;
						background-color: #eef2fd;
						border-radius: 999rpx;
					}

					.card-side-more {
						margin-top: 14rpx;
						padding: 8rpx 22rpx;
						font-size: 22rpx;
						line-height: 1.2;
						color: #ffffff;
						background-color: #2e63e8;
						border-radius: 999rpx;
					}
				}
			}
		}
	}
}
</style>
