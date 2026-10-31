<template>
	<view class="job-detail" :class="{ 'is-guest': isGuest }" :style="{ paddingTop: statusBarHeight + 'px' }">
		<!-- ===== 顶部导航：返回 + 收藏 / 分享 ===== -->
		<view class="navbar">
			<view class="back" @click="onBack"></view>
			<view class="navbar-actions">
				<image class="icon-collect"
					:src="collecting ? '/static/icon/detail/detail-collect-active.svg' : '/static/icon/detail/detail-collect.svg'"
					mode="aspectFit" @click="collectJob" />
				<image class="icon-share" src="/static/icon/detail/detail-share.svg" mode="aspectFit" />
			</view>
		</view>

		<!-- ===== 岗位摘要 ===== -->
		<view class="summary">
			<text class="job-title">{{ jobDetail.job_name }}</text>

			<view class="salary-row">
				<text class="job-salary">{{ jobDetail.salaryMin }}-{{ jobDetail.salaryMax }}K</text>
				<text class="job-exp">· {{ jobDetail.experience }}</text>
			</view>

			<view class="meta-row">
				<image class="meta-pin" src="/static/icon/detail/detail-pin.svg" mode="aspectFit" />
				<text class="meta-text">{{ jobDetail.city }} · {{ jobDetail.district }}</text>
			</view>
		</view>

		<!-- ===== 公司信息 ===== -->
		<view class="company-card">
			<view class="company-logo">
				<text class="company-logo-text">{{ jobDetail.company?.slice(0, 1) }}</text>
			</view>
			<view class="company-info">
				<text class="company-name">{{ jobDetail.company }}</text>
			</view>
			<view class="chevron"></view>
		</view>

		<view class="content">
			<!-- ===== 职位描述 ===== -->
			<text class="section-title">职位描述</text>
			<view class="jd-list">
				<view class="jd-item" v-for="(text, index) in jobDesc" :key="index">
					<text class="jd-index">{{ index + 1 }}</text>
					<text class="jd-text">{{ text }}</text>
				</view>
			</view>

			<view class="divider"></view>

			<!-- ===== 任职要求 ===== -->
			<text class="section-title">任职要求</text>
			<view class="jd-list">
				<view class="jd-item" v-for="(text, index) in jobDetail.skill_tags" :key="index">
					<text class="jd-index">{{ index + 1 }}</text>
					<text class="jd-text">{{ text }}</text>
				</view>
			</view>

			<text class="updated" v-if="jobDetail.publish_date">职位信息更新于
				{{ formatPublishDate(jobDetail.publish_date) }}</text>
		</view>

		<!-- ===== 底部操作栏：未登录时隐藏，由登录引导替代 ===== -->
		<view class="bottom-bar" v-if="!isGuest">
			<view class="btn btn-jd" @click="openJdAnalysis">
				<text class="btn-text">JD 岗位描述</text>
			</view>
			<view class="btn btn-ai" @click="startMatch">
				<text class="btn-text btn-text-light">AI 分析匹配度</text>
			</view>
		</view>

		<!-- ===== 未登录访客：遮住下半部分内容并引导登录 ===== -->
		<GuestLogin v-if="isGuest" />

		<!-- ===== 匹配分析结果：本页内流式展示，返回只关闭浮层 ===== -->
		<transition name="match">
			<view v-if="matchOpen" class="match-overlay" :style="{ paddingTop: statusBarHeight + 'px' }">
				<matchPanel :text="matchText" :loading="matchLoading" :saving="savingReport" @back="closeMatch"
					@save="saveReport" />
			</view>
		</transition>
		<!-- ===== JD 深度解读：本页内流式展示 ===== -->
		<transition name="match">
			<view v-if="jdOpen" class="match-overlay" :style="{ paddingTop: statusBarHeight + 'px' }">
				<JdPanel v-if="jdText" :jdBasicInfo="jdBasicInfo" :jdDuties="jdDuties"
					:knowledgeRequirements="knowledgeRequirements" :jdInterviewPrep="jdInterviewPrep"
					:jdHiddenInfo="jdHiddenInfo" :company="jobDetail.company"
					:location="[jobDetail.city, jobDetail.district].filter(Boolean).join(' · ')"
					:salary-text="`${jobDetail.salaryMin}-${jobDetail.salaryMax}K`"
					:experience="jobDetail.experience" backText="返回岗位" @goBack="closeJd" />

				<!-- 首段内容到达前显示加载态 -->
				<view v-else class="jd-loading">
					<view class="jd-loading-head">
						<text class="jd-loading-label">分析报告</text>
						<text class="jd-loading-back" @click="closeJd">返回岗位</text>
					</view>
					<text class="jd-loading-text">正在解读岗位描述…</text>
				</view>
			</view>
		</transition>
	</view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { getJobDetail, type JobDetail } from '@/api/server'
import { streamAI, streamMatch } from '@/api/ai'
import { addFavorite, getMatchReport, removeFavorite, saveMatchReport } from '@/api/user'
import { getErrorMessage } from '@/utils/request'
import { parseSections } from '@/utils/aiText'
import { isLoggedIn } from '@/utils/auth'
import { useJdReport } from '@/composables/useJdReport'
import matchPanel from '@/components/aiAnalyse/matchPanel.vue'
import JdPanel from '@/components/aiAnalyse/jdPanel.vue'
import GuestLogin from '@/components/detail/guestLogin.vue'
import { onBackPress, onLoad, onUnload } from '@dcloudio/uni-app'

// 状态栏高度：自定义导航栏用它做顶部留白（H5 端没有状态栏，取 12px 保底）
const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 12

// 访客态：未登录时只露出岗位摘要与公司信息，正文由渐变遮罩挡住并引导登录
const isGuest = ref(!isLoggedIn())

// 静态数据：职位描述（接口暂未返回）
const jobDesc = [
	'暂无数据'
]

// 收藏状态：true 显示实心星，以接口返回的 favorited 为准
const collecting = ref(false)

// 获取岗位详情
const jobDetail = ref({} as JobDetail)
const getJob = async (id: number) => {
	try {
		const res = await getJobDetail(id)
		jobDetail.value = res
		// 回显后端返回的收藏状态
		console.log(res)
		collecting.value = res.favorited
	} catch (error) {
		console.log(error)
	}
}

// 后端时间是字符串，格式化成 YYYY-MM-DD HH:mm（解析失败时原样展示）
const formatPublishDate = (value: string) => {
	const date = new Date(value)
	if (Number.isNaN(date.getTime())) return value
	const pad = (num: number) => String(num).padStart(2, '0')
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

// 当前岗位 id，页面通过 ?id= 传入
const jobId = ref<number | null>(null)

// ===== 岗位匹配分析：流式获取，直接在本页展示 =====
const matchOpen = ref(false)
const matchLoading = ref(false)
const matchText = ref('')
let matchController: AbortController | null = null

// 防抖：500ms 内的重复点击直接忽略
const MATCH_DEBOUNCE = 500
let lastMatchAt = 0

const startMatch = async () => {
	if (!jobId.value) {
		uni.showToast({ title: '岗位信息不存在', icon: 'none' })
		return
	}

	const now = Date.now()
	if (now - lastMatchAt < MATCH_DEBOUNCE) return
	lastMatchAt = now

	// 重新分析前先清空并中止上一次请求
	matchController?.abort()
	matchText.value = ''
	matchOpen.value = true
	matchLoading.value = true

	const controller = new AbortController()
	matchController = controller
	try {
		await streamMatch({
			jobId: jobId.value,
			signal: controller.signal,
			onDelta: (delta) => {
				matchText.value += delta
			}
		})
	} catch (error) {
		// 主动关闭不算失败
		if (!controller.signal.aborted) {
			console.error('[detail] 匹配分析失败', error)
			uni.showToast({ title: error instanceof Error ? error.message : '匹配分析失败', icon: 'none' })
		}
	} finally {
		if (matchController === controller) {
			matchController = null
			matchLoading.value = false
		}
	}
}

const closeMatch = () => {
	matchController?.abort()
	matchController = null
	matchLoading.value = false
	matchOpen.value = false
}

// 保存当前匹配报告
const savingReport = ref(false)

const saveReport = async () => {
	if (!jobId.value) {
		uni.showToast({ title: '岗位信息不存在', icon: 'none' })
		return
	}
	const content = matchText.value.trim()
	if (!content) {
		uni.showToast({ title: '暂无可保存的报告', icon: 'none' })
		return
	}
	if (savingReport.value) return

	savingReport.value = true
	try {
		// 先查是否已保存过，已保存则提示会覆盖
		const existing = await getMatchReport(jobId.value)
		if (existing) {
			const confirmed = await new Promise<boolean>((resolve) => {
				uni.showModal({
					title: '提示',
					content: '该岗位已保存过匹配报告，继续保存会覆盖旧报告，是否继续？',
					confirmText: '继续保存',
					confirmColor: '#007c77',
					success: (res) => resolve(!!res.confirm),
					fail: () => resolve(false)
				})
			})
			if (!confirmed) return
		}

		await saveMatchReport(jobId.value, content)
		uni.showToast({ title: '报告已保存', icon: 'success' })
	} catch (error) {
		console.error('[detail] 保存匹配报告失败', error)
		uni.showToast({ title: getErrorMessage(error, '保存失败，请稍后重试'), icon: 'none' })
	} finally {
		savingReport.value = false
	}
}

// 安卓物理返回：优先关闭浮层
onBackPress(() => {
	if (jdOpen.value) {
		closeJd()
		return true
	}
	if (!matchOpen.value) return false
	closeMatch()
	return true
})

onUnload(() => {
	matchController?.abort()
	matchController = null
	jdController?.abort()
	jdController = null
})

const collectJob = async () => {
	if (!jobId.value) {
		uni.showToast({ title: '岗位信息不存在', icon: 'none' })
		return
	}

	// 收藏需要登录：访客先提示并引导去登录页
	if (isGuest.value) {
		uni.showToast({ title: '登录后才能收藏职位', icon: 'none' })
		setTimeout(() => {
			uni.navigateTo({ url: '/pages/login/index' })
		}, 800)
		return
	}

	try {
		// 已收藏：再点一次调用取消收藏
		if (collecting.value) {
			await removeFavorite(jobId.value)
			collecting.value = false
			uni.showToast({ title: '已取消收藏', icon: 'none' })
			return
		}

		const res = await addFavorite(jobId.value)
		collecting.value = true
		uni.showToast({ title: `已收藏，共 ${res.favoriteCount} 个职位`, icon: 'none' })
	} catch (error) {
		console.error('[detail] 收藏操作失败', error)
		uni.showToast({ title: getErrorMessage(error, '操作失败，请稍后重试'), icon: 'none' })
	}
}

// ===== JD 深度解读：流式获取，直接在本页展示 =====
const jdOpen = ref(false)
const jdLoading = ref(false)
const jdText = ref('')
let jdController: AbortController | null = null

const jdSections = computed(() => parseSections(jdText.value))
const { jdBasicInfo, jdDuties, knowledgeRequirements, jdHiddenInfo, jdInterviewPrep } = useJdReport(jdSections)

// 把岗位详情拼成 JD 文本，作为分析输入
const buildJdInput = () => {
	const detail = jobDetail.value
	return [
		`职位名称：${detail.job_name}`,
		`公司：${detail.company || '未提供'}`,
		`工作地点：${[detail.city, detail.district].filter(Boolean).join(' · ') || '未提供'}`,
		`薪资范围：${detail.salaryMin}-${detail.salaryMax}K`,
		`经验要求：${detail.experience || '未提供'}`,
		`技能要求：${detail.skill_tags?.join('、') || '未提供'}`
	].join('\n')
}

// 打开 JD 深度解读：与匹配分析各自独立一条流，直接在本页展示结果
const openJdAnalysis = () => {
	if (!jobDetail.value?.job_name) {
		uni.showToast({ title: '岗位信息加载中，请稍后再试', icon: 'none' })
		return
	}
	if (jdLoading.value) return

	jdController?.abort()
	jdText.value = ''
	jdLoading.value = true
	jdOpen.value = true

	const controller = new AbortController()
	jdController = controller
	streamAI({
		scene: 'jd',
		messages: [{ role: 'user', content: buildJdInput() }],
		signal: controller.signal,
		onDelta: (delta) => {
			jdText.value += delta
		}
	})
		.catch((error) => {
			// 主动关闭不算失败
			if (controller.signal.aborted) return
			console.error('[detail] JD 解读失败', error)
			jdOpen.value = false
			uni.showToast({ title: error instanceof Error ? error.message : 'JD 解读失败', icon: 'none' })
		})
		.finally(() => {
			if (jdController === controller) {
				jdController = null
				jdLoading.value = false
			}
		})
}

// 关闭 JD 解读浮层
const closeJd = () => {
	jdController?.abort()
	jdController = null
	jdLoading.value = false
	jdOpen.value = false
}

onLoad((options) => {
	// 列表页通过 ?id= 传入岗位 id
	const id = Number(options?.id)
	if (!id) return
	jobId.value = id
	getJob(id)
})

// 返回上一页
const onBack = () => {
	uni.navigateBack()
}
</script>

<style lang="scss">
.job-detail {
	box-sizing: border-box;
	min-height: 100vh;
	padding-bottom: calc(180rpx + env(safe-area-inset-bottom));
	font-family: Inter, -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', Helvetica, Arial,
		sans-serif;

	/* 访客态：浅青渐变底，与下半部分遮罩自然衔接
	   同时锁定页面：只做布局锁定，不拦截触摸手势，避免滑动把遮罩下的正文滚出来；
	   系统左右滑的返回手势由原生层处理，不受影响 */
	&.is-guest {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		overflow: hidden;
		background-image: linear-gradient(180deg, #e2f3f0 0%, #f1f8f7 30%, #f4f8f7 100%);
	}

	/* ===== 顶部导航 ===== */
	.navbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		box-sizing: border-box;
		height: 88rpx;
		margin-top: 8rpx;
		padding: 0 40rpx;

		/* 返回箭头：左 + 下描边旋转 45°，指向左侧 */
		.back {
			flex-shrink: 0;
			width: 20rpx;
			height: 20rpx;
			border-left: 3rpx solid #3d4b54;
			border-bottom: 3rpx solid #3d4b54;
			transform: rotate(45deg);
		}

		.navbar-actions {
			display: flex;
			align-items: center;
			gap: 28rpx;

			.icon-collect {
				width: 38rpx;
				height: 36rpx;
			}

			.icon-share {
				width: 38rpx;
				height: 46rpx;
			}
		}
	}

	/* ===== 岗位摘要 ===== */
	.summary {
		padding: 8rpx 40rpx 0;

		.job-title {
			display: block;
			font-size: 52rpx;
			font-weight: 700;
			line-height: 1.25;
			letter-spacing: -1.6rpx;
			color: #17252b;
		}

		.salary-row {
			display: flex;
			align-items: baseline;
			margin-top: 16rpx;

			.job-salary {
				font-size: 38rpx;
				font-weight: 700;
				line-height: 1.2;
				letter-spacing: -0.6rpx;
				color: #007c77;
			}

			.job-exp {
				margin-left: 12rpx;
				font-size: 25rpx;
				line-height: 1.2;
				color: #65747c;
			}
		}

		.meta-row {
			display: flex;
			align-items: center;
			margin-top: 20rpx;

			.meta-pin {
				flex-shrink: 0;
				width: 24rpx;
				height: 30rpx;
			}

			.meta-text {
				margin-left: 12rpx;
				font-size: 25rpx;
				line-height: 1.2;
				color: #65747c;
			}
		}
	}

	/* ===== 公司信息 ===== */
	.company-card {
		display: flex;
		align-items: center;
		box-sizing: border-box;
		height: 150rpx;
		margin: 32rpx 40rpx 0;
		padding: 0 28rpx;
		background-color: #ffffff;
		border: 2rpx solid #e3ebec;
		border-radius: 28rpx;

		.company-logo {
			display: flex;
			align-items: center;
			justify-content: center;
			flex-shrink: 0;
			width: 88rpx;
			height: 88rpx;
			background-color: #26363d;
			border-radius: 24rpx;

			.company-logo-text {
				font-size: 32rpx;
				font-weight: 600;
				line-height: 1;
				color: #ffffff;
			}
		}

		.company-info {
			flex: 1;
			min-width: 0;
			margin-left: 24rpx;

			.company-name {
				display: block;
				font-size: 28rpx;
				font-weight: 600;
				line-height: 1.2;
				letter-spacing: -0.3rpx;
				color: #17252b;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}
		}

		/* 右箭头：旋转 45° 的直角边框 */
		.chevron {
			flex-shrink: 0;
			width: 14rpx;
			height: 14rpx;
			margin-left: 16rpx;
			border-right: 3rpx solid #8a979e;
			border-bottom: 3rpx solid #8a979e;
			transform: rotate(-45deg);
		}
	}

	/* ===== 正文 ===== */
	.content {
		padding: 0 40rpx;

		.section-title {
			display: block;
			margin-top: 36rpx;
			font-size: 36rpx;
			font-weight: 700;
			line-height: 1.25;
			letter-spacing: -0.7rpx;
			color: #17252b;
		}

		.jd-list {
			margin-top: 20rpx;

			.jd-item {
				display: flex;
				margin-top: 24rpx;

				&:first-child {
					margin-top: 0;
				}

				.jd-index {
					flex-shrink: 0;
					width: 36rpx;
					font-size: 21rpx;
					line-height: 1.65;
					color: #93a0a7;
				}

				.jd-text {
					flex: 1;
					min-width: 0;
					font-size: 27rpx;
					line-height: 1.65;
					color: #3d4b54;
				}
			}
		}

		.divider {
			height: 2rpx;
			margin: 12rpx 0 0;
			background-color: #edf2f2;
		}

		.updated {
			display: block;
			margin-top: 28rpx;
			font-size: 20rpx;
			line-height: 1.4;
			color: #93a0a7;
		}
	}

	/* ===== 底部操作栏 ===== */
	.bottom-bar {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		align-items: center;
		box-sizing: border-box;
		padding: 24rpx 40rpx;
		padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
		background-color: #ffffff;
		border-top: 2rpx solid #e3ebec;

		.btn {
			display: flex;
			align-items: center;
			justify-content: center;
			height: 86rpx;
			border-radius: 22rpx;

			.btn-text {
				font-size: 27rpx;
				font-weight: 500;
				line-height: 1;
				color: #3d4b54;
			}

			.btn-text-light {
				font-size: 28rpx;
				font-weight: 600;
				color: #ffffff;
			}
		}

		/* 左：JD 岗位描述 */
		.btn-jd {
			flex: 1;
			box-sizing: border-box;
			background-color: #f7faf9;
			border: 2rpx solid #d7e2e2;
		}

		/* 右：AI 分析匹配度 */
		.btn-ai {
			flex: 1.2;
			margin-left: 24rpx;
			background-image: linear-gradient(180deg, #007c77 0%, #00746f 100%);
		}
	}
}

/* ===== 匹配分析浮层 ===== */
.match-overlay {
	position: fixed;
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
	z-index: 30;
	overflow-y: auto;
	box-sizing: border-box;
	background-color: #f4f8f7;
	background-image: linear-gradient(180deg, #e2f3f0 0%, #f1f8f7 30%, #f4f8f7 100%);
}

/* ===== JD 解读加载态 ===== */
.jd-loading {
	padding-top: 24rpx;

	.jd-loading-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 40rpx;
	}

	.jd-loading-label {
		font-size: 23rpx;
		line-height: 1;
		color: #8a979e;
	}

	.jd-loading-back {
		font-size: 24rpx;
		line-height: 1;
		color: #65747c;
	}

	.jd-loading-text {
		display: block;
		margin-top: 120rpx;
		font-size: 26rpx;
		line-height: 1.4;
		text-align: center;
		color: #8a979e;
	}
}

/* 打开 / 关闭：淡入淡出 + 轻微位移 */
.match-enter-active,
.match-leave-active {
	transition: opacity 0.24s ease, transform 0.24s ease;
}

.match-enter-from,
.match-leave-to {
	opacity: 0;
	transform: translateY(16rpx);
}
</style>
