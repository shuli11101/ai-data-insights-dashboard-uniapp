<template>
	<view class="match-panel">
		<!-- 顶部操作 -->
		<view class="top-actions">
			<text class="top-label">分析报告</text>
			<text class="back-chat" @click="emit('back')">返回</text>
		</view>

		<!-- 标题 -->
		<view class="report-head">
			<text class="report-title">岗位匹配分析</text>
			<text class="report-subtitle">结合岗位要求与你的求职意向生成</text>
		</view>

		<view class="sheet">
			<!-- 综合匹配分 -->
			<text class="meta-label">综合匹配分</text>
			<view class="score-line">
				<text class="score-num">{{ score }}</text>
				<text class="score-unit">%</text>
			</view>
			<text class="score-tip">{{ scoreTip }}</text>

			<!-- 关键指标 -->
			<text class="meta-label metrics-label">关键指标</text>
			<view class="metrics">
				<view class="metric">
					<view class="metric-ring" :style="ringStyle(coverage)">
						<text class="metric-value">{{ coverage }}%</text>
					</view>
					<text class="metric-title">技能覆盖率</text>
					<text class="metric-caption">{{ coverageCaption }}</text>
				</view>

				<view class="metric">
					<view class="metric-ring" :style="ringStyle(overlap)">
						<text class="metric-value">{{ overlap }}%</text>
					</view>
					<text class="metric-title">薪资重叠率</text>
					<text class="metric-caption">{{ overlap > 0 ? '有重叠区间' : '无重叠区间' }}</text>
				</view>

				<view class="metric">
					<view class="metric-ring" :style="ringStyle(absDeviation)">
						<text class="metric-value">{{ absDeviation }}%</text>
					</view>
					<text class="metric-title">薪资偏差率</text>
					<text class="metric-caption">{{ deviationCaption }}</text>
				</view>
			</view>

			<view class="divider"></view>

			<!-- 技能匹配 -->
			<view class="section-head">
				<text class="section-title">技能匹配</text>
				<text class="section-count">{{ matchedCount }} 项已匹配</text>
			</view>
			<view class="field-row">
				<text class="field-label">已匹配技能</text>
				<text class="field-value">{{ matched || '未提及' }}</text>
			</view>
			<view class="field-row">
				<text class="field-label">缺失技能</text>
				<text class="field-value">{{ missing || '未提及' }}</text>
			</view>
			<view class="field-row">
				<text class="field-label">多余技能</text>
				<text class="field-value">{{ extra || '未提及' }}</text>
			</view>

			<view class="divider"></view>

			<!-- 城市与学历 -->
			<view class="section-head">
				<text class="section-title">城市与学历</text>
				<text class="section-count">{{ conditionCount }} 个条件</text>
			</view>
			<view class="field-row">
				<text class="field-label">城市</text>
				<text class="field-value">{{ cityText || '—' }}</text>
			</view>
			<view class="field-row">
				<text class="field-label">学历</text>
				<text class="field-value">{{ educationText || '—' }}</text>
			</view>

			<!-- 简要结论 -->
			<template v-if="advices.length">
				<view class="divider"></view>
				<text class="meta-label">简要结论</text>
				<text class="conclusion" v-for="(item, index) in advices" :key="index">{{ item }}</text>
			</template>

			<text class="footnote">匹配分析基于当前 JD 与求职意向生成，仅供参考。</text>

			<!-- 保存报告 -->
			<view class="save-btn" :class="{ 'is-disabled': loading || saving }" @click="onSave">
				{{ saving ? '保存中…' : '保存报告' }}
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { parseSections, sectionItems, sectionNumber } from '@/utils/aiText'

const props = defineProps<{
	/** AI 流式输出累积的原始文本 */
	text: string
	/** 是否仍在接收流 */
	loading: boolean
	/** 是否正在保存报告 */
	saving?: boolean
}>()

const emit = defineEmits<{
	(e: 'back'): void
	(e: 'save'): void
}>()

// 分析未结束或保存中时忽略点击
const onSave = () => {
	if (props.loading || props.saving) return
	emit('save')
}

const sections = computed(() => parseSections(props.text))

const score = computed(() => sectionNumber(sections.value, '综合匹配分'))

// 「维度：内容」拆成标签 + 值
const splitPairs = (title: string) =>
	sectionItems(sections.value, title).map((text) => {
		const match = /^(.+?)[：:]\s*(.*)$/.exec(text.trim())
		return match ? { label: match[1]!, value: match[2]! } : { label: '', value: text }
	})

const pickValue = (rows: { label: string; value: string }[], label: string) =>
	rows.find((row) => row.label === label)?.value ?? ''

// ===== 技术栈 =====
const techRows = computed(() => splitPairs('技术栈'))
const matched = computed(() => pickValue(techRows.value, '已匹配技能'))
const missing = computed(() => pickValue(techRows.value, '缺失技能'))
const extra = computed(() => pickValue(techRows.value, '多余技能'))

// 从「Vue、React」里数出已匹配数量
const matchedCount = computed(() => {
	const value = matched.value.trim()
	if (!value || value === '无') return 0
	return value.split('、').filter(Boolean).length
})

const toPercent = (value: string) => {
	const num = Number.parseInt(value.replace(/[^\d-]/g, ''), 10)
	return Number.isFinite(num) ? Math.min(100, Math.max(0, num)) : 0
}

const coverage = computed(() => toPercent(pickValue(techRows.value, '技能覆盖率')))
const coverageCaption = computed(() => (matchedCount.value ? `已匹配 ${matchedCount.value} 项` : '无匹配技能'))

// ===== 薪资指标 =====
const salaryRows = computed(() => splitPairs('薪资'))
const overlap = computed(() => toPercent(pickValue(salaryRows.value, '重叠百分比')))
const deviation = computed(() => {
	const num = Number.parseInt(pickValue(salaryRows.value, '偏差百分比').replace(/[^\d-]/g, ''), 10)
	return Number.isFinite(num) ? num : 0
})
const absDeviation = computed(() => Math.abs(deviation.value))
const deviationCaption = computed(() => (absDeviation.value >= 50 ? '偏差较高' : '偏差较小'))

// 圆环：用 conic-gradient 按百分比填充
const ringStyle = (percent: number) => ({
	background: `conic-gradient(#007C77 0 ${Math.min(100, Math.max(0, percent))}%, #E7F1EE 0)`
})

// ===== 城市与学历 =====
const cityRows = computed(() => splitPairs('城市'))
const eduRows = computed(() => splitPairs('学历'))

const cityText = computed(() => {
	if (!cityRows.value.length) return ''
	const sameCity = pickValue(cityRows.value, '是否同城')
	const remote = pickValue(cityRows.value, '是否支持远程')
	const city = sameCity === '是' ? '同城' : sameCity === '否' ? '不同城' : '未提及是否同城'
	const remoteText =
		remote === '是' ? '支持远程' : remote === '否' ? '不支持远程' : '未提及是否支持远程'
	return `${city} · ${remoteText}`
})

const educationText = computed(() => {
	if (!eduRows.value.length) return ''
	const passed = pickValue(eduRows.value, '是否达标')
	const requirement = pickValue(eduRows.value, '学历要求')
	const status = passed === '是' ? '已达标' : passed === '否' ? '未达标' : '未提及是否达标'
	return `${status} · ${requirement || '未提及'}`
})

const conditionCount = computed(() => (cityText.value ? 1 : 0) + (educationText.value ? 1 : 0))

// ===== 结论 =====
const advices = computed(() => sectionItems(sections.value, '建议'))

// 匹配分文案
const scoreTip = computed(() => {
	if (props.loading && !props.text) return '正在分析岗位匹配度…'
	if (score.value >= 80) return '基于岗位要求与个人条件综合计算，匹配度较高。'
	if (score.value >= 60) return '基于岗位要求与个人条件综合计算，匹配度中等。'
	return '基于岗位要求与个人条件综合计算，当前匹配偏低。'
})
</script>

<style lang="scss" scoped>
.match-panel {
	display: flex;
	flex-direction: column;
	box-sizing: border-box;
	min-height: 100vh;
	padding-top: 32rpx;
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
		font-size: 22rpx;
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
	margin-top: 32rpx;
	padding: 0 40rpx;

	.report-title {
		display: block;
		font-size: 50rpx;
		font-weight: 700;
		line-height: 1.2;
		letter-spacing: -1.6rpx;
		color: #17252b;
	}

	.report-subtitle {
		display: block;
		margin-top: 12rpx;
		font-size: 22rpx;
		line-height: 1.4;
		color: #65747c;
	}
}

/* ===== 报告纸 ===== */
.sheet {
	flex: 1;
	box-sizing: border-box;
	margin-top: 24rpx;
	padding: 32rpx 40rpx 48rpx;
	background-color: #ffffff;
	border-radius: 44rpx 44rpx 0 0;
}

.meta-label {
	display: block;
	font-size: 20rpx;
	line-height: 1.2;
	color: #8a979e;
}

/* ===== 综合匹配分 ===== */
.score-line {
	display: flex;
	align-items: baseline;
	margin-top: 12rpx;
}

.score-num {
	font-size: 100rpx;
	font-weight: 700;
	line-height: 1;
	letter-spacing: -4rpx;
	color: #007c77;
}

.score-unit {
	margin-left: 4rpx;
	font-size: 44rpx;
	font-weight: 600;
	letter-spacing: -1rpx;
	color: #007c77;
}

.score-tip {
	display: block;
	margin-top: 16rpx;
	font-size: 24rpx;
	line-height: 1.5;
	color: #3d4b54;
}

/* ===== 关键指标 ===== */
.metrics-label {
	margin-top: 48rpx;
}

.metrics {
	display: flex;
	margin-top: 24rpx;
}

.metric {
	display: flex;
	flex-direction: column;
	align-items: center;
	flex: 1;
	min-width: 0;
}

.metric-ring {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	box-sizing: border-box;
	width: 116rpx;
	height: 116rpx;
	border-radius: 50%;

	/* 内圈白底，形成环形 */
	&::after {
		content: '';
		position: absolute;
		top: 10rpx;
		right: 10rpx;
		bottom: 10rpx;
		left: 10rpx;
		background-color: #ffffff;
		border-radius: 50%;
	}

	.metric-value {
		position: relative;
		z-index: 1;
		font-size: 28rpx;
		font-weight: 700;
		line-height: 1;
		color: #17252b;
	}
}

.metric-title {
	margin-top: 22rpx;
	font-size: 22rpx;
	line-height: 1.2;
	color: #3d4b54;
}

.metric-caption {
	margin-top: 8rpx;
	font-size: 19rpx;
	line-height: 1.2;
	color: #8a979e;
}

/* ===== 分隔线与小节 ===== */
.divider {
	height: 2rpx;
	margin: 36rpx 0;
	background-color: #edf2f2;
}

.section-head {
	display: flex;
	align-items: baseline;
	justify-content: space-between;
}

.section-title {
	font-size: 32rpx;
	font-weight: 700;
	line-height: 1.2;
	letter-spacing: -0.6rpx;
	color: #17252b;
}

.section-count {
	font-size: 20rpx;
	line-height: 1.2;
	color: #8a979e;
}

.field-row {
	display: flex;
	align-items: flex-start;
	margin-top: 22rpx;

	.field-label {
		flex-shrink: 0;
		width: 156rpx;
		font-size: 22rpx;
		line-height: 1.7;
		color: #78868f;
	}

	.field-value {
		flex: 1;
		min-width: 0;
		font-size: 24rpx;
		line-height: 1.7;
		color: #3d4b54;
	}
}

.conclusion {
	display: block;
	margin-top: 16rpx;
	font-size: 24rpx;
	line-height: 1.7;
	color: #3d4b54;
}

.footnote {
	display: block;
	margin-top: 48rpx;
	font-size: 20rpx;
	line-height: 1.4;
	color: #8a979e;
}

.save-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 92rpx;
	margin-top: 40rpx;
	font-size: 30rpx;
	font-weight: 600;
	letter-spacing: 0.6rpx;
	color: #ffffff;
	background-image: linear-gradient(180deg, #007c77 0%, #00746f 100%);
	border-radius: 24rpx;

	&.is-disabled {
		opacity: 0.5;
	}
}
</style>
