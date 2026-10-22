export type AiScene = 'drawer' | 'interpret' | 'skill' | 'jd' | 'chat' | '0' | '4'

const BASE_URL = 'http://127.0.0.1:3000'

/** 后端统一响应包装 */
interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

/** 一轮对话消息：role 为 user 或 assistant */
export interface ChatTurn {
  role: 'user' | 'assistant'
  content: string
}

/** 历史会话摘要 */
export interface ConversationSummary {
  conversationId: string
  /** 会话类型：single = 单轮分析，multi = 多轮对话 */
  type: 'single' | 'multi'
  /** 后端场景标识：chat / drawer / skill / jd 等 */
  scene: string
  /** ISO 时间字符串 */
  updateTime: string
  messageCount: number
  lastMessage: string
}

/** 会话详情里的单条消息，比请求多一个创建时间 */
export interface ConversationMessage extends ChatTurn {
  createTime: string
}

/** 会话详情：用于从历史记录恢复对话 */
export interface ConversationDetail {
  conversationId: string
  scene: string
  updateTime: string
  messages: ConversationMessage[]
}

export interface StreamAIOptions {
  scene: AiScene
  /** 完整对话历史，按时间顺序，最后一条必须是 user */
  messages: ChatTurn[]
  /** 会话 id：后端首轮返回后，从第二轮开始带上，用于续聊 */
  conversationId?: string
  /** 附加信息：岗位详情、求职者信息等 */
  context?: string
  signal?: AbortSignal
  /** 每收到一次文本增量，调用该回调 */
  onDelta: (delta: string) => void
  /** 后端在流里下发会话 id 时回调，用于后续轮次续聊 */
  onConversationId?: (id: string) => void
}

// 调用流式AI接口
export async function streamAI({
  scene,
  messages,
  conversationId,
  context,
  signal,
  onDelta,
  onConversationId,
} : StreamAIOptions): Promise<void> {
  const response = await fetch(BASE_URL + '/api/ai/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    signal,
    body: JSON.stringify({
      scene,
      messages,
      conversationId,
      context,
    }),
  })

  if(!response.ok || !response.body) {
    const detail = (await response.json().catch(() => null))
    throw new Error(detail?.message || detail?.error || 'AI 分析失败')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while(true) {
    const { done, value } = await reader.read()
    if(done) {
      break
    }
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''
    for(const line of lines) {
      if(!line.startsWith('data:')) {
        continue
      }
      // {"choices":[{"delta":{"content":"你"}}]} -> payload(把最前面的的 data: 去掉了)
      const payload = line.slice(5).trim()
      if(payload === '[DONE]') {
        return
      }

      let event: { content?: string; error?: string; conversationId?: string }
      try {
        event = JSON.parse(payload)
      } catch  {
        continue
      }
      if(event.error) {
        throw new Error(event.error)
      }
      if(event.conversationId) {
        onConversationId?.(event.conversationId)
      }
      if(event.content) {
        onDelta(event.content)
      }
    }
  }
}

/** 通用 GET：解包后端的 { code, message, data } */
async function getJSON<T>(path: string): Promise<T> {
  const response = await fetch(BASE_URL + path)
  if (!response.ok) {
    throw new Error('请求失败，请稍后重试')
  }
  const json: ApiResponse<T> = await response.json()
  if (json.code !== 0) {
    throw new Error(json.message || '请求失败')
  }
  return json.data
}

/** 历史会话列表 */
export function fetchConversations(limit = 20): Promise<ConversationSummary[]> {
  return getJSON<ConversationSummary[]>(`/api/ai/conversations?limit=${limit}`)
}

/** 单个会话的详情与历史消息，用于从历史记录恢复对话 */
export function fetchConversation(conversationId: string): Promise<ConversationDetail> {
  return getJSON<ConversationDetail>(
    `/api/ai/conversation?conversationId=${encodeURIComponent(conversationId)}`,
  )
}

/** 批量删除会话 */
export async function deleteConversations(conversationIds: string[]): Promise<void> {
  const response = await fetch(BASE_URL + '/api/ai/conversation', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ conversationIds }),
  })
  const detail: ApiResponse<unknown> | null = await response.json().catch(() => null)
  if (!response.ok || (detail && detail.code !== 0)) {
    throw new Error(detail?.message || '删除失败，请稍后重试')
  }
}
