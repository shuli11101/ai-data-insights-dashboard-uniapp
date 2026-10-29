<template>
	<view class="jd-panel">
		<!-- ===== 顶部操作 ===== -->
		<view class="top-actions">
			<text class="top-label">分析报告</text>
			<text class="back-chat" @click="goBackChat">{{ backText || '返回聊天' }}</text>
		</view>

		<!-- ===== 标题 ===== -->
		<view class="report-head">
			<text class="report-title">岗位深度解读</text>
			<text class="report-subtitle">根据当前 JD 拆解岗位要求、职责与团队信号</text>
		</view>

		<!-- ===== 报告纸 ===== -->
		<view class="sheet">
			<!-- 01 岗位基本信息 -->
			<view class="section-meta">
				<text class="meta-text">岗位基本信息</text>
				<text v-if="!companyLine" class="meta-text">JD 信息有限</text>
			</view>

			<text class="job-title">{{ jdBasicInfo[0]?.value }}</text>

			<!-- 有公司 / 地点时直接展示，提示条只在信息缺失时出现 -->
			<text v-if="companyLine" class="job-sub">{{ companyLine }}</text>

			<view class="notice" v-else>
				<text class="notice-icon">i</text>
				<text class="notice-text">公司与地点未写明，以下内容仅按岗位类型解读。</text>
			</view>

			<view class="summary">
				<view v-for="(col, index) in basicCols" :key="col.label" class="summary-col"
					:class="{ 'summary-col--divided': index > 0, 'summary-col--accent': index === 0 }">
					<text class="summary-label">{{ col.label }}</text>
					<text class="summary-value" :class="{ 'summary-value--accent': index === 0 }">{{ col.value }}</text>
				</view>
			</view>

			<view class="divider"></view>

			<!-- 02 岗位职责 -->
			<view class="section-head">
				<text class="section-title">岗位职责</text>
				<text class="section-count">{{ jdDuties.length }} 项</text>
			</view>

			<view v-for="item in jdDuties" :key="item.label + item.value" class="field-row">
				<text class="field-label">{{ item.label }}</text>
				<text class="field-value">{{ item.value }}</text>
			</view>

			<view class="divider"></view>

			<!-- 03 认知要求 -->
			<view class="section-head">
				<text class="section-title">认知要求</text>
				<text class="section-count">{{ requirementRows.length }} 项</text>
			</view>

			<view v-for="item in requirementRows" :key="item.label" class="field-row">
				<text class="field-label">{{ item.label }}</text>
				<text class="field-value">{{ item.value }}</text>
			</view>

			<view class="divider"></view>

			<!-- 04 隐藏信息 -->
			<view class="section-head">
				<text class="section-title">隐藏信息</text>
				<text class="badge">推断</text>
			</view>
			<text class="section-note">以下为基于岗位类型与描述的判断，仅供参考。</text>

			<view v-for="item in jdHiddenInfo" :key="item.label + item.value" class="field-row">
				<text class="field-label">{{ item.label }}</text>
				<text class="field-value">{{ item.value }}</text>
			</view>

			<!-- 05 面试准备方向 -->
			<template v-if="jdInterviewPrep.length">
				<view class="divider"></view>

				<view class="section-head">
					<text class="section-title">面试准备方向</text>
					<text class="section-count">{{ jdInterviewPrep.length }} 项</text>
				</view>

				<view v-for="item in jdInterviewPrep" :key="item.label + item.value" class="field-row">
					<text class="field-label">{{ item.label }}</text>
					<text class="field-value">{{ item.value }}</text>
				</view>
			</template>

			<text class="foot">以上内容由 AI 分析生成，仅供参考；未写明项不做确定判断。</text>
		</view>
	</view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
	jdBasicInfo: { label: string; value: string }[]
	jdDuties: { label: string; value: string }[]
	knowledgeRequirements: { label: string; value: string[] | string }[]
	jdInterviewPrep: { label: string; value: string }[]
	jdHiddenInfo: { label: string; value: string }[]
	/** 公司（详情页传入后展示真实信息，不再提示信息缺失） */
	company?: string
	/** 工作地点，如 深圳 · 南山区 */
	location?: string
	/** 月薪范围，如 20-35K */
	salaryText?: string
	/** 经验要求，如 3-4年经验 */
	experience?: string
	/** 返回按钮文案 */
	backText?: string
}>()

const jdBasicInfo = computed(() => props.jdBasicInfo)
const jdDuties = computed(() => props.jdDuties)
const jdInterviewPrep = computed(() => props.jdInterviewPrep)
const jdHiddenInfo = computed(() => props.jdHiddenInfo)

// 认知要求：数组项合并成一段文案，与设计稿的「标签 + 内容」行保持同一结构
const requirementRows = computed(() =>
	props.knowledgeRequirements.map((item) => ({
		label: item.label,
		value: Array.isArray(item.value) ? item.value.join('；') : item.value,
	}))
)

const emit = defineEmits(['goBack'])
const goBackChat = () => {
	emit('goBack')
}

// 公司 · 地点：有值时展示，替代「信息缺失」提示
const companyLine = computed(() => [props.company, props.location].filter(Boolean).join(' · '))

// 从 AI 解析出的基本信息里取某一项
const pickBasic = (label: string) =>
	props.jdBasicInfo.find((item) => item.label === label)?.value || '未提及'

// 基本信息三列：优先用详情页传入的真实数据，缺失时回退到 AI 解析结果
const basicCols = computed(() => [
	{ label: '月薪范围', value: props.salaryText || pickBasic('薪资范围') },
	{ label: '经验', value: props.experience || '未提及' },
	{ label: '学历', value: '未提及' }
])
</script>

<style lang="scss" scoped>
.jd-panel {
	display: flex;
	flex-direction: column;
	box-sizing: border-box;
	padding: 24rpx 0 40rpx;
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

.section-meta {
	display: flex;
	align-items: baseline;
	justify-content: space-between;

	.meta-text {
		font-size: 21rpx;
		line-height: 1.2;
		color: #8a979e;
	}
}

.job-title {
	display: block;
	margin-top: 12rpx;
	font-size: 36rpx;
	font-weight: 700;
	line-height: 1.3;
	letter-spacing: -0.6rpx;
	color: #17252b;
}

/* 公司 · 地点 */
.job-sub {
	display: block;
	margin-top: 10rpx;
	font-size: 23rpx;
	line-height: 1.4;
	color: #65747c;
}

/* 提示条：浅青底 + 细描边圆形图标 */
.notice {
	display: flex;
	align-items: center;
	box-sizing: border-box;
	margin-top: 20rpx;
	padding: 18rpx 20rpx;
	background-color: #f1f9f7;
	border-radius: 20rpx;

	.notice-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		box-sizing: border-box;
		width: 24rpx;
		height: 24rpx;
		font-size: 16rpx;
		font-style: italic;
		line-height: 1;
		color: #487c77;
		border: 2rpx solid #487c77;
		border-radius: 50%;
	}

	.notice-text {
		flex: 1;
		min-width: 0;
		margin-left: 12rpx;
		font-size: 23rpx;
		line-height: 1.4;
		color: #3d4b54;
	}
}

/* 薪资 / 经验 / 学历 */
.summary {
	display: flex;
	align-items: center;
	margin-top: 32rpx;

	.summary-col {
		// flex: 1;
		min-width: 120rpx;

		&--divided {
			padding-left: 26rpx;
			border-left: 2rpx solid #e9eff0;
		}

		&--accent {
			min-width: 230rpx;
		}
	}

	.summary-label {
		display: block;
		font-size: 20rpx;
		line-height: 1.2;
		color: #8a979e;
	}

	.summary-value {
		display: block;
		margin-top: 12rpx;
		font-size: 26rpx;
		line-height: 1.3;
		color: #3d4b54;

		&--accent {
			font-size: 32rpx;
			font-weight: 700;
			letter-spacing: -0.6rpx;
			color: #007c77;
		}
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
	align-items: center;
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

	.badge {
		box-sizing: border-box;
		padding: 6rpx 18rpx;
		font-size: 20rpx;
		font-weight: 500;
		line-height: 1.2;
		color: #487c77;
		background-color: #eff8f5;
		border-radius: 20rpx;
	}
}

.section-note {
	display: block;
	margin-top: 12rpx;
	font-size: 21rpx;
	line-height: 1.5;
	color: #8a979e;
}

/* ===== 标签 + 内容行 ===== */
.field-row {
	display: flex;
	align-items: flex-start;
	margin-top: 28rpx;

	.field-label {
		flex-shrink: 0;
		width: 156rpx;
		font-size: 23rpx;
		line-height: 1.7;
		color: #78868f;
	}

	.field-value {
		flex: 1;
		min-width: 0;
		font-size: 25rpx;
		line-height: 1.7;
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
