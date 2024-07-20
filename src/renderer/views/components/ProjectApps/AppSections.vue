<script setup lang="ts">
    import UiButton from "@Renderer/components/ui/UiButton.vue"
    import { useProjectStore } from "@Renderer/stores/useProjectStore"
    import { ref, Ref, onMounted } from "vue"
    import AppSection from "@Common/models/AppSection"
    import UiText from "@Renderer/components/ui/UiText.vue"
    import UiCheckbox from "@Renderer/components/ui/UiCheckbox.vue"
    import GenerateBasicSections from "@Renderer/services/project/GenerateBasicSections"
    import { PlusIcon } from "@heroicons/vue/24/outline"

    const projectStore = useProjectStore(),
        editingSection = ref<null | AppSection>(null),
        appSections = ref([]) as Ref<AppSection[]>

    onMounted(() => {
        loadSections()
    })

    const loadSections = () => {
        setTimeout(() => {
            appSections.value = projectStore.project.appSections
        }, 100)
    }

    const editSection = (section: AppSection) => {
        editingSection.value = section
    }

    const isEditingSection = (section: AppSection) => {
        if (!editingSection.value) return false
        return editingSection.value.id === section.id
    }

    const isNotEditingSection = (section: AppSection) => {
        return !isEditingSection(section)
    }

    const saveSection = () => {
        editingSection.value.save()

        cancel()
    }

    const cancel = () => {
        editingSection.value = null
    }

    const addSection = () => {
        const section = new AppSection({
            name: "New section",
            routePrefix: "",
            requiresAuth: false,
            projectId: projectStore.project.id
        })

        section.save()

        appSections.value.push(section)
    }

    const addDefaultSections = async () => {
        await new GenerateBasicSections(projectStore.project).handle()

        loadSections()
    }

    const deleteSection = async (section: AppSection) => {
        const confirmed = await window.projectConfirm("Are you sure you want to delete this section? This will remove all related apps.")

        if(!confirmed) return
        
        section.delete()

        appSections.value = appSections.value.filter(s => s.id !== section.id)
    }
</script>

<template>
    <div class="mb-3 flex space-x-2">
        <UiButton @click="addSection()">
            <PlusIcon class="w-4 h-4 mr-1 text-red-500" />
            Add Section
        </UiButton>
        <UiButton @click="addDefaultSections()">
            <PlusIcon class="w-4 h-4 mr-1 text-red-500" />
            Add Default Sections
        </UiButton>
    </div>

    <div class="bg-slate-950 p-3 rounded-lg border border-slate-700 h-screen  overflow-y-auto pb-48">
        <div
            class="mb-2 border border-slate-700 bg-slate-850 rounded-lg cursor-pointer hover:bg-slate-800 w-2/3 flex justify-between items-center"
            v-for="section in appSections"
            :key="section.id"
        >
            <div @click="editSection(section)" v-if="isNotEditingSection(section)" class="w-full h-full p-3 space-x-2 flex justify-between">
                <span>{{ section.name }}</span>
                <small class="text-slate-500">{{ section.getApplicationsCount() }} apps</small>
            </div>
            <div v-else class="p-3 w-full">
                <UiText class="mb-3" v-model="editingSection.name" label="Name" />
                <UiText class="mb-3" v-model="editingSection.routePrefix" label="Route prefix" />
                <UiText class="mb-3" v-model="editingSection.routeBasePath" label="Route base path" />
                <UiCheckbox class="mb-3" v-model="editingSection.requiresAuth" label="Requires Auth?" />

                <div class="mt-4 flex justify-between">
                    <div class="flex space-x-2">
                        <UiButton @click="deleteSection(editingSection)">Delete</UiButton>
                    </div>
                    
                    <div class="flex space-x-2">
                        <UiButton @click="cancel">Cancel</UiButton>
                        <UiButton @click="saveSection()">Save</UiButton>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>