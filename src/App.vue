<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header class="border-b border-white/10 bg-slate-950/80 backdrop-blur">
    <nav class="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
      <RouterLink class="font-bold text-brand-500" to="/">Vue Starter</RouterLink>
      <RouterLink class="text-sm text-slate-300 hover:text-white" to="/about">O projekcie</RouterLink>
    </nav>
  </header>
  <main><RouterView /></main>
</template>
