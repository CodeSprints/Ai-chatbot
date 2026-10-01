<script setup lang="ts">
import { Plus, MessageSquare, Trash2, X } from 'lucide-vue-next'
import type { Thread } from '@/types/chat'

defineProps<{ threads: Thread[]; activeId: string; open: boolean }>()
const emit = defineEmits<{ select: [id: string]; create: []; remove: [id: string]; close: [] }>()
</script>

<template>
  <aside :class="['fixed inset-y-0 left-0 z-30 flex w-80 max-w-[85vw] flex-col border-r border-line bg-white transition-transform duration-200 lg:static lg:translate-x-0', open ? 'translate-x-0' : '-translate-x-full']" aria-label="Lista rozmów">
    <div class="flex h-16 items-center justify-between border-b border-line px-5">
      <div>
        <p class="text-lg font-bold tracking-tight text-ink">Iskra</p>
        <p class="text-xs text-muted">Twój spokojny asystent AI</p>
      </div>
      <button class="rounded-lg p-2 text-muted hover:bg-surface lg:hidden" aria-label="Zamknij panel rozmów" @click="emit('close')"><X :size="20" /></button>
    </div>
    <div class="p-4">
      <button class="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark" @click="emit('create')"><Plus :size="18" aria-hidden="true" /> Nowa rozmowa</button>
    </div>
    <nav class="flex-1 overflow-y-auto px-3" aria-label="Twoje rozmowy">
      <p class="px-2 pb-2 text-xs font-semibold uppercase tracking-wider text-muted">Historia</p>
      <div v-if="!threads.length" class="px-2 py-5 text-sm text-muted">Brak zapisanych rozmów.</div>
      <div v-for="thread in threads" :key="thread.id" class="group mb-1 flex items-center gap-1 rounded-xl" :class="thread.id === activeId ? 'bg-indigo-50 text-brand' : 'text-ink hover:bg-surface'">
        <button class="min-h-11 min-w-0 flex-1 rounded-xl px-3 py-2 text-left text-sm" :aria-current="thread.id === activeId ? 'page' : undefined" @click="emit('select', thread.id)"><MessageSquare :size="16" class="mr-2 inline-block align-text-bottom" aria-hidden="true" /><span class="truncate">{{ thread.title }}</span></button>
        <button class="mr-1 rounded-lg p-2 text-muted opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 focus:opacity-100" :aria-label="`Usuń rozmowę ${thread.title}`" @click="emit('remove', thread.id)"><Trash2 :size="16" /></button>
      </div>
    </nav>
    <div class="border-t border-line p-4 text-xs leading-5 text-muted"><p class="font-semibold text-ink">Prywatność przede wszystkim</p><p>Dane rozmów są przechowywane lokalnie na tym urządzeniu.</p></div>
  </aside>
  <button v-if="open" class="fixed inset-0 z-20 bg-slate-950/30 lg:hidden" aria-label="Zamknij panel rozmów" @click="emit('close')"></button>
</template>
