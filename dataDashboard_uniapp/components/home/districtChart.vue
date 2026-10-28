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
// 青色系配色：由深到浅，末位最浅用于「其他」
const COLORS = ['#00a8b0', '#007c77', '#5ed7dc', '#a5e9ec', '#d9f1f3']

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
	height: 356rpx;
	padding: 32rpx;
	background-color: #ffffff;
	border: 2rpx solid #e9eeec;
	border-radius: 32rpx;

	.district-head {
		display: flex;
		align-items: center;
	}

	// 标题图标：浅灰圆角底 + 青色柱子
	.district-icon {
		display: flex;
		align-items: flex-end;
		justify-content: center;
		flex-shrink: 0;
		box-sizing: border-box;
		width: 60rpx;
		height: 60rpx;
		padding-bottom: 14rpx;
		background-color: #f5f5f5;
		border-radius: 16rpx;

		.icon-bar {
			width: 5rpx;
			margin: 0 2rpx;
			background-color: #007c77;
			border-radius: 3rpx;

			&--sm {
				height: 10rpx;
			}

			&--md {
				height: 17rpx;
			}

			&--lg {
				height: 26rpx;
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
		font-size: 32rpx;
		font-weight: 700;
		line-height: 1.15;
		color: #0a0a0a;
	}

	.district-subtitle {
		display: block;
		margin-top: 8rpx;
		font-size: 22rpx;
		line-height: 1.2;
		color: #a3a3a3;
	}

	// 右侧范围胶囊：静态展示，与设计稿一致
	.district-filter {
		display: flex;
		align-items: center;
		flex-shrink: 0;
		box-sizing: border-box;
		height: 40rpx;
		padding: 0 16rpx;
		background-color: #f5f5f5;
		border-radius: 20rpx;

		.filter-text {
			font-size: 20rpx;
			line-height: 1;
			color: #737373;
		}

		.filter-chevron {
			width: 7rpx;
			height: 7rpx;
			margin-left: 8rpx;
			border-right: 2rpx solid #a3a3a3;
			border-bottom: 2rpx solid #a3a3a3;
			transform: rotate(45deg);
		}
	}

	// 分段条：上下各留一份自适应空白，让条形与图例整体垂直居中
	.district-bar {
		display: flex;
		width: 100%;
		height: 24rpx;
		margin-top: auto;
		overflow: hidden;

		// 段间分隔：用白色右边框模拟间隙，宽度占比不受影响
		.bar-segment {
			box-sizing: border-box;
			height: 100%;
			min-width: 4rpx;
			border-right: 6rpx solid #ffffff;
			border-radius: 12rpx;

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
		margin-top: 28rpx;
		margin-bottom: auto;

		.legend-item {
			display: flex;
			align-items: center;
			white-space: nowrap;
		}

		.legend-dot {
			flex-shrink: 0;
			width: 10rpx;
			height: 10rpx;
			border-radius: 50%;
		}

		.legend-name {
			margin-left: 8rpx;
			font-size: 20rpx;
			line-height: 1;
			color: #737373;
		}

		.legend-percent {
			margin-left: 6rpx;
			font-size: 20rpx;
			font-weight: 600;
			line-height: 1;
			color: #737373;
		}
	}
}
</style>
