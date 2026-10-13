import { createSSRApp } from 'vue'
import App from './App.vue'

// uni-app Vue3 入口：框架会调用 createApp 创建应用实例
export function createApp() {
	const app = createSSRApp(App)
	return {
		app
	}
}
