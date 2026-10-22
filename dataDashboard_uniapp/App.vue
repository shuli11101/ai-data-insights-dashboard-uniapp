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
</style>
