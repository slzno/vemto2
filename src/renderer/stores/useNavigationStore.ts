import { defineStore } from "pinia"

export const useNavigationStore = defineStore("navigation", {
    state: () => ({ 
        activeTab: window.localStorage.getItem("activeProjectTab") || "schema"
    }),

    actions: {
        setActiveTab(tab: string) {
            this.activeTab = tab

            setTimeout(() => {
                window.localStorage.setItem("activeProjectTab", tab)
            }, 100)
        },

        clearActiveTab() {
            this.activeTab = "schema"
        }
    },

    getters: {
        activeTabIs(state) {
            return (tab: string) => state.activeTab === tab
        },

        activeTabIsNot(state) {
            return (tab: string) => state.activeTab !== tab
        }
    }
})
