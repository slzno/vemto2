<script setup lang="ts">
    // import { useProjectStore } from '@Renderer/stores/useProjectStore'

    import { onMounted, ref } from 'vue'
    import { useRoute } from 'vue-router'
    import Page from '@Common/models/Page'

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
            Page editor {{ pageId }} {{ page.getFileName() }}
        </div>
    </div>
</template>
