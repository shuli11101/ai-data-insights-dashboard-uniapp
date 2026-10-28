<template>
	<view class="edit-profile">
		<!-- ===== 顶部导航 ===== -->
		<view class="appbar" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="back" @click="goBack"></view>
			<text class="appbar-title">编辑资料</text>
		</view>

		<!-- ===== 头像 ===== -->
		<view class="avatar-section">
			<view class="avatar" @click="chooseAvatar">
				<image v-if="avatarPreview || avatar" class="avatar-img" :src="avatarPreview || avatar" mode="aspectFill" />
				<text v-else class="avatar-text">{{ avatarText }}</text>

				<view class="camera-badge">
					<view class="camera-icon"></view>
				</view>
			</view>
			<text class="avatar-action" @click="chooseAvatar">更换头像</text>
			<text class="avatar-hint">头像和名称会展示在求职主页</text>
		</view>

		<!-- ===== 表单 ===== -->
		<view class="sheet">
			<text class="sheet-title">基本资料</text>

			<!-- 名称 -->
			<view class="field">
				<view class="field-head">
					<text class="field-label">名称</text>
					<text class="field-hint">2–12 个字符</text>
				</view>
				<view class="field-box">
					<input class="field-input" v-model="nickname" maxlength="12" placeholder="请输入名称"
						placeholder-style="color:#A1ACB3;font-size:29rpx" />
				</view>
			</view>

			<!-- 手机号：脱敏且不可修改 -->
			<view class="field">
				<view class="field-head">
					<text class="field-label">手机号</text>
					<text class="field-hint">不可修改</text>
				</view>
				<view class="field-box field-box--disabled">
					<text class="field-text">{{ maskedPhone }}</text>
					<image class="field-lock" src="/static/icon/user/lock.svg" mode="aspectFit" />
				</view>
			</view>

			<!-- 目前工作 -->
			<view class="field">
				<view class="field-head">
					<text class="field-label">目前工作</text>
				</view>
				<view class="field-box">
					<input class="field-input" v-model="currentJob" maxlength="64" placeholder="如：前端工程师"
						placeholder-style="color:#A1ACB3;font-size:29rpx" />
				</view>
			</view>

			<!-- 所在地 -->
			<view class="field">
				<view class="field-head">
					<text class="field-label">所在地</text>
				</view>

				<cityPicker v-model="location">
					<template #trigger="{ selected, toggle }">
						<view class="field-box field-box--select" @click="toggle">
							<text class="field-text" :class="{ 'is-placeholder': !selected }">
								{{ selected || '请选择所在地' }}
							</text>
							<view class="chevron"></view>
						</view>
					</template>
				</cityPicker>
			</view>

			<!-- 隐私说明 -->
			<view class="note">
				<image class="note-icon" src="/static/icon/user/lock.svg" mode="aspectFit" />
				<text class="note-text">手机号不会展示，其他资料会用于求职主页与岗位推荐。</text>
			</view>
		</view>

		<!-- ===== 固定保存栏 ===== -->
		<view class="save-bar">
			<view class="save-btn" @click="save">保存修改</view>
			<text class="save-hint">保存后将更新你的求职资料</text>
		</view>
	</view>
</template>

<script setup lang="ts">
import { getUserProfile } from '@/api/user'
import cityPicker from '@/components/user/cityPicker.vue'
import { onLoad } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'

// 自定义导航栏需自行避开状态栏
const statusBarHeight = uni.getSystemInfoSync().statusBarHeight ?? 0

// 表单数据
const nickname = ref('')
const phone = ref('')
const currentJob = ref('')
const location = ref('')
const avatar = ref('')
// 本地选择的头像预览（后端提供上传接口后再换成线上地址）
const avatarPreview = ref('')

const avatarText = computed(() => nickname.value?.[0] || '未')

// 手机号脱敏：138****8000
const maskedPhone = computed(
	() => phone.value.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2') || '未绑定'
)

// 拉取当前资料用于回显
const loadProfile = async () => {
	try {
		const res = await getUserProfile()
		nickname.value = res.nickname ?? ''
		phone.value = res.phone ?? ''
		currentJob.value = res.currentJob ?? ''
		location.value = res.location ?? ''
		avatar.value = res.avatar ?? ''
	} catch (error) {
		console.error('[editProfile] 获取用户信息失败', error)
	}
}

onLoad(() => {
	loadProfile()
})

// 更换头像：先本地预览，上传接口接入后再提交线上地址
const chooseAvatar = () => {
	uni.chooseImage({
		count: 1,
		sizeType: ['compressed'],
		sourceType: ['album', 'camera'],
		success: (res) => {
			avatarPreview.value = res.tempFilePaths[0]
		}
	})
}

// 保存资料：修改资料接口待确认，这里只做名称校验
const save = () => {
	const name = nickname.value.trim()
	if (name.length < 2 || name.length > 12) {
		uni.showToast({ title: '名称需 2–12 个字符', icon: 'none' })
		return
	}
	uni.showToast({ title: '保存接口待接入', icon: 'none' })
}

// 返回上一页；直接进入本页时回「我的」
const goBack = () => {
	uni.navigateBack({
		fail: () => {
			uni.switchTab({ url: '/pages/user/index' })
		}
	})
}
</script>

<style lang="scss" scoped>
.edit-profile {
	box-sizing: border-box;
	min-height: 100vh;
	padding: 0 0 calc(220rpx + env(safe-area-inset-bottom));
	background-image: linear-gradient(180deg, #e2f3f0 0%, #f1f8f7 28%, #f4f8f7 100%);
	font-family: Inter, -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', Helvetica, Arial,
		sans-serif;
}

/* ===== 顶部导航 ===== */
.appbar {
	position: relative;
	display: flex;
	align-items: center;
	box-sizing: border-box;
	height: 88rpx;
	padding-right: 40rpx;
	padding-left: 40rpx;
}

.back {
	position: relative;
	flex-shrink: 0;
	box-sizing: border-box;
	width: 74rpx;
	height: 74rpx;
	background-color: #ffffff;
	border: 2rpx solid #d8e2e3;
	border-radius: 50%;

	&::after {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		width: 16rpx;
		height: 16rpx;
		margin: -8rpx 0 0 -6rpx;
		border-left: 3rpx solid #3d4b54;
		border-bottom: 3rpx solid #3d4b54;
		transform: rotate(45deg);
	}
}

.appbar-title {
	position: absolute;
	left: 50%;
	font-size: 30rpx;
	font-weight: 600;
	line-height: 1;
	letter-spacing: -0.4rpx;
	color: #17252b;
	transform: translateX(-50%);
}

/* ===== 头像 ===== */
.avatar-section {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 40rpx 0 32rpx;
}

.avatar {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	box-sizing: border-box;
	width: 156rpx;
	height: 156rpx;
	background-color: #e8f7f4;
	border: 2rpx solid #d3eae6;
	border-radius: 50%;

	.avatar-text {
		font-size: 58rpx;
		font-weight: 600;
		line-height: 1;
		color: #007c77;
	}

	.avatar-img {
		width: 100%;
		height: 100%;
		border-radius: 50%;
	}
}

/* 相机角标：白色圆 + 描边相机 */
.camera-badge {
	position: absolute;
	right: -2rpx;
	bottom: -2rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	box-sizing: border-box;
	width: 52rpx;
	height: 52rpx;
	background-color: #ffffff;
	border: 2rpx solid #d3e6e2;
	border-radius: 50%;
}

.camera-icon {
	position: relative;
	width: 26rpx;
	height: 19rpx;
	border: 2rpx solid #007c77;
	border-radius: 4rpx;

	&::before {
		content: '';
		position: absolute;
		top: -7rpx;
		left: 50%;
		width: 10rpx;
		height: 7rpx;
		border: 2rpx solid #007c77;
		border-bottom: none;
		border-radius: 3rpx 3rpx 0 0;
		transform: translateX(-50%);
	}

	&::after {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		box-sizing: border-box;
		width: 9rpx;
		height: 9rpx;
		margin: -4.5rpx 0 0 -4.5rpx;
		border: 2rpx solid #007c77;
		border-radius: 50%;
	}
}

.avatar-action {
	margin-top: 20rpx;
	font-size: 25rpx;
	font-weight: 500;
	line-height: 1;
	color: #007c77;
}

.avatar-hint {
	margin-top: 12rpx;
	font-size: 21rpx;
	line-height: 1.2;
	color: #8a979e;
}

/* ===== 表单纸 ===== */
.sheet {
	box-sizing: border-box;
	padding: 28rpx 40rpx 40rpx;
	background-color: #ffffff;
	border-radius: 44rpx 44rpx 0 0;
}

.sheet-title {
	display: block;
	font-size: 24rpx;
	font-weight: 600;
	line-height: 1.2;
	letter-spacing: 0.4rpx;
	color: #78868f;
}

.field {
	margin-top: 30rpx;

	.field-head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		margin-bottom: 12rpx;

		.field-label {
			font-size: 25rpx;
			font-weight: 600;
			line-height: 1.2;
			color: #3d4b54;
		}

		.field-hint {
			font-size: 21rpx;
			line-height: 1.2;
			color: #8a979e;
		}
	}

	.field-box {
		display: flex;
		align-items: center;
		box-sizing: border-box;
		height: 96rpx;
		padding: 0 28rpx;
		background-color: #f8fbfa;
		border: 2rpx solid #e0e9e8;
		border-radius: 22rpx;
	}

	.field-input {
		flex: 1;
		min-width: 0;
		height: 100%;
		font-size: 29rpx;
		font-weight: 500;
		color: #17252b;
	}

	.field-text {
		flex: 1;
		min-width: 0;
		font-size: 29rpx;
		font-weight: 500;
		line-height: 1.2;
		color: #17252b;

		&.is-placeholder {
			font-weight: 400;
			color: #a1acb3;
		}
	}

	/* 手机号：灰底、不可编辑 */
	.field-box--disabled {
		background-color: #f1f6f5;
		border-color: #e6eeed;

		.field-text {
			font-weight: 400;
			color: #65747c;
		}
	}

	.field-lock {
		flex-shrink: 0;
		width: 22rpx;
		height: 26rpx;
		margin-left: 16rpx;
		opacity: 0.6;
	}

	.field-box--select {
		padding-right: 28rpx;
	}

	.chevron {
		flex-shrink: 0;
		width: 14rpx;
		height: 14rpx;
		margin-left: 16rpx;
		border-top: 2rpx solid #9aa6ac;
		border-right: 2rpx solid #9aa6ac;
		transform: rotate(45deg);
	}
}

/* ===== 隐私说明 ===== */
.note {
	display: flex;
	align-items: center;
	box-sizing: border-box;
	margin-top: 32rpx;
	padding: 22rpx 24rpx;
	background-color: #f1f9f7;
	border-radius: 20rpx;
}

.note-icon {
	flex-shrink: 0;
	width: 20rpx;
	height: 24rpx;
	margin-right: 14rpx;
}

.note-text {
	font-size: 21rpx;
	line-height: 1.4;
	color: #3d4b54;
}

/* ===== 保存栏 ===== */
.save-bar {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	box-sizing: border-box;
	padding: 24rpx 40rpx calc(20rpx + env(safe-area-inset-bottom));
	background-color: #ffffff;
	border-top: 2rpx solid #e3ebec;
}

.save-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 92rpx;
	font-size: 30rpx;
	font-weight: 600;
	letter-spacing: 0.6rpx;
	color: #ffffff;
	background-image: linear-gradient(180deg, #007c77 0%, #00746f 100%);
	border-radius: 24rpx;
}

.save-hint {
	display: block;
	margin-top: 12rpx;
	font-size: 20rpx;
	line-height: 1.2;
	text-align: center;
	color: #8a979e;
}
</style>
