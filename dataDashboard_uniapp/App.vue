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
</style>
