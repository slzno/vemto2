import Relationship from "@Common/models/Relationship"
import RelationshipService from "./base/RelationshipService";

class CalculateManyToManyRelationshipsData extends RelationshipService {
    private _relationship: Relationship

    getDefaultName(): string {
        return ''
    }
    
    get relationship(): Relationship {
        return this._relationship
    }
}