<script setup lang="ts">
    // import { useProjectStore } from '@Renderer/stores/useProjectStore'

    import { onMounted, ref } from 'vue'
    import PreviewPageComponent from '@Renderer/views/components/ProjectPage/PreviewPageComponent.vue'
    import { useRoute } from 'vue-router'
    import Page from '@Common/models/page/Page'
    import UiButton from '@Renderer/components/ui/UiButton.vue'
    import HandleProjectDatabase from '@Renderer/services/HandleProjectDatabase'
    import UiTabs from '@Renderer/components/ui/UiTabs.vue'
    import UiSelect from '@Renderer/components/ui/UiSelect.vue'
    import UiText from '@Renderer/components/ui/UiText.vue'
    import { Bars3Icon, DocumentDuplicateIcon, TrashIcon } from '@heroicons/vue/24/outline'

    // const projectStore = useProjectStore()

    // get pageId from route params
    const route = useRoute(),
        pageId = route.params.pageId,
        page = ref(null),
        selectedComponent = ref(null)

    const selectedTab = ref("page")

    const tabs = [
        { label: "Page", value: "page" },
        { label: "Logic", value: "logic" },
        { label: "Settings", value: "settings" },
    ]

    onMounted(async () => {
        await HandleProjectDatabase.populate(() => {
            page.value = Page.find(pageId)
        })
    })

    const addComponent = (type: string) => {
        page.value.addComponent({
            type: type,
            settings: {}
        })
    }

    const deleteComponent = (component: any) => {
        page.value.removeComponent(component)
    }

    const selectComponent = (component: any) => {
        selectedComponent.value = component
    }

    const updateComponent = (component: any) => {
        page.value.updateComponent(component)
    }

    const isSelected = (component: any) => {
        if (!selectedComponent.value) return false

        return selectedComponent.value.id === component.id
    }
</script>

<template>
    <div
        class="bg-slate-100 dark:bg-slate-900 w-full h-full relative overflow-hidden"
    >
        <div v-if="page">
            <div class="p-2 font-bold">Edit {{ page.getLabel() }} Page</div>

            <UiTabs :tabs="tabs" v-model="selectedTab" :external="true" />

            <section class="flex w-full h-screen space-x-4 mt-2 px-2" v-if="selectedTab === 'page'">
                <div class="space-y-2">
                    <small>Basic</small>
                    <UiButton class="w-full">Section</UiButton>
                    <UiButton class="w-full" @click="addComponent('HeaderOne')">H1</UiButton>
                    <UiButton class="w-full">H2</UiButton>
                    <UiButton class="w-full">Small</UiButton>
                    <UiButton class="w-full" @click="addComponent('Paragraph')">Paragraph</UiButton>
                    <small>Logic</small>
                    <UiButton class="w-full">If</UiButton>
                    <UiButton class="w-full">If...Else</UiButton>
                    <UiButton class="w-full">Foreach</UiButton>
                    <UiButton class="w-full">Forelse</UiButton>
                    <small>Custom</small>
                    <UiButton class="w-full">Navbar</UiButton>
                    <UiButton class="w-full">Post Item</UiButton>
                </div>

                <div class="flex-grow bg-slate-950 p-2 rounded-lg space-y-1">
                    <div v-for="component in page.getComponents()" :key="component.id" @click="selectComponent(component)" :class="{'border-red-500': isSelected(component)}" class="relative border border-dotted border-slate-600 rounded-md p-4 hover:border-red-500 cursor-pointer group">
                        <div class="absolute top-0 right-0 bg-red-500 p-1.5 px-2 flex justify-between space-x-2 rounded-tr rounded-bl opacity-0 group-hover:opacity-100">
                            <div class="py-0.5 px-1 text-sm rounded bg-red-600">
                                {{ component.getLabel() }}
                            </div>

                            <button>
                                <Bars3Icon class="w-6 h-6 text-white" />
                            </button>
                            <button>
                                <DocumentDuplicateIcon class="w-6 h-6 text-white" />
                            </button>
                            <button @click="deleteComponent(component)">
                                <TrashIcon class="w-6 h-6 text-white" />
                            </button>
                        </div>
                        <div>
                            <PreviewPageComponent :component="component" @update="updateComponent(component)" />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </div>
</template>
