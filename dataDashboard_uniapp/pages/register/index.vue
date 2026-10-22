<template>
	<view class="auth-page">
		<!-- ===== 奶油色头部：品牌 + 标题 ===== -->
		<view class="hero" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="brand">
				<image class="brand-mark" src="/static/icon/auth/brand.svg" mode="aspectFit" />
				<text class="brand-name">AI 分析</text>
				<view class="brand-dot"></view>
			</view>

			<view class="hero-copy">
				<image class="hero-art" src="/static/icon/auth/hero-sprout.svg" mode="aspectFit" />
				<text class="hero-title">先认识一下</text>
				<view class="hero-line"></view>
				<text class="hero-desc">创建账号，保存你的分析记录和求职意向。</text>
			</view>
		</view>

		<!-- ===== 注册表单卡片 ===== -->
		<view class="form-card">
			<view class="field field-phone">
				<view class="field-main">
					<view class="field-row">
						<text class="field-prefix">+86</text>
						<input class="field-input" type="number" v-model="phone" maxlength="11" placeholder="请输入手机号"
							placeholder-class="field-placeholder" />
					</view>
				</view>
			</view>

			<view class="field">
				<view class="field-main">
					<view class="field-row">
						<input class="field-input" type="number" v-model="code" maxlength="6" placeholder="输入 6 位验证码"
							placeholder-class="field-placeholder" />
					</view>
				</view>
				<view class="code-btn">获取验证码</view>
			</view>

			<view class="field">
				<view class="field-main">
					<view class="field-row">
						<input class="field-input" :password="!showPassword" v-model="password" maxlength="20"
							placeholder="8-20 位密码" placeholder-class="field-placeholder" />
					</view>
				</view>
				<image class="eye-icon" src="/static/icon/auth/eye.svg" mode="aspectFit"
					@click="showPassword = !showPassword" />
			</view>
		</view>

		<!-- ===== 协议勾选 ===== -->
		<view class="consent" @click="agreed = !agreed">
			<view class="consent-box" :class="{ 'is-checked': agreed }"></view>
			<text class="consent-text">我已阅读并同意<text class="consent-link">《用户协议》</text>和<text
					class="consent-link">《隐私政策》</text></text>
		</view>

		<!-- ===== 主按钮 ===== -->
		<view class="primary-btn">创建账号</view>

		<!-- ===== 去登录 ===== -->
		<view class="switch-row">
			<text class="switch-text">已有账号？</text>
			<text class="switch-link" @click="toLogin">去登录</text>
		</view>

		<!-- ===== 隐私提示 ===== -->
		<view class="tip">
			<image class="tip-icon" src="/static/icon/auth/lock.svg" mode="aspectFit" />
			<text class="tip-text">注册后，你的记录只对你可见</text>
		</view>

		<!-- ===== 底部版权 ===== -->
		<view class="footer">
			<view class="footer-line"></view>
			<text class="footer-text">© 2026 AI 分析</text>
		</view>
	</view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// H5 端拿不到状态栏高度（为 0），头部内容靠上，用 0 兜底即可
const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 0

// 静态表单数据：暂未接入注册接口
const phone = ref('')
const code = ref('')
const password = ref('')
const showPassword = ref(false)
// 默认勾选，与设计稿一致
const agreed = ref(true)

// 登录页替换当前页，避免登录/注册来回跳转堆积页面栈
const toLogin = () => {
	uni.redirectTo({ url: '/pages/login/index' })
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

	.brand {
		display: flex;
		align-items: center;
		padding-top: 52rpx;

		.brand-mark {
			width: 48rpx;
			height: 48rpx;
		}

		.brand-name {
			margin-left: 16rpx;
			font-size: 21rpx;
			font-weight: 500;
			letter-spacing: 0.5rpx;
			color: #0a0a0a;
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

		/* 右上角嫩芽插画 */
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
			color: #0a0a0a;
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
			color: #0a0a0a;
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

	/* 行间分割线 */
	&+.field::before {
		content: '';
		position: absolute;
		top: 0;
		left: 24rpx;
		right: 32rpx;
		height: 1px;
		background-color: #f4eee4;
	}

	.field-main {
		flex: 1;
		min-width: 0;
		margin-left: 28rpx;

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

	/* 获取验证码 */
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

	/* 密码可见性切换 */
	.eye-icon {
		flex-shrink: 0;
		width: 32rpx;
		height: 32rpx;
		margin-left: 16rpx;
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

/* ===== 协议勾选 ===== */
.consent {
	display: flex;
	align-items: flex-start;
	margin: 28rpx 40rpx 0;

	.consent-box {
		position: relative;
		box-sizing: border-box;
		flex-shrink: 0;
		width: 28rpx;
		height: 28rpx;
		background-color: #ffffff;
		border: 2rpx solid #d8cfc0;
		border-radius: 7rpx;

		&.is-checked {
			background-color: #5c7c68;
			border-color: #5c7c68;

			&::after {
				content: '';
				position: absolute;
				top: 2rpx;
				left: 9rpx;
				width: 6rpx;
				height: 12rpx;
				border: solid #ffffff;
				border-width: 0 3rpx 3rpx 0;
				transform: rotate(45deg);
			}
		}
	}

	.consent-text {
		margin-left: 12rpx;
		font-size: 19rpx;
		line-height: 1.4;
		color: #0a0a0a;
	}

	.consent-link {
		color: #4e6b58;
	}
}

/* ===== 主按钮 ===== */
.primary-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 86rpx;
	margin: 30rpx 40rpx 0;
	font-size: 24rpx;
	font-weight: 600;
	color: #ffffff;
	background-color: #5c7c68;
	border-radius: 43rpx;
	box-shadow: 0 18rpx 24rpx rgba(92, 124, 104, 0.28);
}

/* ===== 去登录 ===== */
.switch-row {
	display: flex;
	align-items: center;
	justify-content: center;
	margin-top: 44rpx;
	font-size: 20rpx;
	line-height: 1.4;

	.switch-text {
		color: #0a0a0a;
	}

	.switch-link {
		margin-left: 6rpx;
		font-weight: 600;
		color: #4e6b58;
	}
}

/* ===== 隐私提示 ===== */
.tip {
	display: flex;
	align-items: center;
	justify-content: center;
	margin-top: 28rpx;

	.tip-icon {
		width: 24rpx;
		height: 24rpx;
		margin-right: 12rpx;
	}

	.tip-text {
		font-size: 19rpx;
		line-height: 1.4;
		color: #0a0a0a;
	}
}

/* ===== 底部版权 ===== */
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
		color: #0a0a0a;
	}
}
</style>
