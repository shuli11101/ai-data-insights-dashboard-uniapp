<template>
	<view class="salary-card">
		<view class="salary-head">
			<text class="salary-title">薪酬分布</text>
			<text class="salary-subtitle">近 7 日岗位薪资区间分布（单位：个）</text>
		</view>

		<view class="salary-bars">
			<view class="bar-col" v-for="bar in items" :key="bar.label">
				<view class="bar-track">
					<view class="bar" :style="{ height: bar.height + '%' }"></view>
				</view>
				<text class="bar-label">{{ bar.label }}</text>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
// 薪酬分布柱状图：柱高由使用方按数据换算成百分比后传入
withDefaults(
	defineProps<{
		items?: { label: string; height: number }[]
	}>(),
	{
		items: () => []
	}
)
</script>

<style lang="scss" scoped>
.salary-card {
	display: flex;
	flex-direction: column;
	box-sizing: border-box;
	width: 100%;
	height: 288rpx;
	padding: 26rpx 28rpx 18rpx;
	background-color: #ffffff;
	border: 2rpx solid #e8ecf3;
	border-radius: 28rpx;
	box-shadow: 0 6rpx 24rpx rgba(15, 23, 42, 0.04);

	.salary-title {
		display: block;
		font-size: 30rpx;
		font-weight: 600;
		line-height: 1.15;
		color: #0a0a0a;
	}

	.salary-subtitle {
		display: block;
		margin-top: 6rpx;
		font-size: 20rpx;
		line-height: 1.2;
		color: #9ca3af;
	}

	// 柱区：等分若干列，整体贴着卡片底部
	.salary-bars {
		display: flex;
		flex: 1;
		align-items: flex-end;
		margin-top: 12rpx;

		.bar-col {
			display: flex;
			flex-direction: column;
			align-items: center;
			flex: 1;
			min-width: 0;
		}

		// 轨道：柱高百分比以此为基准，柱子从底部往上长
		.bar-track {
			display: flex;
			align-items: flex-end;
			justify-content: center;
			width: 100%;
			height: 112rpx;
			margin-top: 8rpx;
		}

		.bar {
			width: 40rpx;
			background-color: #0a0a0a;
			border-radius: 8rpx 8rpx 0 0;
		}

		// 区间刻度
		.bar-label {
			margin-top: 8rpx;
			font-size: 19rpx;
			line-height: 1;
			color: #9ca3af;
			white-space: nowrap;
		}
	}
}
</style>
