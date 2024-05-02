<script setup lang="ts">
    import UiTabs from "@Renderer/components/ui/UiTabs.vue"
    import { ref, watch, defineExpose, nextTick, onMounted } from "vue"
    import { useErrorsStore } from "@Renderer/stores/useErrorsStore"
    import UiSmallButton from "@Renderer/components/ui/UiSmallButton.vue"
    import { CheckCircleIcon, ShieldExclamationIcon, XMarkIcon, FlagIcon, ListBulletIcon, CheckBadgeIcon } from "@heroicons/vue/24/outline"
    import Main from "@Renderer/services/wrappers/Main"
    import UiTip from "@Renderer/components/ui/UiTip.vue"
    import UiWarning from "@Renderer/components/ui/UiWarning.vue"

    const errorsStore = useErrorsStore()

    const showing = ref(false)

    // watch(() => errorsStore.hasErrors, (hasErrors) => {
    //     if(!hasErrors) {
    //         close()
    //     }
    // })

    onMounted(() => {
        checkDependencies()
    })

    const checkDependencies = async () => {
        const result = await Main.API.getPhpInfo()

        console.log(result)
    }

    const show = async () => {
        showing.value = true

        checkDependencies()
    }

    const close = () => {
        showing.value = false
    }

    const toggle = () => {
        if(showing.value) {
            close()
        } else {
            show()
        }
    }

    defineExpose({
        show,
        close,
        toggle,
    })
</script>

<template>
    <Teleport to="#appContainer">
        <Transition
            enter-from-class="transition duration-200 translate-y-full"
            enter-to-class="transition duration-200 translate-y-0"
            leave-from-class="transition duration-200 translate-y-0"
            leave-to-class="transition duration-200 translate-y-full"
        >
            <div v-show="showing" class="fixed rounded-lg shadow bg-slate-900 border border-slate-700 dark:text-slate-300" style="bottom: 60px; right: 10px; width: 500px; height: 40rem; z-index: 9998;">
                <!-- Header: 66px -->
                <header>
                    <div class="flex items-center text-center px-1 py-0.5 w-full bg-slate-850 border-b border-slate-700 rounded-t-lg">
                        <div class="flex-1 flex justify-center items-center gap-1">
                            <ListBulletIcon class="h-5 w-5 text-slate-500 stroke-2" />
                            Dependencies
                        </div>
    
                        <div @click="close()">
                            <XMarkIcon class="h-4 w-4 text-slate-400 cursor-pointer stroke-2 hover:text-red-500" />
                        </div>
                    </div>
                </header>
    
                <div class="p-4" style="height: calc(100% - 66px)">
                    <div class="mb-4">
                        <UiWarning>
                            You need to have the following dependencies installed on your system to be able to use Vemto properly.
                        </UiWarning>
                    </div>

                    <div class="flex items-center space-x-1">
                        <CheckBadgeIcon class="h-5 w-5 text-green-500 stroke-2" />
                        <span>PHP 8.2+</span>
                    </div>

                    <div class="flex items-center space-x-1">
                        <XMarkIcon class="h-5 w-5 text-red-500 stroke-2" />
                        <span>Composer</span>
                    </div>

                    <div class="text-white font-semibold mt-3 mb-2">PHP Extensions</div>

                    <div class="flex items-center space-x-1">
                        <CheckBadgeIcon class="h-5 w-5 text-green-500 stroke-2" />
                        <span>Zip</span>
                    </div>

                    <div class="flex items-center space-x-1">
                        <CheckBadgeIcon class="h-5 w-5 text-green-500 stroke-2" />
                        <span>PDO</span>
                    </div>

                    <div class="flex items-center space-x-1">
                        <CheckBadgeIcon class="h-5 w-5 text-green-500 stroke-2" />
                        <span>PDO SQLite</span>
                    </div>

                    <div class="flex items-center space-x-1">
                        <CheckBadgeIcon class="h-5 w-5 text-green-500 stroke-2" />
                        <span>Ctype</span>
                    </div>

                    <div class="flex items-center space-x-1">
                        <CheckBadgeIcon class="h-5 w-5 text-green-500 stroke-2" />
                        <span>cURL</span>
                    </div>

                    <div class="flex items-center space-x-1">
                        <CheckBadgeIcon class="h-5 w-5 text-green-500 stroke-2" />
                        <span>DOM</span>
                    </div>

                    <div class="flex items-center space-x-1">
                        <CheckBadgeIcon class="h-5 w-5 text-green-500 stroke-2" />
                        <span>Fileinfo</span>
                    </div>

                    <div class="flex items-center space-x-1">
                        <CheckBadgeIcon class="h-5 w-5 text-green-500 stroke-2" />
                        <span>Filter</span>
                    </div>

                    <div class="flex items-center space-x-1">
                        <CheckBadgeIcon class="h-5 w-5 text-green-500 stroke-2" />
                        <span>Hash</span>
                    </div>

                    <div class="flex items-center space-x-1">
                        <CheckBadgeIcon class="h-5 w-5 text-green-500 stroke-2" />
                        <span>Mbstring</span>
                    </div>

                    <div class="flex items-center space-x-1">
                        <CheckBadgeIcon class="h-5 w-5 text-green-500 stroke-2" />
                        <span>OpenSSL</span>
                    </div>

                    <div class="flex items-center space-x-1">
                        <CheckBadgeIcon class="h-5 w-5 text-green-500 stroke-2" />
                        <span>PCRE</span>
                    </div>

                    <div class="flex items-center space-x-1">
                        <CheckBadgeIcon class="h-5 w-5 text-green-500 stroke-2" />
                        <span>Session</span>
                    </div>

                    <div class="flex items-center space-x-1">
                        <CheckBadgeIcon class="h-5 w-5 text-green-500 stroke-2" />
                        <span>Tokenizer</span>
                    </div>

                    <div class="flex items-center space-x-1">
                        <CheckBadgeIcon class="h-5 w-5 text-green-500 stroke-2" />
                        <span>XML</span>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>
