<script setup lang="ts">
    import UiButton from "@Renderer/components/ui/UiButton.vue"
    import { useProjectStore } from "@Renderer/stores/useProjectStore"
    import { ref, Ref, onMounted } from "vue"
    import UiText from "@Renderer/components/ui/UiText.vue"
    import UiCheckbox from "@Renderer/components/ui/UiCheckbox.vue"
    import { PlusIcon } from "@heroicons/vue/24/outline"
    import Main from "@Renderer/services/wrappers/Main"

    const projectStore = useProjectStore(),
        templates = ref([]) as Ref<string[]>

    onMounted(() => {
        loadTemplates()
    })

    const loadTemplates = async () => {
        setTimeout(async () => {
            templates.value = await Main.API.listTemplates()
        }, 100)
    }
</script>

<template>
    <div class="mb-3 flex space-x-2">
        <!-- <UiButton>
            <PlusIcon class="w-4 h-4 mr-1 text-red-500" />
            Add Section
        </UiButton> -->
    </div>

    <div class="bg-slate-950 p-3 rounded-lg border border-slate-700 h-screen  overflow-y-auto pb-48">
        <pre>
            {{ templates }}
        </pre>
    </div>
</template>