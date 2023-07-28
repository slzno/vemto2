<script setup lang="ts">
import Page from "@Common/models/page/Page"
import { defineProps, defineEmits, watch} from "vue"
import useComponentLogic from "./base/useComponentLogic"
import PreviewPageComponent from "@Renderer/views/components/ProjectPage/PreviewPageComponent.vue"

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
const { component } = useComponentLogic(props.baseComponent, emit)
</script>

<template>
    <div v-if="component">
        <div class="columns-1 lg:columns-2">
            <div 
                :id="'firstColumnComponents' + component.id" 
                :component-id="component.id"
                components-container="firstColumnComponents"
                class="rounded border border-slate-600 bg-slate-800 border-dotted p-2 pb-32 space-y-2">
                
                <PreviewPageComponent 
                    v-for="nestedComponent in component.getNestedComponents('firstColumnComponents')"
                    :page="page"
                    :base-component="nestedComponent" 
                    @pageUpdated="emit('pageUpdated')"
                />
            </div>

            <div 
                :id="'secondColumnComponents' + component.id" 
                :component-id="component.id"
                components-container="secondColumnComponents"
                class="rounded border border-slate-600 bg-slate-800 border-dotted p-2 pb-32 space-y-2">
                
                <PreviewPageComponent 
                    v-for="nestedComponent in component.getNestedComponents('secondColumnComponents')"
                    :page="page"
                    :base-component="nestedComponent" 
                    @pageUpdated="emit('pageUpdated')"
                />
            </div>
        </div>
    </div>
</template>