<template>
	<view class="ai-analyse" :style="{ paddingTop: statusBarHeight + 'px' }">
		<transition name="input" mode="out-in">
			<view v-if="!hasResult && !restoring" class="input-stage">
				<!-- ===== 顶部控制区：返回 + 标题 + 历史 ===== -->
				<view class="top-controls">
					<view class="back" @click="onBack"></view>
					<text class="top-title">AI 分析</text>
					<text class="history" @click="goHistory">历史</text>
				</view>

				<!-- ===== 问候语 ===== -->
				<view class="greeting">
					<text class="greeting-title">{{ title === '技术栈评估' ? '今天想评估什么技术栈？' : '看到了喜欢的岗位？' }}</text>
					<text class="greeting-desc">岗位匹配、技能差距、面试准备，都可以聊。</text>
				</view>

				<!-- ===== 快捷建议 ===== -->
				<view class="suggestions">
					<text class="suggestions-label">可以这样开始</text>
					<view class="chip" v-for="item in suggestions" :key="item.text" @click="navigateTo(item)">
						<view class="chip-icon-wrap">
							<image class="chip-icon" :class="'chip-icon--' + item.type" :src="item.icon"
								mode="aspectFit" />
						</view>
						<view class="chip-texts">
							<text class="chip-title">{{ item.text }}</text>
							<text class="chip-desc">{{ item.desc }}</text>
						</view>
						<view class="chip-chevron"></view>
					</view>
				</view>

				<!-- ===== 底部输入区 ===== -->
				<view class="composer">
					<view class="composer-box">
						<input class="composer-input" v-model="message" type="text" placeholder="发消息或按住说话…"
							confirm-type="send" placeholder-class="composer-placeholder" @confirm="sendMessage" />
					</view>
					<view class="composer-row">
						<view class="icon-btn">
							<image class="icon-btn-icon icon-btn-icon--plus" src="/static/icon/aiAnalyse/plus.svg"
								mode="aspectFit" />
						</view>

						<!-- 输入框右下2个按钮 之后可选择上传简历 -->
						<view class="row-right">
							<view class="icon-btn">
								<image class="icon-btn-icon icon-btn-icon--mic" src="/static/icon/aiAnalyse/mic.svg"
									mode="aspectFit" />
							</view>
							<view class="icon-btn icon-btn--send" @click="sendMessage()">
								<image class="icon-btn-icon icon-btn-icon--send" src="/static/icon/aiAnalyse/send.svg"
									mode="aspectFit" />
							</view>
						</view>
					</view>
				</view>
			</view>

		</transition>

		<!-- 分析结果（带出现/消失过渡） -->
		<transition name="result" mode="out-in">
			<view v-if="hasResult && title === '技术栈评估'" class="result-stage" :style="{ top: statusBarHeight + 'px' }">
				<SkillPanel :matchScore="matchScore" :abovePercent="abovePercent" :sections="sections"
					:salaryRange="salaryRange" :targetJob="targetJob" :salaryMedian="salaryMedian"
					:coreAdvantages="coreAdvantages" :skillGaps="skillGaps" :jobAdvice="jobAdvice" @goBack="goBack" />
			</view>
			<view v-else-if="hasResult && title === 'JD 描述'" class="result-stage"
				:style="{ top: statusBarHeight + 'px' }">
				<JdPanel :jdBasicInfo="jdBasicInfo" :jdDuties="jdDuties" :knowledgeRequirements="knowledgeRequirements"
					:jdInterviewPrep="jdInterviewPrep" :jdHiddenInfo="jdHiddenInfo" @goBack="goBack" />
			</view>
		</transition>

		<!-- 自定义顶部提示 -->
		<view v-if="toastMsg" class="custom-toast" :style="{ top: (statusBarHeight + 20) + 'px' }">
			<text class="custom-toast-text">{{ toastMsg }}</text>
		</view>

	</view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'
import { ref, computed, watch } from 'vue'

import { useAIStream } from '@/composables/useAIStream'
import { fetchConversation } from '@/api/ai'
import type { AiScene } from '@/api/ai'
import { sectionNumber, sectionText, sectionItems, sectionEntries } from '@/utils/aiText'
import SkillPanel from '@/components/aiAnalyse/skillPanel.vue'
import JdPanel from '@/components/aiAnalyse/jdPanel.vue'

// 导入 AI 流式输出模块
const { sections, hasResult, loading, error, start, reset, restore, refuseReason, refused } = useAIStream()

const systemInfo = uni.getSystemInfoSync()
// 状态栏高度：自定义导航栏用它做顶部留白（H5 端没有状态栏，取 0）
const statusBarHeight = systemInfo.statusBarHeight ?? 0

// 页面类型（由上一页 URL 传入，用于控制问候语等显示）
const title = ref('')

// 正在从历史记录恢复结果：期间不渲染输入态，避免问候语闪一下
const restoring = ref(false)

// 输入框内容
const message = ref('')

interface Suggestion {
	text: string
	desc: string
	icon: string
	type: 'remote' | 'research' | 'mining' | 'inspiration'
	scene: 'skill' | 'jd'
}

// 快捷建议：图标为从 Figma 导出的真实 SVG
const suggestions: Suggestion[] = [
	{
		text: '技术栈分析',
		desc: '看看技能与目标岗位的距离',
		icon: '/static/icon/aiAnalyse/remote-control.svg',
		type: 'remote',
		scene: 'skill'
	},
	{
		text: 'JD 分析',
		desc: '粘贴岗位描述，拆解优势与差距',
		icon: '/static/icon/aiAnalyse/research.svg',
		type: 'research',
		scene: 'jd'
	},
]

const navigateTo = (item: Suggestion) => {
	if (item.scene === activeTab.value) return
	const jump = item.scene === 'skill' ? '技术栈评估' : 'JD 描述'
	uni.navigateTo({
		url: '/pages/aiAnalyse/index?title=' + jump,
	})
}

// 当前分析场景，默认按 JD 描述处理
const activeTab = ref<AiScene>('jd')
// 开始分析：单轮场景只传一条 user 消息
const startAnalysis = () => {
	const input = message.value.trim()
	start({
		scene: activeTab.value,
		messages: [{ role: 'user', content: input }],
	})
	message.value = ''
}

// 发送消息
const isSending = ref(false)
const sendMessage = async () => {
	if (message.value.trim() === '') {
		showToast('请先输入内容')
		return
	}
	if (isSending.value || loading.value) return
	isSending.value = true
	await startAnalysis()
	isSending.value = false
}

// 自定义顶部提示：默认 2200ms 自动消失
const toastMsg = ref('')
let toastTimer: ReturnType<typeof setTimeout> | null = null
const showToast = (msg: string) => {
	toastMsg.value = msg
	if (toastTimer) clearTimeout(toastTimer)
	toastTimer = setTimeout(() => {
		toastMsg.value = ''
	}, 2200)
}

// 分析结束且输出为「拒绝」时，用 toast 提示拒绝原因
watch([loading, refused, hasResult], () => {
	if (!loading.value && refused.value && !hasResult.value) {
		showToast(refuseReason.value)
	}
})

// 返回聊天
const goBack = () => {
	reset()
}



// 进度条
const clampPercent = (value: number) => Math.min(100, Math.max(0, value))


// 分析结果（由 AI 流式输出解析而来）
const matchScore = computed(() => clampPercent(sectionNumber(sections.value, '匹配度评分')))
const abovePercent = computed(() => clampPercent(sectionNumber(sections.value, '超越比例')))
const salaryRange = computed(() => sectionText(sections.value, '薪资预估'))
const targetJob = computed(() => sectionText(sections.value, '目标岗位'))
const salaryMedian = computed(() => sectionText(sections.value, '市场中位数'))
const coreAdvantages = computed(() => sectionEntries(sections.value, '核心优势'))
const skillGaps = computed(() => sectionItems(sections.value, '待补充技能'))
const jobAdvice = computed(() => sectionItems(sections.value, '求职建议'))

// JD 描述分析结果
const JD_BASIC_FIELDS = ['职位名称', '所属部门', '工作地点', '薪资范围']

const jdBasicInfo = computed(() =>
	JD_BASIC_FIELDS.map((label) => {
		const item = sectionItems(sections.value, '岗位基本信息').find((text) => text.startsWith(label))
		const value = item?.slice(label.length).replace(/^[：:]\s*/, '').trim()
		return { label, value: value || '未提及' }
	}),
)
// 岗位职责
const JD_BASIC_DUTIES_FIELDS = ['日常做什么', '核心产出', '协作对象', '优先级判断']
const jdDuties = computed(() =>
	JD_BASIC_DUTIES_FIELDS.map((label) => {
		const item = sectionItems(sections.value, '岗位职责').find((text) => text.startsWith(label))
		const value = item?.slice(label.length).replace(/^[：:]\s*/, '').trim()
		return { label, value: value || '未提及' }
	}),
)

// 认知要求：固定 2 个字段，从「认知要求」小节按「字段名：值」拆出
const KNOWLEDGE_FIELDS = ['硬性要求', '软性要求']

const knowledgeRequirements = computed(() =>
	KNOWLEDGE_FIELDS.map((label) => {
		const item = sectionItems(sections.value, '认知要求').find((text) => text.startsWith(label)) || ''
		const value = item?.slice(label.length).replace(/^[：:]\s*/, '').trim().split('、') || []
		return { label, value: value || '未提及' }
	}
	),
)

// 「维度：内容」类小节（隐藏信息 / 面试准备方向）：按第一个冒号拆成标签与内容，维度名由 AI 决定，不写死
const splitPairs = (title: string) =>
	sectionItems(sections.value, title).map((text) => {
		const match = /^(.+?)[：:]\s*(.*)$/.exec(text.trim())
		return match ? { label: match[1]!, value: match[2]! } : { label: '', value: text }
	})

const jdHiddenInfo = computed(() => splitPairs('隐藏信息'))
const jdInterviewPrep = computed(() => splitPairs('面试准备方向'))



// 从历史会话恢复单轮分析结果
const restoreFromConversation = async (conversationId: string) => {
	restoring.value = true
	try {
		const detail = await fetchConversation(conversationId)
		if (detail.scene === 'skill') {
			title.value = '技术栈评估'
			activeTab.value = 'skill'
		} else if (detail.scene === 'jd') {
			title.value = 'JD 描述'
			activeTab.value = 'jd'
		} else {
			// 非单轮分析场景没有对应卡片，交给对话页
			uni.redirectTo({ url: '/pages/aiChat/index?conversationId=' + conversationId })
			return
		}

		// 取最后一条 AI 回复作为分析结果，直接解析成卡片
		const lastReply = [...detail.messages].reverse().find((item) => item.role === 'assistant')
		restore(lastReply?.content ?? '')
	} catch {
		showToast('历史记录加载失败')
	} finally {
		restoring.value = false
	}
}

onLoad((options) => {
	// 从历史记录进入：按会话场景恢复结果
	const conversationId = options?.conversationId
	if (conversationId) {
		restoreFromConversation(conversationId)
		return
	}

	// 获取类型参数（由上一页通过 URL 传入）
	const type = options?.title
	title.value = type ?? ''

	// 本页只负责技术栈 / JD 两种单轮分析，其余入口统一交给多轮对话页
	if (type === '技术栈评估') {
		activeTab.value = 'skill'
	} else if (type === 'JD 描述') {
		activeTab.value = 'jd'
	} else {
		uni.redirectTo({ url: '/pages/aiChat/index' })
	}
})

// 返回上一页
const onBack = () => {
	const pages = getCurrentPages()
	if (pages.length <= 1) {
		uni.navigateBack()
	} else {
		uni.switchTab({ url: '/pages/aiAnalyseHome/index' })
	}
}

// 历史：切到会话列表 tab
const goHistory = () => {
	uni.switchTab({ url: '/pages/aiAnalyseHome/index' })
}

</script>

<style lang="scss">
/* 输入框占位符：placeholder-class 需为独立类名，不能嵌套在页面根类里 */
.composer-placeholder {
	font-size: 26rpx;
	color: #97a4aa;
}

.ai-analyse {
	box-sizing: border-box;
	position: relative;
	display: flex;
	flex-direction: column;
	height: 100vh;
	padding: 36rpx 31rpx 40rpx;
	font-family: Inter, -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif;

	/* 自定义顶部提示：固定顶部居中，深色胶囊 + 轻投影 */
	.custom-toast {
		position: fixed;
		left: 50%;
		z-index: 9999;
		box-sizing: border-box;
		width: 80%;
		padding: 18rpx 34rpx;
		background-color: #ff6d6df0;
		border-radius: 999rpx;
		box-shadow: 0 12rpx 30rpx rgba(79, 70, 240, 0.28);
		transform: translateX(-50%);
		animation: toast-in 0.24s ease-out;

		.custom-toast-text {
			display: block;
			font-size: 26rpx;
			line-height: 1.4;
			color: #ffffff;
			text-align: center;
		}
	}

	/* 提示滑入动画 */
	@keyframes toast-in {
		from {
			opacity: 0;
			transform: translate(-50%, -16rpx);
		}

		to {
			opacity: 1;
			transform: translate(-50%, 0);
		}
	}

	/* 输入态容器：撑满剩余高度，让快捷建议的 margin-top:auto 能推到底部，避免底部空白 */
	.input-stage {
		display: flex;
		flex: 1;
		flex-direction: column;
	}

	/* 结果区：绝对定位叠在容器上，不参与文档流布局，出现/消失时不会挤压下方内容 */
	.result-stage {
		position: absolute;
		right: 0;
		bottom: 0;
		left: 0;
		z-index: 10;
		overflow-y: auto;
		box-sizing: border-box;
	}

	.input-enter-active,
	.input-leave-active {
		transition: opacity 0.3s ease, transform 0.3s ease;
	}

	.input-enter-from,
	.input-leave-to {
		opacity: 0;
		transform: translateY(-24rpx);
	}

	/* 结果区出现/消失过渡 */
	.result-enter-active,
	.result-leave-active {
		transition: opacity 0.3s ease, transform 0.3s ease;
	}

	.result-enter-from,
	.result-leave-to {
		opacity: 0;
		transform: translateY(24rpx);
	}

	/* ===== 顶部控制区 ===== */
	.top-controls {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 88rpx;
		margin-top: 8rpx;

		/* 返回箭头：左 + 下描边旋转 45°，指向左侧 */
		.back {
			flex-shrink: 0;
			width: 20rpx;
			height: 20rpx;
			border-left: 3rpx solid #3d4b54;
			border-bottom: 3rpx solid #3d4b54;
			transform: rotate(45deg);
		}

		.top-title {
			position: absolute;
			left: 50%;
			font-size: 29rpx;
			font-weight: 600;
			line-height: 1;
			letter-spacing: -0.4rpx;
			color: #3d4b54;
			transform: translateX(-50%);
		}

		.history {
			flex-shrink: 0;
			font-size: 24rpx;
			line-height: 1;
			color: #65747c;
		}
	}

	/* ===== 问候语 ===== */
	.greeting {
		margin-top: 160rpx;

		.greeting-title {
			display: block;
			font-size: 58rpx;
			font-weight: 700;
			line-height: 1.3;
			letter-spacing: -2rpx;
			color: #17252b;
		}

		.greeting-desc {
			display: block;
			margin-top: 16rpx;
			font-size: 25rpx;
			line-height: 1.45;
			color: #65747c;
		}
	}

	/* ===== 快捷建议（贴底，由 margin-top:auto 吸收剩余空间） ===== */
	.suggestions {
		display: flex;
		flex-direction: column;
		gap: 16rpx;
		margin-top: auto;
		padding: 40rpx 0 8rpx;

		.suggestions-label {
			margin-bottom: 4rpx;
			font-size: 21rpx;
			line-height: 1.2;
			color: #8a979e;
		}

		.chip {
			display: flex;
			align-items: center;
			box-sizing: border-box;
			height: 116rpx;
			padding: 0 28rpx;
			background-color: #ffffff;
			border: 2rpx solid #dde8e7;
			border-radius: 24rpx;

			.chip-icon-wrap {
				display: flex;
				align-items: center;
				justify-content: center;
				flex-shrink: 0;
				width: 44rpx;
				height: 44rpx;
			}

			/* 各芯片图标按设计稿实际尺寸单独设置 */
			.chip-icon {
				&--remote {
					width: 30rpx;
					height: 26rpx;
				}

				&--research {
					width: 26rpx;
					height: 28rpx;
				}
			}

			.chip-texts {
				flex: 1;
				min-width: 0;
				margin-left: 18rpx;
			}

			.chip-title {
				display: block;
				font-size: 27rpx;
				font-weight: 600;
				line-height: 1.2;
				color: #17252b;
			}

			.chip-desc {
				display: block;
				margin-top: 6rpx;
				font-size: 21rpx;
				line-height: 1.2;
				color: #8a979e;
			}

			.chip-chevron {
				flex-shrink: 0;
				width: 12rpx;
				height: 12rpx;
				margin-left: 16rpx;
				border-top: 2rpx solid #9aa6ac;
				border-right: 2rpx solid #9aa6ac;
				transform: rotate(45deg);
			}
		}
	}

	/* ===== 底部输入区：通栏白底，左右贴屏幕边缘 ===== */
	.composer {
		flex-shrink: 0;
		box-sizing: border-box;
		margin: 18rpx -31rpx -40rpx;
		padding: 32rpx 40rpx calc(40rpx + env(safe-area-inset-bottom));
		background-color: #ffffff;
		border-top: 2rpx solid #e3ebec;

		/* 输入框：浅底细描边，贴合设计稿的圆角矩形 */
		.composer-box {
			display: flex;
			align-items: center;
			box-sizing: border-box;
			height: 88rpx;
			padding: 0 24rpx;
			background-color: #f5f8f7;
			border: 2rpx solid #e2eaea;
			border-radius: 24rpx;
		}

		.composer-input {
			flex: 1;
			min-width: 0;
			height: 100%;
			font-size: 26rpx;
			color: #17252b;
		}

		.composer-row {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin-top: 20rpx;

			.row-right {
				display: flex;
				align-items: center;
				gap: 20rpx;
			}

			.icon-btn {
				display: flex;
				align-items: center;
				justify-content: center;
				width: 68rpx;
				height: 68rpx;
				background-color: #f1f7f5;
				border-radius: 50%;

				&--send {
					width: 72rpx;
					height: 72rpx;
					background-image: linear-gradient(180deg, #007c77 0%, #00746f 100%);
				}
			}

			.icon-btn-icon {
				&--plus {
					width: 26rpx;
					height: 26rpx;
				}

				&--mic {
					width: 24rpx;
					height: 32rpx;
				}

				&--send {
					width: 36rpx;
					height: 36rpx;
				}
			}

			.model-pill {
				display: flex;
				align-items: center;
				justify-content: center;
				width: 263rpx;
				height: 65rpx;
				background-color: #f1f7f5;
				border-radius: 33rpx;

				.model-pill-text {
					font-size: 25rpx;
					line-height: 1;
					color: #3d4b54;
				}
			}
		}
	}
}
</style>
