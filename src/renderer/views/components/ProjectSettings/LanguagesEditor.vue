
<script setup lang="ts">
    import Draggable from "vuedraggable"
    import Main from '@Renderer/services/wrappers/Main'
    import { ref, computed, onMounted } from "vue"
    import { useProjectStore } from "@Renderer/stores/useProjectStore"
    import UiText from '@Renderer/components/ui/UiText.vue'
    import UiButton from '@Renderer/components/ui/UiButton.vue'
    import { ArrowDownTrayIcon, ArrowPathIcon, Bars2Icon, Bars3Icon, ClipboardDocumentListIcon, TrashIcon } from '@heroicons/vue/24/outline'
    import UiOptionsDropdown from "@Renderer/components/ui/UiOptionsDropdown.vue"
    import UiDropdownItem from "@Renderer/components/ui/UiDropdownItem.vue"

    let appConfig = null

    const projectStore = useProjectStore(),
        appDefaultLanguage = ref("en"),
        appLanguages = ref([])

    onMounted(async () => {
        
    })

    const reloadSettings = async () => {
        await loadSettings()
    }

    const loadSettings = async () => {
        appConfig = await Main.API.readProjectFile("config/app.php")

        // get the locale from the app config ('locale' => 'en' or "locale" => 'en' or 'locale' => "en" or "locale" => "en")
        let locale = appConfig.match(/'locale'\s*=>\s*'(.*?)'/)?.[1] || appConfig.match(/"locale"\s*=>\s*"(.*?)"/)?.[1]

        appDefaultLanguage.value = locale || "en"

        let langFolder = await Main.API.readProjectFolder("/lang")

        const languageCodes = extractLanguageCodes(langFolder)

        console.log(languageCodes)
    }

    const extractLanguageCodes = (paths) => {
        const languageCodes = new Set()

        paths.forEach(path => {
            // Extract the language code using a regular expression
            const match = path.match(/\/lang\/([^\/]+)(?:\/|\.json$)/)

            if (match) {
                console.log(match[1])
                languageCodes.add(match[1])
            }
        })

        return Array.from(languageCodes)
    }

</script>

<template>
    <div
        class="bg-slate-100 dark:bg-slate-900 w-full h-full relative overflow-scroll"
    >
        <div class="flex space-x-2 sticky py-2">
            <UiButton @click="reloadSettings">
                <ArrowPathIcon class="w-5 h-5 mr-1 text-red-500" />
                Reload
            </UiButton>

            <!-- <UiButton :disabled="!hasChanges" @click="saveEnvSettings">
                <ArrowDownTrayIcon class="w-5 h-5 mr-1 text-red-500" />
                Save
            </UiButton> -->
        </div>

        <div class="h-[calc(100vh-150px)] overflow-y-auto pr-4 pb-52">
            
        </div>
    </div>
</template>
