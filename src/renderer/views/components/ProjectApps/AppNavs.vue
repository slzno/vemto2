<script setup lang="ts">
    import { ref, onMounted } from "vue";
    import Draggable from 'vuedraggable';
    import Nav from "@Common/models/Nav";
    import RecursiveNav from "./RecursiveNav.vue"
    import UiText from "@Renderer/components/ui/UiText.vue";
    import UiModal from "@Renderer/components/ui/UiModal.vue";
    import UiButton from "@Renderer/components/ui/UiButton.vue";
    import UiSelect from "@Renderer/components/ui/UiSelect.vue";
    import { useProjectStore } from "@Renderer/stores/useProjectStore";

    const projectStore = useProjectStore(),
        editingNavigation = ref<null | Nav>(null),
        showingCreateNavigationModal = ref<boolean>(false),
        navigations = ref<Nav[]>([])

    const navigableId = ref<number | null>(null),
        navigableType = ref<string | null>("Crud"),
        name = ref<string | null>(null)

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

    const createNavigation = () => {
        if(!navigableId.value || !navigableType.value || !name.value) return

        const nav = new Nav({
            name: name.value,
            navigableId: navigableId.value,
            navigableType: navigableType.value,
            projectId: projectStore.project.id
        })

        nav.save()

        resetModalData()
        close()

        navigations.value = projectStore.project.getRootNavs()
    }

    const resetModalData = () => {
        navigableId.value = null
        navigableType.value = null
        name.value = null
    }

    const close = () => {
        showingCreateNavigationModal.value = false
    }

    const saveNavigationOrder = (event) => {
        const { newIndex, oldIndex, movedContext } = event;
        console.log(event, movedContext)
        const movedNavigation = movedContext.element;

        console.log(movedNavigation)
        // const newParentNav = projectStore.project.getRootNavs().find(nav => nav.children.includes(movedNavigation));

        // movedNavigation.parentNavId = newParentNav ? newParentNav.id : null;

        // navigation.children.forEach((nav: Nav) => nav.save())
    }

    onMounted(() => {
        navigations.value = projectStore.project.getRootNavs()
    })
</script>

<template>
    <div class="mb-3">
        <UiButton @click="showingCreateNavigationModal = true">Add Menu Item</UiButton>
    </div>

    <UiModal
        title="Create Navigation"
        :show="showingCreateNavigationModal"
        @close="close()"
        width="25%"
    >
        <div class="m-2">
            <div class="m-1 flex flex-col gap-2">
                <UiText id="navigation-name" v-model="name" label="Name" />

                <UiSelect v-model="navigableType" label="Navigable Type">
                    <option :value="null" disabled>Select a Navigable Type</option>
                    <option value="Crud">Crud</option>
                    <option value="Page">Page</option>
                </UiSelect>

                <UiSelect v-model="navigableId" label="Crud">
                    <option :value="null" disabled>Select a Crud</option>
                    <option v-for="crud in projectStore.project.cruds" :value="crud.id" :key="crud.id">{{ crud.name }}</option>
                </UiSelect>
            </div>

            <div class="m-1 mt-2 flex justify-end">
                <UiButton @click="createNavigation()">Create</UiButton>
            </div>
        </div>
    </UiModal>

    <div class="bg-slate-950 p-3 rounded-lg border border-slate-700 h-screen">
        <Draggable 
            v-model="navigations"
            item-key="app-navs-draggable"
            group="navigations"
            @end="saveNavigationOrder"
        >
            <template #item="{ element }">
                <RecursiveNav
                    :nav="element"
                    :editing-navigation="editingNavigation"
                    @editNavigation="editNavigation"
                    @cancelEditing="cancelEditing"
                    @saveNavigation="saveNavigation"
                />
            </template>
        </Draggable>
    </div>
</template>
