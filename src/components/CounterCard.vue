<script setup lang="ts">
import { useCounterStore } from '@/stores/counter'
const counter = useCounterStore()
</script>

<template>
  <section class="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl">
    <p class="mb-4 text-slate-300">Pinia działa. Licznik: <strong class="text-white">{{ counter.count }}</strong></p>
    <button class="rounded-lg bg-brand-600 px-4 py-2 font-semibold hover:bg-brand-500" type="button" @click="counter.increment">Zwiększ</button>
  </section>
</template>
