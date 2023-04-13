<script setup lang="ts">
    // import { useProjectStore } from '@Renderer/stores/useProjectStore'

    import { onMounted, ref } from 'vue'
    import { useRoute } from 'vue-router'
    import Page from '@Common/models/Page'
import UiButton from '@Renderer/components/ui/UiButton.vue';

    // const projectStore = useProjectStore()

    // get pageId from route params
    const route = useRoute(),
        pageId = route.params.pageId,
        page = ref(null)

    onMounted(() => {
        page.value = Page.find(pageId)
    })
</script>

<template>
    <div
        class="bg-slate-100 dark:bg-slate-900 w-full h-full relative overflow-hidden p-4"
    >
        <div v-if="page">
            Page editor: {{ page.getFileName() }}

            <div>
                <UiButton>Add Section</UiButton>
                <UiButton>Add Datatable</UiButton>
                <UiButton>Add Text Input</UiButton>
                <UiButton>Add Button</UiButton>
                <UiButton>Add Hero</UiButton>
                <UiButton>Add Title</UiButton>
            </div>
        </div>
    </div>
</template>
