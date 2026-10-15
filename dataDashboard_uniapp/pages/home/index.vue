<template>
	<view class="home">
		<view class="main">
			<!-- 搜索栏 -->
			<searchInput @search="onSearch"></searchInput>

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
							<view class="hero-stat-chart"></view>
						</view>
					</view>
				</swiper-item>
				<swiper-item>暂无图片</swiper-item>
				<swiper-item>暂无图片</swiper-item>
			</swiper>
			<!-- 底部切换点 -->
			<view class="hero-swiper-dots">
				<view :class="{ active: currentSlide === 0 }" class="swiper-dot"></view>
				<view :class="{ active: currentSlide === 1 }" class="swiper-dot"></view>
				<view :class="{ active: currentSlide === 2 }" class="swiper-dot"></view>
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
import { useJobList, type JobFilters, type JobRow } from '@/utils/useJobList'

// swiper 索引
const currentSlide = ref(0)

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

// 搜索：带上关键词跳到搜索结果页
const onSearch = (keyword: string) => {
	uni.navigateTo({
		url: '/pages/searchList/index?keyword=' + encodeURIComponent(keyword)
	})
}

// 点击跳转到详情页
const toDetail = (item: JobRow) => {
	uni.navigateTo({
		url: '/pages/detail/index?id=' + item.id
	})
}

onMounted(() => {
	// 首屏加载第 1 页
	refresh()
})
</script>

<style lang="scss">
/* 搜索框占位符：placeholder-class 需为独立类名，不能嵌套在页面根类里 */
.search-placeholder {
	font-size: 28rpx;
	color: #9aa0a6;
}

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

				// 迷你趋势图：由 clip-path 裁出折线下方的面积，白色系贴合深蓝底
				.hero-stat-chart {
					position: relative;
					width: 100%;
					height: 60rpx;
					margin-top: 8rpx;
					background-image: linear-gradient(180deg, rgba(255, 255, 255, 0.55) 0%, rgba(255, 255, 255, 0) 100%);
					clip-path: polygon(0 82%, 16% 68%, 32% 86%, 48% 48%, 64% 60%, 80% 22%, 100% 8%, 100% 100%, 0 100%);

					// 折线本身：用同一组拐点裁出一条白色细带
					&::after {
						position: absolute;
						top: 0;
						left: 0;
						width: 100%;
						height: 100%;
						background-color: #ffffff;
						content: '';
						clip-path: polygon(0 82%, 16% 68%, 32% 86%, 48% 48%, 64% 60%, 80% 22%, 100% 8%, 100% 12%, 80% 26%, 64% 64%, 48% 52%, 32% 90%, 16% 72%, 0 86%);
					}
				}
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
