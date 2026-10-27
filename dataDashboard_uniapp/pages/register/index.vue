<template>
	<view class="auth-page">
		<!-- ===== 顶部栏：返回 + 品牌 + 帮助 ===== -->
		<view class="topbar">
			<view class="back" @click="goBack"></view>

			<text class="help">帮助</text>
		</view>

		<!-- ===== 标题 ===== -->
		<view class="intro">
			<text class="intro-title">创建账号</text>
			<text class="intro-desc">保存技能评估和岗位分析记录，换台设备也能接着看。</text>
		</view>

		<!-- ===== 手机号 ===== -->
		<view class="field" style="margin-top:20rpx;">
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

		<!-- ===== 短信验证码 ===== -->
		<view class="field">
			<view class="field-head">
				<text class="field-label">短信验证码</text>
				<text class="field-hint">6 位数字</text>
			</view>
			<view class="field-box">
				<input class="field-input" type="number" v-model="code" maxlength="6" placeholder="请输入验证码"
					placeholder-class="field-placeholder" />
				<view class="code-divider"></view>
				<text class="code-btn" :class="{ 'is-disabled': countdown > 0 }" @click="sendCode">
					{{ countdown > 0 ? `${countdown}s 后重发` : '获取验证码' }}
				</text>
			</view>
		</view>

		<!-- ===== 设置密码 ===== -->
		<view class="field">
			<view class="field-head">
				<text class="field-label">设置密码</text>
				<text class="field-hint">8–20 位</text>
			</view>
			<view class="field-box">
				<input class="field-input" :password="!showPassword" v-model="password" maxlength="20"
					placeholder="请设置登录密码" placeholder-class="field-placeholder" />
				<image class="eye-icon" src="/static/icon/auth/eye.svg" mode="aspectFit"
					@click="showPassword = !showPassword" />
			</view>

			<!-- 密码强度提示：静态空状态，与设计稿一致 -->
			<view class="strength">
				<view class="strength-bar"></view>
				<view class="strength-bar"></view>
				<view class="strength-bar"></view>
				<view class="strength-bar"></view>
				<text class="strength-text">至少 8 位，含字母和数字</text>
			</view>
		</view>

		<!-- ===== 主按钮 ===== -->
		<view class="primary-btn" @click="setRegister()">注册并登录</view>

		<!-- ===== 协议勾选 ===== -->
		<view class="consent" @click="agreed = !agreed">
			<view class="consent-box" :class="{ 'is-checked': agreed }"></view>
			<text class="consent-text">我已阅读并同意<text class="consent-link">《用户协议》</text>和<text
					class="consent-link">《隐私政策》</text></text>
		</view>

		<!-- ===== 去登录 ===== -->
		<view class="switch-row">
			<text class="switch-text">已有账号？</text>
			<text class="switch-link" @click="toLogin">去登录</text>
		</view>

		<!-- ===== 隐私提示 ===== -->
		<text class="tip">注册后，手机号仅用于登录和账号安全，不会展示在公开信息中。</text>

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
import { register } from '@/api/auth'
import { getErrorMessage } from '@/utils/request'
import { onUnmounted, ref } from 'vue'

// 静态表单数据：暂未接入注册接口
const phone = ref('')
const code = ref('')
const password = ref('')
const showPassword = ref(false)
// 默认勾选，与设计稿一致
const agreed = ref(false)

// 验证码重发倒计时（秒）
const countdown = ref(0)
// 是否已点击获取验证码：未获取过不允许注册
const codeSent = ref(false)
let timer: ReturnType<typeof setInterval> | null = null

// 启动 60 秒倒计时
const startCountdown = () => {
	countdown.value = 60
	if (timer) clearInterval(timer)
	timer = setInterval(() => {
		countdown.value -= 1
		if (countdown.value <= 0) {
			countdown.value = 0
			if (timer) {
				clearInterval(timer)
				timer = null
			}
		}
	}, 1000)
}

// 获取验证码：倒计时期间直接忽略点击（防抖），并校验手机号
const sendCode = () => {
	if (countdown.value > 0) return
	if (!/^1\d{10}$/.test(phone.value)) {
		uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
		return
	}


	codeSent.value = true
	startCountdown()
	uni.showToast({ title: '验证码已发送', icon: 'none' })
}

// 页面卸载时清理定时器，避免倒计时继续跑
onUnmounted(() => {
	if (timer) {
		clearInterval(timer)
		timer = null
	}
})

// 返回上一页；直接进入本页时退回登录页
const goBack = () => {
	uni.navigateBack({
		delta: 1,
		fail: () => {
			uni.redirectTo({ url: '/pages/login/index' })
		}
	})
}

// 登录页替换当前页，避免登录/注册来回跳转堆积页面栈
const toLogin = () => {
	uni.redirectTo({ url: '/pages/login/index' })
}

// 注册账号
const setRegister = async () => {
	// 没点过“获取验证码”不允许注册
	if (!codeSent.value) {
		uni.showToast({ title: '请先获取验证码', icon: 'none' })
		return
	}
	// 未勾选用户协议不允许注册
	if (!agreed.value) {
		uni.showToast({ title: '请先同意用户协议和隐私政策', icon: 'none' })
		return
	}

	try {
		const res = await register({
			phone: phone.value,
			code: code.value,
			password: password.value
		})
		// 存储 token 到本地存储
		if (res) {
			if (res.token) {
				uni.setStorageSync('token', res.token)
			}
		}

		uni.showToast({
			title: '注册成功',
			icon: 'success'
		})
		uni.switchTab({
			url: '/pages/home/index'
		})
	} catch (error) {
		console.error('注册失败:', error)
		// 409 等业务错误使用后端返回的提示，例如“该手机号已注册”
		uni.showToast({ title: getErrorMessage(error, '注册失败，请稍后重试'), icon: 'none' })
	}





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
	position: relative;
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

	/* 品牌：绝对居中，不参与两侧按钮的宽度分配 */
	.brand {
		position: absolute;
		top: 0;
		left: 50%;
		display: flex;
		align-items: center;
		height: 72rpx;
		transform: translateX(-50%);

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
		font-weight: 600;
		line-height: 1;
		color: #007c77;
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
	margin-top: 32rpx;

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

		.code-divider {
			flex-shrink: 0;
			width: 2rpx;
			height: 68rpx;
			margin: 0 24rpx;
			background-color: #e3ebec;
		}

		.code-btn {
			flex-shrink: 0;
			font-size: 25rpx;
			font-weight: 600;
			line-height: 1;
			color: #007c77;

			// 倒计时中：置灰，提示不可点击
			&.is-disabled {
				color: #a1acb3;
			}
		}

		.eye-icon {
			flex-shrink: 0;
			width: 32rpx;
			height: 32rpx;
			margin-left: 16rpx;
		}
	}

	/* 密码强度提示 */
	.strength {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		margin-top: 10rpx;

		.strength-bar {
			width: 31rpx;
			height: 6rpx;
			margin-right: 4rpx;
			background-color: #dbe5e6;
			border-radius: 3rpx;
		}

		.strength-text {
			margin-left: 20rpx;
			font-size: 21rpx;
			line-height: 1;
			color: #78868f;
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
	margin-top: 24rpx;
	font-size: 32rpx;
	font-weight: 600;
	letter-spacing: 1rpx;
	color: #ffffff;
	background-image: linear-gradient(180deg, #007c77 0%, #00746f 100%);
	border-radius: 24rpx;
}

/* ===== 协议勾选 ===== */
.consent {
	display: flex;
	align-items: center;
	margin-top: 36rpx;

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

/* ===== 去登录 ===== */
.switch-row {
	display: flex;
	align-items: center;
	margin-top: 32rpx;
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

/* ===== 隐私提示 ===== */
.tip {
	display: block;
	margin-top: 16rpx;
	font-size: 21rpx;
	line-height: 1.5;
	color: #7d8b91;
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
