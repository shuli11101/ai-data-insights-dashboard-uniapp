<template>
	<view class="auth-page">
		<!-- ===== 奶油色头部：品牌 + 标题 ===== -->
		<view class="hero" :key="heroKey" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="brand">
				<image class="brand-mark" src="/static/icon/auth/brand.svg" mode="aspectFit" />
				<text class="brand-name">AI 分析</text>
				<view class="brand-dot"></view>
			</view>

			<view class="hero-copy">
				<image class="hero-art" src="/static/icon/auth/hero-sun.svg" mode="aspectFit" />
				<text class="hero-title">欢迎回来</text>
				<view class="hero-line"></view>
				<text class="hero-desc">继续看看，有没有更适合你的机会。</text>
			</view>
		</view>

		<!-- ===== 登录表单卡片 ===== -->
		<view class="form-card">
			<view class="field field-phone">
				<!-- <view class="field-icon">
					<image class="field-icon-img" src="/static/icon/auth/phone.svg" mode="aspectFit" />
				</view> -->
				<view class="field-main">
					<view class="field-row">
						<text class="field-prefix">+86</text>
						<input class="field-input" type="number" v-model="phone" maxlength="11" placeholder="请输入手机号"
							placeholder-class="field-placeholder" />
					</view>
				</view>
			</view>

			<view class="field">
				<!-- <view class="field-icon">
					<image class="field-icon-img" src="/static/icon/auth/shield.svg" mode="aspectFit" />
				</view> -->
				<view class="field-main">
					<view class="field-row">
						<input class="field-input" type="number" v-model="code" maxlength="6" placeholder="输入 6 位验证码"
							placeholder-class="field-placeholder" />
					</view>
				</view>
				<view class="code-btn">获取验证码</view>
			</view>
		</view>

		<!-- ===== 主按钮 ===== -->
		<view class="primary-btn">登录</view>

		<!-- ===== 微信一键登录 ===== -->
		<view class="ghost-btn">
			<image class="ghost-icon" src="/static/icon/auth/wechat.svg" mode="aspectFit" />
			<text class="ghost-text">微信一键登录</text>
		</view>

		<!-- ===== 去注册 ===== -->
		<view class="switch-row">
			<text class="switch-text">还没有账号？</text>
			<text class="switch-link" @click="toRegister">去注册</text>
		</view>

		<!-- ===== 安全提示 ===== -->
		<view class="tip">
			<view class="tip-check"></view>
			<text class="tip-text">登录后，分析记录和求职意向会自动保存</text>
		</view>

		<!-- ===== 底部协议 ===== -->
		<view class="footer">
			<view class="footer-line"></view>
			<text class="footer-text">登录即代表你同意<text class="footer-link">《用户协议》</text>和<text
					class="footer-link">《隐私政策》</text></text>
		</view>
	</view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import { ref } from 'vue'

// H5 端拿不到状态栏高度（为 0），头部内容靠上，用 0 兜底即可
const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 0

// 每次进入页面递增 key，让头部重新挂载以重播下落入场动画
const heroKey = ref(0)
onShow(() => {
	heroKey.value += 1
})

// 静态表单数据：暂未接入登录接口
const phone = ref('')
const code = ref('')

// 注册页替换当前页，避免登录/注册来回跳转堆积页面栈
const toRegister = () => {
	uni.redirectTo({ url: '/pages/register/index' })
}
</script>

<style lang="scss">
.auth-page {
	display: flex;
	flex-direction: column;
	box-sizing: border-box;
	min-height: 100vh;
	background-color: #ffffff;
	font-family: Inter, -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', Helvetica, Arial,
		sans-serif;
}

/* ===== 奶油色头部 ===== */
.hero {
	box-sizing: border-box;
	padding: 0 40rpx 90rpx;
	background-color: #f8f2e8;
	border-bottom-left-radius: 62rpx;
	border-bottom-right-radius: 62rpx;
	/* 每次进入页面从顶部缓缓落下 */
	animation: hero-drop 0.7s cubic-bezier(0.22, 0.61, 0.36, 1) both;

	.brand {
		display: flex;
		align-items: center;
		padding-top: 52rpx;
		/* 等头部落位后再淡入 */
		animation: hero-content-in 0.45s ease-out 0.7s both;

		.brand-mark {
			width: 48rpx;
			height: 48rpx;
		}

		.brand-name {
			margin-left: 16rpx;
			font-size: 21rpx;
			font-weight: 500;
			letter-spacing: 0.5rpx;
			color: #5a544a;
		}

		.brand-dot {
			width: 9rpx;
			height: 9rpx;
			margin-left: 12rpx;
			background-color: #d3a07c;
			border-radius: 50%;
		}
	}

	.hero-copy {
		position: relative;
		display: flex;
		flex-direction: column;
		margin-top: 96rpx;
		/* 等头部落位后再淡入 */
		animation: hero-content-in 0.45s ease-out 0.7s both;

		/* 右上角装饰插画 */
		.hero-art {
			position: absolute;
			top: -70rpx;
			right: 24rpx;
			width: 110rpx;
			height: 110rpx;
		}

		.hero-title {
			font-family: 'Noto Serif SC', 'Songti SC', SimSun, serif;
			font-size: 58rpx;
			font-weight: 600;
			line-height: 1.2;
			letter-spacing: -1.4rpx;
			color: #2e2b27;
		}

		.hero-line {
			width: 48rpx;
			height: 4rpx;
			margin-top: 14rpx;
			background-color: #d3a07c;
			border-radius: 2rpx;
		}

		.hero-desc {
			margin-top: 20rpx;
			font-size: 22rpx;
			line-height: 1.4;
			color: #8c8275;
		}
	}
}

/* ===== 表单卡片：上浮压在头部圆角上 ===== */
.form-card {
	position: relative;
	box-sizing: border-box;
	margin: -56rpx 40rpx 0;
	padding: 8rpx 0;
	background-color: #ffffff;
	border: 1px solid #efe8dd;
	border-radius: 38rpx;
	box-shadow: 0 28rpx 40rpx rgba(74, 59, 44, 0.1);
}

.field {
	position: relative;
	display: flex;
	align-items: center;
	height: 124rpx;
	padding: 0 42rpx 0 62rpx;

	/* 行间分割线：从文案区起笔，避开左侧图标 */
	&+.field::before {
		content: '';
		position: absolute;
		top: 0;
		left: 24rpx;
		right: 32rpx;
		height: 1px;
		background-color: #f4eee4;
	}

	.field-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		width: 58rpx;
		height: 58rpx;
		background-color: #f8f2e8;
		border-radius: 50%;

		.field-icon-img {
			width: 30rpx;
			height: 30rpx;
		}
	}


	.field-main {
		flex: 1;
		min-width: 0;
		margin-left: 28rpx;

		.field-label {
			display: block;
			font-size: 18rpx;
			line-height: 1.2;
			color: #978d80;
		}

		.field-row {
			display: flex;
			align-items: center;
			margin-top: 10rpx;

			.field-prefix {
				margin-right: 16rpx;
				font-size: 26rpx;
				font-weight: 500;
				line-height: 1.2;
				color: #5c7c68;
			}

			.field-input {
				flex: 1;
				min-width: 0;
				height: 36rpx;
				font-size: 28rpx;
				line-height: 36rpx;
				color: #2e2b27;
			}
		}
	}

	/* 获取验证码胶囊 */
	.code-btn {
		flex-shrink: 0;
		margin-left: 16rpx;
		padding: 0 20rpx;
		height: 46rpx;
		font-size: 28rpx;
		font-weight: 500;
		line-height: 46rpx;
		color: rgb(45, 45, 45);
		border-radius: 999rpx;
	}
}

.field-phone {
	padding-left: 0rpx;
}

/* 输入框占位文案：独立类名，保证各端都能命中 */
.field-placeholder {
	font-size: 28rpx;
	color: #b5ac9f;
}

/* ===== 主按钮 ===== */
.primary-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 86rpx;
	margin: 34rpx 40rpx 0;
	font-size: 24rpx;
	font-weight: 600;
	color: #ffffff;
	background-color: #5c7c68;
	border-radius: 43rpx;
	box-shadow: 0 18rpx 24rpx rgba(92, 124, 104, 0.28);
}

/* ===== 微信登录 ===== */
.ghost-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	box-sizing: border-box;
	height: 86rpx;
	margin: 20rpx 40rpx 0;
	background-color: #ffffff;
	border: 1px solid #e7e0d5;
	border-radius: 43rpx;

	.ghost-icon {
		width: 36rpx;
		height: 36rpx;
		margin-right: 14rpx;
	}

	.ghost-text {
		font-size: 22rpx;
		font-weight: 500;
		color: #5a544a;
	}
}

/* ===== 去注册 ===== */
.switch-row {
	display: flex;
	align-items: center;
	justify-content: center;
	margin-top: 44rpx;
	font-size: 20rpx;
	line-height: 1.4;

	.switch-text {
		color: #8c8275;
	}

	.switch-link {
		margin-left: 6rpx;
		font-weight: 600;
		color: #4e6b58;
	}
}

/* ===== 安全提示 ===== */
.tip {
	display: flex;
	align-items: center;
	justify-content: center;
	margin-top: 28rpx;

	.tip-check {
		width: 14rpx;
		height: 24rpx;
		margin-right: 14rpx;
		border: solid #5c7c68;
		border-width: 0 3rpx 3rpx 0;
		transform: rotate(45deg);
	}

	.tip-text {
		font-size: 19rpx;
		line-height: 1.4;
		color: #a79d90;
	}
}

/* ===== 底部协议 ===== */
.footer {
	margin-top: auto;
	padding: 40rpx 40rpx 56rpx;

	.footer-line {
		height: 1px;
		margin-bottom: 32rpx;
		background-color: #f2ece2;
	}

	.footer-text {
		display: block;
		font-size: 18rpx;
		line-height: 1.6;
		text-align: center;
		color: #a79d90;
	}

	.footer-link {
		color: #4e6b58;
		text-decoration: underline;
	}
}

/* 头部入场：从顶部落位 */
@keyframes hero-drop {
	from {
		transform: translateY(-100%);
	}

	to {
		transform: translateY(0);
	}
}

/* 头部内容：落位后逐渐显现 */
@keyframes hero-content-in {
	from {
		opacity: 0;
		transform: translateY(12rpx);
	}

	to {
		opacity: 1;
		transform: translateY(0);
	}
}
</style>
