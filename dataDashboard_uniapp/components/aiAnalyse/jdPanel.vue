<template>
	<view class="jd-panel">
		<!-- 标题区 -->
		<view class="jd-head">
			<view class="jd-head-left">
				<text class="jd-title">岗位深度解读</text>
				<text class="jd-subtitle">{{ jdBasicInfo[0].value }}</text>
			</view>
			<text class="back-chat" @click="goBackChat">返回聊天</text>
		</view>

		<!-- 01 岗位基本信息 -->
		<view class="card">
			<text class="card-label">岗位基本信息</text>
			<text class="info-title">{{ jdBasicInfo[0].value }}</text>
			<text class="info-meta">（地点暂无）</text>
			<view class="info-divider" />

			<view class="info-cols">

				<view v-for="(col, index) in basicCols" :key="col.label" class="info-col"
					:class="{ 'info-col--border': index > 0 }">
					<view style="font-size: 18rpx;">(暂无,都是静态数据)</view>
					<text class="info-col-label">{{ col.label }}</text>
					<text class="info-col-value">{{ col.value }}</text>
				</view>
			</view>
		</view>

		<!-- 02 岗位职责 -->
		<view class="card">
			<view class="card-head">
				<text class="card-label">岗位职责</text>
				<text class="card-count">{{ jdDuties.length }} 项</text>
			</view>

			<view v-for="(item, index) in jdDuties" :key="item.value" class="list-item">
				<text class="list-index">{{ item.label }}</text>
				<text class="list-text">{{ item.value }}</text>
			</view>
		</view>

		<!-- 03 认知要求 -->
		<view class="card">
			<view class="card-head">
				<text class="card-label">认知要求</text>
				<text class="card-count">硬性要求</text>
			</view>

			<view v-for="(req, index) in knowledgeRequirements[0].value" :key="req" class="req-item">
				<text class="req-tag">{{ index <= 9 ? '0' + index : index + 1 }}</text>
						<text class="req-text">{{ req }}</text>
			</view>

			<view class="bonus-divider" />
			<text class="bonus-label">加分项</text>
			<view class="bonus-tags">
				<text v-for="tag in knowledgeRequirements[1].value" :key="tag" class="bonus-tag">{{ tag }}</text>
			</view>
		</view>

		<!-- 04 隐藏信息 -->
		<view class="card">
			<view class="card-head">
				<text class="card-label">隐藏信息</text>
				<text class="ai-badge">AI 推断</text>
			</view>

			<view v-for="item in jdHiddenInfo" :key="item.value" class="hidden-item">
				<view class="hidden-bar" />
				<view class="hidden-body">
					<text class="hidden-title">{{ item.label }}</text>
					<text class="hidden-desc">{{ item.value }}</text>
				</view>
			</view>
		</view>

		<!-- 05 面试准备方向 -->
		<view class="card">
			<view class="card-head">
				<text class="card-label">面试准备方向</text>
				<text class="card-count">{{ prepAreas.length }} 个重点</text>
			</view>

			<view v-for="(item, index) in jdInterviewPrep" :key="item.value" class="prep-item">
				<text class="list-index">{{ String(index + 1).padStart(2, '0') }}</text>
				<view class="prep-body">
					<text class="prep-title">{{ item.label }}</text>
					<text class="prep-desc">{{ item.value }}</text>
				</view>
			</view>
		</view>

		<text class="jd-foot">报告由 AI 生成 · 仅供参考</text>
	</view>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';

const props = defineProps<{
	jdBasicInfo: { label: string; value: string }[]
	jdDuties: { label: string; value: string }[]
	knowledgeRequirements: { label: string; value: string[] | string }[]
	jdInterviewPrep: { label: string; value: string }[]
	jdHiddenInfo: { label: string; value: string }[]
}>()

const jdBasicInfo = computed(() => props.jdBasicInfo)
const jdDuties = computed(() => props.jdDuties)
const knowledgeRequirements = computed(() => props.knowledgeRequirements)
const jdInterviewPrep = computed(() => props.jdInterviewPrep)
const jdHiddenInfo = computed(() => props.jdHiddenInfo)

watch(() => props.knowledgeRequirements, (newVal) => {
	console.log('岗位职责:', newVal)
})

onMounted(() => {
	console.log('岗位基本信息:', jdBasicInfo.value)
	console.log('岗位职责:', jdDuties.value)
	console.log('认知要求:', knowledgeRequirements.value)
	console.log('面试准备方向:', jdInterviewPrep.value)
	console.log('隐藏信息:', jdHiddenInfo.value)
})


const emit = defineEmits(['goBack'])
const goBackChat = () => {
	emit('goBack')
}

// ===== 静态数据（后续替换为 AI 流式解析结果） =====



// 基本信息三列
const basicCols = [
	{ label: '薪资', value: '¥28–38K·14薪' },
	{ label: '经验', value: '5–10 年' },
	{ label: '学历', value: '本科及以上' },
]

// 岗位职责
const responsibilities = [
	'负责中后台产品的前端架构设计与核心模块开发',
	'主导性能优化、工程化体系与稳定性建设',
	'推动微前端、组件库和低代码平台落地',
	'协同产品、设计和后端，完成复杂业务交付',
	'参与技术评审，指导初中级工程师成长',
]

// 认知要求（硬性门槛）
const requirements = [
	{ tag: '经验', text: '5 年以上前端经验，有大型项目主导经历' },
	{ tag: '技术', text: '精通 React / TypeScript，能独立完成架构设计' },
	{ tag: '能力', text: '能拆解复杂业务，并推动方案跨团队落地' },
]

// 加分项
const bonuses = ['微前端', 'Node.js BFF', '数据可视化', '低代码']

// 隐藏信息（AI 推断）
const hiddenInfo = [
	{ title: '团队阶段', desc: '基础架构建设期，工程化落地比堆业务更关键' },
	{ title: '真实优先级', desc: '性能与稳定性被反复提及，面试会重点追问' },
	{ title: '薪资空间', desc: '区间表达开放，实际预算可能高于中位' },
]

// 面试准备方向
const prepAreas = [
	{ title: '技术面', desc: '准备性能优化、工程化与微前端案例，能讲清取舍' },
	{ title: '项目面', desc: '用主导项目讲清架构设计、协作过程与量化结果' },
	{ title: '反问', desc: '确认团队阶段、职责边界与晋升标准' },
]
</script>

<style lang="scss" scoped>
.jd-panel {
	display: flex;
	flex-direction: column;
	gap: 29rpx;
	box-sizing: border-box;
	padding: 48rpx 16rpx 40rpx;
	background-color: #f4f4f4;
}

/* ===== 标题区 ===== */
.jd-head {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	margin-bottom: 14rpx;
}

.jd-head-left {
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

.jd-title {
	font-size: 50rpx;
	font-weight: 700;
	line-height: 1.3;
	color: #111111;
}

.jd-subtitle {
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

/* ===== 01 岗位基本信息 ===== */
.info-title {
	display: block;
	margin-top: 12rpx;
	font-size: 34rpx;
	font-weight: 600;
	line-height: 1.4;
	color: #111111;
}

.info-meta {
	display: block;
	margin-top: 4rpx;
	font-size: 19rpx;
	line-height: 1.4;
	color: #9a9a9a;
}

.info-divider {
	height: 2rpx;
	margin: 24rpx 0;
	background-color: #f1f1f1;
}

.info-cols {
	display: flex;
	align-items: stretch;
}

.info-col {
	flex: 1;
	min-width: 0;

	&--border {
		padding-left: 22rpx;
		border-left: 2rpx solid #f2f2f2;
	}
}

.info-col-label {
	display: block;
	font-size: 18rpx;
	line-height: 1.4;
	color: #a6a6a6;
}

.info-col-value {
	display: block;
	margin-top: 6rpx;
	font-size: 22rpx;
	font-weight: 600;
	line-height: 1.4;
	color: #202020;
	white-space: nowrap;
}

/* ===== 列表项序号（职责 / 面试重点共用） ===== */
.list-item {
	display: flex;
	align-items: flex-start;
	margin-top: 20rpx;
}

.list-index {

	flex-shrink: 0;
	box-sizing: border-box;
	height: 40rpx;
	padding: 0 16rpx;
	margin-right: 18rpx;
	background-color: #f6f6f6;
	border-radius: 20rpx;
	font-size: 17rpx;
	line-height: 40rpx;
	color: #777777;
}

.list-text {
	flex: 1;
	font-size: 20rpx;
	line-height: 1.7;
	color: #3d3d3d;
}

/* ===== 03 认知要求 ===== */
.req-item {
	display: flex;
	align-items: flex-start;
	margin-top: 18rpx;
}

.req-tag {
	flex-shrink: 0;
	width: 40rpx;
	font-size: 17rpx;
	font-weight: 500;
	line-height: 1.7;
	color: #b0b0b0;
	margin-left: 18rpx;
}

.req-text {
	flex: 1;
	font-size: 20rpx;
	line-height: 1.6;
	color: #3d3d3d;
}

.bonus-divider {
	height: 2rpx;
	margin: 24rpx 0;
	background-color: #f2f2f2;
}

.bonus-label {
	display: block;
	font-size: 17rpx;
	line-height: 1.4;
	color: #a6a6a6;
}

.bonus-tags {
	display: flex;
	flex-wrap: wrap;
	margin-top: 12rpx;
}

.bonus-tag {
	box-sizing: border-box;
	padding: 8rpx 24rpx;
	margin-right: 14rpx;
	margin-bottom: 12rpx;
	font-size: 18rpx;
	line-height: 30rpx;
	color: #5d5d5d;
	background-color: #f6f6f6;
	border-radius: 24rpx;
}

/* ===== 04 隐藏信息 ===== */
.ai-badge {
	box-sizing: border-box;
	padding: 6rpx 20rpx;
	font-size: 17rpx;
	font-weight: 500;
	line-height: 1.4;
	color: #4f46f0;
	background-color: #f1efff;
	border-radius: 20rpx;
}

.hidden-item {
	display: flex;
	align-items: flex-start;
	margin-top: 18rpx;
}

.hidden-bar {
	flex-shrink: 0;
	width: 4rpx;
	height: 40rpx;
	margin-top: 4rpx;
	background-color: #4f46f0;
	opacity: 0.55;
	border-radius: 2rpx;
}

.hidden-body {
	flex: 1;
	margin-left: 18rpx;
}

.hidden-title {
	display: block;
	font-size: 20rpx;
	font-weight: 600;
	line-height: 1.4;
	color: #222222;
}

.hidden-desc {
	display: block;
	margin-top: 4rpx;
	font-size: 19rpx;
	line-height: 1.5;
	color: #929292;
}

/* ===== 05 面试准备方向 ===== */
.prep-item {
	display: flex;
	align-items: flex-start;
	margin-top: 22rpx;
}

.prep-body {
	flex: 1;
}

.prep-title {
	display: block;
	font-size: 21rpx;
	font-weight: 600;
	line-height: 1.4;
	color: #1a1a1a;
}

.prep-desc {
	display: block;
	margin-top: 4rpx;
	font-size: 19rpx;
	line-height: 1.5;
	color: #929292;
}

/* ===== 页脚 ===== */
.jd-foot {
	margin-top: 29rpx;
	font-size: 17rpx;
	line-height: 1.4;
	color: #afafaf;
	text-align: center;
}
</style>
