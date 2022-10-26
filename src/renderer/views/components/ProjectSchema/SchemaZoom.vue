<script setup lang="ts">
// import { ref } from 'vue'

// const zoom = ref(1)

// const zoomIn = () => {
//     zoom.value += 0.1
//     document.getElementById("tablesContainer")!.style.transform =
//         "scale(" + zoom.value + ")"
//     // jsPlumbInstance.setZoom(zoom.value)
// }

// const zoomOut = () => {
//     zoom.value -= 0.1
//     document.getElementById("tablesContainer")!.style.transform =
//         "scale(" + zoom.value + ")"
//     // jsPlumbInstance.setZoom(zoom.value)
// }
</script>

<template>
    <div class="absolute bottom-0 right-0 p-4 z-20">
            <div
                class="flex items-center bg-white dark:bg-slate-850 rounded-full shadow p-1"
            >
                <!-- Tools and Icons -->
                <div class="flex">
                    <div
                        class="p-2 cursor-pointer text-slate-600 dark:text-slate-400 hover:text-red-500"
                    >
                        <svg
                            class="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                            ></path>
                        </svg>
                    </div>

                    <div
                        class="p-2 cursor-pointer text-slate-600 dark:text-slate-400 hover:text-red-500"
                    >
                        <svg
                            class="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"
                            ></path>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
</template>