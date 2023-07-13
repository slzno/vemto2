import { defineStore } from "pinia"

export const useAppStore = defineStore("app", {
    state: () => ({ 
        generatingCode: false as boolean,
    }),

    actions: {
        startGeneratingCode() {
            this.generatingCode = true
        },

        finishGeneratingCode() {
            this.generatingCode = false
        }
    },

    getters: {
        isGenerating(state): boolean {
            return state.generatingCode
        },
    }
})
