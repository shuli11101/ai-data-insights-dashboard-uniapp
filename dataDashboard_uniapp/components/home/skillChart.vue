<template>
	<view class="skill-card">
		<view class="skill-head">
			<text class="skill-title">技术栈热度</text>
			<text class="skill-subtitle">岗位描述中出现频次 Top 6</text>
		</view>

		<view class="skill-rows">
			<view class="skill-row" v-for="item in items" :key="item.label">
				<text class="skill-name">{{ item.label }}</text>
				<view class="skill-track">
					<view class="skill-fill" :style="{ width: item.percent + '%' }"></view>
					<text class="skill-percent">{{ item.percent }}%</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
// 技术栈热度横向条形图：percent 同时决定条长和右侧百分比文案
withDefaults(
	defineProps<{
		items?: { label: string; percent: number }[]
	}>(),
	{
		items: () => []
	}
)
</script>

<style lang="scss" scoped>
.skill-card {
	display: flex;
	flex-direction: column;
	box-sizing: border-box;
	width: 100%;
	height: 288rpx;
	padding: 26rpx 28rpx 20rpx;
	background-color: #ffffff;
	border: 2rpx solid #e8ecf3;
	border-radius: 28rpx;
	box-shadow: 0 6rpx 24rpx rgba(15, 23, 42, 0.04);

	.skill-title {
		display: block;
		font-size: 30rpx;
		font-weight: 600;
		line-height: 1.15;
		color: #0a0a0a;
	}

	.skill-subtitle {
		display: block;
		margin-top: 6rpx;
		font-size: 20rpx;
		line-height: 1.2;
		color: #9ca3af;
	}

	// 条形区：6 行等距铺满剩余高度
	.skill-rows {
		display: flex;
		flex: 1;
		flex-direction: column;
		justify-content: space-between;
		margin-top: 12rpx;
	}

	.skill-row {
		display: flex;
		align-items: center;
	}

	// 技能名：定宽，保证所有条形起点对齐
	.skill-name {
		flex-shrink: 0;
		box-sizing: border-box;
		width: 120rpx;
		padding-right: 10rpx;
		font-size: 20rpx;
		line-height: 1;
		color: #525b69;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	// 轨道：浅灰底 + 黑色填充，百分比跟在填充末端
	.skill-track {
		display: flex;
		align-items: center;
		flex: 1;
		min-width: 0;
		height: 22rpx;
		background-color: #f2f6fb;
		border-radius: 999rpx;
	}

	// 百分比文案放不下时，靠 flex 收缩让出宽度，条形不会顶出轨道
	.skill-fill {
		height: 100%;
		background-color: #0a0a0a;
		border-radius: 999rpx;
	}

	.skill-percent {
		flex-shrink: 0;
		margin-left: 8rpx;
		font-size: 18rpx;
		font-weight: 600;
		line-height: 1;
		color: #0a0a0a;
	}
}
</style>
