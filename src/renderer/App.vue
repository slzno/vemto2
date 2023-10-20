<script setup lang="ts">
    import { onMounted, watch } from "vue"
    import { RouterView, useRouter, useRoute } from "vue-router"
    import Main from "@Renderer/services/wrappers/Main"
    import Alert from "@Renderer/components/utils/Alert"
    import { useProjectStore } from "./stores/useProjectStore"

    const router = useRouter(),
        currentRoute = useRoute(),
        projectStore = useProjectStore()

    onMounted(() => {
        Main.API.onDefaultError((error) => {
            if (isSchemaReaderError(error)) {
                treatSchemaReaderError(error)
                return
            }
            
            Alert.error(error.error)
            console.error(error.error)
            console.error(error.stack)
        })

        if (Main.API.onDevelopment()) {
            const lastRoute = window.localStorage.getItem(
                "lastDevelopmentRoute"
            )

            if (lastRoute) router.push(lastRoute)

            localStorage.removeItem("lastDevelopmentRoute")
        }
    })

    const isSchemaReaderError = (error: any): boolean => {
        return error.error.includes("schema-reader")
    }

    const treatSchemaReaderError = (error: any): void => {
        if(projectStore.projectIsEmpty) return
                
        projectStore.project.setCurrentSchemaError(
            error.error,
            error.stack
        )
    }

    watch(currentRoute, (route) => {
        if (Main.API.onDevelopment()) {
            localStorage.setItem("lastDevelopmentRoute", route.path)
        }
    })
</script>

<template>
    <div
        class="titlebar bg-transparent fixed top-0 right-0 z-50 bg-slate-900 border-slate-800 hover:bg-slate-950 cursor-move text-slate-700 flex items-center justify-center px-2"
        style="height: 15px; width: 100%"
    >
        <div>
            <!-- Current Project: vemto-test-01 -->
        </div>
    </div>
    <div id="app" class="w-full h-screen dark">
        <div class="text-slate-900 dark:text-slate-300 h-full w-full">
            <RouterView />
        </div>
    </div>
</template>
