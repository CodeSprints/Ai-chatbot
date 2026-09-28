import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import CounterCard from '../CounterCard.vue'

describe('CounterCard', () => {
  beforeEach(() => setActivePinia(createPinia()))
  it('zwiększa licznik', async () => {
    const wrapper = mount(CounterCard, { global: { plugins: [createPinia()] } })
    await wrapper.get('button').trigger('click')
    expect(wrapper.text()).toContain('Licznik: 1')
  })
})
