<script setup lang="ts">
    import { useProjectStore } from '@Renderer/stores/useProjectStore'

    import { nextTick, onMounted, ref } from 'vue'
    import PreviewPageComponent from '@Renderer/views/components/ProjectPage/PreviewPageComponent.vue'
    import { useRoute } from 'vue-router'
    import Page from '@Common/models/page/Page'
    import UiButton from '@Renderer/components/ui/UiButton.vue'
    import UiTabs from '@Renderer/components/ui/UiTabs.vue'
    import UiSelect from '@Renderer/components/ui/UiSelect.vue'
    import UiText from '@Renderer/components/ui/UiText.vue'
    import Sortable from 'sortablejs'
    import { Bars3Icon, DocumentDuplicateIcon, TrashIcon } from '@heroicons/vue/24/outline'
    import Component from '../../common/models/page/components/AbstractComponent'

    const projectStore = useProjectStore()

    const route = useRoute(),
        pageId = route.params.pageId,
        page = ref(null),
        selectedComponent = ref(null),
        components = ref([])

    const selectedTab = ref("page")

    const tabs = [
        { label: "Page", value: "page" },
        { label: "Logic", value: "logic" },
        { label: "Settings", value: "settings" },
    ]

    let sortable = null

    onMounted(async () => {
        page.value = Page.find(pageId)

        loadComponents()

        nextTick(() => {
            new Sortable(document.getElementById('componentsContainer'), {
                group: "shared",
                animation: 150,
                fallbackOnBody: true,
                swapThreshold: 0.65,
            })

            components.value.forEach((component: Component) => {
                if(!component.hasNestedComponents()) return

                const keys = component.getNestedComponentsKeys()
                
                keys.forEach((key: string) => {
                    const componentsContainerId = `${key}${component.id}`

                    new Sortable(document.getElementById(componentsContainerId), {
                        group: "shared",
                        animation: 150,
                        fallbackOnBody: true,
                        swapThreshold: 0.65,
                    })
                })
            })
        })
    })

    const loadComponents = () => {
        components.value = page.value.getComponents()
    }

    const addComponent = (type: string) => {
        page.value.addComponent({
            type: type,
            category: 'block',
            settings: {}
        })

        loadComponents()
    }

    const addForelseComponent = () => {
        page.value.addComponent({
            type: 'Forelse',
            subType: 'forelse',
            category: 'logic',
            settings: {}
        })

        page.value.addComponent({
            type: 'Forelse',
            subType: 'empty',
            category: 'logic',
            settings: {}
        })

        page.value.addComponent({
            type: 'Forelse',
            subType: 'endforelse',
            category: 'logic',
            settings: {}
        })

        loadComponents()
    }

    const deleteComponent = (component: any) => {
        page.value.removeComponent(component)

        loadComponents()
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

    const saveComponentsOrder = () => {
        page.value.saveComponentsOrder(components.value)
    }
</script>

<template>
    <div
        class="bg-slate-100 dark:bg-slate-900 w-full h-full relative overflow-hidden"
    >
        <!-- <div id="dropzone1" class="dropzone p-2 bg-green-300">
            <div class="item w-20 h-20 bg-red-200 border border-slate-900 m-2"></div>
            <div class="item w-20 h-20 bg-red-200 border border-slate-900 m-2"></div>

            <div class="item w-20 h-20 bg-red-200 border border-slate-900 m-2">
                <div id="dropzone2" class="dropzone p-2 bg-green-300"></div>
            </div>
        </div> -->

        <div v-if="page">
            <div class="p-2 font-bold">Edit {{ page.getLabel() }} Page</div>

            <UiTabs :tabs="tabs" v-model="selectedTab" :external="true" />

            <section class="flex w-full h-screen space-x-4 mt-2 px-2" v-if="selectedTab === 'page'">
                <div class="space-y-2">
                    <small>Basic</small>
                    <UiButton class="w-full" @click="addComponent('TwoColumns')">Two Columns</UiButton>
                    <UiButton class="w-full" @click="addComponent('Custom')">Custom</UiButton>
                    <UiButton class="w-full">Section</UiButton>
                    <UiButton class="w-full" @click="addComponent('HeaderOne')">H1</UiButton>
                    <UiButton class="w-full">H2</UiButton>
                    <UiButton class="w-full" @click="addComponent('Small')">Small</UiButton>
                    <UiButton class="w-full" @click="addComponent('Paragraph')">Paragraph</UiButton>
                    <small>Logic</small>
                    <UiButton class="w-full">If</UiButton>
                    <UiButton class="w-full">If...Else</UiButton>
                    <UiButton class="w-full">Foreach</UiButton>
                    <UiButton class="w-full" @click="addForelseComponent()">Forelse</UiButton>
                    <small>Custom</small>
                    <UiButton class="w-full">Navbar</UiButton>
                    <UiButton class="w-full">Post Item</UiButton>
                </div>

                <div class="w-full h-full">
                    <div id="componentsContainer" class="flex-grow bg-slate-950 p-2 rounded-lg space-y-1">
                        <div @click="selectComponent(component)"
                            v-for="component in components" :key="component.id" 
                            :class="{'border-red-500': isSelected(component), 'bg-red-450 text-white text-sm w-2/5 p-1 font-mono': component.category === 'logic'}" 
                            class="relative border border-dotted border-slate-600 rounded-md p-2 hover:border-red-500 cursor-move group"
                        >
                            <div class="absolute top-0 right-0 bg-red-500 p-1.5 px-2 flex justify-between space-x-2 rounded-tr rounded-bl opacity-0 group-hover:opacity-100">
                                <div class="py-0.5 px-1 text-sm rounded bg-red-600">
                                    {{ component.getLabel() }}
                                </div>

                                <button tabindex="-1">
                                    <Bars3Icon class="w-6 h-6 text-white" />
                                </button>
                                <button tabindex="-1">
                                    <DocumentDuplicateIcon class="w-6 h-6 text-white" />
                                </button>
                                <button tabindex="-1" @click="deleteComponent(component)">
                                    <TrashIcon class="w-6 h-6 text-white" />
                                </button>
                            </div>
                            <div>
                                <PreviewPageComponent :base-component="component" @update="updateComponent(component)" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section class="flex flex-col w-full h-screen space-y-4 mt-2 px-2 pb-40 overflow-scroll" v-if="selectedTab === 'settings'">
                <div>
                    <UiSelect v-model="page.sectionId" label="Section" @change="page.save()" >
                        <option :value="null" disabled>Select a section</option>
                        <option v-for="section in projectStore.project.appSections" :value="section.id" :key="section.id">{{ section.name }}</option>
                    </UiSelect>

                    <UiText v-model="page.namespace" label="Namespace" @input="page.save()" />

                    <UiText v-model="page.livewireComponentName" label="Component Name" @input="page.save()" />

                    <b>Route:</b>
                    <div v-for="route in page.routes" :key="route.id">
                        <UiText v-model="route.path" label="Route path" @input="route.save()" />
                    </div>
                </div>
            </section>
        </div>
    </div>
</template>
