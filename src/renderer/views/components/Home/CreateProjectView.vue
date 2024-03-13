<script setup lang="ts">
    import { PlusCircleIcon } from "@heroicons/vue/24/outline"
    import UiButton from "@Renderer/components/ui/UiButton.vue"
    import UiModal from "@Renderer/components/ui/UiModal.vue"
    import { ref, Ref } from "vue"
    import Main from "@Renderer/services/wrappers/Main"
    import Alert from "@Renderer/components/utils/Alert"
    import UiText from "@Renderer/components/ui/UiText.vue"
    import UiPathSelector from "@Renderer/components/ui/UiPathSelector.vue"
    import UiCheckbox from "@Renderer/components/ui/UiCheckbox.vue"
    import debounce from "@Common/tools/debounce"
    import { ProjectCreatorData } from "@Renderer/services/project/ProjectCreator"

    const showingModal = ref(false)
    
    const settings = ref({}) as Ref<ProjectCreatorData>,
        errors = ref({}) as Ref<any>,
        creatingProject = ref(false)

    const show = async () => {
        const composerInstalled = await Main.API.composerIsInstalled()
        
        if(!composerInstalled) {
            Alert.warning("Composer was not detected. Please install Composer or set the correct path in the settings to create a new app.")
            return
        }

        showingModal.value = true
    }

    const create = () => {
        creatingProject.value = true
    }

    const close = () => {
        showingModal.value = false
    }

    const onProjectNameChanged = debounce(() => {
        const regex = /^([a-zA-Z0-9\-\_]*)$/g

        if (regex.test(settings.value.name)) {
            delete errors.value.name
            return
        }

        errors.value.name = "Invalid project name"
    }, 250)
</script>
<template>
    <div>
        <UiButton class="gap-1.5" @click="show()">
            <PlusCircleIcon class="w-5 h-5 text-red-500" />
            New App
        </UiButton>

        <UiModal
            title="Create New App"
            :show="showingModal"
            :processing="creatingProject"
            @close="close()"
            width="700px"
        >
            <div class="space-y-2 p-4">
                <div>
                    <UiPathSelector v-model="settings.path" label="Project Path" />
                </div>

                <div>
                    <UiText v-model="settings.name" label="App Name" @input="onProjectNameChanged" />

                    <template v-if="errors.name !== undefined">
                        <span class="dark:text-red-500 text-sm pl-2">{{ errors.name }}</span>
                    </template>
                </div>

                <div>
                    <UiCheckbox v-model="settings.usesJetstreamTeams" label="Use Jetstream Teams" />
                </div>

                <div class="flex justify-end">
                    <UiButton :disabled="Object.values(errors).length > 0" @click="create()">
                        <span>Create App</span>
                    </UiButton>
                </div>
            </div>
        </UiModal>
    </div>
</template>