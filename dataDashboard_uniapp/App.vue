<script lang="ts">
export default {
	onLaunch: function () {
		console.log('App Launch')
	},
	onShow: function () {
		console.log('App Show')
	},
	onHide: function () {
		console.log('App Hide')
	}
}
</script>

<style>
/*每个页面公共css */
page,
uni-page-body {
	box-sizing: border-box;
	background-color: #ffffff;
	/* 全局顶部浅青渐变：约 320px 内渐隐为白色 */
	background-image: linear-gradient(180deg, #d9f1f3 0%, #ffffff 100%);
	background-repeat: no-repeat;
	background-size: 100% 640rpx;
}

/* 全局隐藏滚动条（保留滚动能力）：H5 走伪元素，其它端走标准属性 */
::-webkit-scrollbar {
	display: none;
	width: 0;
	height: 0;
}

* {
	scrollbar-width: none;
	-ms-overflow-style: none;
}

/* H5 端底部导航栏：内置 tabBar 默认高度 50px，这里调高一点 */
.uni-tabbar {
	height: 66px !important;
}
</style>
