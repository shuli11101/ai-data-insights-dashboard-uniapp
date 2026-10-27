<template>
	<view class="auth-page">
		<!-- ===== 顶部栏：返回 + 品牌 + 登录帮助 ===== -->
		<view class="topbar">
			<view class="back" @click="goBack"></view>

			<view class="brand">
				<image class="brand-mark" src="/static/icon/auth/brand-mark.svg" mode="aspectFit" />
				<text class="brand-name">AI 分析</text>
			</view>

			<text class="help">登录帮助</text>
		</view>

		<!-- ===== 标题 ===== -->
		<view class="intro">
			<text class="intro-title">登录</text>
			<text class="intro-desc">继续查看你的技能评估和岗位分析记录。</text>
		</view>

		<!-- ===== 手机号 ===== -->
		<view class="field">
			<view class="field-head">
				<text class="field-label">手机号</text>
				<text class="field-hint">中国大陆</text>
			</view>
			<view class="field-box">
				<text class="phone-prefix">+86</text>
				<view class="phone-divider"></view>
				<input class="field-input" type="number" v-model="phone" maxlength="11" placeholder="请输入手机号"
					placeholder-class="field-placeholder" />
			</view>
		</view>

		<!-- ===== 密码 ===== -->
		<view class="field">
			<view class="field-head">
				<text class="field-label">密码</text>
				<text class="field-hint">8–20 位</text>
			</view>
			<view class="field-box">
				<input class="field-input" :password="!showPassword" v-model="password" maxlength="20"
					placeholder="请输入登录密码" placeholder-class="field-placeholder" />
				<image class="eye-icon" src="/static/icon/auth/eye.svg" mode="aspectFit"
					@click="showPassword = !showPassword" />
			</view>
		</view>

		<!-- ===== 主按钮 ===== -->
		<view class="primary-btn" @click="setLogin">登录</view>

		<!-- ===== 去注册 ===== -->
		<view class="switch-row">
			<text class="switch-text">还没有账号？</text>
			<text class="switch-link" @click="toRegister">注册账号</text>
		</view>

		<!-- ===== 协议勾选 ===== -->
		<view class="consent" @click="agreed = !agreed">
			<view class="consent-box" :class="{ 'is-checked': agreed }"></view>
			<text class="consent-text">我已阅读并同意<text class="consent-link">《用户协议》</text>和<text
					class="consent-link">《隐私政策》</text></text>
		</view>

		<!-- ===== 其他登录方式 ===== -->
		<view class="divider">
			<view class="divider-line"></view>
			<text class="divider-text">其他登录方式</text>
			<view class="divider-line"></view>
		</view>

		<view class="wechat-btn">
			<image class="wechat-icon" src="/static/icon/auth/wechat.svg" mode="aspectFit" />
			<text class="wechat-text">微信登录</text>
		</view>

		<!-- ===== 隐私提示 ===== -->
		<view class="tip">
			<image class="tip-icon" src="/static/icon/auth/lock.svg" mode="aspectFit" />
			<text class="tip-text">账号信息仅用于登录，分析记录仅自己可见</text>
		</view>

		<!-- ===== 底部安全提示 ===== -->
		<view class="footer">
			<view class="footer-line"></view>
			<view class="footer-safe">
				<image class="footer-icon" src="/static/icon/auth/shield-safe.svg" mode="aspectFit" />
				<text class="footer-text">求职安全提示：正规招聘不会以任何名义收取费用</text>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { login } from '@/api/auth'
import { getErrorMessage } from '@/utils/request'
import { ref } from 'vue'

const phone = ref('')
const password = ref('')
const showPassword = ref(false)
// 默认勾选，与注册页保持一致
const agreed = ref(false)

// 登录：校验通过后调用登录接口并保存 token
const setLogin = async () => {
	if (!/^1\d{10}$/.test(phone.value)) {
		uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
		return
	}
	if (!password.value) {
		uni.showToast({ title: '请输入密码', icon: 'none' })
		return
	}
	// 未勾选用户协议不允许登录
	if (!agreed.value) {
		uni.showToast({ title: '请先同意用户协议和隐私政策', icon: 'none' })
		return
	}

	try {
		const res = await login({ phone: phone.value, password: password.value })
		if (res.token) {
			uni.setStorageSync('token', res.token)
		}
		uni.showToast({ title: '登录成功', icon: 'success' })
		uni.switchTab({ url: '/pages/home/index' })
	} catch (error) {
		console.error('[login] 登录失败', error)
		uni.showToast({ title: getErrorMessage(error, '手机号或密码错误'), icon: 'none' })
	}
}

// 注册页替换当前页，避免登录/注册来回跳转堆积页面栈
const toRegister = () => {
	uni.redirectTo({ url: '/pages/register/index' })
}

// 返回上一页：上一页若是注册页则跳过它，回到进入注册前的页面
const goBack = () => {
	const pages = getCurrentPages()
	const prev = pages[pages.length - 2]
	const skipRegister = !!prev?.route && prev.route.indexOf('pages/register/index') > -1
	const delta = skipRegister ? 2 : 1

	if (pages.length > delta) {
		uni.navigateBack({ delta })
		return
	}
	// 没有可返回的页面时回首页
	uni.switchTab({ url: '/pages/home/index' })
}
</script>

<style lang="scss">
.auth-page {
	display: flex;
	flex-direction: column;
	box-sizing: border-box;
	min-height: 100vh;
	padding: 0 48rpx;
	font-family: Inter, -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', Helvetica, Arial,
		sans-serif;
}

/* ===== 顶部栏 ===== */
.topbar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 72rpx;
	margin-top: 48rpx;

	/* 返回箭头：左 + 下描边旋转 45°，指向左侧 */
	.back {
		flex-shrink: 0;
		width: 18rpx;
		height: 18rpx;
		border-left: 3rpx solid #3d4b54;
		border-bottom: 3rpx solid #3d4b54;
		transform: rotate(45deg);
	}

	.brand {
		display: flex;
		align-items: center;
		min-width: 0;
		margin-left: 24rpx;

		.brand-mark {
			flex-shrink: 0;
			width: 64rpx;
			height: 64rpx;
		}

		.brand-name {
			margin-left: 16rpx;
			font-size: 30rpx;
			font-weight: 700;
			line-height: 1;
			letter-spacing: -0.3rpx;
			color: #17252b;
			white-space: nowrap;
		}
	}

	.help {
		flex-shrink: 0;
		font-size: 24rpx;
		line-height: 1;
		color: #65747c;
	}
}

/* ===== 标题 ===== */
.intro {
	margin-top: 56rpx;

	.intro-title {
		display: block;
		font-size: 62rpx;
		font-weight: 700;
		line-height: 1.15;
		letter-spacing: -2rpx;
		color: #17252b;
	}

	.intro-desc {
		display: block;
		margin-top: 20rpx;
		font-size: 27rpx;
		line-height: 1.6;
		color: #65747c;
	}
}

/* ===== 表单项 ===== */
.field {
	margin-top: 44rpx;

	.field-head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		margin-bottom: 12rpx;

		.field-label {
			font-size: 25rpx;
			font-weight: 600;
			line-height: 1.2;
			letter-spacing: 0.3rpx;
			color: #3d4b54;
		}

		.field-hint {
			font-size: 21rpx;
			line-height: 1.2;
			color: #78868f;
		}
	}

	/* 输入框：白底胶囊，独立的描边盒子 */
	.field-box {
		display: flex;
		align-items: center;
		box-sizing: border-box;
		height: 106rpx;
		padding: 0 30rpx;
		background-color: #ffffff;
		border: 2rpx solid #d8e2e3;
		border-radius: 23rpx;

		.phone-prefix {
			flex-shrink: 0;
			font-size: 28rpx;
			font-weight: 500;
			line-height: 1;
			letter-spacing: 0.7rpx;
			color: #3d4b54;
		}

		.phone-divider {
			flex-shrink: 0;
			width: 2rpx;
			height: 40rpx;
			margin: 0 24rpx;
			background-color: #e3ebec;
		}

		.field-input {
			flex: 1;
			min-width: 0;
			height: 100%;
			font-size: 30rpx;
			color: #17252b;
		}

		.eye-icon {
			flex-shrink: 0;
			width: 32rpx;
			height: 32rpx;
			margin-left: 16rpx;
		}
	}
}

/* 输入框占位文案：独立类名，保证各端都能命中 */
.field-placeholder {
	font-size: 30rpx;
	color: #a1acb3;
}

/* ===== 主按钮 ===== */
.primary-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 104rpx;
	margin-top: 44rpx;
	font-size: 32rpx;
	font-weight: 600;
	letter-spacing: 1rpx;
	color: #ffffff;
	background-image: linear-gradient(180deg, #007c77 0%, #00746f 100%);
	border-radius: 24rpx;
}

/* ===== 去注册 ===== */
.switch-row {
	display: flex;
	align-items: center;
	margin-top: 40rpx;
	font-size: 25rpx;
	line-height: 1.4;

	.switch-text {
		color: #65747c;
	}

	.switch-link {
		margin-left: 4rpx;
		font-weight: 600;
		color: #007c77;
	}
}

/* ===== 协议勾选 ===== */
.consent {
	display: flex;
	align-items: center;
	margin-top: 32rpx;

	.consent-box {
		position: relative;
		box-sizing: border-box;
		flex-shrink: 0;
		width: 32rpx;
		height: 32rpx;
		background-color: #ffffff;
		border: 2rpx solid #c7d3d5;
		border-radius: 9rpx;

		&.is-checked {
			background-color: #007c77;
			border-color: #007c77;

			&::after {
				content: '';
				position: absolute;
				top: 2rpx;
				left: 10rpx;
				width: 7rpx;
				height: 14rpx;
				border: solid #ffffff;
				border-width: 0 3rpx 3rpx 0;
				transform: rotate(45deg);
			}
		}
	}

	.consent-text {
		margin-left: 18rpx;
		font-size: 23rpx;
		line-height: 1.4;
		color: #65747c;
	}

	.consent-link {
		font-weight: 500;
		color: #3d4b54;
		text-decoration: underline;
		text-decoration-color: #cbd5d6;
	}
}

/* ===== 其他登录方式 ===== */
.divider {
	display: flex;
	align-items: center;
	margin-top: 56rpx;

	.divider-line {
		flex: 1;
		height: 2rpx;
		background-color: #dfe7e8;
	}

	.divider-text {
		flex-shrink: 0;
		margin: 0 24rpx;
		font-size: 21rpx;
		line-height: 1;
		color: #78868f;
	}
}

/* ===== 微信登录 ===== */
.wechat-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	box-sizing: border-box;
	height: 88rpx;
	margin-top: 48rpx;
	background-color: rgba(255, 255, 255, 0.82);
	border: 2rpx solid #d8e2e3;
	border-radius: 23rpx;

	.wechat-icon {
		flex-shrink: 0;
		width: 40rpx;
		height: 40rpx;
		margin-right: 12rpx;
	}

	.wechat-text {
		font-size: 26rpx;
		font-weight: 500;
		line-height: 1;
		color: #3d4b54;
	}
}

/* ===== 隐私提示 ===== */
.tip {
	display: flex;
	align-items: center;
	justify-content: center;
	margin-top: 56rpx;

	.tip-icon {
		flex-shrink: 0;
		width: 24rpx;
		height: 28rpx;
		margin-right: 12rpx;
	}

	.tip-text {
		font-size: 21rpx;
		line-height: 1.4;
		color: #7d8b91;
	}
}

/* ===== 底部安全提示 ===== */
.footer {
	margin-top: auto;
	padding: 40rpx 0 48rpx;

	.footer-line {
		height: 2rpx;
		margin-bottom: 16rpx;
		background-color: rgba(208, 223, 222, 0.68);
	}

	.footer-safe {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.footer-icon {
		flex-shrink: 0;
		width: 26rpx;
		height: 26rpx;
		margin-right: 12rpx;
	}

	.footer-text {
		font-size: 21rpx;
		line-height: 1.4;
		color: #7b898f;
	}
}
</style>
