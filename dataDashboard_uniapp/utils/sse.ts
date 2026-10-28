/** SSE 事件体：不同接口按需取字段 */
export interface SSEEvent {
	/** 文本增量 */
	content?: string
	/** 会话 id（/api/ai/chat） */
	conversationId?: string
	/** 是否命中缓存（/api/ai/match） */
	cached?: boolean
	/** 缓存报告的匹配分（/api/ai/match） */
	score?: number
	/** 后端下发的错误信息 */
	error?: string
}

/**
 * 读取 fetch 的 SSE 响应体，逐条回调 `data:` 后的 JSON。
 * 遇到 `[DONE]` 正常结束；`data:` 里的 error 字段会抛错。
 */
export async function readSSE(
	response: Response,
	onEvent: (event: SSEEvent) => void
): Promise<void> {
	if (!response.body) {
		throw new Error('响应不支持流式读取')
	}

	const reader = response.body.getReader()
	const decoder = new TextDecoder()
	let buffer = ''

	while (true) {
		const { done, value } = await reader.read()
		if (done) break

		buffer += decoder.decode(value, { stream: true })
		const lines = buffer.split('\n')
		// 最后一行可能不完整，留到下一次拼接
		buffer = lines.pop() ?? ''

		for (const line of lines) {
			if (!line.startsWith('data:')) continue

			const payload = line.slice(5).trim()
			if (!payload) continue
			if (payload === '[DONE]') return

			let event: SSEEvent
			try {
				event = JSON.parse(payload)
			} catch {
				continue
			}
			if (event.error) throw new Error(event.error)
			onEvent(event)
		}
	}
}
