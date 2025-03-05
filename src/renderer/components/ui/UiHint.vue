<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { ExclamationCircleIcon } from '@heroicons/vue/24/outline'

const showing = ref(false);
const hintRef = ref(null); // Reference to the hint element
const triggerRef = ref(null); // Reference to the trigger element (icon)

const props = defineProps({
    type: {
        type: String,
        default: "info",
    },

    width: {
        type: String,
        default: "40rem",
    },
});

const adjustHintPosition = async () => {
    await nextTick()

    const hintElement = hintRef.value
    const triggerElement = triggerRef.value

    if (hintElement && triggerElement) {    
        const triggerRect = triggerElement.getBoundingClientRect(),
            hintRect = hintElement.getBoundingClientRect()

        // Calculate position to align the hint with the trigger element
        const topPosition = triggerRect.top + window.scrollY + triggerRect.height
        const leftPosition = triggerRect.left + window.scrollX

        // Apply fixed positioning with calculated top and left values
        hintElement.style.position = 'fixed'
        hintElement.style.top = `${topPosition + 3}px`
        hintElement.style.left = `${leftPosition + 3}px`

        // Check if the hint goes beyond the bottom of the viewport
        if ((topPosition + hintElement.offsetHeight) > (window.innerHeight + window.scrollY)) {
            // If it does, position it above the trigger element instead
            hintElement.style.top = `${triggerRect.top + window.scrollY - hintElement.offsetHeight}px`
        }

        // Check if the hint goes beyond the right side of the viewport
        if ((leftPosition + hintElement.offsetWidth + hintRect.width) > (window.innerWidth + window.scrollX)) {
            // If it does, position it to the left of the trigger element instead
            hintElement.style.left = `${triggerRect.right + window.scrollX - hintElement.offsetWidth}px`
        }
    }
};

watch(showing, (newValue) => {
    if (newValue) {
        // Adjust position when showing is true
        adjustHintPosition()
    }
}, { immediate: true })

</script>

<template>
    <div class="relative px-1 text-lg font-thin">
        <div @mouseenter="showing = true" @mouseleave="showing = false" ref="triggerRef">
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
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition duration-75 ease-in"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
        >
            <div
                v-show="showing"
                :class="{
                    'border-blue-500': type === 'info',
                    'border-orange-500': type === 'warning',
                    'border-red-500': type === 'alert',
                }"
                class="shadow-lg bg-slate-950 rounded-lg border text-white p-4 flex items-center space-x-2"
                style="z-index: 9999"
                :style="{ width }"
                ref="hintRef"
            >
                <div>
                    <slot></slot>
                </div>
            </div>
        </Transition>
  
    </div>
</template>

<style scoped></style>
