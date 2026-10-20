// AI 输出中解析出的一小节
export interface AISection {
  title: string
  // 正文
  text: string
  // 列表项
  items: string[]
}

export function parseSections(raw: string): AISection[] {
  const sections: AISection[] = []
  let current: AISection | null = null
  for (const line of raw.split('\n')) {

    const heading = /^#{1,4}\s*(.*?)\s*#*\s*$/.exec(line)
    if (heading) {
      // 流式输出时标题会先到达半截（如 "##"、"## "），此时解析出空标题，跳过以免生成假小节
      const title = heading[1]!.replace(/[:：]\s*$/, '').trim()
      if (!title) continue
      current = {
        title,
        text: '',
        items: []
      }
      sections.push(current)
      continue
    }
    if (!current) continue
    const item = /^\s*[-*]\s+(.+)$/.exec(line)
    const content = (item ? item[1]! : line).replace(/\*\*/g, '').trim()
    if (!content) continue
    if (item) {
      current.items.push(content)
    } else {
      current.text += content
    }
  }


  return sections
}

// 按标题取小节， 先精确匹配， 再退化位包含匹配
function findSection(sections: AISection[], title: string): AISection | undefined {
  return (
    sections.find((section) => section.title === title) ??
    sections.find((section) => section.title.includes(title))
  )
}

/**
 * 取小节正文；若正文为空则把列表项拼成一行
 */
export function sectionText(sections: AISection[], title: string): string {
  const section = findSection(sections, title)
  if (!section) return ''
  return section.text || section.items.join('、')
}

/**
 * 取小节列表项；若模型写成了整段话则退化为单元素数组
 */
export function sectionItems(sections: AISection[], title: string): string[] {
  const section = findSection(sections, title)
  if (!section) return []

  if (section.items.length) return section.items
  return section.text ? [section.text] : []
}

// 带标题与描述的列表项（如「工程化能力：React 大型项目从 0 到 1」）
export interface AISectionEntry {
  title: string
  desc: string
}

/**
 * 取小节列表项并拆成「标题 + 描述」，用于卡片式展示；
 * 没有「：」分隔符时，整条内容作为标题，描述为空
 */
export function sectionEntries(sections: AISection[], title: string): AISectionEntry[] {
  return sectionItems(sections, title).map((item) => {
    const matched = /^(.+?)\s*[：:]\s*(.+)$/.exec(item)
    if (!matched) return { title: item, desc: '' }
    return { title: matched[1]!.trim(), desc: matched[2]!.trim() }
  })
}

/**
 * 取小节里的第一个整数，用于匹配度、百分比这类纯数字小节
 */
export function sectionNumber(sections: AISection[], title: string): number {
  const matched = /\d+/.exec(sectionText(sections, title))
  return matched ? Number(matched[0]) : 0
}


