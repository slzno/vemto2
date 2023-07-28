<script setup lang="ts">
    import { useProjectStore } from '@Renderer/stores/useProjectStore'

    import { nextTick, onMounted, ref } from 'vue'
    import { useRoute } from 'vue-router'
    import Page from '@Common/models/page/Page'
    import UiButton from '@Renderer/components/ui/UiButton.vue'
    import UiTabs from '@Renderer/components/ui/UiTabs.vue'
    import UiSelect from '@Renderer/components/ui/UiSelect.vue'
    import UiText from '@Renderer/components/ui/UiText.vue'
    import Sortable from 'sortablejs'
    import Component from '../../common/models/page/components/AbstractComponent'
    import PreviewPageComponent from './components/ProjectPage/PreviewPageComponent.vue'
    
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
                onEnd: onSortableEnd
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
                        onEnd: onSortableEnd
                    })
                })
            })
        })
    })

    const onSortableEnd = (evt) => {
        const componentId = evt.item.getAttribute('component-id') || null, 
            fromKey = evt.from.getAttribute('component-id') || "page",
            toKey = evt.to.getAttribute('component-id') || "page",
            parentKey = evt.to.getAttribute('components-container') || "components"

        console.log(evt.item)

        const movementData = {
            componentId: componentId,
            from: fromKey,
            to: toKey,
            parentKey: parentKey,
            oldIndex: evt.oldIndex,
            newIndex: evt.newIndex
        }

        moveComponent(movementData)
    }

    const moveComponent = (movementData: any) => {
        if(!movementData.componentId) return

        console.log(movementData)

        page.value.moveComponent(movementData)

        loadComponents()
    }

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
                        <PreviewPageComponent 
                            v-for="component in components" :key="component.id"
                            :base-component="component" 
                            @update="updateComponent(component)" 
                            @delete="deleteComponent(component)"
                        />
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
