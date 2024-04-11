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
        },

        iconSize: {
            type: String,
            default: "h-5 w-5",
        },

        rightSide: {
            type: Boolean,
            default: false,
        },
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
    <div class="flex items-center relative overflow-visible" ref="dropdown">
        <button @click.prevent.stop="clicked()" class="border border-transparent focus:border-red-500 dark:focus:border-red-500 outline-none rounded hover:text-red-500 group">
            <EllipsisVerticalIcon 
                :class="iconSize"
                class="text-inherit dark:text-inherit cursor-pointer select-none" 
            />
        </button>

        <Transition
            enter-from-class="transition duration-300 opacity-0"
            enter-to-class="transition duration-300 opacity-100"
            leave-from-class="transition duration-300 opacity-100"
            leave-to-class="transition duration-300 opacity-0"
        >
        <div v-if="showing" @click.prevent.stop="close" 
            :class="size"
            class="rounded-md absolute border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 p-1 shadow-lg z-50" 
            style="top: 18px;"
            :style="rightSide ? 'left: 10px;' : 'right: 10px;'"
        >
            <ul>
                <slot></slot>
            </ul>
        </div>
        </Transition>
    </div>
</template>
