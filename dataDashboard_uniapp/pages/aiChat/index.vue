<template>
	<view class="ai-chat" :style="{ paddingTop: statusBarHeight + 'px' }">
		<!-- ===== 顶部控制区 ===== -->
		<view class="top-controls">
			<view class="back" @click="onBack"></view>
			<text class="top-title">AI 分析</text>
			<text class="history" @click="goHistory">历史</text>
		</view>

		<!-- ===== 空态：问候语 + 快捷入口 ===== -->
		<view v-if="!messages.length && !loadingHistory" class="empty-stage">
			<view class="greeting">
				<text class="greeting-title">今天想聊点什么？</text>
				<text class="greeting-desc">岗位匹配、技能差距、面试准备，都可以聊。</text>
			</view>

			<view class="suggestions">
				<text class="suggestions-label">可以这样开始</text>
				<view class="chip" v-for="item in suggestions" :key="item.text" @click="goScene(item)">
					<view class="chip-icon-wrap">
						<image class="chip-icon" :class="'chip-icon--' + item.type" :src="item.icon" mode="aspectFit" />
					</view>
					<view class="chip-texts">
						<text class="chip-title">{{ item.text }}</text>
						<text class="chip-desc">{{ item.desc }}</text>
					</view>
					<view class="chip-chevron"></view>
				</view>
			</view>
		</view>

		<!-- ===== 对话流 ===== -->
		<scroll-view v-else class="chat-list" scroll-y :show-scrollbar="false" :scroll-into-view="anchor"
			scroll-with-animation>
			<view v-for="msg in messages" :id="msg.id" :key="msg.id" class="msg-row" :class="'msg-row--' + msg.role">
				<view class="bubble" :class="'bubble--' + msg.role">
					<text v-if="msg.text" class="bubble-text">{{ formatText(msg.text) }}</text>
					<view v-else class="typing">
						<view class="typing-dot"></view>
						<view class="typing-dot"></view>
						<view class="typing-dot"></view>
					</view>
				</view>
			</view>
			<!-- 滚动锚点：始终位于列表末尾，用于自动滚到最新消息 -->
			<view id="chat-bottom" class="chat-bottom"></view>
		</scroll-view>

		<!-- ===== 底部输入区 ===== -->
		<view class="composer">
			<view class="composer-box">
				<input class="composer-input" v-model="message" type="text" placeholder="发消息或按住说话…" confirm-type="send"
					confirm-hold :focus="inputFocused" @focus="inputFocused = true" @blur="inputFocused = false"
					:adjust-position="true" cursor-spacing="20" placeholder-class="composer-placeholder"
					@confirm="sendMessage" />
			</view>
			<view class="composer-row">
				<view class="icon-btn">
					<image class="icon-btn-icon icon-btn-icon--plus" src="/static/icon/aiAnalyse/plus.svg"
						mode="aspectFit" />
				</view>

				<view class="row-right">
					<view class="icon-btn">
						<image class="icon-btn-icon icon-btn-icon--mic" src="/static/icon/aiAnalyse/mic.svg"
							mode="aspectFit" />
					</view>
					<view class="icon-btn icon-btn--send" :class="{ 'icon-btn--disabled': sending }"
						@click="sendMessage">
						<image class="icon-btn-icon icon-btn-icon--send" src="/static/icon/aiAnalyse/send.svg"
							mode="aspectFit" />
					</view>
				</view>
			</view>
		</view>

		<!-- 自定义顶部提示 -->
		<view v-if="toastMsg" class="custom-toast" :style="{ top: (statusBarHeight + 20) + 'px' }">
			<text class="custom-toast-text">{{ toastMsg }}</text>
		</view>
	</view>
</template>

<script setup lang="ts">
import { onLoad, onUnload } from '@dcloudio/uni-app'
import { nextTick, ref } from 'vue'

import { fetchConversation, streamAI } from '@/api/ai'
import type { AiScene, ChatTurn } from '@/api/ai'
import { isLoggedIn, redirectToLogin } from '@/utils/auth'

/** 一条对话消息：用户输入或 AI 回复 */
interface ChatMessage {
	/** 同时作为 scroll-into-view 的锚点，不能以数字开头 */
	id: string
	role: 'user' | 'assistant'
	text: string
	/** 请求失败的消息不参与后续上下文，避免把报错喂给模型 */
	failed?: boolean
}

const statusBarHeight = uni.getSystemInfoSync().statusBarHeight ?? 0

// 输入框内容
const message = ref('')

// 输入框焦点状态：配合 :focus 在发送后重新唤起键盘
const inputFocused = ref(false)

/** 重新聚焦输入框：先置 false 再置 true，确保 focus 变化能被组件感知 */
const refocusInput = () => {
	inputFocused.value = false
	nextTick(() => {
		inputFocused.value = true
	})
}

// 多轮对话消息列表
const messages = ref<ChatMessage[]>([])

// 后端返回的会话 id：从第二轮开始带上，用于续聊
const conversationId = ref('')

// 当前会话场景：新会话用 '4'，从历史进入时用后端返回的 scene
const scene = ref<AiScene>('4')

// 正在加载历史消息：期间不显示空态问候，避免闪一下
const loadingHistory = ref(false)

// 正在请求中，避免重复发送
const sending = ref(false)

// 滚动锚点：每次更新前先置空，保证同一锚点也能重新触发滚动
const anchor = ref('')

interface Suggestion {
	text: string
	desc: string
	icon: string
	type: 'remote' | 'research'
	title: string
}

// 快捷入口：跳到对应的单轮分析页
const suggestions: Suggestion[] = [
	{
		text: '技术栈分析',
		desc: '看看技能与目标岗位的距离',
		icon: '/static/icon/aiAnalyse/remote-control.svg',
		type: 'remote',
		title: '技术栈评估'
	},
	{
		text: 'JD 分析',
		desc: '粘贴岗位描述，拆解优势与差距',
		icon: '/static/icon/aiAnalyse/research.svg',
		type: 'research',
		title: 'JD 匹配'
	},
]

const goScene = (item: Suggestion) => {
	uni.navigateTo({ url: '/pages/aiAnalyse/index?title=' + item.title })
}

// ===== 滚动到底部 =====
const scrollToBottom = () => {
	anchor.value = ''
	nextTick(() => {
		anchor.value = 'chat-bottom'
	})
}

// 流式增量很密集，节流后滚动，避免每帧都触发布局
let scrollTimer: ReturnType<typeof setTimeout> | null = null
const scrollToBottomThrottled = () => {
	if (scrollTimer) return
	scrollTimer = setTimeout(() => {
		scrollTimer = null
		scrollToBottom()
	}, 120)
}

/** 去掉 AI 输出中的 markdown 标记，对话气泡里只保留纯文本 */
const formatText = (text: string) => text.replace(/^#{1,6}\s*/gm, '').replace(/\*\*/g, '')

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

// ===== 发送消息 =====
let controller: AbortController | null = null

// 携带给后端的历史轮数上限：上下文过长会推高延迟与 token 成本
const MAX_HISTORY = 10

/** 组装请求消息：跳过失败轮次，最后一条必须是刚发出的 user 消息 */
const buildMessages = (): ChatTurn[] =>
	messages.value
		.filter((msg) => !msg.failed)
		.slice(-MAX_HISTORY)
		.map((msg) => ({ role: msg.role, content: msg.text }))

const sendMessage = async () => {
	const content = message.value.trim()
	if (sending.value) return
	if (!content) {
		showToast('请先输入内容')
		return
	}

	// 1. 立即上屏用户消息
	messages.value.push({ id: `u-${Date.now()}`, role: 'user', text: content })
	message.value = ''
	// 发送后重新聚焦，保持键盘不收起，方便连续追问
	refocusInput()

	// 2. 组装请求体：此时数组末尾正好是本轮 user 消息
	const payload = buildMessages()

	// 3. 追加 AI 占位气泡（text 为空时显示打字指示器）
	const aiIndex = messages.value.length
	messages.value.push({ id: `a-${Date.now()}`, role: 'assistant', text: '' })
	scrollToBottom()

	// 4. 发起流式请求，把增量写回当前这条消息
	const self = new AbortController()
	controller = self
	sending.value = true

	try {
		await streamAI({
			scene: scene.value,
			messages: payload,
			conversationId: conversationId.value || undefined,
			signal: self.signal,
			onConversationId: (id) => {
				conversationId.value = id
			},
			onDelta: (delta) => {
				messages.value[aiIndex]!.text += delta
				scrollToBottomThrottled()
			},
		})
	} catch (err) {
		// 主动中止（离开页面）不算失败
		if (!self.signal.aborted) {
			const failedMsg = messages.value[aiIndex]!
			failedMsg.text = err instanceof Error ? err.message : 'AI 分析失败，请稍后重试'
			failedMsg.failed = true
		}
	} finally {
		if (controller === self) {
			controller = null
			sending.value = false
			scrollToBottom()
		}
	}
}

// 从历史记录进入时拉取会话详情，恢复消息与场景
const loadHistory = async (id: string) => {
	loadingHistory.value = true
	try {
		const detail = await fetchConversation(id)
		conversationId.value = detail.conversationId
		scene.value = detail.scene as AiScene
		messages.value = detail.messages.map((turn, index) => ({
			id: `${turn.role === 'user' ? 'u' : 'a'}-${index}`,
			role: turn.role,
			text: turn.content,
		}))
		scrollToBottom()
	} catch (err) {
		showToast(err instanceof Error ? err.message : '历史消息加载失败')
	} finally {
		loadingHistory.value = false
	}
}

onLoad((options) => {
	if (!isLoggedIn()) {
		redirectToLogin()
		return
	}


	const id = options?.conversationId
	if (id) {
		conversationId.value = id
		loadHistory(id)
	}

	refocusInput()
})

// 离开页面时中止未完成的请求，避免回调写入已销毁的页面
onUnload(() => {
	controller?.abort()
	controller = null
	if (scrollTimer) clearTimeout(scrollTimer)
	if (toastTimer) clearTimeout(toastTimer)
})

// 返回：有上级页面就回退，直接进入本页时切回任务列表 tab
const onBack = () => {
	if (getCurrentPages().length > 1) {
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

.ai-chat {
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

	/* ===== 顶部控制区 ===== */
	.top-controls {
		position: relative;
		flex-shrink: 0;
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

	/* 空态容器：撑满剩余高度，让快捷入口贴底 */
	.empty-stage {
		display: flex;
		flex: 1;
		flex-direction: column;
		min-height: 0;
	}

	/* ===== 对话流 ===== */
	.chat-list {
		flex: 1;
		/* 必须配合 height: 0，否则内容会把 scroll-view 撑开导致无法滚动 */
		height: 0;
		box-sizing: border-box;
		padding: 24rpx 4rpx;
	}

	.msg-row {
		display: flex;
		margin-bottom: 32rpx;

		&--user {
			justify-content: flex-end;
		}

		&--assistant {
			justify-content: flex-start;
		}
	}

	.bubble {
		max-width: 82%;
		box-sizing: border-box;
		padding: 24rpx 28rpx;
		font-size: 30rpx;
		line-height: 1.6;

		&--user {
			background-color: #007c77;
			/* 靠近说话人的右下角收窄，形成指向感 */
			border-radius: 28rpx 28rpx 8rpx 28rpx;

			.bubble-text {
				color: #ffffff;
			}
		}

		&--assistant {
			/* AI 回复不加气泡：直接以正文形式展示，仅用户消息有气泡 */
			max-width: 100%;
			padding: 4rpx 0;
			background-color: transparent;
			border: none;
			box-shadow: none;

			.bubble-text {
				color: #17252b;
			}
		}
	}

	.bubble-text {
		/* 保留 AI 输出中的换行 */
		white-space: pre-wrap;
		word-break: break-word;
	}

	/* 等待首字时的三点指示器 */
	.typing {
		display: flex;
		align-items: center;
		gap: 10rpx;
		height: 34rpx;
	}

	.typing-dot {
		width: 10rpx;
		height: 10rpx;
		background-color: #b9c9c6;
		border-radius: 50%;
		animation: typing-bounce 1.2s infinite ease-in-out;

		&:nth-child(2) {
			animation-delay: 0.15s;
		}

		&:nth-child(3) {
			animation-delay: 0.3s;
		}
	}

	@keyframes typing-bounce {

		0%,
		80%,
		100% {
			opacity: 0.3;
			transform: translateY(0);
		}

		40% {
			opacity: 1;
			transform: translateY(-6rpx);
		}
	}

	.chat-bottom {
		height: 2rpx;
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

	/* ===== 快捷入口（贴底，由 margin-top:auto 吸收剩余空间） ===== */
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

				/* 请求进行中：发送按钮降透明度，提示不可重复点击 */
				&--disabled {
					opacity: 0.5;
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
		}
	}
}
</style>
