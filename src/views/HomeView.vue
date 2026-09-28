<script setup lang="ts">
import CounterCard from '@/components/CounterCard.vue'
</script>

<template>
  <div class="mx-auto grid min-h-[calc(100vh-65px)] max-w-5xl place-content-center gap-8 px-6 py-16">
    <div><p class="mb-2 font-medium text-brand-500">Gotowy starter</p><h1 class="text-4xl font-black tracking-tight sm:text-6xl">Vue + Tailwind CSS + Tauri</h1><p class="mt-4 max-w-2xl text-lg text-slate-400">TypeScript, Router, Pinia, ESLint, Prettier i Vitest — skonfigurowane na dobry początek.</p></div>
    <CounterCard />
  </div>
</template>
