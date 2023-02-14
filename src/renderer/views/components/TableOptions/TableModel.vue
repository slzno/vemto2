<script setup lang="ts">
    import { PropType, Ref, toRef, watch } from "vue"
    import Model from "@Common/models/Model"
    import debounce from "@Common/tools/debounce"
    // import UiText from "@Renderer/components/ui/UiText.vue"
    // import { Bars3Icon, ChevronDownIcon } from "@heroicons/vue/24/outline"
    // import UiCheckbox from "@Renderer/components/ui/UiCheckbox.vue"
    // import UiSelect from "@Renderer/components/ui/UiSelect.vue"

    const props = defineProps({
        model: {
            type: Object as PropType<Model>,
            required: true,
        },
    })

    const model = toRef(props, "model") as Ref<Model>

    watch(() => model.value.name, () => {
        saveColunm()
    })

    // debounced
    const saveColunm = debounce(() => {
        model.value.saveFromInterface()
    }, 500)
</script>

<template>
    <div
        class="relative flex-col bg-slate-800 border-l-4 border-slate-700 p-2 rounded-xl shadow"
    >
        <div>
            Model {{ model.name }}
        </div>
    </div>
</template>
