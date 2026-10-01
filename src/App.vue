<script setup lang="ts">
import { computed, ref } from 'vue'
import ThreadList from '@/components/ThreadList.vue'
import ChatPanel from '@/components/ChatPanel.vue'
import { useChat } from '@/composables/useChat'

const sidebarOpen = ref(false)
const chat = useChat()
const messages = computed(() => chat.activeThread.value?.messages ?? [])
const threads = chat.threads
const activeId = chat.activeId
const loading = chat.loading
const error = chat.error

function createThread() { chat.createThread(); sidebarOpen.value = false }
function selectThread(id: string) { chat.selectThread(id); sidebarOpen.value = false }
function removeThread(id: string) { chat.deleteThread(id) }
</script>

<template>
  <div class="flex min-h-screen bg-surface">
    <ThreadList :threads="threads" :active-id="activeId" :open="sidebarOpen" @select="selectThread" @create="createThread" @remove="removeThread" @close="sidebarOpen = false" />
    <ChatPanel :messages="messages" :loading="loading" :error="error" @send="chat.sendMessage" @stop="chat.stop" @menu="sidebarOpen = true" />
  </div>
</template>
