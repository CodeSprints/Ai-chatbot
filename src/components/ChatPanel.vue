<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { Menu, Send, Square, Volume2, Sparkles, Copy, Check } from 'lucide-vue-next'
import type { Message } from '@/types/chat'

defineProps<{ messages: Message[]; loading: boolean; error: string }>()
const emit = defineEmits<{ send: [text: string]; stop: []; menu: [] }>()
const input = ref('')
const messagesEnd = ref<HTMLElement>()
const copied = ref<string | null>(null)
const canSend = computed(() => input.value.trim().length > 0)


async function submit() {
  if (!canSend.value) return
  const text = input.value
  input.value = ''
  emit('send', text)
  await nextTick()
  messagesEnd.value?.scrollIntoView({ behavior: 'smooth' })
}

async function copyMessage(message: Message) {
  await navigator.clipboard?.writeText(message.content)
  copied.value = message.id
  window.setTimeout(() => { copied.value = null }, 1600)
}

function speak(message: Message) {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(message.content)
  utterance.lang = 'pl-PL'
  window.speechSynthesis.speak(utterance)
}
</script>

<template>
  <main class="flex min-w-0 flex-1 flex-col bg-surface">
    <header class="flex min-h-16 items-center justify-between border-b border-line bg-white px-4 sm:px-8">
      <div class="flex items-center gap-3"><button class="rounded-lg p-2 text-muted hover:bg-surface lg:hidden" aria-label="Otwórz listę rozmów" @click="emit('menu')"><Menu :size="21" /></button><div><h1 class="font-semibold text-ink">Rozmowa</h1><p class="text-xs text-muted">Iskra AI · tryb bezpieczny</p></div></div>
      <span class="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 sm:flex"><span class="size-2 rounded-full bg-emerald-500" aria-hidden="true"></span> Gotowy</span>
    </header>
    <section class="flex-1 overflow-y-auto px-4 py-6 sm:px-8" aria-live="polite" aria-label="Wiadomości rozmowy">
      <div class="mx-auto flex w-full max-w-3xl flex-col gap-5">
        <div v-if="!messages.length" class="flex min-h-[45vh] flex-col items-center justify-center text-center"><div class="mb-5 grid size-16 place-items-center rounded-2xl bg-indigo-100 text-brand"><Sparkles :size="30" aria-hidden="true" /></div><h2 class="text-2xl font-bold tracking-tight sm:text-3xl">W czym mogę Ci pomóc?</h2><p class="mt-3 max-w-md text-sm leading-6 text-muted">Zadaj pytanie, poproś o wyjaśnienie lub zacznij od prostego „Cześć”.</p></div>
        <article v-for="message in messages" :key="message.id" class="flex gap-3" :class="message.role === 'user' ? 'justify-end' : 'justify-start'">
          <div class="max-w-[90%] sm:max-w-[78%]" :class="message.role === 'user' ? 'order-1' : ''"><div class="rounded-2xl px-4 py-3 text-[15px] leading-7 shadow-sm" :class="message.role === 'user' ? 'rounded-br-md bg-brand text-white' : 'rounded-bl-md border border-line bg-white text-ink'"><p class="whitespace-pre-wrap break-words">{{ message.content }}</p></div><div v-if="message.role === 'assistant'" class="mt-1 flex gap-1"><button class="rounded-md p-1.5 text-muted hover:bg-white hover:text-ink" :aria-label="`Odczytaj wiadomość: ${message.content.slice(0, 30)}`" @click="speak(message)"><Volume2 :size="15" /></button><button class="rounded-md p-1.5 text-muted hover:bg-white hover:text-ink" :aria-label="`Skopiuj wiadomość: ${message.content.slice(0, 30)}`" @click="copyMessage(message)"><Check v-if="copied === message.id" :size="15" class="text-emerald-600" /><Copy v-else :size="15" /></button></div></div>
        </article>
        <div v-if="loading" class="flex items-center gap-2 text-sm text-muted"><span class="size-2 animate-pulse rounded-full bg-brand"></span><span>Iskra przygotowuje odpowiedź…</span></div>
        <div v-if="error" role="alert" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ error }}</div>
        <div ref="messagesEnd" aria-hidden="true"></div>
      </div>
    </section>
    <footer class="border-t border-line bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 sm:px-8"><form class="mx-auto max-w-3xl" @submit.prevent="submit"><label for="message" class="sr-only">Wiadomość do Iskry</label><div class="flex items-end gap-2 rounded-2xl border border-line bg-surface p-2 transition focus-within:border-brand focus-within:ring-2 focus-within:ring-indigo-100"><textarea id="message" v-model="input" rows="1" maxlength="4000" class="max-h-36 min-h-11 flex-1 resize-none bg-transparent px-3 py-2.5 text-sm leading-6 outline-none placeholder:text-muted" placeholder="Napisz wiadomość…" :disabled="loading" @keydown.enter.exact.prevent="submit"></textarea><button v-if="loading" type="button" class="grid size-11 shrink-0 place-items-center rounded-xl bg-ink text-white hover:bg-slate-700" aria-label="Zatrzymaj odpowiedź" @click="emit('stop')"><Square :size="17" fill="currentColor" /></button><button v-else type="submit" class="grid size-11 shrink-0 place-items-center rounded-xl bg-brand text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40" :disabled="!canSend" aria-label="Wyślij wiadomość"><Send :size="18" /></button></div><p class="mt-2 text-center text-xs text-muted">Enter wysyła wiadomość · Iskra może się mylić, sprawdź ważne informacje.</p></form></footer>
  </main>
</template>
