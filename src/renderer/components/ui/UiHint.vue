<script setup lang="ts">
    import { ref } from "vue"
    import { ExclamationCircleIcon } from "@heroicons/vue/24/outline"

    const showing = ref(false);

    const props = defineProps({
        type: {
            type: String,
            default: "info",
        },
    });
</script>

<template>
    <div class="relative px-1 text-lg font-thin">
        <div @mouseenter="showing = true" @mouseleave="showing = false">
            <ExclamationCircleIcon 
                :class="{ 
                    'text-blue-500': type === 'info', 
                    'text-orange-500': type === 'warning', 
                    'text-red-500': type === 'alert' 
                }"
                class="w-5 h-5 animate-pulse" 
            />
        </div>
       
        <Transition
            enter-from-class="transition duration-200 opacity-0"
            enter-to-class="transition duration-200 opacity-100"
            leave-from-class="transition duration-200 opacity-100"
            leave-to-class="transition duration-200 opacity-0"
        >
            <div
                v-show="showing"
                :class="{
                    'border-blue-500': type === 'info',
                    ' border-orange-500': type === 'warning',
                    'border-red-500': type === 'alert',
                }"
                class="absolute top-6 left-3 shadow-lg bg-slate-950 rounded-lg border text-white p-4 flex items-center space-x-2 w-96"
                style="
                    z-index: 9999;
                "
            >
                <div>
                    <slot></slot>
                </div>
            </div>
        </Transition>
  
    </div>
</template>

<style scoped></style>
