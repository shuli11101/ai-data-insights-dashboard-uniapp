<template>
	<view class="analyse-home" :style="{ paddingTop: statusBarHeight + 'px' }">
		<!-- ===== 顶部标题 + 新建按钮 ===== -->
		<view class="header">
			<text class="header-title">AI 分析</text>
			<view class="header-add" @click="toAnalyse"></view>
		</view>

		<!-- ===== 两个入口卡片 ===== -->
		<view class="entries">
			<view class="entry" v-for="item in entries" :key="item.id" @click="toAnalyse">
				<view class="entry-icon">
					<image class="entry-icon-img" :src="item.icon" mode="aspectFit" />
				</view>
				<text class="entry-title">{{ item.title }}</text>
				<text class="entry-desc">{{ item.desc }}</text>
			</view>
		</view>

		<!-- ===== 历史会话标题栏 ===== -->
		<view class="section-head">
			<text class="section-title">历史会话</text>
			<text class="section-count">{{ sessions.length }} 条记录</text>
		</view>

		<!-- ===== 历史会话列表 ===== -->
		<view class="panel">
			<view class="session" v-for="item in sessions" :key="item.id" @click="toAnalyse">
				<!-- 左侧图标：深色圆 = 匹配度分析，浅色方 = 技术栈评估 -->
				<view class="session-icon" :class="item.type === 'match' ? 'is-match' : 'is-stack'">
					<image class="session-icon-img" :src="item.icon" mode="aspectFit" />
				</view>

				<!-- 中间：标题 + 摘要 -->
				<view class="session-main">
					<text class="session-name">{{ item.title }}</text>
					<text class="session-desc">{{ item.desc }}</text>
				</view>

				<!-- 右侧：时间 + 徽标 -->
				<view class="session-side">
					<text class="session-time">{{ item.time }}</text>
					<view class="session-badge" :class="item.type === 'match' ? 'is-score' : 'is-grade'">
						{{ item.badge }}
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
// 状态栏高度：自定义导航栏用它做顶部留白
// H5 端拿不到状态栏高度（为 0），给 44px 保底，避免标题贴顶
const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 12

/** 入口卡片：技术栈评估 / JD 匹配 */
interface EntryItem {
	id: number
	icon: string
	title: string
	desc: string
}

/** 历史会话：match = 匹配度分析（深色圆 + 百分比），stack = 技术栈评估（浅色方 + 评级） */
interface SessionItem {
	id: number
	type: 'match' | 'stack'
	icon: string
	title: string
	time: string
	desc: string
	badge: string
}

// 静态数据：入口卡片
const entries: EntryItem[] = [
	{ id: 1, icon: '/static/icon/aiAnalyse/entry-stack.svg', title: '技术栈评估', desc: '输入技能，了解自身实力' },
	{ id: 2, icon: '/static/icon/aiAnalyse/entry-jd.svg', title: 'JD 匹配', desc: '粘贴岗位，测算匹配度' }
]

// 静态数据：历史会话
const sessions: SessionItem[] = [
	{
		id: 1,
		type: 'match',
		icon: '/static/icon/aiAnalyse/session-square.svg',
		title: '前端开发工程师 · 字节跳动',
		time: '10:24',
		desc: '匹配度分析完成，核心优势：React…',
		badge: '86%'
	},
	{
		id: 2,
		type: 'stack',
		icon: '/static/icon/aiAnalyse/session-chart.svg',
		title: 'React / TypeScript / Node.js',
		time: '昨天',
		desc: '技术栈评估完成，综合实力评级…',
		badge: '评级 A'
	},
	{
		id: 3,
		type: 'match',
		icon: '/static/icon/aiAnalyse/session-square.svg',
		title: '高级前端工程师 · 美团',
		time: '10:24',
		desc: '匹配度分析完成，待提升：性能优化…',
		badge: '72%'
	},
	{
		id: 4,
		type: 'stack',
		icon: '/static/icon/aiAnalyse/session-chart.svg',
		title: 'Vue3 / Vite / Pinia',
		time: '周一',
		desc: '技术栈评估完成，综合实力评级…',
		badge: '评级 B+'
	},
	{
		id: 5,
		type: 'match',
		icon: '/static/icon/aiAnalyse/session-square.svg',
		title: '全栈工程师 · 某创业公司',
		time: '10/08',
		desc: '匹配度分析完成，待提升：后端深度…',
		badge: '64%'
	},
	{
		id: 6,
		type: 'stack',
		icon: '/static/icon/aiAnalyse/session-chart.svg',
		title: 'TypeScript / GraphQL / NestJS',
		time: '10/05',
		desc: '技术栈评估完成，综合实力评级…',
		badge: '评级 A-'
	},
	{
		id: 7,
		type: 'match',
		icon: '/static/icon/aiAnalyse/session-square.svg',
		title: '前端架构师 · 阿里巴巴',
		time: '09/30',
		desc: '匹配度分析完成，待提升：架构设计…',
		badge: '58%'
	}
]

// 进入 AI 分析详情页
const toAnalyse = () => {
	uni.navigateTo({ url: '/pages/aiAnalyse/index' })
}
</script>

<style lang="scss">
.analyse-home {
	box-sizing: border-box;
	min-height: 100vh;
	padding: 0 40rpx 40rpx;
	background-color: #ffffff;
	font-family: Inter, -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

/* ===== 顶部标题 ===== */
.header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 68rpx;
	padding: 16rpx 0 20rpx;

	.header-title {
		font-size: 56rpx;
		font-weight: 700;
		line-height: 1;
		color: #0a0a0a;
	}

	/* 黑色圆形按钮：用伪元素画白色加号，避免额外图标资源 */
	.header-add {
		position: relative;
		flex-shrink: 0;
		width: 68rpx;
		height: 68rpx;
		border-radius: 50%;
		background-color: #0a0a0a;

		&::before,
		&::after {
			content: '';
			position: absolute;
			top: 50%;
			left: 50%;
			background-color: #ffffff;
			border-radius: 2rpx;
			transform: translate(-50%, -50%);
		}

		&::before {
			width: 28rpx;
			height: 4rpx;
		}

		&::after {
			width: 4rpx;
			height: 28rpx;
		}
	}
}

/* ===== 入口卡片 ===== */
.entries {
	display: flex;
	gap: 20rpx;

	.entry {
		flex: 1;
		min-width: 0;
		box-sizing: border-box;
		height: 168rpx;
		padding: 20rpx 28rpx;
		background-color: #ffffff;
		border: 1px solid #e5e5e5;
		border-radius: 24rpx;

		.entry-icon {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 56rpx;
			height: 56rpx;
			margin-bottom: 4rpx;
			background-color: #f5f5f5;
			border-radius: 50%;

			.entry-icon-img {
				width: 24rpx;
				height: 24rpx;
			}
		}

		.entry-title {
			display: block;
			font-size: 28rpx;
			font-weight: 700;
			line-height: 1.2;
			color: #0a0a0a;
		}

		.entry-desc {
			display: block;
			margin-top: 8rpx;
			font-size: 22rpx;
			line-height: 1.2;
			color: #737373;
		}
	}
}

/* ===== 历史会话标题栏 ===== */
.section-head {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin: 40rpx 0 18rpx;

	.section-title {
		font-size: 26rpx;
		font-weight: 700;
		line-height: 1;
		color: #737373;
	}

	.section-count {
		font-size: 24rpx;
		line-height: 1;
		color: #a3a3a3;
	}
}

/* ===== 历史会话列表容器 ===== */
.panel {
	padding: 24rpx;
	background-color: #ffffff;
	border: 1px solid #f5f5f5;
	border-radius: 24rpx;

	.session {
		display: flex;
		align-items: center;
		height: 88rpx;

		&+.session {
			margin-top: 60rpx;
		}

		/* 左侧图标 */
		.session-icon {
			display: flex;
			align-items: center;
			justify-content: center;
			flex-shrink: 0;
			width: 84rpx;
			height: 84rpx;

			&.is-match {
				background-color: #0a0a0a;
				border-radius: 50%;
			}

			&.is-stack {
				box-sizing: border-box;
				background-color: #f5f5f5;
				border: 1px solid #e5e5e5;
				border-radius: 24rpx;
			}

			.session-icon-img {
				width: 28rpx;
				height: 28rpx;
			}
		}

		/* 中间文案 */
		.session-main {
			flex: 1;
			min-width: 0;
			margin-left: 24rpx;
			margin-right: 20rpx;

			.session-name {
				display: block;
				font-size: 30rpx;
				font-weight: 700;
				line-height: 1.2;
				color: #0a0a0a;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}

			.session-desc {
				display: block;
				margin-top: 5rpx;
				font-size: 25rpx;
				line-height: 1.2;
				color: #737373;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}
		}

		/* 右侧时间 + 徽标 */
		.session-side {
			display: flex;
			flex-direction: column;
			align-items: flex-end;
			flex-shrink: 0;

			.session-time {
				font-size: 22rpx;
				line-height: 1;
				color: #a3a3a3;
			}

			.session-badge {
				display: flex;
				align-items: center;
				justify-content: center;
				box-sizing: border-box;
				height: 40rpx;
				margin-top: 12rpx;
				padding: 0 16rpx;
				font-size: 22rpx;
				font-weight: 700;
				line-height: 1;
				border-radius: 999rpx;

				/* 匹配度：黑底白字 */
				&.is-score {
					background-color: #0a0a0a;
					color: #ffffff;
				}

				/* 评级：浅底灰字 */
				&.is-grade {
					background-color: #f5f5f5;
					border: 1px solid #e5e5e5;
					color: #525252;
				}
			}
		}
	}
}
</style>
