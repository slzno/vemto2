<script setup lang="ts">
    import { ref } from "vue"
    import { onClickOutside } from '@vueuse/core'
    import {
        EllipsisVerticalIcon,
    } from "@heroicons/vue/24/outline"

    const showing = ref(false),
        dropdown = ref(null)

    const show = () => {
        showing.value = true
    }

    const close = () => {
        showing.value = false
    }

    defineExpose({
        show,
        close,
    })

    onClickOutside(dropdown, () => {
        showing.value = false
    })
</script>

<template>
    <div class="relative overflow-visible" ref="dropdown">
        <EllipsisVerticalIcon @click.prevent.stop="showing = !showing" class="h-5 w-5 text-slate-400 cursor-pointer select-none hover:text-slate-300" />

        <Transition
            enter-from-class="transition duration-300 opacity-0"
            enter-to-class="transition duration-300 opacity-100"
            leave-from-class="transition duration-300 opacity-100"
            leave-to-class="transition duration-300 opacity-0"
        >
        <div v-if="showing" @click.prevent.stop="close" class="w-44 rounded-md absolute border border-gray-700 bg-slate-950" style="right: 10px; top: 18px;">
            <ul>
                <slot></slot>
            </ul>
        </div>
        </Transition>
    </div>
</template>
