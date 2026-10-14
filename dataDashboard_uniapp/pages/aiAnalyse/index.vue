<template>
	<view class="ai-analyse" :style="{ paddingTop: statusBarHeight + 'px' }">
		<!-- ===== 顶部控制区：返回按钮 + Work / Code 分段切换 ===== -->
		<view class="top-controls">
			<image class="back-btn" src="/static/icon/aiAnalyse/back.svg" mode="aspectFit" @click="onBack" />
		</view>

		<!-- ===== 问候语 ===== -->
		<view class="greeting">
			<text class="greeting-line">Hey 你好</text>
			<text class="greeting-line">今天 需要 查什么</text>
			<text class="greeting-line">做什么?</text>
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

				<!-- 之后可选择上传简历 -->
				<view class="row-right">
					<view class="icon-btn">
						<image class="icon-btn-icon icon-btn-icon--mic" src="/static/icon/aiAnalyse/mic.svg"
							mode="aspectFit" />
					</view>
					<view class="icon-btn icon-btn--send" @click="message = ''">
						<image class="icon-btn-icon icon-btn-icon--send" src="/static/icon/aiAnalyse/send.svg"
							mode="aspectFit" />
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { onReady, onUnload } from '@dcloudio/uni-app'
import { ref } from 'vue'

const systemInfo = uni.getSystemInfoSync()
// 状态栏高度：自定义导航栏用它做顶部留白（H5 端没有状态栏，取 0）
const statusBarHeight = systemInfo.statusBarHeight ?? 0

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
	display: flex;
	flex-direction: column;
	min-height: 100vh;
	padding: 0 31rpx 40rpx;
	background-color: #f4f4f4;
	font-family: Inter, -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif;

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
			width: 84rpx;
			height: 84rpx;
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

	/* ===== 问候语 ===== */
	.greeting {
		margin-top: 230rpx;

		.greeting-line {
			display: block;
			font-size: 61rpx;
			font-weight: 700;
			line-height: 78rpx;
			color: #111111;
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
					width: 24rpx;
					height: 25rpx;
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
