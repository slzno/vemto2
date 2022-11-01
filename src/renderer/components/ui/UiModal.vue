<script setup lang="ts">
    import { toRef } from "vue"
    import { XMarkIcon } from "@heroicons/vue/24/outline"

    const props = defineProps({
        show: Boolean,
        title: String,
        width: {
            type: String,
            default: "50%",
        },
    })

    const show = toRef(props, "show")
</script>

<template>
    <!-- Transition animation from bottom to top -->
    <Transition
        enter-from-class="transition duration-300 opacity-0"
        enter-to-class="transition duration-300 opacity-100"
        leave-from-class="transition duration-300 opacity-100"
        leave-to-class="transition duration-300 opacity-0"
    >
        <div
            class="fixed left-0 top-0 w-full h-full z-50 text-slate-200 flex items-center justify-center bg-slate-900 bg-opacity-90"
            v-if="show"
        >
            <!-- Modal -->
            <div
                class="relative rounded-lg bg-slate-850 shadow-2xl border border-slate-600"
                :style="{ width: width }"
            >
                <button
                    class="cursor-pointer flex absolute top-2 right-2"
                    @click="$emit('close')"
                >
                    <XMarkIcon class="w-4 h-4 stroke-2 hover:text-red-500" />
                </button>

                <header class="flex justify-between bg-slate-800 p-4 rounded-t-lg">
                    <div class="flex flex-col">
                        <span class="font-semibold">{{ title }}</span>
                    </div>
                </header>

                <!-- Modal Body -->
                <slot></slot>

                <!-- Modal Footer -->
                <footer>
                    <slot name="footer"></slot>
                </footer>

            </div>
        </div>
    </Transition>
</template>

<style scoped></style>
