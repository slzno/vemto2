<script setup lang="ts">
    import UiButton from "@Renderer/components/ui/UiButton.vue"
    import { useProjectStore } from "@Renderer/stores/useProjectStore"
    import { ref } from "vue"
    import AppSection from "@Common/models/AppSection"
import UiText from "@Renderer/components/ui/UiText.vue"
import UiCheckbox from "@Renderer/components/ui/UiCheckbox.vue"

    const projectStore = useProjectStore(),
        editingSection = ref<null | AppSection>(null)

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
</script>

<template>
    <div class="mb-3">
        <UiButton>Add Section</UiButton>
    </div>

    <div class="bg-slate-950 p-3 rounded-lg border border-slate-700 h-screen">
        <div
            class="mb-2 border border-slate-700 bg-slate-850 rounded-lg cursor-pointer hover:bg-slate-800 w-2/3 flex justify-between items-center"
            v-for="section in projectStore.project.appSections"
            :key="section.id"
        >
            <div @click="editSection(section)" v-if="isNotEditingSection(section)" class="font-mono w-full h-full p-3 space-x-2 flex justify-between">
                <span>{{ section.name }}</span>
                <small class="text-slate-500">{{ section.getApplicationsCount() }} apps</small>
            </div>
            <div v-else class="p-3">
                <UiText class="mb-3" v-model="editingSection.name" label="Name" />
                <UiText class="mb-3" v-model="editingSection.routePrefix" label="Route prefix" />
                <UiCheckbox class="mb-3" v-model="editingSection.requiresAuth" label="Requires Auth?" />

                <div class="mt-4 flex justify-between">
                    <UiButton @click="cancel">Cancel</UiButton>
                    <UiButton @click="saveSection()">Save</UiButton>
                </div>
            </div>
        </div>
    </div>
</template>
