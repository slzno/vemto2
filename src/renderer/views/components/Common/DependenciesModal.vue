<script setup lang="ts">
    import PackageChecker from "@Renderer/codegen/sequential/services/PackageChecker"
    import { RenderableDependency } from "@Renderer/codegen/sequential/services/foundation/Renderable"
    import UiButton from "@Renderer/components/ui/UiButton.vue"
    import UiModal from "@Renderer/components/ui/UiModal.vue"
import Alert from "@Renderer/components/utils/Alert"
    import Main from "@Renderer/services/wrappers/Main"
    import { ref, onMounted, defineExpose, Ref } from "vue"

    const emit = defineEmits(["close"])

    const showingModal = ref(false),
        composerDependencies = ref([]) as Ref<RenderableDependency[]>,
        packagesDependencies = ref([]) as Ref<RenderableDependency[]>,
        installing = ref(false)

    onMounted(() => {
        fetchMissingDependencies()
    })

    const fetchMissingDependencies = () => {
        composerDependencies.value = PackageChecker.getComposerDependenciesMissing()
        packagesDependencies.value = PackageChecker.getPackagesDependenciesMissing()
    }

    const show = async () => {
        showingModal.value = true

        fetchMissingDependencies()
    }

    const close = () => {
        showingModal.value = false

        emit("close")
    }

    const installMissingDependencies = async () => {
        let hasErrors = false

        installing.value = true

        try {
            await installComposerDependencies()
            await installPackagesDependencies()
        } catch (error: any) {
            hasErrors = true
            Alert.error("Failed to install dependencies")
        } finally {
            installing.value = false

            if(hasErrors) return

            Alert.success("Dependencies installed successfully")
            close()
        }
    }

    const installComposerDependencies = async () => {
        await Promise.all(
                composerDependencies.value.map(async (dependency) => {
                    await Main.API.executeComposerOnProject(`require ${dependency.name}`)
                })
            ).catch(e => {
                Alert.error("Failed to install composer dependencies: " + e.message)
                installing.value = false

                throw new Error(e)
            })
    }

    const installPackagesDependencies = async () => {
        await Promise.all(
                packagesDependencies.value.map(async (dependency) => {
                    await Main.API.executeYarnOnProject(`add ${dependency.name}`)
                })
            ).catch(e => {
                Alert.error("Failed to install yarn dependencies: " + e.message)
                installing.value = false
                
                throw new Error(e)
            })
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

        templatePaths.forEach((path: string) => {
            // do something
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
        @close="close"
    >
        <div class="p-4">
            <table class="w-full">
                <thead>
                    <tr>
                        <th class="text-left p-2">Composer</th>
                        <th class="text-left p-2">Packages</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="p-2">
                            <li class="list-none" v-for="dependency in composerDependencies" :key="dependency.name">
                                <a class="text-red-400 underline hover:text-red-500">
                                    {{ dependency.name }}
                                </a>
                            </li>
                        </td>
                        <td class="p-2">
                            <li class="list-none" v-for="dependency in packagesDependencies" :key="dependency.name">
                                <a class="text-red-400 underline hover:text-red-500">
                                    {{ dependency.name }}
                                </a>
                            </li>
                        </td>
                    </tr>
                </tbody>
            </table>
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
