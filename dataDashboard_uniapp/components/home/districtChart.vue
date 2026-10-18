<template>
	<view class="district-card">
		<view class="district-head">
			<view class="district-icon">
				<view class="icon-bar icon-bar--sm"></view>
				<view class="icon-bar icon-bar--md"></view>
				<view class="icon-bar icon-bar--lg"></view>
			</view>

			<view class="district-titles">
				<text class="district-title">城市岗位分布</text>
				<text class="district-subtitle">城市岗位数量占比 · 近 30 天</text>
			</view>

			<view class="district-filter">
				<text class="filter-text">全国</text>
				<view class="filter-chevron"></view>
			</view>
		</view>

		<!-- 分段条：宽度按占比分配，段间用白色分隔线留出空隙 -->
		<view class="district-bar">
			<view class="bar-segment" v-for="(item, index) in items" :key="item.name"
				:style="{ width: item.percent + '%', backgroundColor: COLORS[index % COLORS.length] }"></view>
		</view>

		<!-- 图例：圆点 + 城市名 + 占比 -->
		<view class="district-legend">
			<view class="legend-item" v-for="(item, index) in items" :key="item.name">
				<view class="legend-dot" :style="{ backgroundColor: COLORS[index % COLORS.length] }"></view>
				<text class="legend-name">{{ item.name }}</text>
				<text class="legend-percent">{{ item.percent }}%</text>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
// 灰度配色：与设计稿的极简黑白风格一致，末位浅灰用于「其他」
const COLORS = ['#0a0a0a', '#3f4856', '#7c8798', '#c5ceda', '#e8ecf3']

withDefaults(
	defineProps<{
		items?: { name: string; percent: number }[]
	}>(),
	{
		items: () => []
	}
)
</script>

<style lang="scss" scoped>
.district-card {
	display: flex;
	flex-direction: column;
	box-sizing: border-box;
	width: 100%;
	height: 288rpx;
	padding: 26rpx 28rpx;
	background-color: #ffffff;
	border: 2rpx solid #e8ecf3;
	border-radius: 28rpx;
	box-shadow: 0 6rpx 24rpx rgba(15, 23, 42, 0.04);

	.district-head {
		display: flex;
		align-items: center;
	}

	// 标题图标：浅灰圆角底 + 黑色柱子
	.district-icon {
		display: flex;
		align-items: flex-end;
		justify-content: center;
		flex-shrink: 0;
		box-sizing: border-box;
		width: 54rpx;
		height: 54rpx;
		padding-bottom: 12rpx;
		background-color: #f2f6fb;
		border: 2rpx solid #e7edf5;
		border-radius: 16rpx;

		.icon-bar {
			width: 5rpx;
			margin: 0 2rpx;
			background-color: #0a0a0a;
			border-radius: 3rpx;

			&--sm {
				height: 10rpx;
			}

			&--md {
				height: 17rpx;
			}

			&--lg {
				height: 24rpx;
			}
		}
	}

	.district-titles {
		flex: 1;
		min-width: 0;
		margin-left: 16rpx;
	}

	.district-title {
		display: block;
		font-size: 30rpx;
		font-weight: 600;
		line-height: 1.15;
		color: #0a0a0a;
	}

	.district-subtitle {
		display: block;
		margin-top: 6rpx;
		font-size: 20rpx;
		line-height: 1.2;
		color: #9ca3af;
	}

	// 右侧范围胶囊：静态展示，与设计稿一致
	.district-filter {
		display: flex;
		align-items: center;
		flex-shrink: 0;
		box-sizing: border-box;
		height: 38rpx;
		padding: 0 16rpx;
		background-color: #f5f7fa;
		border-radius: 19rpx;

		.filter-text {
			font-size: 19rpx;
			line-height: 1;
			color: #69717e;
		}

		.filter-chevron {
			width: 7rpx;
			height: 7rpx;
			margin-left: 8rpx;
			border-right: 2rpx solid #8f97a4;
			border-bottom: 2rpx solid #8f97a4;
			transform: rotate(45deg);
		}
	}

	.district-bar {
		display: flex;
		width: 100%;
		height: 20rpx;
		margin-top: 80rpx;
		overflow: hidden;

		// 段间分隔：用白色右边框模拟间隙，宽度占比不受影响
		.bar-segment {
			box-sizing: border-box;
			height: 100%;
			min-width: 4rpx;
			border-right: 6rpx solid #ffffff;
			border-radius: 6rpx;

			&:last-child {
				border-right: none;
			}
		}
	}

	.district-legend {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		column-gap: 20rpx;
		row-gap: 12rpx;
		margin-top: 26rpx;

		.legend-item {
			display: flex;
			align-items: center;
			white-space: nowrap;
		}

		.legend-dot {
			flex-shrink: 0;
			width: 9rpx;
			height: 9rpx;
			border-radius: 50%;
		}

		.legend-name {
			margin-left: 8rpx;
			font-size: 19rpx;
			line-height: 1;
			color: #717a88;
		}

		.legend-percent {
			margin-left: 6rpx;
			font-size: 19rpx;
			font-weight: 600;
			line-height: 1;
			color: #0a0a0a;
		}
	}
}
</style>
