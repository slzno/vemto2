<script setup lang="ts">
import Page from "@Common/models/page/Page"
import { defineProps, defineEmits, watch} from "vue"
import useComponentLogic from "./base/useComponentLogic"

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
        <input 
            spellcheck="false"
            autocomplete="off"
            v-model="component.settings.content"
            class="text-xs outline-none bg-transparent w-full"
        />
    </div>
</template>