<template>
	<view class="saved-page">
		<!-- ===== 顶部导航 ===== -->
		<view class="appbar" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="back" @click="goBack"></view>
			<text class="appbar-title">收藏职位</text>
		</view>

		<!-- ===== 统计 ===== -->
		<text class="page-subtitle">共 {{ total }} 个职位 · 最近收藏在前</text>

		<!-- ===== 加载 / 空状态 ===== -->
		<text v-if="loading" class="state-text">加载中…</text>
		<text v-else-if="!jobs.length" class="state-text">暂无收藏职位</text>

		<!-- ===== 按收藏时间分组 ===== -->
		<view class="group" v-for="group in groups" :key="group.label">
			<view class="group-head">
				<text class="group-label">{{ group.label }}</text>
				<text class="group-count">{{ group.items.length }} 个</text>
			</view>

			<view class="job-card" v-for="item in group.items" :key="item.id" @click="toDetail(item)">
				<view class="card-main">
					<text class="job-title">{{ item.jobName }}</text>
					<text class="job-meta">
						<text class="job-salary">{{ salaryText(item) }}</text>
						· {{ item.company }} · {{ item.city }}·{{ item.district }}
					</text>
				</view>

				<!-- 已收藏标记 -->
				<image class="bookmark" src="/static/icon/user/bookmark.svg" mode="aspectFit" />
			</view>
		</view>

		<text class="foot-note">收藏职位仅自己可见。</text>
	</view>
</template>

<script setup lang="ts">
import { getFavoriteList, type FavoriteJobItem } from '@/api/user'
import { onShow } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'

// 自定义导航栏需自行避开状态栏
const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 12

// 收藏职位：接口按收藏时间倒序返回
const jobs = ref<FavoriteJobItem[]>([])
const total = ref(0)
const loading = ref(false)

// 按收藏时间分组的列表
interface FavoriteGroup {
	/** 分组标题：今天 / 昨天 / 更早 */
	label: string
	items: FavoriteJobItem[]
}

// 今天 / 昨天 / 更早三组，空组不展示
const groups = computed<FavoriteGroup[]>(() => {
	const now = new Date()
	const yesterday = new Date(now)
	yesterday.setDate(now.getDate() - 1)

	const result: FavoriteGroup[] = [
		{ label: '今天', items: [] },
		{ label: '昨天', items: [] },
		{ label: '更早', items: [] }
	]

	jobs.value.forEach((item) => {
		const date = new Date(item.favoriteTime)
		if (Number.isNaN(date.getTime())) {
			result[2]!.items.push(item)
			return
		}
		if (date.toDateString() === now.toDateString()) {
			result[0]!.items.push(item)
		} else if (date.toDateString() === yesterday.toDateString()) {
			result[1]!.items.push(item)
		} else {
			result[2]!.items.push(item)
		}
	})

	return result.filter((group) => group.items.length)
})

// 薪资文案：20–35K
const salaryText = (item: FavoriteJobItem) => `${item.salaryMin}–${item.salaryMax}K`

// 拉取收藏列表
const loadFavorites = async () => {
	loading.value = true
	try {
		const res = await getFavoriteList()
		jobs.value = res.list
		total.value = res.total
	} catch (error) {
		console.error('[favorites] 获取收藏职位失败', error)
		uni.showToast({ title: '收藏职位加载失败', icon: 'none' })
	} finally {
		loading.value = false
	}
}

// 每次回到本页都刷新，取消收藏后能及时更新
onShow(loadFavorites)

// 点击职位进详情页（详情页会按 id 调 /home/jobDetail）
const toDetail = (item: FavoriteJobItem) => {
	uni.navigateTo({
		url: '/pages/detail/index?id=' + item.id
	})
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
.saved-page {
	box-sizing: border-box;
	min-height: 100vh;
	padding: 0 40rpx calc(40rpx + env(safe-area-inset-bottom));
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

/* ===== 统计说明 ===== */
.page-subtitle {
	display: block;
	margin-top: 14rpx;
	font-size: 22rpx;
	line-height: 1.2;
	color: #65747c;
}

/* ===== 加载 / 空状态 ===== */
.state-text {
	display: block;
	padding: 60rpx 0;
	font-size: 24rpx;
	line-height: 1.4;
	text-align: center;
	color: #8a979e;
}

/* ===== 时间分组 ===== */
.group {
	margin-top: 44rpx;

	.group-head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		margin-bottom: 18rpx;
	}

	.group-label {
		font-size: 23rpx;
		font-weight: 600;
		letter-spacing: 0.4rpx;
		color: #78868f;
	}

	.group-count {
		font-size: 19rpx;
		line-height: 1.2;
		color: #8a979e;
	}
}

/* ===== 职位卡片 ===== */
.job-card {
	position: relative;
	display: flex;
	align-items: center;
	box-sizing: border-box;
	min-height: 129rpx;
	padding: 22rpx 70rpx 22rpx 30rpx;
	background-color: #ffffff;
	border: 2rpx solid #e3ebec;
	border-radius: 24rpx;

	& + .job-card {
		margin-top: 18rpx;
	}

	.card-main {
		flex: 1;
		min-width: 0;
	}

	.job-title {
		display: block;
		font-size: 32rpx;
		font-weight: 600;
		line-height: 1.2;
		letter-spacing: -0.4rpx;
		color: #17252b;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.job-meta {
		display: block;
		margin-top: 8rpx;
		font-size: 20rpx;
		line-height: 1.3;
		color: #78868f;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;

		.job-salary {
			font-weight: 600;
			color: #007c77;
		}
	}

	/* 收藏标记：右上角书签 */
	.bookmark {
		position: absolute;
		top: 26rpx;
		right: 30rpx;
		width: 30rpx;
		height: 40rpx;
	}
}

/* ===== 底部说明 ===== */
.foot-note {
	display: block;
	margin-top: 36rpx;
	font-size: 20rpx;
	line-height: 1.4;
	color: #8a979e;
}
</style>
