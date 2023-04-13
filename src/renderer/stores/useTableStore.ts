import { defineStore } from "pinia"
import Table from "@Common/models/Table"

export const useProjectStore = defineStore("table", {
    state: () => ({ 
        table: {} as Table
    }),

    actions: {
        setTable(table: Table) {
            this.table = table
        },

        reloadTable() {
            if(!this.table.id) return

            this.table = this.table.fresh()
        }
    },

    getters: {
        
    }
})
