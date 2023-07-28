<script setup lang="ts">
import { defineProps, defineEmits, ref, onMounted } from "vue"
import { Bars3Icon, DocumentDuplicateIcon, TrashIcon } from '@heroicons/vue/24/outline'

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

const emit = defineEmits(["update", "delete"])

const component = ref(null),
    mouseHover = ref(false)

onMounted(() => {
    component.value = props.baseComponent
})

const selectComponent = (component) => {
    console.log(component)
}

const deleteComponent = (component) => {
    console.log(component)
}

const isSelected = (component) => {
    return false
}

const componentClasses = (component) => {
    return {
        'border-red-500': isSelected(component), 
        'bg-red-450 text-white text-sm w-2/5 p-1 font-mono': component.category === 'logic',
    }
}
</script>

<template>
    <div v-if="component" @click="selectComponent(component)"
        :component-id="component.id"
        :class="componentClasses(component)"
        class="relative border border-dotted border-slate-600 rounded-md p-2 hover:border-red-500 cursor-move"
        @mouseenter="mouseHover = true"
        @mouseleave="mouseHover = false"
    >
        <div 
            :class="{'group-hover:opacity-100': mouseHover, 'opacity-0': !mouseHover}"
            class="absolute top-0 right-0 bg-red-500 p-1.5 px-2 flex justify-between space-x-2 rounded-tr rounded-bl">
            <div class="py-0.5 px-1 text-sm rounded bg-red-600">
                {{ component.getLabel() }}
            </div>

            <button tabindex="-1">
                <Bars3Icon class="w-6 h-6 text-white" />
            </button>
            <button tabindex="-1">
                <DocumentDuplicateIcon class="w-6 h-6 text-white" />
            </button>
            <button tabindex="-1" @click="$emit('delete', component)">
                <TrashIcon class="w-6 h-6 text-white" />
            </button>
        </div>
        <div>
            <component 
                :is="componentMap[component.getName()]" 
                :base-component="component" 
                @update="$emit('update', component)" 
            />
        </div>
    </div>
</template>