<script setup lang="ts">
    import UiWarning from "@Renderer/components/ui/UiWarning.vue"
    import { ref, watch, defineExpose, nextTick, onMounted } from "vue"
    import UiSmallButton from "@Renderer/components/ui/UiSmallButton.vue"
    import MainDependenciesInfo from "@Renderer/services/MainDependenciesInfo"
    import { XMarkIcon, ListBulletIcon, CheckBadgeIcon } from "@heroicons/vue/24/outline"
import UiLoading from "@Renderer/components/ui/UiLoading.vue"
import UiActiveOrInactive from "@Renderer/components/ui/UiActiveOrInactive.vue"
import UiHint from "@Renderer/components/ui/UiHint.vue"

    const mainDependencies = new MainDependenciesInfo()

    const showing = ref(false),
        loading = ref(false)

    // watch(() => errorsStore.hasErrors, (hasErrors) => {
    //     if(!hasErrors) {
    //         close()
    //     }
    // })

    onMounted(() => {
        checkDependenciesAndShowIfNotValid()
    })

    const checkDependenciesAndShowIfNotValid = async () => {
        await checkDependencies()

        if(mainDependencies.hasMissingDependencies()) {
            show()
        }
    }

    const checkDependencies = async () => {
        loading.value = true

        await mainDependencies.check()

        loading.value = false
    }

    const showAndCheckDependencies = async () => {
        show()
        await checkDependencies()
    }

    const show = async () => {
        showing.value = true
    }

    const close = () => {
        showing.value = false
    }

    const toggle = () => {
        if(showing.value) {
            close()
        } else {
            showAndCheckDependencies()
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
            <div v-show="showing" class="fixed rounded-lg shadow bg-slate-900 border border-slate-700 dark:text-slate-300" style="bottom: 60px; right: 10px; width: 350px; height: 40rem; z-index: 9998;">
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
                
                <div v-if="loading" class="p-4">
                    <UiLoading :stroke-width="2" />
                </div>

                <div v-else class="p-4 overflow-y-auto" style="height: calc(100% - 66px)">
                    <div class="mb-4" v-if="mainDependencies.hasMissingDependencies()">
                        <UiWarning>
                            You need to have the following dependencies installed on your system to be able to use Vemto properly.
                        </UiWarning>
                    </div>

                    <div class="flex items-center space-x-1">
                        <UiActiveOrInactive :active="mainDependencies.isPhpVersionValid()" />
                        <span>PHP 8.2+</span>
                    </div>

                    <div class="flex items-center space-x-1">
                        <UiActiveOrInactive :active="mainDependencies.isComposerInstalled()" />
                        <span>Composer</span>
                    </div>

                    <div class="text-white font-semibold mt-3 mb-2">PHP Extensions</div>

                    <div class="flex items-center space-x-1">
                        <UiActiveOrInactive :active="mainDependencies.hasExtension('zip')" />
                        <span>Zip</span>
                    </div>
                    
                    <div class="flex items-center space-x-1">
                        <UiActiveOrInactive :active="mainDependencies.hasExtension('PDO')" />
                        <span>PDO</span>
                    </div>

                    <div class="flex items-center space-x-1">
                        <UiActiveOrInactive :active="mainDependencies.hasExtension('ctype')" />
                        <span>Ctype</span>
                    </div>

                    <div class="flex items-center space-x-1">
                        <UiActiveOrInactive :active="mainDependencies.hasExtension('curl')" />
                        <span>cURL</span>
                    </div>

                    <div class="flex items-center space-x-1">
                        <UiActiveOrInactive :active="mainDependencies.hasExtension('dom')" />
                        <span>DOM</span>
                    </div>

                    <div class="flex items-center space-x-1">
                        <UiActiveOrInactive :active="mainDependencies.hasExtension('fileinfo')" />
                        <span>Fileinfo</span>
                    </div>

                    <div class="flex items-center space-x-1">
                        <UiActiveOrInactive :active="mainDependencies.hasExtension('filter')" />
                        <span>Filter</span>
                    </div>

                    <div class="flex items-center space-x-1">
                        <UiActiveOrInactive :active="mainDependencies.hasExtension('hash')" />
                        <span>Hash</span>
                    </div>

                    <div class="flex items-center space-x-1">
                        <UiActiveOrInactive :active="mainDependencies.hasExtension('mbstring')" />
                        <span>Mbstring</span>
                    </div>

                    <div class="flex items-center space-x-1">
                        <UiActiveOrInactive :active="mainDependencies.hasExtension('openssl')" />
                        <span>OpenSSL</span>
                    </div>

                    <div class="flex items-center space-x-1">
                        <UiActiveOrInactive :active="mainDependencies.hasExtension('pcre')" />
                        <span>PCRE</span>
                    </div>

                    <div class="flex items-center space-x-1">
                        <UiActiveOrInactive :active="mainDependencies.hasExtension('session')" />
                        <span>Session</span>
                    </div>

                    <div class="flex items-center space-x-1">
                        <UiActiveOrInactive :active="mainDependencies.hasExtension('tokenizer')" />
                        <span>Tokenizer</span>
                    </div>

                    <div class="flex items-center space-x-1">
                        <UiActiveOrInactive :active="mainDependencies.hasExtension('xml')" />
                        <span>XML</span>
                    </div>

                    <div class="flex items-center space-x-1">
                        <UiActiveOrInactive :active="mainDependencies.hasExtension('sqlite3')" />
                        <div class="flex items-center">
                            SQLite
                            <UiHint width="24rem">
                                SQlite is necessary when creating a new Laravel project from Vemto, because the command <i>`composer create-project laravel/laravel`</i> uses SQLite as the default database.
                            </UiHint>
                        </div>
                    </div>
                    
                    <div class="flex items-center space-x-1">
                        <UiActiveOrInactive :active="mainDependencies.hasExtension('pdo_sqlite')" />
                        <div class="flex items-center">
                            PDO SQLite
                            <UiHint width="24rem">
                                SQlite is necessary when creating a new Laravel project from Vemto, because the command <i>`composer create-project laravel/laravel`</i> uses SQLite as the default database.
                            </UiHint>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>
