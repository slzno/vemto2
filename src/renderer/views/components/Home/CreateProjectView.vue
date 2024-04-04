<script setup lang="ts">
    import { ref, Ref, onMounted, defineEmits } from "vue"
    import { PlusCircleIcon } from "@heroicons/vue/24/outline"
    import UiButton from "@Renderer/components/ui/UiButton.vue"
    import UiModal from "@Renderer/components/ui/UiModal.vue"
    import Main from "@Renderer/services/wrappers/Main"
    import Alert from "@Renderer/components/utils/Alert"
    import UiText from "@Renderer/components/ui/UiText.vue"
    import UiPathSelector from "@Renderer/components/ui/UiPathSelector.vue"
    import UiCheckbox from "@Renderer/components/ui/UiCheckbox.vue"
    import debounce from "@Common/tools/debounce"
    import ProjectCreator, { ProjectCreatorData } from "@Renderer/services/project/ProjectCreator"
    import PathUtil from "@Common/util/PathUtil"
    import UiSelect from "@Renderer/components/ui/UiSelect.vue"

    const showingModal = ref(false)
    
    const settings = ref({}) as Ref<ProjectCreatorData>,
        errors = ref({}) as Ref<any>,
        creatingProject = ref(false),
        currentState = ref(""),
        projectCreator = new ProjectCreator()

    const emit = defineEmits(["reloadProjectListAndOpenPath"])

    const show = async () => {
        const composerInstalled = await Main.API.composerIsInstalled()
        
        if(!composerInstalled) {
            Alert.warning("Composer was not detected. Please install Composer or set the correct path in the settings to create a new app.")
            return
        }

        showingModal.value = true
    }

    const create = async () => {
        if(creatingProject.value) return

        if(!validate()) return

        createProject()
    }

    const validate = () => {
        if(!settings.value.path?.length) {
            errors.value.path = "The path is required"
        }

        if(!settings.value.name?.length) {
            errors.value.name = "The name is required"
        }

        if(!settings.value.starterKit?.length) {
            errors.value.starterKit = "The starter kit is required"
        }

        if(!settings.value.database?.length) {
            errors.value.database = "The database is required"
        }

        return !Object.values(errors).length
    }

    const createProject = () => {
        creatingProject.value = true

        Main.API.folderExists(settings.value.completePath)
            .then((folderExists: boolean) => {
                if(folderExists) {
                    Alert.error("The folder already exists")
                    creatingProject.value = false
                    
                    return
                }

                settings.value.completePath = PathUtil.join(settings.value.path, settings.value.name)

                projectCreator.create(settings.value, (state) => currentState.value = state)
                    .then(() => {
                        if(projectCreator.hasErrors) return

                        Alert.success("App created successfully")

                        close()
                        emit("reloadProjectListAndOpenPath", settings.value.completePath)
                        
                        resetSettings()
                    })
                    .finally(() => {
                        currentState.value = ""
                        creatingProject.value = false
                    })
            })
            .catch((error) => {
                Alert.error(error.message)
                creatingProject.value = false
            })
    }

    const close = () => {
        showingModal.value = false
    }

    const onProjectNameChanged = debounce(() => {
        if(!settings.value.name?.length) {
            errors.value.name = "The name is required"
            return
        }

        const regex = /^([a-zA-Z0-9\-\_]*)$/g

        if (regex.test(settings.value.name)) {
            delete errors.value.name
            return
        }

        errors.value.name = "Invalid project name"
    }, 250)

    const onProjectPathChanged = debounce(() => {
        if(!settings.value.path?.length) {
            errors.value.path = "The path is required"
            return
        }

        delete errors.value.path
    }, 250)

    const resetSettings = () => {
        settings.value = {
            path: "",
            name: "",
            starterKit: "jetstream",
            database: "mysql"
        } as ProjectCreatorData
    }

    const onStarterKitChanged = () => {
        if(!["jetstream", "breeze"].includes(settings.value.starterKit)) {
            errors.value.starterKit = "Invalid starter kit"
            return
        }

        delete errors.value.starterKit

        if(settings.value.starterKit === "breeze") {
            settings.value.usesJetstreamTeams = false
        }
    }

    const onDatabaseChanged = () => {
        if(!["sqlite", "mysql", "postgresql", "sqlsrv"].includes(settings.value.database)) {
            errors.value.database = "Invalid database"
            return
        }

        delete errors.value.database
    }

    onMounted(() => {
        resetSettings()
    })
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
                    <UiPathSelector v-model="settings.path" label="Project Path" @input="onProjectPathChanged" />

                    <template v-if="errors.path !== undefined">
                        <span class="dark:text-red-500 text-sm pl-2">{{ errors.path }}</span>
                    </template>
                </div>

                <div>
                    <UiText v-model="settings.name" label="App Name" @input="onProjectNameChanged" />

                    <template v-if="errors.name !== undefined">
                        <span class="dark:text-red-500 text-sm pl-2">{{ errors.name }}</span>
                    </template>
                </div>

                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <UiSelect v-model="settings.starterKit" label="UI Starter Kit" @change="onStarterKitChanged">
                            <option value="jetstream">Jetstream</option>
                            <option value="breeze">Breeze</option>
                        </UiSelect>

                        <template v-if="errors.starterKit !== undefined">
                            <span class="dark:text-red-500 text-sm pl-2">{{ errors.starterKit }}</span>
                        </template>
                    </div>
                    <div>
                        <UiSelect v-model="settings.database" label="Database" @change="onDatabaseChanged">
                            <option value="sqlite">SQLite</option>
                            <option value="mysql">MySQL</option>
                            <option value="postgresql">PostgreSQL</option>
                            <option value="sqlsrv">SQL Server</option>
                        </UiSelect>

                        <template v-if="errors.database !== undefined">
                            <span class="dark:text-red-500 text-sm pl-2">{{ errors.database }}</span>
                        </template>
                    </div>
                </div>

                <div v-if="settings.starterKit === 'jetstream'">
                    <UiCheckbox v-model="settings.usesJetstreamTeams" label="Use Jetstream Teams" />
                </div>

                <div class="flex justify-end">
                    <UiButton :disabled="Object.values(errors).length > 0" @click="create()">
                        <span>Create App</span>
                    </UiButton>
                </div>
            </div>

            <div v-if="creatingProject" class="space-y-2 p-4 mt-2 bg-slate-950 rounded-b-lg border-t border-slate-700">
                <span class="text-sm">{{ currentState }}</span>
                <span class="points-animation relative"></span>
            </div>
        </UiModal>
    </div>
</template>
<style>
.points-animation::after {
    content: '.';
    animation: points 1.5s infinite;
}

@keyframes points {
    45% {
        content: '..';
    }
    80% {
        content: '...';
    }
}
</style>