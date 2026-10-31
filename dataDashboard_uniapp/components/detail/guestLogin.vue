<template>
	<!-- 未登录访客：从屏幕中部开始的渐变遮罩 + 登录引导 -->
	<view class="guest-login">
		<view class="guest-body">
			<view class="lock">
				<image class="lock-icon" src="/static/icon/detail/detail-lock.svg" mode="aspectFit" />
			</view>

			<text class="guest-title">登录后查看完整职位</text>
			<text class="guest-desc">解锁岗位职责、任职要求与匹配分析。</text>

			<view class="login-btn" @click="goLogin">
				<text class="login-btn-text">登录 / 注册</text>
			</view>
		</view>

		<view class="agreement">
			<text class="agreement-text">登录即代表你同意</text>
			<text class="agreement-link" @click="openAgreement">《用户协议》</text>
			<text class="agreement-text">和</text>
			<text class="agreement-link" @click="openAgreement">《隐私政策》</text>
		</view>
	</view>
</template>

<script setup lang="ts">
// 用 navigateTo 而不是 redirectTo：访客登录后仍能返回当前职位详情
const goLogin = () => {
	uni.navigateTo({ url: '/pages/login/index' })
}

// 用户协议与隐私政策
const openAgreement = () => {
	uni.navigateTo({ url: '/pages/user/agreement/index' })
}
</script>

<style lang="scss" scoped>
.guest-login {
	position: fixed;
	right: 0;
	bottom: 0;
	left: 0;
	/* 遮罩从屏幕中部开始，透明 → 不透明，让上半部分职位信息仍可读 */
	top: 25vh;
	z-index: 20;
	display: flex;
	flex-direction: column;
	box-sizing: border-box;
	padding: 0 48rpx calc(72rpx + env(safe-area-inset-bottom));
	background-image: linear-gradient(180deg,
			rgba(248, 252, 250, 0) 0%,
			rgba(248, 252, 250, 0.55) 18%,
			rgba(248, 252, 250, 0.92) 28%,
			#f8fcfa 34%,
			#f8fcfa 100%);

	/* 引导内容在遮罩区域内垂直居中 */
	.guest-body {
		display: flex;
		flex: 1;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		margin-top: 200rpx;
	}

	.lock {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 88rpx;
		height: 88rpx;
		background-color: #e8f7f4;
		border-radius: 50%;
	}

	.lock-icon {
		width: 34rpx;
		height: 42rpx;
	}

	.guest-title {
		margin-top: 32rpx;
		font-size: 40rpx;
		font-weight: 700;
		line-height: 1.2;
		letter-spacing: -1rpx;
		color: #17252b;
	}

	.guest-desc {
		margin-top: 12rpx;
		font-size: 23rpx;
		line-height: 1.4;
		color: #65747c;
	}

	.login-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		align-self: stretch;
		height: 92rpx;
		margin-top: 36rpx;
		background-color: #007c77;
		border-radius: 24rpx;

		.login-btn-text {
			font-size: 29rpx;
			font-weight: 600;
			line-height: 1;
			letter-spacing: 0.6rpx;
			color: #ffffff;
		}
	}

	.agreement {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-wrap: wrap;
	}

	.agreement-text,
	.agreement-link {
		font-size: 18rpx;
		line-height: 1.6;
		color: #8a979e;
	}

	.agreement-link {
		text-decoration: underline;
		text-decoration-color: #c7d2d3;
	}
}
</style>
