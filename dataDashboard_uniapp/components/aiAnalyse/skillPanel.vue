<template>
	<view class="result-panel">
		<!-- ===== 顶部操作 ===== -->
		<view class="top-actions">
			<text class="top-label">分析报告</text>
			<text class="back-chat" @click="goBackChat">返回聊天</text>
		</view>

		<!-- ===== 标题 ===== -->
		<view class="report-head">
			<text class="report-title">你的匹配结果</text>
			<text class="report-subtitle">基于当前简历与岗位 JD 综合生成</text>
		</view>

		<!-- ===== 报告纸 ===== -->
		<view class="sheet">
			<!-- 01 匹配度评分 + 超越比例 -->
			<view class="score">
				<view class="score-main">
					<text class="meta-text">匹配度评分</text>
					<view class="score-value">
						<text class="score-num">{{ matchScore }}</text>
						<text class="score-unit">%</text>
					</view>
					<text class="score-tip">{{ choiceTip() }}</text>
				</view>

				<view class="score-side">
					<text class="meta-text">超越比例</text>
					<text class="side-num">{{ abovePercent }}%</text>
					<text class="side-caption">超过同岗位求职者</text>
					<view class="progress">
						<view class="progress-fill" :style="{ width: abovePercent + '%' }" />
					</view>
				</view>
			</view>

			<view class="divider"></view>

			<!-- 02 目标岗位与薪资 -->
			<view class="section-head">
				<text class="section-title">目标岗位与薪资</text>
				<text class="section-count">{{ jobCity }}</text>
			</view>

			<text class="job-name">{{ jobTitle }}</text>

			<view class="salary">
				<view class="salary-col">
					<text class="meta-text">月薪预估</text>
					<text class="salary-num">{{ salaryRange }}</text>
				</view>

				<view class="salary-col salary-col--divided">
					<text class="meta-text">市场中位数</text>
					<view class="salary-row">
						<text class="median-num">{{ salaryMedian }}</text>
						<text class="median-note">样本不足，仅供参考</text>
					</view>
				</view>
			</view>

			<view class="divider"></view>

			<!-- 03 核心优势 -->
			<view class="section-head">
				<text class="section-title">核心优势</text>
				<text class="section-count">{{ coreAdvantages.length }} 项</text>
			</view>

			<view v-for="item in coreAdvantages" :key="item.title + item.desc" class="adv-item">
				<view class="tick"></view>
				<view class="adv-body">
					<text class="adv-title">{{ item.title }}</text>
					<text class="adv-desc">{{ item.desc }}</text>
				</view>
			</view>

			<view class="divider"></view>

			<!-- 04 待补充技能 -->
			<view class="section-head">
				<text class="section-title">待补充技能</text>
				<text class="section-count">{{ skillGaps.length }} 项</text>
			</view>

			<view v-if="skillGaps.length" class="gap-card">
				<text class="gap-badge">优先补齐</text>
				<text class="gap-name">{{ skillGaps[0] }}</text>
			</view>

			<view v-if="skillGaps.length > 1" class="gap-more" @click="showAllGaps = !showAllGaps">
				<text class="gap-more-text">{{ showAllGaps ? '收起' : `查看其余 ${skillGaps.length - 1} 项` }}</text>
				<view class="gap-more-chevron" :class="{ 'is-open': showAllGaps }"></view>
			</view>

			<view v-if="showAllGaps" class="gap-list">
				<view v-for="(item, index) in skillGaps.slice(1)" :key="index" class="gap-item">
					<view class="gap-dot"></view>
					<text class="gap-item-text">{{ item }}</text>
				</view>
			</view>

			<!-- 05 求职建议 -->
			<template v-if="jobAdvice.length">
				<view class="divider"></view>

				<view class="section-head">
					<text class="section-title">求职建议</text>
					<text class="section-count">{{ jobAdvice.length }} 项</text>
				</view>

				<view v-for="(item, index) in jobAdvice" :key="index" class="gap-item">
					<view class="gap-dot"></view>
					<text class="gap-item-text">{{ item }}</text>
				</view>
			</template>

			<text class="foot">匹配结果基于当前简历与 JD 生成，仅供参考。</text>
		</view>
	</view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { PropType } from 'vue'
import type { AISectionEntry } from '@/utils/aiText'

const props = defineProps({
	matchScore: {
		type: Number,
		default: 0
	},
	abovePercent: {
		type: Number,
		default: 0
	},
	sections: {
		type: Array,
		default: () => []
	},
	salaryRange: {
		type: String,
		default: ''
	},
	targetJob: {
		type: String,
		default: ''
	},
	salaryMedian: {
		type: String,
		default: ''
	},
	coreAdvantages: {
		type: Array as PropType<AISectionEntry[]>,
		default: () => []
	},
	skillGaps: {
		type: Array as PropType<string[]>,
		default: () => []
	},
	jobAdvice: {
		type: Array as PropType<string[]>,
		default: () => []
	},
})

const emit = defineEmits(['goBack'])

// 结果数据
const matchScore = computed(() => props.matchScore)
const abovePercent = computed(() => props.abovePercent)
const salaryRange = computed(() => props.salaryRange)
const salaryMedian = computed(() => props.salaryMedian)
const coreAdvantages = computed(() => props.coreAdvantages)
const skillGaps = computed(() => props.skillGaps)
const jobAdvice = computed(() => props.jobAdvice)

// 目标岗位文案形如「杭州 · 前端开发工程师」，拆成城市与岗位名
const jobParts = computed(() =>
	props.targetJob
		.split('·')
		.map((part) => part.trim())
		.filter(Boolean),
)
const jobCity = computed(() => (jobParts.value.length > 1 ? jobParts.value[0] : ''))
const jobTitle = computed(() => jobParts.value[1] || jobParts.value[0] || '')

// 待补充技能：默认只展示第一项，其余折叠
const showAllGaps = ref(false)

const tip = [
	'匹配良好，建议优先投递并准备面试。',
	'匹配一般，建议先看优势，再补齐关键技能。',
	'匹配较低，建议优先补齐待补充技能。',
]
const choiceTip = () => {
	if (matchScore.value >= 80) return tip[0]
	if (matchScore.value >= 60) return tip[1]
	return tip[2]
}

// 返回聊天
const goBackChat = () => {
	emit('goBack')
}
</script>

<style lang="scss" scoped>
.result-panel {
	display: flex;
	flex-direction: column;
	box-sizing: border-box;
	padding: 48rpx 0 40rpx;
	font-family: Inter, -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', Helvetica, Arial,
		sans-serif;
}

/* ===== 顶部操作 ===== */
.top-actions {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 40rpx;

	.top-label {
		font-size: 23rpx;
		line-height: 1;
		color: #8a979e;
	}

	.back-chat {
		font-size: 24rpx;
		line-height: 1;
		color: #65747c;
	}
}

/* ===== 标题 ===== */
.report-head {
	padding: 20rpx 40rpx 0;

	.report-title {
		display: block;
		font-size: 52rpx;
		font-weight: 700;
		line-height: 1.25;
		letter-spacing: -1.6rpx;
		color: #17252b;
	}

	.report-subtitle {
		display: block;
		margin-top: 12rpx;
		font-size: 23rpx;
		line-height: 1.45;
		color: #65747c;
	}
}

/* ===== 报告纸 ===== */
.sheet {
	box-sizing: border-box;
	margin-top: 26rpx;
	padding: 40rpx 40rpx 48rpx;
	background-color: #ffffff;
	border-radius: 44rpx 44rpx 0 0;
}

.meta-text {
	font-size: 21rpx;
	line-height: 1.2;
	color: #8a979e;
}

/* ===== 匹配度评分 ===== */
.score {
	display: flex;
	align-items: flex-start;

	.score-main {
		flex: 1;
		min-width: 0;
	}

	.score-value {
		display: flex;
		align-items: baseline;
		margin-top: 12rpx;
	}

	.score-num {
		font-size: 108rpx;
		font-weight: 700;
		line-height: 1;
		letter-spacing: -4rpx;
		color: #007c77;
	}

	.score-unit {
		margin-left: 4rpx;
		font-size: 46rpx;
		font-weight: 600;
		line-height: 1;
		letter-spacing: -1rpx;
		color: #007c77;
	}

	.score-tip {
		display: block;
		margin-top: 18rpx;
		font-size: 24rpx;
		line-height: 1.45;
		color: #3d4b54;
	}

	.score-side {
		flex-shrink: 0;
		width: 232rpx;
		margin-left: 24rpx;
	}

	.side-num {
		display: block;
		margin-top: 16rpx;
		font-size: 48rpx;
		font-weight: 700;
		line-height: 1;
		letter-spacing: -1rpx;
		color: #17252b;
	}

	.side-caption {
		display: block;
		margin-top: 8rpx;
		font-size: 21rpx;
		line-height: 1.2;
		color: #8a979e;
	}

	.progress {
		width: 100%;
		height: 8rpx;
		margin-top: 22rpx;
		overflow: hidden;
		background-color: #e7f0ee;
		border-radius: 4rpx;
	}

	.progress-fill {
		height: 100%;
		background-color: #007c77;
		border-radius: 4rpx;
	}
}

.divider {
	height: 2rpx;
	margin: 30rpx 0 34rpx;
	background-color: #edf2f2;
}

/* ===== 分组标题 ===== */
.section-head {
	display: flex;
	align-items: baseline;
	justify-content: space-between;

	.section-title {
		font-size: 34rpx;
		font-weight: 700;
		line-height: 1.2;
		letter-spacing: -0.6rpx;
		color: #17252b;
	}

	.section-count {
		font-size: 21rpx;
		line-height: 1.2;
		color: #8a979e;
	}
}

/* ===== 目标岗位与薪资 ===== */
.job-name {
	display: block;
	margin-top: 16rpx;
	font-size: 38rpx;
	font-weight: 700;
	line-height: 1.3;
	letter-spacing: -0.8rpx;
	color: #17252b;
}

.salary {
	display: flex;
	align-items: flex-start;
	margin-top: 28rpx;

	.salary-col {
		flex: 1;
		min-width: 0;

		&--divided {
			padding-left: 28rpx;
			border-left: 2rpx solid #e9eff0;
		}
	}

	.salary-num {
		display: block;
		margin-top: 12rpx;
		font-size: 44rpx;
		font-weight: 700;
		line-height: 1.1;
		letter-spacing: -0.8rpx;
		color: #007c77;
	}

	.salary-row {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		margin-top: 12rpx;
	}

	.median-num {
		flex-shrink: 0;
		font-size: 32rpx;
		font-weight: 600;
		line-height: 1.1;
		color: #3d4b54;
	}

	.median-note {
		flex-shrink: 0;
		margin-left: 12rpx;
		font-size: 19rpx;
		line-height: 1.2;
		color: #8a979e;
	}
}

/* ===== 核心优势 ===== */
.adv-item {
	display: flex;
	align-items: flex-start;
	margin-top: 26rpx;

	.tick {
		flex-shrink: 0;
		width: 20rpx;
		height: 11rpx;
		margin-top: 12rpx;
		margin-left: 4rpx;
		border-left: 3rpx solid #007c77;
		border-bottom: 3rpx solid #007c77;
		transform: rotate(-45deg);
	}

	.adv-body {
		flex: 1;
		min-width: 0;
		margin-left: 18rpx;
	}

	.adv-title {
		display: block;
		font-size: 25rpx;
		font-weight: 500;
		line-height: 1.55;
		color: #3d4b54;
	}

	.adv-desc {
		display: block;
		margin-top: 4rpx;
		font-size: 23rpx;
		line-height: 1.55;
		color: #65747c;
	}
}

/* ===== 待补充技能 ===== */
.gap-card {
	box-sizing: border-box;
	margin-top: 24rpx;
	padding: 20rpx 28rpx;
	background-color: #f1f9f7;
	border-radius: 24rpx;

	.gap-badge {
		display: block;
		font-size: 19rpx;
		font-weight: 600;
		line-height: 1.2;
		color: #487c77;
	}

	.gap-name {
		display: block;
		margin-top: 8rpx;
		font-size: 25rpx;
		font-weight: 600;
		line-height: 1.4;
		color: #17252b;
	}
}

.gap-more {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-top: 24rpx;

	.gap-more-text {
		font-size: 23rpx;
		font-weight: 500;
		line-height: 1;
		color: #007c77;
	}

	.gap-more-chevron {
		width: 12rpx;
		height: 12rpx;
		border-right: 2rpx solid #007c77;
		border-bottom: 2rpx solid #007c77;
		transform: rotate(45deg);
		transition: transform 0.2s ease;

		&.is-open {
			transform: rotate(-135deg);
		}
	}
}

.gap-list {
	margin-top: 8rpx;
}

.gap-item {
	display: flex;
	align-items: flex-start;
	margin-top: 20rpx;

	.gap-dot {
		flex-shrink: 0;
		width: 8rpx;
		height: 8rpx;
		margin-top: 14rpx;
		background-color: #9ab8b3;
		border-radius: 50%;
	}

	.gap-item-text {
		flex: 1;
		min-width: 0;
		margin-left: 16rpx;
		font-size: 24rpx;
		line-height: 1.6;
		color: #3d4b54;
	}
}

/* ===== 页脚 ===== */
.foot {
	display: block;
	margin-top: 40rpx;
	font-size: 20rpx;
	line-height: 1.5;
	color: #8a979e;
}
</style>
