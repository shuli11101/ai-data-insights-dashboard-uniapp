<template>
	<!-- App 端启动页：与 H5 首屏启动页保持同一视觉，自行淡出后移除 -->
	<view v-if="visible" class="app-splash" :class="{ 'is-leaving': leaving }">
		<view class="splash-logo">
			<view class="splash-bar splash-bar--sm"></view>
			<view class="splash-bar splash-bar--md"></view>
			<view class="splash-bar splash-bar--lg"></view>
		</view>

		<text class="splash-title">JobVision</text>
		<text class="splash-subtitle">大数据招聘岗位分析平台</text>

		<view class="splash-dots">
			<view class="splash-dot"></view>
			<view class="splash-dot"></view>
			<view class="splash-dot"></view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'


const visible = ref(true)
const leaving = ref(false)

onMounted(() => {
	// 展示 800ms 后淡出，再卸载，覆盖原生启动图关闭后的白屏间隙
	setTimeout(() => {
		leaving.value = true
		setTimeout(() => {
			visible.value = false
		}, 300)
	}, 800)
})
</script>

<style lang="scss" scoped>
.app-splash {
	position: fixed;
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
	z-index: 9999;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	background-color: #ffffff;
	transition: opacity 0.3s ease;

	&.is-leaving {
		opacity: 0;
	}
}

// 品牌图标：黑色圆角方块 + 三根白色柱体，与首页 Hero 图标一致
.splash-logo {
	display: flex;
	align-items: flex-end;
	justify-content: center;
	box-sizing: border-box;
	width: 168rpx;
	height: 168rpx;
	padding-bottom: 40rpx;
	background-color: #0a0a0a;
	border-radius: 48rpx;
	box-shadow: 0 24rpx 60rpx rgba(10, 10, 10, 0.18);
	animation: splash-logo-in 0.5s ease both;
}

.splash-bar {
	width: 14rpx;
	margin: 0 7rpx;
	background-color: #ffffff;
	border-radius: 8rpx;

	&--sm {
		height: 28rpx;
	}

	&--md {
		height: 46rpx;
	}

	&--lg {
		height: 64rpx;
	}
}

.splash-title {
	margin-top: 44rpx;
	font-size: 52rpx;
	font-weight: 700;
	line-height: 1.1;
	letter-spacing: 0.6rpx;
	color: #0a0a0a;
}

.splash-subtitle {
	margin-top: 16rpx;
	font-size: 24rpx;
	line-height: 1.2;
	letter-spacing: 0.4rpx;
	color: #9ca3af;
}

// 加载指示：三点呼吸，保持黑灰极简
.splash-dots {
	display: flex;
	align-items: center;
	margin-top: 68rpx;
}

.splash-dot {
	width: 10rpx;
	height: 10rpx;
	margin: 0 8rpx;
	background-color: #0a0a0a;
	border-radius: 50%;
	animation: splash-dot 1.2s ease-in-out infinite;

	&:nth-child(2) {
		animation-delay: 0.15s;
	}

	&:nth-child(3) {
		animation-delay: 0.3s;
	}
}

@keyframes splash-logo-in {
	from {
		opacity: 0;
		transform: scale(0.94);
	}

	to {
		opacity: 1;
		transform: scale(1);
	}
}

@keyframes splash-dot {

	0%,
	100% {
		opacity: 0.25;
	}

	50% {
		opacity: 1;
	}
}
</style>
