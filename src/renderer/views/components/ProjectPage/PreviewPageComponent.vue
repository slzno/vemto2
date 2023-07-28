<script setup lang="ts">
import { defineProps, defineEmits, ref, watch, onMounted } from "vue"

// Components
import HeaderOneComponent from '@Renderer/logic/page/components/HeaderOneComponent.vue'
import TwoColumnsComponent from "@Renderer/logic/page/components/TwoColumnsComponent.vue"

const componentMap = {
    HeaderOneComponent,
    TwoColumnsComponent,
}

const props = defineProps({
    baseComponent: {
        type: Object,
        required: true,
    },
})

const emit = defineEmits(["update"])

const component = ref(null)

onMounted(() => {
    component.value = props.baseComponent
})
</script>

<template>
    <div v-if="component">
        <component 
            :is="componentMap[component.getName()]" 
            :base-component="component" 
            @update="$emit('update', component)" 
        />
    </div>
</template>