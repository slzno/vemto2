<script setup lang="ts">
    import { toRef, useSlots, onMounted, defineEmits, watch } from "vue"
    import { XMarkIcon } from "@heroicons/vue/24/outline"
import UiLoading from "./UiLoading.vue"

    const props = defineProps({
        show: Boolean,
        title: String,
        width: {
            type: String,
            default: "50%",
        },
        height: {
            type: String,
            default: "auto",
        },
        onTopOfEverything: {
            type: Boolean,
            default: false,
        },
        processing: {
            type: Boolean,
            default: false,
        }
    })

    const show = toRef(props, "show"),
        onTopOfEverything = toRef(props, "onTopOfEverything"),
        emit = defineEmits(["show", "close"]),
        slots = useSlots()

    // watch show prop and emit show event when it changes to true
    watch(show, (value) => {
        if (value) emit("show")
    })

    onMounted(() => {
        // window.addEventListener("keydown", (e) => {
        //     console.log("escape")
        //     if (e.key === "Escape") {
        //         if (show.value) emit("close")
        //     }
        // })
    })
</script>

<template>
    <!-- Transition animation from bottom to top -->
    <Teleport to="#appContainer">
        <Transition
            enter-from-class="transition duration-300 opacity-0"
            enter-to-class="transition duration-300 opacity-100"
            leave-from-class="transition duration-300 opacity-100"
            leave-to-class="transition duration-300 opacity-0"
        >
            
            <div
                @keydown.escape="$emit('close')"
                style="z-index: 70;"
                :style="onTopOfEverything ? 'z-index: 100000 !important' : ''"
                :class="{
                    'select-none pointer-events-none': processing,
                }"
                class="fixed left-0 top-0 w-full h-full dark:text-slate-200 flex items-center justify-center bg-slate-200 dark:bg-slate-900 bg-opacity-95"
                v-if="show"
            >
                <!-- Modal -->
                <div
                    class="flex flex-col relative rounded-lg bg-white dark:bg-slate-850 shadow-2xl border border-slate-200 dark:border-slate-700"
                    style="max-height: calc(100vh - 5rem);"
                    :style="{ width: width, height: height }"
                >
                    <button
                        :class="{
                            'pointer-events-none opacity-20': processing,
                        }"
                        class="cursor-pointer flex absolute top-2 right-2"
                        @click="$emit('close')"
                    >
                        <UiLoading v-if="processing" :size="15" :stroke-width="2" />
                        <XMarkIcon v-else class="w-4 h-4 stroke-2 hover:text-red-500" />
                    </button>

                    <header class="flex justify-between bg-white dark:bg-slate-800 p-2 rounded-t-lg border-b border-slate-200 text-slate-700 dark:border-slate-700">
                        <div class="flex flex-col">
                            <span class="font-normal dark:text-slate-200">
                                {{ title }}
                            </span>
                        </div>
                    </header>

                    <!-- Modal Body -->
                    <div
                        :class="{
                            'opacity-50': processing,
                        }" 
                        class="w-full h-full overflow-y-auto scrollbar-thin scrollbar-thumb-slate-400 scrollbar-track-slate-300 dark:scrollbar-thumb-black dark:scrollbar-track-slate-900"
                    >
                        <slot></slot>
                    </div>

                    <!-- Modal Footer -->
                    <footer v-if="slots.footer" 
                        :class="{
                            'opacity-50': processing,
                        }" 
                        class="bg-white dark:bg-slate-800 rounded-b-lg border-t border-slate-200 dark:border-slate-700"
                    >
                        <slot name="footer"></slot>
                    </footer>

                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped></style>
