<template>
	<view class="agreement-page">
		<!-- ===== 顶部导航 ===== -->
		<view class="appbar" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="back" @click="goBack"></view>
			<text class="appbar-title">用户协议与隐私</text>
		</view>

		<!-- ===== 标题 ===== -->
		<view class="page-head">
			<text class="page-title">用户协议与隐私</text>
			<text class="page-subtitle">更新日期：2026-10-29</text>
		</view>

		<!-- ===== 正文 ===== -->
		<view class="sheet">
			<view class="section" v-for="section in sections" :key="section.title">
				<text class="section-title">{{ section.title }}</text>
				<text class="paragraph" v-for="(text, index) in section.paragraphs" :key="index">{{ text }}</text>
			</view>

			<text class="foot-note">如对本协议或隐私政策有疑问，可通过「关于我们」与我们联系。</text>
		</view>
	</view>
</template>

<script setup lang="ts">
// 自定义导航栏需自行避开状态栏
const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 12

// 协议内容：静态文案，后续如需服务端下发再替换为接口数据
interface AgreementSection {
	title: string
	paragraphs: string[]
}

const sections: AgreementSection[] = [
	{
		title: '一、服务说明',
		paragraphs: [
			'本应用为求职者提供岗位浏览、岗位匹配分析与求职资料管理服务，帮助你在求职过程中更高效地了解岗位与自身条件的匹配情况。',
			'你使用本服务即表示已阅读并同意本协议的全部内容；如不同意，请停止使用。'
		]
	},
	{
		title: '二、账号与安全',
		paragraphs: [
			'你需要使用手机号注册并登录，请妥善保管账号与密码，不要向他人泄露。',
			'如发现账号存在异常登录或被盗用，请及时修改密码并与我们联系。'
		]
	},
	{
		title: '三、使用规范',
		paragraphs: [
			'你承诺不利用本服务发布虚假信息、进行批量爬取、干扰服务正常运行，或从事其他违反法律法规的行为。',
			'对违反上述规范的行为，我们有权限制或终止相应服务。'
		]
	},
	{
		title: '四、内容与知识产权',
		paragraphs: [
			'本应用内的界面设计、文字、图表等内容的知识产权归我们或相应权利人所有，未经许可不得复制、传播或用于商业用途。',
			'你提交的简历与求职信息仍归你所有，你授权我们在提供服务的范围内使用这些信息。'
		]
	},
	{
		title: '五、个人信息收集与使用',
		paragraphs: [
			'为完成账号注册与登录，我们会收集你的手机号；为生成匹配分析与岗位推荐，我们会收集你填写的城市、工作经验、学历、技能、当前薪资与期望薪资等信息。',
			'上述信息仅用于账号识别、岗位推荐、匹配分析与服务改进，不会用于与服务无关的用途。'
		]
	},
	{
		title: '六、信息共享与披露',
		paragraphs: [
			'除法律法规要求或取得你的明确同意外，我们不会向第三方出售或共享你的个人信息。',
			'在使用第三方服务（如短信验证）时，我们仅会提供完成该服务所必需的信息。'
		]
	},
	{
		title: '七、信息存储与保护',
		paragraphs: [
			'我们会在实现服务目的所需的期限内保存你的信息，并采取加密传输、访问控制等措施保护数据安全。',
			'尽管我们已采取合理措施，仍无法完全避免网络环境中的安全风险。'
		]
	},
	{
		title: '八、你的权利',
		paragraphs: [
			'你可以在「个人中心」查看和修改资料，在「偏好设置」更新求职意向，并可随时取消收藏或删除分析报告。',
			'如需注销账号或删除个人信息，可联系我们处理。'
		]
	},
	{
		title: '九、协议变更',
		paragraphs: ['我们可能根据业务调整更新本协议，更新后会在应用内提示；继续使用即视为同意更新后的内容。']
	}
]

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
.agreement-page {
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	min-height: 100vh;
	background-image: linear-gradient(180deg, #e2f3f0 0%, #f1f8f7 30%, #f4f8f7 100%);
	font-family: Inter, -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', Helvetica, Arial,
		sans-serif;
}

/* ===== 顶部导航：白色圆钮返回 + 居中标题 ===== */
.appbar {
	position: relative;
	display: flex;
	align-items: center;
	box-sizing: border-box;
	height: 88rpx;
	padding: 0 40rpx;
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
	font-size: 29rpx;
	font-weight: 600;
	line-height: 1;
	letter-spacing: -0.4rpx;
	color: #17252b;
	transform: translateX(-50%);
}

/* ===== 标题区 ===== */
.page-head {
	padding: 18rpx 40rpx 0;

	.page-title {
		display: block;
		font-size: 44rpx;
		font-weight: 700;
		line-height: 1.2;
		letter-spacing: -1.2rpx;
		color: #17252b;
	}

	.page-subtitle {
		display: block;
		margin-top: 10rpx;
		font-size: 22rpx;
		line-height: 1.2;
		color: #65747c;
	}
}

/* ===== 正文纸：白色大圆角，铺到页面底部 ===== */
.sheet {
	flex: 1;
	box-sizing: border-box;
	margin-top: 32rpx;
	padding: 20rpx 40rpx calc(48rpx + env(safe-area-inset-bottom));
	background-color: #ffffff;
	border-radius: 44rpx 44rpx 0 0;
}

.section {
	margin-top: 32rpx;

	&:first-child {
		margin-top: 12rpx;
	}

	.section-title {
		display: block;
		font-size: 30rpx;
		font-weight: 600;
		line-height: 1.4;
		letter-spacing: -0.3rpx;
		color: #17252b;
	}

	.paragraph {
		display: block;
		margin-top: 14rpx;
		font-size: 25rpx;
		line-height: 1.8;
		color: #3d4b54;
	}
}

/* ===== 底部说明 ===== */
.foot-note {
	display: block;
	margin-top: 48rpx;
	font-size: 20rpx;
	line-height: 1.5;
	color: #8a979e;
}
</style>
