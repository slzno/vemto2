import { defineStore } from "pinia"
import Table from "@Common/models/Table"

export const useSchemaStore = defineStore("schema", {
    state: () => ({ 
        focusedTable: {} as Table,
        selectedTable: {} as Table
    }),

    actions: {
        selectTable(table: Table): void {
            this.deselectTable()

            this.selectedTable = table
        },

        deselectTable(): void {
            this.selectedTable = {} as Table
        },

        focusTable(table: Table): void {
            console.log("focusTable", table)
            this.focusedTable = table
        }
    },

    getters: {
        selectedTableIs(state) {
            return (table: Table) => state.selectedTable.id === table.id
        },

        selectedTableIsNot(state) {
            return (table: Table) => state.selectedTable.id !== table.id
        },

        hasSelectedTable(state): boolean {
            return !! state.selectedTable.id
        }
    }
})
