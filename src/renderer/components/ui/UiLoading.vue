<script setup lang="ts">
    import { computed, onMounted, ref } from 'vue'

    const canShow = ref(false)

    const props = defineProps({
        size: {
            type: Number,
            default: 20,
        },

        strokeWidth: {
            type: Number,
            default: 4,
        },

        delay: {
            type: Number,
            default: 0,
        },
    })
    
    onMounted(() => {
        if (props.delay === 0) {
            canShow.value = true
            return
        }

        setTimeout(() => {
            canShow.value = true
        }, props.delay)
    })

    const ringStyle = computed(() => ({
        width: `${props.size}px`,
        height: `${props.size}px`,
    }))

    const divStyle = computed(() => {
        const size = Math.max(0, props.size - 4)
        
        return {
            width: `${size}px`,
            height: `${size}px`,
            margin: `${props.strokeWidth}px`,
            borderWidth: `${props.strokeWidth}px`,
            borderRadius: '50%',
        }
    })
</script>

<template>
    <div v-show="canShow" class="flex text-gray-500 dark:text-white" :style="ringStyle">
        <div class="lds-ring">
            <div :style="divStyle"></div>
            <div :style="divStyle"></div>
            <div :style="divStyle"></div>
            <div :style="divStyle"></div>
        </div>
    </div>
</template>

<style scoped>
    .lds-ring {
        display: inline-block;
        position: relative;
    }
    .lds-ring div {
        box-sizing: border-box;
        display: block;
        position: absolute;
        margin: 4px;
        border: 4px solid currentColor;
        border-radius: 50%;
        animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
        border-color: currentColor transparent transparent transparent;
    }
    .lds-ring div:nth-child(1) {
        animation-delay: -0.45s;
    }
    .lds-ring div:nth-child(2) {
        animation-delay: -0.3s;
    }
    .lds-ring div:nth-child(3) {
        animation-delay: -0.15s;
    }
    @keyframes lds-ring {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
</style>
