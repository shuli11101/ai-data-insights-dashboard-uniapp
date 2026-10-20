<template>
	<view class="result-panel">
		<!-- 标题区 -->
		<view class="result-head">
			<view class="result-head-left">
				<text class="result-title">你的匹配结果</text>
				<text class="result-subtitle">基于岗位 JD 与个人经历综合生成</text>
			</view>
			<text class="back-chat" @click="goBackChat">返回聊天</text>
		</view>

		<!-- 匹配度评分 + 超越比例 -->
		<view class="card score-card">
			<view class="score-body">
				<view class="score-main">
					<text class="card-label">匹配度评分</text>
					<view class="score-value">
						<text class="score-num">{{ matchScore }}</text>
						<text class="score-unit">%</text>
					</view>
					<text class="card-tip">{{ choiceTip() }}</text>
				</view>

				<view class="score-side">
					<text class="card-label">超越比例</text>
					<text class="side-num">{{ abovePercent }}%</text>
					<text class="card-tip">超过同岗位求职者</text>
					<view class="progress">
						<view class="progress-fill" :style="{ width: abovePercent + '%' }" />
					</view>
				</view>
			</view>
		</view>

		<!-- 目标岗位 -->
		<view class="card role-card">
			<text class="card-label">目标岗位</text>
			<view class="role-row">
				<view class="role-icon">
					<image class="role-icon-img" src="/static/icon/aiAnalyse/role-briefcase.svg" mode="aspectFit" />
				</view>
				<view class="role-info">
					<text class="role-title">{{ targetJob[1] }}</text>
					<text class="role-meta">{{ targetJob[0] }}</text>
				</view>
			</view>
		</view>

		<!-- 薪资预估 + 市场中位数 -->
		<view class="card salary-card">
			<view class="salary-body">
				<view class="salary-col">
					<text class="card-label">薪资预估</text>
					<text class="salary-num">{{ salaryRange }}</text>
					<text class="salary-note">月薪 · {{ targetJob[0] }}</text>
				</view>

				<view class="salary-col salary-col--right">
					<text class="card-label">市场中位数</text>
					<text class="salary-num">{{ salaryMedian }}</text>
					<text class="salary-note">该岗位市场中控</text>
				</view>
			</view>

			<text class="salary-sample">样本：（暂为空）</text>
		</view>

		<!-- 核心优势 -->
		<view class="card strength-card">
			<view class="card-head">
				<text class="card-label">核心优势</text>
				<text class="card-count">{{ coreAdvantages.length }} 项</text>
			</view>

			<view class="strength-list">
				<view v-for="item in coreAdvantages" :key="item.title" class="strength-item">
					<view class="check" />
					<view class="strength-info">
						<text class="strength-title">{{ item.title }}</text>
						<text class="strength-desc">{{ item.desc }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 待补充技能 -->
		<view class="card skill-card">
			<view class="card-head">
				<text class="card-label">待补充技能</text>
				<text class="card-count">{{ skillGaps.length }} 项</text>
			</view>

			<view class="skill-tags">
				<text v-for="(item, index) in skillGaps" :key="index" class="skill-tag"
					:class="{ 'skill-tag--primary': index === 0 || index === 1 }">{{ item }}</text>
			</view>

			<text class="skill-note">优先补强前两项，覆盖目标岗位的高频要求</text>
		</view>

		<!-- 求职建议 -->
		<view class="card advice-card">
			<text class="card-label">求职建议</text>

			<view class="advice-list">
				<view v-for="(item, index) in jobAdvice" :key="index" class="advice-item">
					<view class="advice-dot" />
					<text class="advice-text">{{ item }}</text>
				</view>
			</view>
		</view>

		<text class="result-foot">报告由 AI 生成 · 仅供参考</text>
	</view>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
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
const targetJob = computed(() => props.targetJob.split('·'))
const salaryMedian = computed(() => props.salaryMedian)
const coreAdvantages = computed(() => props.coreAdvantages)
const skillGaps = computed(() => props.skillGaps)
const jobAdvice = computed(() => props.jobAdvice)

const tip = [
	'匹配良好，建议优先投递',
	'匹配一般，建议关注核心优势',
	'匹配较差，建议关注待补充技能'
]
const choiceTip = () => {
	if (matchScore.value >= 80) {
		return tip[0]
	}
	if (matchScore.value >= 60) {
		return tip[1]
	}
	return tip[2]
}

// 返回聊天（点击逻辑待补充）
const goBackChat = () => {
	// TODO: 返回聊天
	emit('goBack')
}


</script>

<style lang="scss" scoped>
.result-panel {
	display: flex;
	flex-direction: column;
	gap: 29rpx;
	box-sizing: border-box;
	padding: 48rpx 16rpx 40rpx;
	background-color: #f4f4f4;
}

/* ===== 标题区 ===== */
.result-head {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	margin-bottom: 14rpx;
}

.result-head-left {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	min-width: 0;
}

.back-chat {
	padding: 14rpx 22rpx;
	font-size: 22rpx;
	line-height: 1;
	color: #6b7280;
	white-space: nowrap;
}

.result-title {
	font-size: 50rpx;
	font-weight: 700;
	line-height: 1.3;
	color: #111111;
}

.result-subtitle {
	margin-top: 8rpx;
	font-size: 21rpx;
	line-height: 1.4;
	color: #8d8d8d;
}

/* ===== 卡片通用样式 ===== */
.card {
	box-sizing: border-box;
	padding: 34rpx 43rpx;
	background-color: #ffffff;
	border: 2rpx solid #ececec;
	border-radius: 43rpx;
	box-shadow: 0 7rpx 16rpx rgba(17, 17, 17, 0.05);
}

.card-label {
	display: block;
	font-size: 19rpx;
	line-height: 1.4;
	color: #8f8f8f;
}

.card-tip {
	display: block;
	margin-top: 8rpx;
	font-size: 19rpx;
	line-height: 1.4;
	color: #979797;
}

.card-head {
	display: flex;
	align-items: baseline;
	justify-content: space-between;
}

.card-count {
	font-size: 18rpx;
	line-height: 1.4;
	color: #ababab;
}

/* ===== 匹配度评分 ===== */
.score-card {
	padding-top: 38rpx;
	padding-bottom: 34rpx;
}

.score-body {
	display: flex;
	align-items: stretch;
}

.score-main {
	width: 339rpx;
	flex-shrink: 0;
}

.score-side {
	flex: 1;
	padding-left: 43rpx;
	border-left: 2rpx solid #f0f0f0;
}

.score-value {
	display: flex;
	align-items: baseline;
	margin-top: 10rpx;
}

.score-num {
	font-size: 105rpx;
	font-weight: 700;
	line-height: 1;
	color: #111111;
}

.score-unit {
	margin-left: 4rpx;
	font-size: 41rpx;
	font-weight: 600;
	line-height: 1;
	color: #111111;
}

.side-num {
	display: block;
	margin-top: 12rpx;
	font-size: 54rpx;
	font-weight: 700;
	line-height: 1;
	color: #111111;
}

.progress {
	width: 195rpx;
	height: 7rpx;
	margin-top: 20rpx;
	overflow: hidden;
	background-color: #f0f0f0;
	border-radius: 4rpx;
}

.progress-fill {
	height: 100%;
	background-color: #4f46f0;
	border-radius: 4rpx;
}

.score-foot {
	display: block;
	margin-top: 18rpx;
	font-size: 17rpx;
	line-height: 1.4;
	color: #aeaeae;
}

/* ===== 目标岗位 ===== */
.role-row {
	display: flex;
	align-items: center;
	margin-top: 14rpx;
}

.role-icon {
	display: flex;
	flex-shrink: 0;
	align-items: center;
	justify-content: center;
	width: 65rpx;
	height: 65rpx;
	background-color: #111111;
	border-radius: 20rpx;
}

.role-icon-img {
	width: 33rpx;
	height: 33rpx;
}

.role-info {
	flex: 1;
	margin-left: 22rpx;
	overflow: hidden;
}

.role-title {
	display: block;
	font-size: 28rpx;
	font-weight: 600;
	line-height: 1.4;
	color: #111111;
}

.role-meta {
	display: block;
	margin-top: 6rpx;
	font-size: 19rpx;
	line-height: 1.4;
	color: #9a9a9a;
}

/* ===== 薪资预估 ===== */
.salary-body {
	display: flex;
	align-items: stretch;
}

.salary-col {
	width: 325rpx;
	flex-shrink: 0;
}

.salary-col--right {
	flex: 1;
	width: auto;
	padding-left: 29rpx;
	border-left: 2rpx solid #f0f0f0;
}

.salary-num {
	display: block;
	margin-top: 14rpx;
	font-size: 47rpx;
	font-weight: 700;
	line-height: 1;
	color: #111111;
}

.salary-note {
	display: block;
	margin-top: 8rpx;
	font-size: 18rpx;
	line-height: 1.4;
	color: #9a9a9a;
}

.salary-sample {
	display: block;
	margin-top: 14rpx;
	font-size: 17rpx;
	line-height: 1.4;
	color: #b2b2b2;
}

/* ===== 核心优势 ===== */
.strength-card {
	padding-bottom: 30rpx;
}

.strength-list {
	margin-top: 10rpx;
}

.strength-item {
	display: flex;
	align-items: flex-start;
	padding: 20rpx 0;
	border-bottom: 2rpx solid #f2f2f2;

	&:last-child {
		padding-bottom: 0;
		border-bottom: none;
	}
}

.check {
	position: relative;
	flex-shrink: 0;
	width: 29rpx;
	height: 29rpx;
	margin-top: 2rpx;
	background-color: #111111;
	border-radius: 50%;

	/* 白色对勾 */
	&::after {
		content: '';
		position: absolute;
		top: 7rpx;
		left: 9rpx;
		width: 7rpx;
		height: 12rpx;
		border-right: 2rpx solid #ffffff;
		border-bottom: 2rpx solid #ffffff;
		transform: rotate(45deg);
	}
}

.strength-info {
	flex: 1;
	margin-left: 14rpx;
	overflow: hidden;
}

.strength-title {
	display: block;
	font-size: 22rpx;
	font-weight: 600;
	line-height: 1.4;
	color: #1a1a1a;
}

.strength-desc {
	display: block;
	margin-top: 4rpx;
	font-size: 19rpx;
	line-height: 1.4;
	color: #929292;
}

/* ===== 待补充技能 ===== */
.skill-card {
	padding-bottom: 30rpx;
}

.skill-tags {
	display: flex;
	flex-wrap: wrap;
	margin-top: 18rpx;
}

.skill-tag {
	box-sizing: border-box;
	padding: 8rpx 25rpx;
	margin-right: 14rpx;
	margin-bottom: 12rpx;
	font-size: 20rpx;
	font-weight: 500;
	line-height: 36rpx;
	color: #4b4b4b;
	background-color: #f6f6f6;
	border: 2rpx solid #f1f1f1;
	border-radius: 29rpx;
}

/* 高亮标签：优先补强的技能 */
.skill-tag--primary {
	font-weight: 600;
	color: #4f46f0;
	background-color: #f1efff;
	border-color: #f1efff;
}

.skill-note {
	display: block;
	margin-top: 6rpx;
	font-size: 18rpx;
	line-height: 1.4;
	color: #9a9a9a;
}

/* ===== 求职建议 ===== */
.advice-card {
	padding-bottom: 36rpx;
}

.advice-list {
	margin-top: 18rpx;
}

.advice-item {
	display: flex;
	align-items: flex-start;

	&+& {
		margin-top: 18rpx;
	}
}

.advice-dot {
	flex-shrink: 0;
	width: 7rpx;
	height: 7rpx;
	margin-top: 13rpx;
	margin-right: 14rpx;
	background-color: #111111;
	border-radius: 50%;
}

.advice-text {
	flex: 1;
	font-size: 20rpx;
	line-height: 1.7;
	color: #3e3e3e;
}

/* ===== 页脚 ===== */
.result-foot {
	margin-top: 29rpx;
	font-size: 17rpx;
	line-height: 1.4;
	color: #afafaf;
	text-align: center;
}
</style>
