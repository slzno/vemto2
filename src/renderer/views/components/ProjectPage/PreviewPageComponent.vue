<script setup lang="ts">
import Page from "@Common/models/page/Page"
import { defineProps, defineEmits, ref, onMounted } from "vue"
import { Bars3Icon, DocumentDuplicateIcon, TrashIcon } from '@heroicons/vue/24/outline'

// Components
import SmallComponent from "@Renderer/logic/page/components/SmallComponent.vue"
import HeaderOneComponent from '@Renderer/logic/page/components/HeaderOneComponent.vue'
import TwoColumnsComponent from "@Renderer/logic/page/components/TwoColumnsComponent.vue"
import ParagraphComponent from "@Renderer/logic/page/components/ParagraphComponent.vue"
import CustomComponent from "@Renderer/logic/page/components/CustomComponent.vue"
import ForelseComponent from "@Renderer/logic/page/components/ForelseComponent.vue"
import LinkComponent from "@Renderer/logic/page/components/LinkComponent.vue"

const componentMap = {
    HeaderOneComponent,
    TwoColumnsComponent,
    SmallComponent,
    ParagraphComponent,
    CustomComponent,
    ForelseComponent,
    LinkComponent,
}

const props = defineProps({
    page: {
        type: Page,
        required: true,
    },
    baseComponent: {
        type: Object,
        required: true,
    },
})

const emit = defineEmits(["pageUpdated"])

const component = ref(null),
    mouseHover = ref(false)

onMounted(() => {
    component.value = props.baseComponent
})

const deleteComponent = (component) => {
    props.page.removeComponent(component)
    emit('pageUpdated')
}

const componentClasses = (component) => {
    return {
        'bg-red-450 text-white text-sm w-2/5 p-1 font-mono': component.category === 'logic',
    }
}
</script>

<template>
    <div v-if="component"
        :component-id="component.id"
        :class="componentClasses(component)"
        class="relative border border-slate-800 rounded-md p-2 hover:border-red-800 cursor-move"
        @mouseenter="mouseHover = true"
        @mouseleave="mouseHover = false"
    >
        <div 
            :class="{'group-hover:opacity-100': mouseHover, 'opacity-0': !mouseHover}"
            class="absolute top-0 right-0 bg-slate-800 border border-slate-700 p-1 px-2 flex justify-between space-x-2 rounded-tr rounded-bl">
            <div class="flex items-center justify-center py-0.5 px-2 text-xs rounded bg-slate-650">
                {{ component.getLabel() }}
            </div>

            <button tabindex="-1">
                <Bars3Icon class="w-4 h-4 text-white" />
            </button>
            <button tabindex="-1">
                <DocumentDuplicateIcon class="w-4 h-4 text-white" />
            </button>
            <button tabindex="-1" @click="deleteComponent(component)">
                <TrashIcon class="w-4 h-4 text-white" />
            </button>
        </div>
        <div>
            <component 
                :is="componentMap[component.getName()]" 
                :page="page"
                :base-component="component" 
                @pageUpdated="emit('pageUpdated')"
            />
        </div>
    </div>
</template>