<script setup lang="ts">
    import { onMounted, watch, ref } from "vue"
    import { RouterView, useRouter, useRoute } from "vue-router"
    import Main from "@Renderer/services/wrappers/Main"
    import Alert from "@Renderer/components/utils/Alert"
    import { useErrorsStore } from "./stores/useErrorsStore"
    import { useProjectStore } from "./stores/useProjectStore"

    const router = useRouter(),
        currentRoute = useRoute(),
        projectStore = useProjectStore(),
        errorsStore = useErrorsStore(),
        titlebarColor = ref("bg-transparent")

    onMounted(() => {
        Main.API.onDefaultError((error) => {
            if (isSchemaReaderError(error)) {
                treatSchemaReaderError(error)
                return
            }
            
            Alert.error(error.message)
            console.error(error.message)
            console.error(error.stack)

            errorsStore.addError({
                message: error.message,
                stack: error.stack,
            })
        })

        if (Main.API.onDevelopment()) {
            const lastRoute = window.localStorage.getItem(
                "lastDevelopmentRoute"
            )

            if (lastRoute) router.push(lastRoute)

            localStorage.removeItem("lastDevelopmentRoute")
        }

        // catch all uncaught errors
        window.addEventListener("error", (event) => {
            const error = event.error

            Alert.error(error.message)

            errorsStore.addError({
                message: error.message,
                stack: error.stack,
            })
        })
    })

    const isSchemaReaderError = (error: any): boolean => {
        return error.message.includes("schema-reader")
    }

    const treatSchemaReaderError = (error: any): void => {
        if(projectStore.projectIsEmpty) return
                
        projectStore.project.setCurrentSchemaError(
            error.message,
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
        :class="titlebarColor"
        class="titlebar fixed top-0 right-0 z-50 cursor-move text-slate-700 flex items-center justify-center px-2"
        style="height: 18px; width: 100%"
    >
        <div>
            <!-- Current Project: vemto-test-01 -->
        </div>
    </div>
    <div id="appContainer" class="w-full h-screen ">
        <div class="text-slate-900 dark:text-slate-300 h-full w-full">
            <RouterView />
        </div>
    </div>
</template>
