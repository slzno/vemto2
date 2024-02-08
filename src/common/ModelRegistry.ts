import RelaDB from "@tiago_silva_pereira/reladb"
import Column from "./models/Column"
import Index from "./models/Index"
import Model from "./models/Model"
import Project from "./models/Project"
import Relationship from "./models/Relationship"
import RenderableFile from "./models/RenderableFile"
import Route from "./models/Route"
import Nav from "./models/Nav"
import Table from "./models/Table"
import Crud from "./models/crud/Crud"
import CrudPanel from "./models/crud/CrudPanel"
import Input from "./models/crud/Input"
import Page from "./models/page/Page"
import FillableModelColumn from "./models/FillableModelColumn"
import GuardedModelColumn from "./models/GuardedModelColumn"
import IndexColumn from "./models/IndexColumn"
import AppSection from "./models/AppSection"
import SchemaSection from "./models/SchemaSection"
import HasManyDetail from "./models/crud/HasManyDetail"
import HiddenModelColumn from "./models/HiddenModelColumn"
import DatesModelColumn from "./models/DatesModelColumn"
import CastsModelColumn from "./models/CastsModelColumn"
import MorphManyDetail from "./models/crud/MorphManyDetail"
import BelongsToManyDetail from "./models/crud/BelongsToManyDetail"
import MorphToManyDetail from "./models/crud/MorphToManyDetail"

export default new class ModelRegistry {
    registerModels() {
        RelaDB.Resolver.onDatabaseReady(() => {
            RelaDB.Resolver.db().registerModel(Nav, "Nav")
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
            RelaDB.Resolver.db().registerModel(Page, "Page")
            RelaDB.Resolver.db().registerModel(FillableModelColumn, "FillableModelColumn", "fillable_model_column")
            RelaDB.Resolver.db().registerModel(GuardedModelColumn, "GuardedModelColumn", "guarded_model_column")
            RelaDB.Resolver.db().registerModel(HiddenModelColumn, "HiddenModelColumn", "hidden_model_column")
            RelaDB.Resolver.db().registerModel(DatesModelColumn, "DatesModelColumn", "dates_model_column")
            RelaDB.Resolver.db().registerModel(CastsModelColumn, "CastsModelColumn", "casts_model_column")
            RelaDB.Resolver.db().registerModel(IndexColumn, "IndexColumn", "index_column")
            RelaDB.Resolver.db().registerModel(AppSection, "AppSection")
            RelaDB.Resolver.db().registerModel(SchemaSection, "SchemaSection")
            RelaDB.Resolver.db().registerModel(HasManyDetail, "HasManyDetail")
            RelaDB.Resolver.db().registerModel(MorphManyDetail, "MorphManyDetail")
            RelaDB.Resolver.db().registerModel(BelongsToManyDetail, "BelongsToManyDetail")
            RelaDB.Resolver.db().registerModel(MorphToManyDetail, "MorphToManyDetail")
        })
    }
}
