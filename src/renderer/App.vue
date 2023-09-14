<script setup lang="ts">
    import { onMounted, watch } from "vue"
    import { RouterView, useRouter, useRoute } from "vue-router"
    import Main from "@Renderer/services/wrappers/Main"
    import Alert from '@Renderer/components/utils/Alert'

    const router = useRouter(),
        currentRoute = useRoute()

    onMounted(() => {
        Main.API.onDefaultError((error) => { 
            if(!error.error.includes('schema-reader')) {
                Alert.error(error.error)
                console.error(error.error)
                console.error(error.stack)
            }
        })

        if(Main.API.onDevelopment()) {
            const lastRoute = window.localStorage.getItem('lastDevelopmentRoute')

            if(lastRoute) router.push(lastRoute)

            localStorage.removeItem('lastDevelopmentRoute')
        }
    })

    watch(currentRoute, (route) => {
        if(Main.API.onDevelopment()) {
            localStorage.setItem('lastDevelopmentRoute', route.path)
        }
    })
</script>

<template>
    <div
        class="titlebar fixed top-0 right-0 z-50 hover:bg-slate-950 cursor-move "
        style="height: 30px; width: 200px"
    ></div>
    <div id="app" class="w-full h-screen dark">
        <div class="text-slate-900 dark:text-slate-300 h-full w-full">
            <RouterView />
        </div>
    </div>
</template>
