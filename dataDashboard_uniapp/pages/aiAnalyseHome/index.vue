<template>
	<view class="analyse-home">
		<!-- ===== 顶部标题 + 新建按钮 ===== -->
		<view class="header">
			<text class="header-title">AI 分析</text>
			<view class="header-side">
				<!-- 今日话题气泡：静态引导文案，点击进入对话 -->
				<view class="topic-bubble" @click="toAnalyse">
					<text class="topic-label">今日话题</text>
					<text class="topic-title">{{ randomTopic.title }}</text>
					<text class="topic-desc">{{ randomTopic.desc }}</text>
				</view>
				<view class="header-add" @click="toAnalyse"></view>
			</view>
		</view>

		<!-- ===== 两个入口卡片 ===== -->
		<view class="entries">
			<view @click="startSession(item.title)" class="entry" v-for="item in entries" :key="item.id">
				<view class="entry-icon">
					<image class="entry-icon-img" :src="item.icon" mode="aspectFit" />
				</view>
				<text class="entry-title">{{ item.title }}</text>
				<text class="entry-desc">{{ item.desc }}</text>
			</view>
		</view>

		<!-- ===== 历史会话标题栏 ===== -->
		<view v-if="sessions.length" class="section-head">
			<text class="section-title">历史会话</text>
			<view class="section-actions">
				<template v-if="!selecting">
					<text class="section-count">{{ sessions.length }} 条记录</text>
					<text class="manage-btn" @click="startSelect">管理</text>
				</template>
				<template v-else>
					<text class="manage-btn" @click="cancelSelect">取消</text>
					<text class="delete-btn" :class="{ 'is-disabled': !selected.length }" @click="removeSelected">
						删除{{ selected.length ? `(${selected.length})` : '' }}
					</text>
				</template>
			</view>
		</view>

		<!-- ===== 历史会话列表 ===== -->
		<view v-if="sessions.length" class="panel">
			<view class="session" v-for="item in sessions" :key="item.id" @click="onSessionClick(item)">
				<!-- 多选态：左侧勾选圈 -->
				<view v-if="selecting" class="session-check" :class="{ 'is-checked': isSelected(item.id) }"></view>

				<!-- 左侧图标：深色圆 = 匹配度分析，浅色方 = 技术栈评估 -->
				<view class="session-icon" :class="'is-' + item.type">
					<image class="session-icon-img" :src="item.icon" mode="aspectFit" />
				</view>

				<!-- 中间：标题 + 摘要 -->
				<view class="session-main">
					<text class="session-name">{{ item.title }}</text>
					<text class="session-desc">{{ item.desc }}</text>
				</view>

				<!-- 右侧：时间 + 徽标 -->
				<view class="session-side">
					<text class="session-time">{{ item.time }}</text>
					<view class="session-badge" :class="item.type === 'match' ? 'is-score' : 'is-grade'">
						{{ item.scene }}
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import { computed, reactive, ref } from 'vue'

import { deleteConversations, fetchConversations } from '@/api/ai'

// 状态栏高度：自定义导航栏用它做顶部留白
// H5 端拿不到状态栏高度（为 0），给 44px 保底，避免标题贴顶
const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 12

/** 入口卡片：技术栈评估 / JD 匹配 */
interface EntryItem {
	id: number
	icon: string
	title: string
	desc: string
}

/** 历史会话：match = 匹配度分析（深色圆），stack = 技术栈评估（浅色方），chat = 多轮对话（白底圆） */
interface SessionItem {
	id: string
	type: 'match' | 'stack' | 'chat'
	icon: string
	title: string
	time: string
	desc: string
	scene: string
	/** 是否为可还原成卡片的单轮分析（skill / jd） */
	analysis: boolean
}

// 顶部语句随机
interface TopicItem {
	title: string
	desc: string
}
const randomTopic = ref<TopicItem>({ title: '', desc: '' })
const getRandomTopic = () => {
	return headerText.content[Math.floor(Math.random() * headerText.content.length)]
}
const headerText = reactive({
	label: '今日话题',
	content: [
		{ title: '今天想聊啥?', desc: '点我，随便聊两句' },
		{ title: '最近怎么样?', desc: '点我，唠两句' },
		{ title: '最近在找机会?', desc: '点我，聊聊方向' },
		{ title: '简历要不要改改?', desc: '点我，一起看看' },
		{ title: '有啥想吐槽的?', desc: '点我，我听着' },
		{ title: '工作还顺心吗?', desc: '点我，聊聊' }
	]
})



// 技术栈分析和jd匹配 card
const entries: EntryItem[] = [
	{ id: 1, icon: '/static/icon/aiAnalyse/entry-stack.svg', title: '技术栈评估', desc: '输入技能，了解自身实力' },
	{ id: 2, icon: '/static/icon/aiAnalyse/entry-jd.svg', title: 'JD 匹配', desc: '粘贴岗位，测算匹配度' }
]

// 开始会话
const startSession = (title: string) => {
	uni.navigateTo({ url: '/pages/aiAnalyse/index?title=' + title })
}

// ===== 历史会话：来自后端接口 =====
const sessions = ref<SessionItem[]>([])

/** 后端 scene → 列表展示配置 */
const SCENE_META = {
	skill: { title: '技术栈评估', type: 'stack', icon: '/static/icon/aiAnalyse/session-chart.svg' },
	jd: { title: 'JD 匹配', type: 'match', icon: '/static/icon/aiAnalyse/session-square.svg' },
	drawer: { title: '市场洞察', type: 'match', icon: '/static/icon/aiAnalyse/session-square.svg' },
	chat: { title: 'AI 对话', type: 'chat', icon: '/static/icon/aiAnalyse/session-chat.svg' },
} as const

type SceneKey = keyof typeof SCENE_META

/** 去掉 markdown 标记并压缩空白，作为列表摘要 */
const toSummary = (text: string) =>
	text
		.replace(/^#{1,6}\s*/gm, '')
		.replace(/\*\*/g, '')
		.replace(/\s+/g, ' ')
		.trim()

const pad = (n: number) => String(n).padStart(2, '0')

/** 列表时间：今天显示时分，昨天显示「昨天」，更早显示月/日 */
const formatTime = (iso: string) => {
	const date = new Date(iso)
	const now = new Date()
	if (date.toDateString() === now.toDateString()) {
		return `${pad(date.getHours())}:${pad(date.getMinutes())}`
	}
	const yesterday = new Date(now)
	yesterday.setDate(now.getDate() - 1)
	if (date.toDateString() === yesterday.toDateString()) {
		return '昨天'
	}
	return `${pad(date.getMonth() + 1)}/${pad(date.getDate())}`
}

const loadSessions = async () => {
	try {
		const list = await fetchConversations(20)
		console.log('历史会话列表:', list)
		sessions.value = list.map((item) => {
			const meta = SCENE_META[item.scene as SceneKey] ?? SCENE_META.chat
			const summary = toSummary(item.lastMessage)
			return {
				id: item.conversationId,
				type: meta.type,
				icon: meta.icon,
				title: meta.title,
				time: formatTime(item.updateTime),
				desc: summary.length > 42 ? summary.slice(0, 42) + '…' : summary,
				scene: item.scene === "chat" ? "日常" : item.scene === 'skill' ? "技术栈" : 'JD',
				// 单轮且场景为技术栈 / JD 时，才进结果卡片页
				analysis: item.type === 'single' && (item.scene === 'skill' || item.scene === 'jd'),
			}
		})
	} catch {
		// 拉取失败时保持空列表，不展示过期数据
		sessions.value = []
	}
}

// 每次回到本页都刷新，保证新建的会话能及时出现
onShow(() => {
	cancelSelect()
	loadSessions()
	randomTopic.value = getRandomTopic()
})

// 打开历史会话：单轮分析进结果卡片页，多轮对话进对话页
const openSession = (item: SessionItem) => {
	const path = item.analysis ? '/pages/aiAnalyse/index' : '/pages/aiChat/index'
	uni.navigateTo({ url: `${path}?conversationId=${item.id}` })
}

// ===== 批量删除 =====
const selecting = ref(false)
const selected = ref<string[]>([])

const startSelect = () => {
	selecting.value = true
}

const cancelSelect = () => {
	selecting.value = false
	selected.value = []
}

const isSelected = (id: string) => selected.value.includes(id)

const toggleSelect = (id: string) => {
	selected.value = isSelected(id)
		? selected.value.filter((item) => item !== id)
		: [...selected.value, id]
}

// 多选态下点击只切换选中，不进入会话
const onSessionClick = (item: SessionItem) => {
	if (selecting.value) {
		toggleSelect(item.id)
		return
	}
	openSession(item)
}

const removeSelected = async () => {
	if (!selected.value.length) return

	const confirmed = await new Promise<boolean>((resolve) => {
		uni.showModal({
			title: '删除会话',
			content: `确定删除选中的 ${selected.value.length} 条会话吗？`,
			confirmColor: '#4f46f0',
			success: (res) => resolve(!!res.confirm),
			fail: () => resolve(false),
		})
	})
	if (!confirmed) return

	try {
		await deleteConversations(selected.value)
		sessions.value = sessions.value.filter((item) => !selected.value.includes(item.id))
		cancelSelect()
		uni.showToast({ title: '已删除', icon: 'none' })
	} catch (err) {
		uni.showModal({
			title: '删除失败',
			content: err instanceof Error ? err.message : '请稍后重试',
			showCancel: false,
		})
	}
}

// 新建会话（右上角 +）
const toAnalyse = () => {
	uni.navigateTo({ url: '/pages/aiChat/index' })
}
</script>

<style lang="scss">
.analyse-home {
	box-sizing: border-box;
	min-height: 100vh;
	padding: 36rpx 40rpx 40rpx;
	background-color: #ffffff;
	font-family: Inter, -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

/* ===== 顶部标题 ===== */
.header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	min-height: 68rpx;
	padding: 16rpx 0 20rpx;

	.header-title {
		flex-shrink: 0;
		font-size: 56rpx;
		font-weight: 700;
		line-height: 1;
		color: #0a0a0a;
	}

	/* 右侧：话题气泡 + 新建按钮 */
	.header-side {
		display: flex;
		align-items: center;
		flex-shrink: 0;
		gap: 12rpx;
		margin-left: 20rpx;
	}

	/* 今日话题气泡：静态文案，点击进入对话 */
	.topic-bubble {
		position: relative;
		box-sizing: border-box;
		padding: 14rpx 20rpx 16rpx;
		background-color: #ffffff;
		border: 1px solid #e7e7ea;
		border-radius: 24rpx;
		box-shadow: 0 12rpx 16rpx rgba(10, 10, 10, 0.1);

		/* 白色尖角：旋转方块，只保留朝右的两条描边 */
		&::after {
			content: '';
			position: absolute;
			top: 50%;
			right: -9rpx;
			width: 16rpx;
			height: 16rpx;
			background-color: #ffffff;
			border-top: 1px solid #e7e7ea;
			border-right: 1px solid #e7e7ea;
			transform: translateY(-50%) rotate(45deg);
		}

		.topic-label {
			display: block;
			font-size: 18rpx;
			line-height: 1;
			letter-spacing: 1rpx;
			color: #a8a8ae;
		}

		.topic-title {
			display: block;
			margin-top: 8rpx;
			font-size: 26rpx;
			font-weight: 600;
			line-height: 1.1;
			color: #0a0a0a;
			white-space: nowrap;
		}

		.topic-desc {
			display: block;
			margin-top: 6rpx;
			font-size: 20rpx;
			line-height: 1.2;
			color: #8a8a91;
			white-space: nowrap;
		}
	}

	/* 黑色圆形按钮：用伪元素画白色加号，避免额外图标资源 */
	.header-add {
		position: relative;
		flex-shrink: 0;
		width: 68rpx;
		height: 68rpx;
		border-radius: 50%;
		background-color: #0a0a0a;

		&::before,
		&::after {
			content: '';
			position: absolute;
			top: 50%;
			left: 50%;
			background-color: #ffffff;
			border-radius: 2rpx;
			transform: translate(-50%, -50%);
		}

		&::before {
			width: 28rpx;
			height: 4rpx;
		}

		&::after {
			width: 4rpx;
			height: 28rpx;
		}
	}
}

/* ===== 入口卡片 ===== */
.entries {
	display: flex;
	gap: 20rpx;

	.entry {
		flex: 1;
		min-width: 0;
		box-sizing: border-box;
		height: 168rpx;
		padding: 20rpx 28rpx;
		background-color: #ffffff;
		border: 1px solid #e5e5e5;
		border-radius: 24rpx;

		.entry-icon {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 56rpx;
			height: 56rpx;
			margin-bottom: 4rpx;
			background-color: #f5f5f5;
			border-radius: 50%;

			.entry-icon-img {
				width: 24rpx;
				height: 24rpx;
			}
		}

		.entry-title {
			display: block;
			font-size: 28rpx;
			font-weight: 700;
			line-height: 1.2;
			color: #0a0a0a;
		}

		.entry-desc {
			display: block;
			margin-top: 8rpx;
			font-size: 22rpx;
			line-height: 1.2;
			color: #737373;
		}
	}
}

/* ===== 历史会话标题栏 ===== */
.section-head {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin: 40rpx 0 18rpx;

	.section-title {
		font-size: 26rpx;
		font-weight: 700;
		line-height: 1;
		color: #737373;
	}

	.section-count {
		font-size: 24rpx;
		line-height: 1;
		color: #a3a3a3;
	}

	/* 右侧操作区：记录数 / 管理 / 取消 / 删除 */
	.section-actions {
		display: flex;
		align-items: center;
		gap: 20rpx;
	}

	.manage-btn {
		font-size: 24rpx;
		line-height: 1;
		color: #4f46f0;
	}

	.delete-btn {
		font-size: 24rpx;
		line-height: 1;
		color: #ff5a5a;

		/* 未选中任何项时置灰，避免误触 */
		&.is-disabled {
			color: #c9c9c9;
		}
	}
}

/* ===== 历史会话列表容器 ===== */
.panel {
	padding: 24rpx;
	background-color: #ffffff;
	border: 1px solid #f5f5f5;
	border-radius: 24rpx;

	.session {
		display: flex;
		align-items: center;
		height: 88rpx;

		&+.session {
			margin-top: 60rpx;
		}

		/* 多选态勾选圈：选中后填充黑底 + 白色对勾 */
		.session-check {
			position: relative;
			flex-shrink: 0;
			box-sizing: border-box;
			width: 36rpx;
			height: 36rpx;
			margin-right: 20rpx;
			background-color: #ffffff;
			border: 2rpx solid #d4d4d4;
			border-radius: 50%;

			&.is-checked {
				background-color: #0a0a0a;
				border-color: #0a0a0a;

				&::after {
					content: '';
					position: absolute;
					top: 6rpx;
					left: 11rpx;
					width: 8rpx;
					height: 15rpx;
					border: solid #ffffff;
					border-width: 0 3rpx 3rpx 0;
					transform: rotate(45deg);
				}
			}
		}

		/* 左侧图标 */
		.session-icon {
			display: flex;
			align-items: center;
			justify-content: center;
			flex-shrink: 0;
			width: 84rpx;
			height: 84rpx;

			&.is-match {
				background-color: #0a0a0a;
				border-radius: 24rpx;
			}

			&.is-stack {
				box-sizing: border-box;
				background-color: #f5f5f5;
				border: 1px solid #e5e5e5;
				border-radius: 24rpx;
			}

			/* 多轮对话：白底圆 + 细描边，与实心黑圆、浅灰方区分 */
			&.is-chat {
				box-sizing: border-box;
				background-color: #ffffff;
				border: 1px solid #e5e5e5;
				border-radius: 50%;
			}

			.session-icon-img {
				width: 28rpx;
				height: 28rpx;
			}
		}

		/* 中间文案 */
		.session-main {
			flex: 1;
			min-width: 0;
			margin-left: 24rpx;
			margin-right: 20rpx;

			.session-name {
				display: block;
				font-size: 30rpx;
				font-weight: 700;
				line-height: 1.2;
				color: #0a0a0a;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}

			.session-desc {
				display: block;
				margin-top: 5rpx;
				font-size: 25rpx;
				line-height: 1.2;
				color: #737373;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}
		}

		/* 右侧时间 + 徽标 */
		.session-side {
			display: flex;
			flex-direction: column;
			align-items: flex-end;
			flex-shrink: 0;

			.session-time {
				font-size: 22rpx;
				line-height: 1;
				color: #a3a3a3;
			}

			.session-badge {
				display: flex;
				align-items: center;
				justify-content: center;
				box-sizing: border-box;
				height: 40rpx;
				margin-top: 12rpx;
				padding: 0 16rpx;
				font-size: 22rpx;
				font-weight: 700;
				line-height: 1;
				border-radius: 999rpx;

				/* 匹配度：黑底白字 */
				&.is-score {
					background-color: #0a0a0a;
					color: #ffffff;
				}

				/* 评级：浅底灰字 */
				&.is-grade {
					background-color: #f5f5f5;
					border: 1px solid #e5e5e5;
					color: #525252;
				}
			}
		}
	}
}
</style>
