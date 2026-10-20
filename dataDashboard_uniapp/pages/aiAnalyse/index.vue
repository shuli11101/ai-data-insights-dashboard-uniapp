<template>
	<view class="ai-analyse" :style="{ paddingTop: statusBarHeight + 'px' }">
		<transition name="input" mode="out-in">
			<view v-if="!hasResult" class="input-stage">
				<!-- ===== 顶部控制区：返回按钮 + Work / Code 分段切换 ===== -->
				<view class="top-controls">
					<image class="back-btn" src="/static/icon/aiAnalyse/back.svg" mode="aspectFit" @click="onBack" />
				</view>

				<!-- ===== 问候语 ===== -->
				<view class="greeting">
					<view v-if="title === '技术栈评估'" class="greeting-card">
						<text class="greeting-hello">Hey 你好</text>
						<text class="greeting-title">今天想评估</text>
						<text class="greeting-title">什么技术栈？</text>
					</view>
					<view v-else-if="title === 'JD 匹配'" class="greeting-card">
						<text class="greeting-hello">Hey 你好</text>
						<text class="greeting-title">看到了</text>
						<text class="greeting-title">喜欢的岗位？</text>
					</view>
				</view>

				<!-- ===== 快捷建议 ===== -->
				<view class="suggestions">
					<view class="chip" v-for="item in suggestions" :key="item.text" @click="message = item.text">
						<image class="chip-icon" :class="'chip-icon--' + item.type" :src="item.icon" mode="aspectFit" />
						<text class="chip-text">{{ item.text }}</text>
					</view>
				</view>

				<!-- ===== 底部输入区 ===== -->
				<view class="composer">
					<input class="composer-input" v-model="message" type="text" placeholder="发消息或按住说话..."
						placeholder-class="composer-placeholder" />
					<view class="composer-row">
						<view class="row-left">
							<view class="icon-btn">
								<image class="icon-btn-icon icon-btn-icon--plus" src="/static/icon/aiAnalyse/plus.svg"
									mode="aspectFit" />
							</view>
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
			<view v-else-if="hasResult && title === 'JD 匹配'" class="result-stage"
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
import type { AiScene } from '@/api/ai'
import { sectionNumber, sectionText, sectionItems, sectionEntries } from '@/utils/aiText'
import SkillPanel from '@/components/aiAnalyse/skillPanel.vue'
import JdPanel from '@/components/aiAnalyse/jdPanel.vue'

// 导入 AI 流式输出模块
const { sections, hasResult, loading, error, start, reset, refuseReason, refused } = useAIStream()

const systemInfo = uni.getSystemInfoSync()
// 状态栏高度：自定义导航栏用它做顶部留白（H5 端没有状态栏，取 0）
const statusBarHeight = systemInfo.statusBarHeight ?? 0

// 页面类型（由上一页 URL 传入，用于控制问候语等显示）
const title = ref('')

// 顶部 Work / Code 分段切换
const mode = ref<'work' | 'code'>('work')

// 输入框内容
const message = ref('')

interface Suggestion {
	text: string
	icon: string
	type: 'remote' | 'research' | 'mining' | 'inspiration'
}

// 快捷建议：图标为从 Figma 导出的真实 SVG
const suggestions: Suggestion[] = [
	{ text: '进行技术栈分析', icon: '/static/icon/aiAnalyse/remote-control.svg', type: 'remote' },
	{ text: '进行jd分析', icon: '/static/icon/aiAnalyse/research.svg', type: 'research' },
]

// 当前分析场景，默认按 JD 匹配处理
const activeTab = ref<AiScene>('jd')
// 开始分析
const startAnalysis = () => {
	start({
		scene: activeTab.value,
		input: message.value,
	})
	message.value = ''
}

// 发送消息
const isSending = ref(false)
const sendMessage = async () => {
	if (message.value.trim() !== '') {
		isSending.value = true
		await startAnalysis()
	} else {
		showToast('请先输入内容')
	}
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

// JD 匹配分析
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



onLoad((options) => {
	// 获取类型参数（由上一页通过 URL 传入）
	const type = options?.title
	title.value = type ?? ''
	if (type) {
		if (type === '技术栈评估') {
			activeTab.value = 'skill'
		} else if (type === 'JD 匹配') {
			activeTab.value = 'jd'
		} else {
			activeTab.value = '0'
		}
	}
})

// 返回上一页
const onBack = () => {
	uni.navigateBack()
}

</script>

<style lang="scss">
/* 输入框占位符：placeholder-class 需为独立类名，不能嵌套在页面根类里 */
.composer-placeholder {
	font-size: 30rpx;
	color: #b5b5b5;
}

.ai-analyse {
	box-sizing: border-box;
	position: relative;
	display: flex;
	flex-direction: column;
	height: 100vh;
	padding: 36rpx 31rpx 40rpx;
	background-color: #f4f4f4;
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

	/* ===== 顶部控制区（返回按钮绝对定位，分段控件水平居中） ===== */
	.top-controls {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 84rpx;
		margin-top: 25rpx;

		.back-btn {
			position: absolute;
			left: 0;
			width: 64rpx;
			height: 64rpx;
		}

		/* 分段控件：172×40，胶囊轨道，内缩 3px 作为选中块留白 */
		.segmented {
			display: flex;
			box-sizing: border-box;
			width: 328rpx;
			height: 76rpx;
			padding: 6rpx;
			background-color: #e9e9e9;
			border-radius: 999rpx;

			.segmented-item {
				display: flex;
				flex: 1;
				align-items: center;
				justify-content: center;
				border-radius: 999rpx;

				&.active {
					background-color: #ffffff;

					.segmented-text {
						font-weight: 700;
						color: #111111;
					}
				}
			}

			.segmented-text {
				font-size: 30rpx;
				line-height: 1;
				color: #8a8a8e;
			}
		}
	}

	/* ===== 问候语（白卡 + 品牌色胶囊问候） ===== */
	.greeting {
		margin-top: 200rpx;

		.greeting-card {
			box-sizing: border-box;
			padding: 48rpx 44rpx;

			.greeting-hello {
				display: inline-block;
				box-sizing: border-box;
				padding: 14rpx 28rpx;
				margin-bottom: 40rpx;
				background-color: #efedff;
				border-radius: 999rpx;
				font-size: 30rpx;
				font-weight: 600;
				line-height: 1;
				color: #4f46f0;
			}

			.greeting-title {
				display: block;
				font-size: 62rpx;
				font-weight: 800;
				line-height: 1.3;
				letter-spacing: 1rpx;
				color: #111111;
			}
		}
	}

	/* ===== 快捷建议（贴底，由 margin-top:auto 吸收剩余空间） ===== */
	.suggestions {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 15rpx;
		margin-top: auto;
		padding-top: 40rpx;

		.chip {
			display: flex;
			align-items: center;
			box-sizing: border-box;
			height: 59rpx;
			padding: 0 24rpx;
			background-color: #fcfcfc;
			border: 2rpx solid #e6e6e6;
			border-radius: 23rpx;

			.chip-text {
				font-size: 25rpx;
				line-height: 1;
				color: #1f1f1f;
			}

			/* 各芯片图标按设计稿实际尺寸单独设置 */
			.chip-icon {
				margin-right: 17rpx;

				&--remote {
					width: 25rpx;
					height: 22rpx;
				}

				&--research {
					width: 23rpx;
					height: 23rpx;
				}

				&--mining {
					width: 19rpx;
					height: 21rpx;
				}

				&--inspiration {
					width: 23rpx;
					height: 23rpx;
				}
			}
		}
	}

	/* ===== 底部输入区 ===== */
	.composer {
		box-sizing: border-box;
		height: 191rpx;
		margin-top: 18rpx;
		padding: 31rpx 19rpx 0;
		background-color: #ffffff;
		border-radius: 50rpx;

		.composer-input {
			height: 36rpx;
			font-size: 30rpx;
			line-height: 36rpx;
			color: #1f1f1f;
			margin-left: 16rpx;
		}

		.composer-row {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin-top: 29rpx;

			.row-left,
			.row-right {
				display: flex;
				align-items: center;
				gap: 19rpx;
			}

			.icon-btn {
				display: flex;
				align-items: center;
				justify-content: center;
				width: 65rpx;
				height: 65rpx;
				background-color: #f0f0f0;
				border-radius: 50%;

				&--send {
					background-color: #4f46f0;
				}
			}

			.icon-btn-icon {
				&--plus {
					width: 20rpx;
					height: 20rpx;
				}

				&--mic {
					width: 18rpx;
					height: 26rpx;
				}

				&--send {
					width: 38rpx;
					height: 38rpx;
				}
			}

			.model-pill {
				display: flex;
				align-items: center;
				justify-content: center;
				width: 263rpx;
				height: 65rpx;
				background-color: #f0f0f0;
				border-radius: 33rpx;

				.model-pill-text {
					font-size: 25rpx;
					line-height: 1;
					color: #2a2a2a;
				}
			}
		}
	}
}
</style>
