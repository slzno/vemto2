<script setup lang="ts">
    import { ref, defineEmits } from "vue"
    import { onClickOutside } from '@vueuse/core'
    import {
        EllipsisVerticalIcon,
    } from "@heroicons/vue/24/outline"

    const showing = ref(false),
        dropdown = ref(null)

    const emit = defineEmits(["clicked"])

    const props = defineProps({
        size: {
            type: String,
            default: "w-44",
        }
    })

    const show = () => {
        showing.value = true
    }

    const clicked = () => {
        showing.value = !showing.value
        emit("clicked")
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
        <EllipsisVerticalIcon @click.prevent.stop="clicked()" class="h-5 w-5 text-slate-400 cursor-pointer select-none hover:text-slate-300" />

        <Transition
            enter-from-class="transition duration-300 opacity-0"
            enter-to-class="transition duration-300 opacity-100"
            leave-from-class="transition duration-300 opacity-100"
            leave-to-class="transition duration-300 opacity-0"
        >
        <div v-if="showing" @click.prevent.stop="close" 
            :class="size"
            class="rounded-md absolute border border-gray-700 bg-slate-950 p-1" 
            style="right: 10px; top: 18px;"
        >
            <ul>
                <slot></slot>
            </ul>
        </div>
        </Transition>
    </div>
</template>
