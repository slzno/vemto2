import RelaDB from "@tiago_silva_pereira/reladb"
import Column from "./models/Column"
import Index from "./models/Index"
import Model from "./models/Model"
import Project from "./models/Project"
import Relationship from "./models/Relationship"
import RenderableFile from "./models/RenderableFile"
import Route from "./models/Route"
import Table from "./models/Table"
import Crud from "./models/crud/Crud"
import CrudPanel from "./models/crud/CrudPanel"
import Input from "./models/crud/Input"

export default new class ModelRegistry {
    registerModels() {
        RelaDB.Resolver.onDatabaseReady(() => {
            RelaDB.Resolver.db().registerModel(Column, "Column")
            RelaDB.Resolver.db().registerModel(Index, "Index")
            RelaDB.Resolver.db().registerModel(Model, "Model")
            RelaDB.Resolver.db().registerModel(Project, "Project")
            RelaDB.Resolver.db().registerModel(Relationship, "Relationship")
            RelaDB.Resolver.db().registerModel(RenderableFile, "RenderableFile")
            RelaDB.Resolver.db().registerModel(Route, "Route")
            RelaDB.Resolver.db().registerModel(Table, "Table")
            RelaDB.Resolver.db().registerModel(Crud, "Crud")
            RelaDB.Resolver.db().registerModel(CrudPanel, "CrudPanel")
            RelaDB.Resolver.db().registerModel(Input, "Input")
        })
    }
}
