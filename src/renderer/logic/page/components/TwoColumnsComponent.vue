<script setup lang="ts">
import { defineProps, defineEmits, watch} from "vue"
import useComponentLogic from "./base/useComponentLogic"
import PreviewPageComponent from "@Renderer/views/components/ProjectPage/PreviewPageComponent.vue"

const props = defineProps({
    baseComponent: {
        type: Object,
        required: true,
    },
})

const emit = defineEmits(["update"])
const { component } = useComponentLogic(props.baseComponent, emit)
</script>

<template>
    <div v-if="component">
        <div class="columns-1 lg:columns-2">
            <div 
                :id="'firstColumnComponents' + component.id" 
                :component-id="component.id"
                components-container="firstColumnComponents"
                class="border border-slate-600 bg-slate-800 border-dotted p-2 pb-32 space-y-1">
                
                <PreviewPageComponent 
                    v-for="nestedComponent in component.getNestedComponents('firstColumnComponents')"
                    :base-component="nestedComponent" 
                    @update="$emit('update', nestedComponent)"
                />
            </div>

            <div 
                :id="'secondColumnComponents' + component.id" 
                :component-id="component.id"
                components-container="secondColumnComponents"
                class="border border-slate-600 bg-slate-800 border-dotted p-2 pb-32 space-y-1">
                
                <PreviewPageComponent 
                    v-for="nestedComponent in component.getNestedComponents('secondColumnComponents')"
                    :base-component="nestedComponent" 
                    @update="$emit('update', nestedComponent)"
                />
            </div>
        </div>
    </div>
</template>