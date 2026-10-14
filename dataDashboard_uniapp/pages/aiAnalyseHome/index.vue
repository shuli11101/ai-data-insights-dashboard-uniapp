<template>
	<view class="tasks" :style="{ paddingTop: statusBarHeight + 'px' }">
		<!-- ===== 顶部标题 ===== -->
		<view class="header">
			<text class="header-title">全部任务</text>
		</view>

		<!-- ===== 任务列表（单列） ===== -->
		<view class="list">
			<view @click="onTaskClick(item)" class="task" v-for="item in tasks" :key="item.id">
				<view class="task-main">
					<text class="task-title">{{ item.title }}</text>
					<text class="task-time">{{ item.time }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
// 状态栏高度：自定义导航栏用它做顶部留白（H5 端没有状态栏，取 0）
const statusBarHeight = uni.getSystemInfoSync().statusBarHeight ?? 0

type TaskStatus = '进行中' | '已完成' | '待开始'

interface Task {
	id: number
	title: string
	time: string
	status: TaskStatus
}

// 静态任务数据
const tasks: Task[] = [
	{ id: 1, title: '招聘岗位数据清洗', time: '今天 09:24', status: '已完成' },
	{ id: 2, title: '岗位薪资区间分布分析', time: '今天 10:05', status: '进行中' },
	{ id: 3, title: '技能标签词频统计', time: '今天 11:18', status: '待开始' },
	{ id: 4, title: '一线城市岗位热度对比', time: '昨天 16:40', status: '已完成' },
	{ id: 5, title: '学历要求与薪资相关性', time: '昨天 14:02', status: '已完成' },
	{ id: 6, title: '岗位增长趋势周报', time: '昨天 09:30', status: '进行中' },
	{ id: 7, title: '公司规模分布统计', time: '10-11 18:15', status: '待开始' },
	{ id: 8, title: '经验要求分布统计', time: '10-10 15:47', status: '已完成' }
]

// 跳转页面
const onTaskClick = (item: Task) => {
	uni.navigateTo({ url: '/pages/aiAnalyse/index' })
}
</script>

<style lang="scss">
.tasks {
	box-sizing: border-box;
	min-height: 100vh;
	padding: 0 31rpx 40rpx;
	background-color: #f4f4f4;
	font-family: Inter, -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif;

	/* ===== 顶部标题 ===== */
	.header {
		padding: 25rpx 0 30rpx;

		.header-title {
			font-size: 42rpx;
			font-weight: 700;
			color: #111111;
		}
	}

	/* ===== 任务列表：单列排布 ===== */
	.list {
		display: flex;
		flex-direction: column;
		gap: 18rpx;

		.task {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 26rpx 24rpx;
			background-color: #ffffff;
			border-radius: 23rpx;

			.task-main {
				// 允许标题/时间在空间不足时省略
				flex: 1;
				min-width: 0;

				.task-title {
					display: block;
					font-size: 30rpx;
					font-weight: 700;
					line-height: 1.3;
					color: #111111;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}

				.task-time {
					display: block;
					margin-top: 10rpx;
					font-size: 24rpx;
					line-height: 1.2;
					color: #8a8a8e;
				}
			}

			/* 状态胶囊：不参与压缩，始终贴右 */
			.task-status {
				flex-shrink: 0;
				margin-left: 20rpx;
				padding: 8rpx 18rpx;
				font-size: 22rpx;
				line-height: 1;
				border-radius: 999rpx;

				&.is-doing {
					background-color: rgba(79, 70, 240, 0.1);
					color: #4f46f0;
				}

				&.is-done {
					background-color: #f0f0f0;
					color: #1f1f1f;
				}

				&.is-todo {
					background-color: #f0f0f0;
					color: #8a8a8e;
				}
			}
		}
	}
}
</style>
