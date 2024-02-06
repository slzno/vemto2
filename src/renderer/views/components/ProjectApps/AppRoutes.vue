<script setup lang="ts">
    import { ref } from "vue";
    import { capitalCase } from "change-case";
    import UiText from "@Renderer/components/ui/UiText.vue";
    import Route, { RouteType } from "@Common/models/Route";
    import UiButton from "@Renderer/components/ui/UiButton.vue";
    import UiModal from "@Renderer/components/ui/UiModal.vue";
    import UiSelect from "@Renderer/components/ui/UiSelect.vue";
    import { useProjectStore } from "@Renderer/stores/useProjectStore"

    const projectStore = useProjectStore(),
        activeRoute = ref<Route|null>(null),
        selectedRoutable = ref(null),
        showingCreateNavigationModal = ref<boolean>(false)

    const onRouteClick = (route: Route) => {
        if(activeRoute.value?.id == route.id) return

        cancel()

        activeRoute.value = route

        selectedRoutable.value = {
            id: route.routableId,
            type: route.routableType
        }
    }

    const saveRoute = () => {
        if(!activeRoute.value) return

        activeRoute.value.type = activeRoute.value.type as RouteType

        if(selectedRoutable.value) {
            activeRoute.value.routableId = selectedRoutable.value.id
            activeRoute.value.routableType = selectedRoutable.value.type
        }

        activeRoute.value.save()

        cancel()
    }

    const getRouteTypes = () => {
        return Object.entries(RouteType).map(key => {
            return {
                label: key[0],
                value: key[1]
            }
        })
    }

    const getProjectApps = () => {
        return projectStore.project.getApplications()
    }

    const cancel = () => {
        activeRoute.value = null
        selectedRoutable.value = null
    }

    const deleteRoute = async (route: Route) => {
        const confirmed = await window.projectConfirm("Are you sure you want to delete this route?")

        if(!confirmed) return

        route.delete()
        cancel()
    }
</script>

<template>
    <div class="mb-3">
        <UiButton>Add Route</UiButton>
    </div>

    <UiModal
        title="Add Menu Item"
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
        <div
            class="w-2/3 mb-2 border border-slate-700 bg-slate-850 rounded-lg p-3 hover:bg-slate-800 flex flex-col gap-3"
            v-for="route in projectStore.project.routes"
            @click="onRouteClick(route)"
            :key="route.id"
        >
            <div class="cursor-pointer w-full flex justify-between items-start">
                <div>
                    <div class="mt-2 space-x-3 font-mono">
                        <span
                            class="px-2 py-0.5 bg-green-300 text-green-700 rounded"
                            >{{ route.method.toUpperCase() }}</span
                        >
                        <span>{{ route.path }}</span>
                    </div>
                </div>
        
                <div>
                    <div class="rounded px-2 py-1 bg-slate-800 inline-block text-sm">
                        {{ route.getName() }}
                    </div>
                </div>
            </div>

            <div v-if="activeRoute?.id === route.id">
                <div class="flex justify-between gap-3">
                    <UiText class="mb-3" v-model="activeRoute.name" label="Name" />
                    <UiText class="mb-3" v-model="activeRoute.tag" label="Tag" />
                </div>

                <div class="mb-3 flex flex-col gap-1">
                    <UiSelect v-model="activeRoute.method" label="Method">
                        <option value="get">GET</option>
                        <option value="post">POST</option>
                        <option value="put">PUT</option>
                        <option value="patch">PATCH</option>
                        <option value="delete">DELETE</option>
                    </UiSelect>
                </div>

                <UiText class="mb-3" v-model="activeRoute.path" label="Path" />

                <div class="mb-3 flex flex-col gap-1">
                    <UiSelect v-model="activeRoute.type" label="Type">
                        <option
                            v-for="routeType in getRouteTypes()"
                            :key="routeType.value"
                            :value="routeType.value"
                        >{{ capitalCase(routeType.label) }}</option>
                    </UiSelect>
                </div>

                <div class="mb-3 flex flex-col gap-1">
                    <UiSelect v-model="selectedRoutable" label="Application">
                        <option
                            v-for="app in getProjectApps()"
                            :key="app.id"
                            :value="{ id: app.id, type: app.constructor.identifier() }"
                        >{{ app.constructor.identifier() }}: {{ app.name }}</option>
                    </UiSelect>
                </div>

                <div class="mt-4 flex justify-between">
                    <div class="flex space-x-2">
                        <UiButton @click.stop="deleteRoute(route)">Delete</UiButton>
                    </div>
                    
                    <div class="flex space-x-2">
                        <UiButton @click.stop="cancel()">Cancel</UiButton>
                        <UiButton @click.stop="saveRoute()">Save</UiButton>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
