import { readSSE } from '@/utils/sse'

export type AiScene = 'drawer' | 'interpret' | 'skill' | 'jd' | 'chat' | '0' | '4'

const BASE_URL = 'http://127.0.0.1:3000'

/** 构造请求头：JSON + 登录后附加 token（原生 fetch 不走 http 拦截器） */
function buildHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const token = uni.getStorageSync('token') as string
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  return headers
}

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
    headers: buildHeaders(),
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

  await readSSE(response, (event) => {
    if (event.conversationId) {
      onConversationId?.(event.conversationId)
    }
    if (event.content) {
      onDelta(event.content)
    }
  })
}

export interface StreamMatchOptions {
  /** 岗位 id */
  jobId: number
  /** true 忽略缓存重新生成 */
  force?: boolean
  signal?: AbortSignal
  /** 每收到一次文本增量，调用该回调 */
  onDelta: (delta: string) => void
  /** 首帧回调：是否命中缓存，缓存时带上次的匹配分 */
  onCached?: (cached: boolean, score?: number) => void
}

// 岗位匹配度分析（SSE）：POST /api/ai/match
export async function streamMatch({
  jobId,
  force = false,
  signal,
  onDelta,
  onCached,
}: StreamMatchOptions): Promise<void> {
  const response = await fetch(BASE_URL + '/api/ai/match', {
    method: 'POST',
    headers: buildHeaders(),
    signal,
    body: JSON.stringify({ jobId, force }),
  })

  if (!response.ok || !response.body) {
    const detail = await response.json().catch(() => null)
    throw new Error(detail?.message || '匹配分析失败')
  }

  await readSSE(response, (event) => {
    if (event.cached !== undefined) onCached?.(event.cached, event.score)
    if (event.content) onDelta(event.content)
  })
}

/** 通用 GET：解包后端的 { code, message, data } */
async function getJSON<T>(path: string): Promise<T> {
  const response = await fetch(BASE_URL + path, { headers: buildHeaders() })
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
    headers: buildHeaders(),
    body: JSON.stringify({ conversationIds }),
  })
  const detail: ApiResponse<unknown> | null = await response.json().catch(() => null)
  if (!response.ok || (detail && detail.code !== 0)) {
    throw new Error(detail?.message || '删除失败，请稍后重试')
  }
}
