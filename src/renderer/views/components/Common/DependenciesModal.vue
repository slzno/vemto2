<script setup lang="ts">
    import Project from "@Common/models/Project"
    import RenderableFile from "@Common/models/RenderableFile"
    import PackageChecker from "@Renderer/codegen/sequential/services/PackageChecker"
    import { RenderableDependency } from "@Renderer/codegen/sequential/services/foundation/Renderable"
    import UiButton from "@Renderer/components/ui/UiButton.vue"
    import UiModal from "@Renderer/components/ui/UiModal.vue"
    import Alert from "@Renderer/components/utils/Alert"
    import Main from "@Renderer/services/wrappers/Main"
    import { ref, defineExpose, Ref, nextTick } from "vue"

    const emit = defineEmits(["close", "forceGeneration"])

    const showingModal = ref(false),
        composerDependencies = ref([]) as Ref<RenderableDependency[]>,
        packagesDependencies = ref([]) as Ref<RenderableDependency[]>,
        installing = ref(false),
        currentState = ref("")

    const show = async (packageChecker: PackageChecker) => {
        showingModal.value = true

        composerDependencies.value = packageChecker.getComposerDependenciesMissing()
        packagesDependencies.value = packageChecker.getPackagesDependenciesMissing()
    }

    const close = () => {
        showingModal.value = false

        emit("close")
    }

    const installMissingDependencies = async () => {
        installing.value = true

        try {
            await installComposerDependencies()
            await installPackagesDependencies()

            close()
            
            if(installing.value) {
                Alert.success("Dependencies installed successfully")
                installing.value = false
            }
        } catch (error: any) {
            Alert.error(error.message)
        }
    }

    const onDependencyInstallError = (error: any) => {
        installing.value = false

        Alert.error(error.message)
    }

    const installComposerDependencies = async () => {
        currentState.value = "Installing Composer dependencies"

        await Promise.all(
            composerDependencies.value.map(async (dependency) => {
                await Main.API.executeComposerOnProject(`require ${dependency.name}`)
            })
        ).then(() => {}, (error) => onDependencyInstallError(error))
    }

    const installPackagesDependencies = async () => {
        currentState.value = "Installing Packages dependencies"

        await Promise.all(
            packagesDependencies.value.map(async (dependency) => {
                await Main.API.executeYarnOnProject(`add ${dependency.name}`)
            })
        ).then(() => {}, (error) => onDependencyInstallError(error))
    }

    const generateWithMissingDependencies = () => {
        let templatePaths = []

        composerDependencies.value.forEach((dependency) => {
            templatePaths.push(...dependency.templatePaths)
        })

        packagesDependencies.value.forEach((dependency) => {
            templatePaths.push(...dependency.templatePaths)
        })

        templatePaths = [...new Set(templatePaths)]

        const project: Project = Project.find(1)

        if(!project) return

        templatePaths.forEach((path: string) => {
            const renderableFile: RenderableFile = project.getRenderableFileByTemplatePath(path)

            if(!renderableFile) return

            renderableFile.setAsSkipped()
        })

        nextTick(() => {
            emit("forceGeneration")
            close()
        })
    }

    defineExpose({
        show,
        close,
    })
</script>

<template>
    <UiModal
        width="700px"
        title="Dependencies Missing"
        :show="showingModal"
        :processing="installing"
        @close="close"
    >
        <div class="p-4">
            <template v-if="composerDependencies.length">
                <div>
                    <span>Composer</span>
                    <li class="list-none" v-for="dependency in composerDependencies" :key="dependency.name">
                        <a class="text-red-400 underline hover:text-red-500">
                            {{ dependency.name }}
                        </a>
                    </li>
                </div>
            </template>

            <template v-if="packagesDependencies.length">
                <div class="mt-4">
                    <span>Packages</span>
                    <li class="list-none" v-for="dependency in packagesDependencies" :key="dependency.name">
                        <a class="text-red-400 underline hover:text-red-500">
                            {{ dependency.name }}
                        </a>
                    </li>
                </div>
            </template>
        </div>

        <div v-if="installing" class="space-y-2 p-4 mt-2 bg-slate-950 rounded-b-lg border-t border-slate-700">
            <span class="text-sm">{{ currentState }}</span>
            <span class="points-animation relative"></span>
        </div>

        <template #footer>
            <div class="flex justify-between p-2">
                <UiButton @click="generateWithMissingDependencies()">
                    <div>Continue generating</div>
                </UiButton>

                <UiButton @click="installMissingDependencies()">
                    <div>Install Missing Dependencies</div>
                </UiButton>
            </div>
        </template>
    </UiModal>

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