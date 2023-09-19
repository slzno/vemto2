<script setup lang="ts">
    import { ref } from "vue";
    import { useProjectStore } from "@Renderer/stores/useProjectStore"
    import RecursiveNav from "./RecursiveNav.vue"
    import UiButton from "@Renderer/components/ui/UiButton.vue";
    import Nav from "@Common/models/Nav";

    const projectStore = useProjectStore(),
        editingNavigation = ref<null | Nav>(null)

    const editNavigation = (navigation: Nav) => {
        if(navigation.id === editingNavigation.value?.id) return

        editingNavigation.value = navigation
    }

    const cancelEditing = () => {
        editingNavigation.value = null
    }

    const saveNavigation = (navigation: Nav) => {
        navigation.save()

        cancelEditing()
    }
</script>

<template>

    <div class="mb-3">
        <UiButton>Add Menu Item</UiButton>
    </div>

    <div class="bg-slate-950 p-3 rounded-lg border border-slate-700 h-screen">
        <div
            v-for="nav in projectStore.project.getRootNavs()"
            :key="nav.id"
        >
            <RecursiveNav
                :nav="nav"
                :editing-navigation="editingNavigation"
                @editNavigation="editNavigation"
                @cancelEditing="cancelEditing"
                @saveNavigation="saveNavigation"
            />
        </div>
    </div>

</template>
