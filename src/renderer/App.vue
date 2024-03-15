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
            
            if (errorsStore.lastErrorMessage === error.message) return

            // Alert.error("Error from background process")
            console.error(error.message)
            console.error(error.stack)

            addErrorToStore(error)
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

            addErrorToStore(error)
        })

        // catch all unhandled promise rejections
        window.addEventListener("unhandledrejection", (event) => {
            console.error("Unhandled Promise Rejection at:", event.promise)

            const error = event.reason

            addErrorToStore(error)
        })
    })

    const isSchemaReaderError = (error: any): boolean => {
        return error.message.includes("schema-reader")
    }

    const treatSchemaReaderError = (error: any): void => {
        if(projectStore.projectIsEmpty) {
            addErrorToStore(error)

            return
        }
                
        projectStore.project.setCurrentSchemaError(
            error.message,
            error.stack
        )
    }

    const addErrorToStore = (error: any): void => {
        errorsStore.addError({
            message: error.message,
            stack: error.stack,
            hasTemplateError: !! error.hasTemplateError,
            templateErrorLine: error.templateErrorLine || 0,
            templateName: error.templateName || "",
            templateContent: error.templateContent || "",
            templateLines: error.templateLines || [],
        })
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
    <div id="appContainer" class="w-full h-screen antialiased dark">
        <div class="text-slate-700 dark:text-slate-300 h-full w-full">
            <RouterView :key="$route.fullPath" />
        </div>
    </div>
</template>
