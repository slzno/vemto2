<script setup lang="ts">
    import SequentialGenerator from "@Renderer/codegen/sequential/SequentialGenerator"
    import PackageChecker from "@Renderer/codegen/sequential/services/PackageChecker"
    import { RenderableDependency } from "@Renderer/codegen/sequential/services/foundation/Renderable"
    import UiButton from "@Renderer/components/ui/UiButton.vue"
    import UiModal from "@Renderer/components/ui/UiModal.vue"
    import Alert from "@Renderer/components/utils/Alert"
    import Main from "@Renderer/services/wrappers/Main"
    import { useProjectStore } from "@Renderer/stores/useProjectStore"
    import { ref, defineExpose, Ref, nextTick } from "vue"

    const emit = defineEmits(["close", "generate"])

    const showingModal = ref(false),
        composerDependencies = ref([]) as Ref<RenderableDependency[]>,
        packagesDependencies = ref([]) as Ref<RenderableDependency[]>,
        installing = ref(false),
        currentState = ref("")

    const projectStore = useProjectStore()

    const show = async (packageChecker: PackageChecker) => {
        showingModal.value = true

        composerDependencies.value = packageChecker.getComposerMissingDependencies()
        packagesDependencies.value = packageChecker.getPackagesMissingDependencies()
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
            
            if(installing.value) {
                Alert.success("Dependencies installed successfully")
                installing.value = false
            }

            emit('generate')
            
            close()
        } catch (error: any) {
            installing.value = false

            throw error
        }
    }

    const installComposerDependencies = async () => {
        currentState.value = "Installing Composer dependencies"

        for (const dependency of composerDependencies.value) {
            await Main.API.executeComposerOnProject(`require ${dependency.name}`)
        }

    }

    const installPackagesDependencies = async () => {
        currentState.value = "Installing Packages dependencies"

        for (const dependency of packagesDependencies.value) {
            await Main.API.executeYarnOnProject(`add ${dependency.name}`)
        }
    }

    const justGenerate = () => {
       const sequentialGenerator = new SequentialGenerator(projectStore.project)

        nextTick(() => {
            emit('generate')
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
                        <a class="text-red-400">
                            {{ dependency.name }}
                        </a>
                    </li>
                </div>
            </template>

            <template v-if="packagesDependencies.length">
                <div class="mt-4">
                    <span>Packages</span>
                    <li class="list-none" v-for="dependency in packagesDependencies" :key="dependency.name">
                        <a class="text-red-400">
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
                <UiButton @click="justGenerate()">
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