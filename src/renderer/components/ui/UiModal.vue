<script setup lang="ts">
    import { toRef, useSlots } from "vue"
    import { XMarkIcon } from "@heroicons/vue/24/outline"

    const props = defineProps({
        show: Boolean,
        title: String,
        width: {
            type: String,
            default: "50%",
        },
    })

    const show = toRef(props, "show"),
        slots = useSlots()
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
            class="fixed left-0 top-0 w-full h-full z-50 text-slate-200 flex items-center justify-center bg-slate-900 bg-opacity-95"
            v-if="show"
        >
            <!-- Modal -->
            <div
                class="relative rounded-lg bg-slate-850 shadow-2xl border border-slate-700"
                style="max-height: calc(100vh - 5rem);"
                :style="{ width: width }"
            >
                <button
                    class="cursor-pointer flex absolute top-2 right-2"
                    @click="$emit('close')"
                >
                    <XMarkIcon class="w-4 h-4 stroke-2 hover:text-red-500" />
                </button>

                <header class="flex justify-between bg-slate-800 p-2 rounded-t-lg border-b border-slate-700">
                    <div class="flex flex-col">
                        <span class="font-semibold">{{ title }}</span>
                    </div>
                </header>

                <!-- Modal Body -->
                <div class="w-full h-full overflow-y-auto">
                    <slot></slot>
                </div>

                <!-- Modal Footer -->
                <footer v-if="slots.footer" class="bg-slate-800 rounded-b-lg border-t border-slate-700">
                    <slot name="footer"></slot>
                </footer>

            </div>
        </div>
    </Transition>
</template>

<style scoped></style>
