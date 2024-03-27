<script setup lang="ts">
    import PackageChecker from "@Renderer/codegen/sequential/services/PackageChecker"
    import { RenderableDependency } from "@Renderer/codegen/sequential/services/foundation/Renderable"
    import UiButton from "@Renderer/components/ui/UiButton.vue"
    import UiModal from "@Renderer/components/ui/UiModal.vue"
import Main from "@Renderer/services/wrappers/Main"
    import { ref, onMounted, defineExpose, Ref } from "vue"

    const emit = defineEmits(["close"])

    const showingModal = ref(false),
        composerDependencies = ref([]) as Ref<RenderableDependency[]>,
        packagesDependencies = ref([]) as Ref<RenderableDependency[]>

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

    const openPackagist = (dependency: RenderableDependency) => {
        Main.API.openURL(`https://packagist.org/packages/${dependency.name}`)
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
                                <a @click="openPackagist(dependency)" class="cursor-pointer text-red-400 underline hover:text-red-500">
                                    {{ dependency.name }}
                                </a>
                            </li>
                        </td>
                        <td class="p-2">
                            <li class="list-none" v-for="dependency in packagesDependencies" :key="dependency.name">
                                <a class="cursor-pointer text-red-400 underline hover:text-red-500">
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
                <UiButton>
                    <div>Continue generating</div>
                </UiButton>

                <UiButton>
                    <div>Install Missing Dependencies</div>
                </UiButton>
            </div>
        </template>
    </UiModal>

</template>
