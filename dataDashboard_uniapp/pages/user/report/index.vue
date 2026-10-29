<template>
	<view class="report-page" :class="{ 'is-selecting': selectMode }">
		<template v-if="!detailOpen">
			<!-- ===== 顶部导航 ===== -->
			<view class="appbar" :style="{ paddingTop: statusBarHeight + 'px' }">
				<text class="appbar-label">AI 分析</text>
				<text class="appbar-back" @click="selectMode ? exitSelect() : goBack()">{{ selectMode ? '完成' : '返回'
					}}</text>
			</view>

			<!-- ===== 标题 ===== -->
			<view class="page-head">
				<text class="page-title">分析报告</text>
				<view class="head-row">
					<text class="page-subtitle">共 {{ total }} 份 · 按生成时间排序</text>
					<text v-if="reports.length" class="batch-btn" @click="enterSelect">批量管理</text>
				</view>
			</view>

			<!-- ===== 报告列表 ===== -->
			<view class="sheet">
				<text v-if="loading" class="state-text">加载中…</text>
				<text v-else-if="!reports.length" class="state-text">暂无分析报告</text>

				<view class="report-row" v-for="item in reports" :key="item.reportId" @click="onRowClick(item)">
					<view v-if="selectMode" class="check" :class="{ 'is-on': selectedJobIds.includes(item.jobId) }"></view>

					<view class="row-main">
						<text class="job-name">{{ item.jobName }}</text>
						<text class="job-meta">{{ metaText(item) }}</text>
						<text class="job-metrics">{{ metricsText(item) }}</text>
					</view>

					<view class="row-side">
						<text class="score">{{ item.score }}%</text>
						<text class="score-label">综合匹配分</text>
						<text class="time">{{ formatTime(item.saveTime) }}</text>
					</view>
				</view>

				<text class="foot-note">分析报告仅自己可见，可随时回来继续查看。</text>
			</view>

			<!-- ===== 批量操作栏 ===== -->
			<view v-if="selectMode" class="batch-bar">
				<view class="select-all" @click="toggleSelectAll">
					<view class="check" :class="{ 'is-on': allSelected }"></view>
					<text class="select-all-text">{{ allSelected ? '取消全选' : '全选' }}</text>
				</view>

				<view class="delete-btn" :class="{ 'is-disabled': !selectedJobIds.length || deleting }"
					@click="confirmDelete">
					{{ selectedJobIds.length ? `删除（${selectedJobIds.length}）` : '删除' }}
				</view>
			</view>
		</template>

		<!-- ===== 报告详情：复用匹配分析面板 ===== -->
		<view v-else class="match-overlay" :style="{ paddingTop: statusBarHeight + 'px' }">
			<matchPanel :text="detailText" :loading="false" readonly @back="closeDetail" />
		</view>
	</view>
</template>

<script setup lang="ts">
import { deleteMatchReports, getMatchReportDetail, getMatchReportList, type MatchReportItem } from '@/api/user'
import { getErrorMessage } from '@/utils/request'
import matchPanel from '@/components/aiAnalyse/matchPanel.vue'
import { onBackPress, onShow } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'

// 自定义导航栏需自行避开状态栏
const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 12

// 报告列表：接口按生成时间倒序返回
const reports = ref<MatchReportItem[]>([])
const total = ref(0)
const loading = ref(false)

// 批量选择：打开时行点击改为勾选
const selectMode = ref(false)
// 选中项按 jobId 记录，删除接口按 jobIds 提交
const selectedJobIds = ref<number[]>([])
const deleting = ref(false)
// 一次最多删除的数量
const MAX_DELETE = 50
const allSelected = computed(
	() => reports.value.length > 0 && selectedJobIds.value.length === reports.value.length
)

// 报告详情：复用 matchPanel 解析正文
const detailOpen = ref(false)
const detailText = ref('')

const pad = (n: number) => String(n).padStart(2, '0')

// 列表时间：今天 / 昨天显示「今天 HH:mm」，更早显示月/日
const formatTime = (iso: string) => {
	const date = new Date(iso)
	if (Number.isNaN(date.getTime())) return iso
	const now = new Date()
	const hm = `${pad(date.getHours())}:${pad(date.getMinutes())}`
	if (date.toDateString() === now.toDateString()) return `今天 ${hm}`
	const yesterday = new Date(now)
	yesterday.setDate(now.getDate() - 1)
	if (date.toDateString() === yesterday.toDateString()) return `昨天 ${hm}`
	return `${pad(date.getMonth() + 1)}/${pad(date.getDate())}`
}

// 公司 · 地点 · 经验，缺失的字段自动省略
const metaText = (item: MatchReportItem) =>
	[item.company, item.location, item.experience].filter(Boolean).join(' · ')

// 关键指标：技能覆盖率与薪资偏差
const metricsText = (item: MatchReportItem) => {
	const parts: string[] = []
	if (item.skillCoverage != null) parts.push(`技能覆盖 ${item.skillCoverage}%`)
	if (item.salaryDeviation != null) parts.push(`薪资偏差 ${item.salaryDeviation}%`)
	return parts.join(' · ')
}

// 拉取报告列表
const loadReports = async () => {
	loading.value = true
	try {
		const res = await getMatchReportList()
		reports.value = res.list
		total.value = res.total
	} catch (error) {
		console.error('[report] 获取分析报告失败', error)
		uni.showToast({ title: '分析报告加载失败', icon: 'none' })
	} finally {
		loading.value = false
	}
}

// 每次回到本页都刷新，保证新生成的报告及时出现
onShow(loadReports)

// 打开报告详情：按岗位 id 拉取报告正文，拿到后再展示面板
const openDetail = async (item: MatchReportItem) => {
	uni.showLoading({ title: '加载中', mask: true })
	try {
		const res = await getMatchReportDetail(item.jobId)
		uni.hideLoading()
		if (!res) {
			uni.showToast({ title: '该报告不存在', icon: 'none' })
			return
		}
		detailText.value = res.report.content
		detailOpen.value = true
	} catch (error) {
		uni.hideLoading()
		console.error('[report] 获取报告详情失败', error)
		uni.showToast({ title: getErrorMessage(error, '报告加载失败，请稍后重试'), icon: 'none' })
	}
}

// 关闭详情，回到列表
const closeDetail = () => {
	detailOpen.value = false
	detailText.value = ''
}

// 进入 / 退出批量选择
const enterSelect = () => {
	selectMode.value = true
	selectedJobIds.value = []
}

const exitSelect = () => {
	selectMode.value = false
	selectedJobIds.value = []
}

// 行点击：普通模式看详情，选择模式切换勾选
const onRowClick = (item: MatchReportItem) => {
	if (!selectMode.value) {
		openDetail(item)
		return
	}
	const id = item.jobId
	if (selectedJobIds.value.includes(id)) {
		selectedJobIds.value = selectedJobIds.value.filter((value) => value !== id)
		return
	}
	if (selectedJobIds.value.length >= MAX_DELETE) {
		uni.showToast({ title: `一次最多删除 ${MAX_DELETE} 份`, icon: 'none' })
		return
	}
	selectedJobIds.value = [...selectedJobIds.value, id]
}

// 全选 / 取消全选：超过上限时只选前 50 份
const toggleSelectAll = () => {
	if (allSelected.value) {
		selectedJobIds.value = []
		return
	}
	const ids = reports.value.map((item) => item.jobId)
	if (ids.length > MAX_DELETE) {
		selectedJobIds.value = ids.slice(0, MAX_DELETE)
		uni.showToast({ title: `一次最多删除 ${MAX_DELETE} 份`, icon: 'none' })
		return
	}
	selectedJobIds.value = ids
}

// 批量删除：二次确认后调用接口，并同步本地列表
const confirmDelete = async () => {
	if (!selectedJobIds.value.length || deleting.value) return
	if (selectedJobIds.value.length > MAX_DELETE) {
		uni.showToast({ title: `一次最多删除 ${MAX_DELETE} 份`, icon: 'none' })
		return
	}
	const count = selectedJobIds.value.length

	const confirmed = await new Promise<boolean>((resolve) => {
		uni.showModal({
			title: '删除报告',
			content: `确定删除选中的 ${count} 份报告吗？`,
			confirmColor: '#007c77',
			success: (res) => resolve(!!res.confirm),
			fail: () => resolve(false)
		})
	})
	if (!confirmed) return

	deleting.value = true
	try {
		await deleteMatchReports(selectedJobIds.value)
		const ids = selectedJobIds.value
		reports.value = reports.value.filter((item) => !ids.includes(item.jobId))
		total.value = Math.max(0, total.value - count)
		exitSelect()
		uni.showToast({ title: '已删除', icon: 'none' })
	} catch (error) {
		console.error('[report] 删除报告失败', error)
		uni.showToast({ title: getErrorMessage(error, '删除失败，请稍后重试'), icon: 'none' })
	} finally {
		deleting.value = false
	}
}

// 返回上一页；直接进入本页时回「我的」
const goBack = () => {
	uni.navigateBack({
		fail: () => {
			uni.switchTab({ url: '/pages/user/index' })
		}
	})
}

// 安卓物理返回：优先关闭详情 / 退出多选
onBackPress(() => {
	if (detailOpen.value) {
		closeDetail()
		return true
	}
	if (selectMode.value) {
		exitSelect()
		return true
	}
	return false
})
</script>

<style lang="scss" scoped>
.report-page {
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	min-height: 100vh;
	background-image: linear-gradient(180deg, #e2f3f0 0%, #f1f8f7 30%, #f4f8f7 100%);
	font-family: Inter, -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', Helvetica, Arial,
		sans-serif;
}

/* ===== 顶部导航：左侧场景标签 + 右侧返回 ===== */
.appbar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	box-sizing: border-box;
	height: 88rpx;
	padding: 0 40rpx;

	.appbar-label {
		font-size: 22rpx;
		line-height: 1;
		color: #8a979e;
	}

	.appbar-back {
		font-size: 23rpx;
		line-height: 1;
		color: #65747c;
	}
}

/* ===== 标题区 ===== */
.page-head {
	padding: 18rpx 40rpx 0;

	.page-title {
		display: block;
		font-size: 50rpx;
		font-weight: 700;
		line-height: 1.1;
		letter-spacing: -1.5rpx;
		color: #17252b;
	}

	.head-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: 10rpx;
	}

	.page-subtitle {
		font-size: 22rpx;
		line-height: 1.2;
		color: #65747c;
	}

	/* 批量管理入口 */
	.batch-btn {
		flex-shrink: 0;
		margin-left: 24rpx;
		font-size: 22rpx;
		line-height: 1.2;
		color: #007c77;
	}
}

/* ===== 报告纸：白色大圆角，铺到页面底部 ===== */
.sheet {
	flex: 1;
	box-sizing: border-box;
	margin-top: 40rpx;
	padding: 12rpx 40rpx calc(40rpx + env(safe-area-inset-bottom));
	background-color: #ffffff;
	border-radius: 44rpx 44rpx 0 0;
}

/* 多选时给底部操作栏留出空间 */
.report-page.is-selecting .sheet {
	padding-bottom: calc(180rpx + env(safe-area-inset-bottom));
}

/* 圆形勾选框：列表行与全选共用 */
.check {
	position: relative;
	flex-shrink: 0;
	box-sizing: border-box;
	width: 36rpx;
	height: 36rpx;
	background-color: #ffffff;
	border: 2rpx solid #c9d6d6;
	border-radius: 50%;

	&.is-on {
		background-color: #007c77;
		border-color: #007c77;

		&::after {
			content: '';
			position: absolute;
			top: 50%;
			left: 50%;
			width: 15rpx;
			height: 8rpx;
			border-left: 3rpx solid #ffffff;
			border-bottom: 3rpx solid #ffffff;
			transform: translate(-50%, -60%) rotate(-45deg);
		}
	}
}

/* 单条报告：左侧岗位信息，右侧分数与时间 */
.report-row {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	padding: 30rpx 0 34rpx;
	border-bottom: 2rpx solid #edf2f2;

	&:last-of-type {
		border-bottom: none;
	}

	/* 行内勾选框与岗位名首行对齐 */
	.check {
		margin-top: 4rpx;
		margin-right: 20rpx;
	}

	.row-main {
		flex: 1;
		min-width: 0;
		margin-right: 24rpx;
	}

	.job-name {
		display: block;
		font-size: 30rpx;
		font-weight: 600;
		line-height: 1.2;
		letter-spacing: -0.3rpx;
		color: #17252b;
	}

	.job-meta {
		display: block;
		margin-top: 8rpx;
		font-size: 22rpx;
		line-height: 1.3;
		color: #65747c;
	}

	.job-metrics {
		display: block;
		margin-top: 8rpx;
		font-size: 20rpx;
		line-height: 1.3;
		color: #78868f;
	}

	.row-side {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		flex-shrink: 0;
	}

	.score {
		font-size: 44rpx;
		font-weight: 700;
		line-height: 1;
		letter-spacing: -1rpx;
		color: #007c77;
	}

	.score-label {
		margin-top: 6rpx;
		font-size: 18rpx;
		line-height: 1.2;
		color: #8a979e;
	}

	.time {
		margin-top: 22rpx;
		font-size: 18rpx;
		line-height: 1.2;
		color: #8a979e;
	}
}

/* ===== 报告详情浮层 ===== */
.match-overlay {
	position: fixed;
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
	z-index: 30;
	overflow-y: auto;
	box-sizing: border-box;
	background-image: linear-gradient(180deg, #e2f3f0 0%, #f1f8f7 30%, #f4f8f7 100%);
}

/* ===== 批量操作栏 ===== */
.batch-bar {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 20;
	display: flex;
	align-items: center;
	justify-content: space-between;
	box-sizing: border-box;
	padding: 20rpx 40rpx calc(20rpx + env(safe-area-inset-bottom));
	background-color: #ffffff;
	border-top: 2rpx solid #e3ebec;

	.select-all {
		display: flex;
		align-items: center;
	}

	.select-all-text {
		margin-left: 14rpx;
		font-size: 24rpx;
		line-height: 1.2;
		color: #3d4b54;
	}

	.delete-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
		min-width: 220rpx;
		height: 80rpx;
		padding: 0 32rpx;
		font-size: 27rpx;
		font-weight: 600;
		color: #ffffff;
		background-image: linear-gradient(180deg, #007c77 0%, #00746f 100%);
		border-radius: 20rpx;

		&.is-disabled {
			opacity: 0.5;
		}
	}
}

/* ===== 加载 / 空状态 ===== */
.state-text {
	display: block;
	padding: 60rpx 0;
	font-size: 24rpx;
	line-height: 1.4;
	text-align: center;
	color: #8a979e;
}

/* ===== 底部说明 ===== */
.foot-note {
	display: block;
	margin-top: 36rpx;
	font-size: 20rpx;
	line-height: 1.4;
	color: #8a979e;
}
</style>
