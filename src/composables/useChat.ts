import { computed, ref } from 'vue'
import { askAssistant } from '@/lib/chat-api'
import { loadThreads, makeId, saveThreads } from '@/lib/storage'
import type { Message, Thread } from '@/types/chat'

const initial = loadThreads()
const threads = ref<Thread[]>(initial)
const activeId = ref(initial[0]?.id ?? '')
const loading = ref(false)
const error = ref('')
let controller: AbortController | undefined

function newThread(): Thread {
  const now = Date.now()
  const thread: Thread = { id: makeId(), title: 'Nowa rozmowa', messages: [], updatedAt: now }
  threads.value = [thread, ...threads.value]
  activeId.value = thread.id
  saveThreads(threads.value)
  return thread
}

if (!activeId.value) newThread()

export function useChat() {
  const activeThread = computed(() => threads.value.find((item) => item.id === activeId.value) ?? threads.value[0])

  function selectThread(id: string) {
    activeId.value = id
  }

  function createThread() {
    newThread()
  }

  function deleteThread(id: string) {
    threads.value = threads.value.filter((item) => item.id !== id)
    if (activeId.value === id) activeId.value = threads.value[0]?.id ?? ''
    if (!threads.value.length) newThread()
    saveThreads(threads.value)
  }

  function updateMessages(messages: Message[]) {
    const thread = activeThread.value
    if (!thread) return
    const first = messages.find((item) => item.role === 'user')
    thread.messages = messages
    thread.title = thread.title === 'Nowa rozmowa' && first ? first.content.slice(0, 48) : thread.title
    thread.updatedAt = Date.now()
    saveThreads(threads.value)
  }

  async function sendMessage(content: string) {
    const text = content.trim()
    if (!text || loading.value || !activeThread.value) return
    error.value = ''
    const user: Message = { id: makeId(), role: 'user', content: text, createdAt: Date.now() }
    const messages = [...activeThread.value.messages, user]
    updateMessages(messages)
    loading.value = true
    controller = new AbortController()
    try {
      const answer = await askAssistant(messages, controller.signal)
      updateMessages([...messages, { id: makeId(), role: 'assistant', content: answer, createdAt: Date.now() }])
    } catch (caught) {
      if ((caught as Error).name !== 'AbortError') error.value = (caught as Error).message || 'Nie udało się uzyskać odpowiedzi.'
    } finally {
      loading.value = false
      controller = undefined
    }
  }

  function stop() {
    controller?.abort()
  }

  return { threads, activeId, activeThread, loading, error, selectThread, createThread, deleteThread, sendMessage, stop }
}
