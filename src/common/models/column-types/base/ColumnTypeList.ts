import Project from "@Common/models/Project"
import BigIncrements from "../BigIncrements"
import BigInteger from "../BigInteger"
import Binary from "../Binary"
import Boolean from "../Boolean"
import Char from "../Char"
import Date from "../Date"
import DateTime from "../DateTime"
import DateTimeTz from "../DateTimeTz"
import Decimal from "../Decimal"
import Double from "../Double"
import Enum from "../Enum"
import Float from "../Float"
import ForeignId from "../ForeignId"
import Geometry from "../Geometry"
import GeometryCollection from "../GeometryCollection"
import Increments from "../Increments"
import Integer from "../Integer"
import IpAddress from "../IpAddress"
import Json from "../Json"
import Jsonb from "../Jsonb"
import LineString from "../LineString"
import LongText from "../LongText"
import MacAddress from "../MacAddress"
import MediumIncrements from "../MediumIncrements"
import MediumInteger from "../MediumInteger"
import MediumText from "../MediumText"
import MultiLineString from "../MultiLineString"
import MultiPoint from "../MultiPoint"
import MultiPolygon from "../MultiPolygon"
import MultiPolygonZ from "../MultiPolygonZ"
import Point from "../Point"
import Polygon from "../Polygon"
import Set from "../Set"
import SmallIncrements from "../SmallIncrements"
import SmallInteger from "../SmallInteger"
import String from "../String"
import Text from "../Text"
import Time from "../Time"
import Timestamp from "../Timestamp"
import TimestampTz from "../TimestampTz"
import TimeTz from "../TimeTz"
import TinyIncrements from "../TinyIncrements"
import TinyInteger from "../TinyInteger"
import UnsignedBigInteger from "../UnsignedBigInteger"
import UnsignedDecimal from "../UnsignedDecimal"
import UnsignedInteger from "../UnsignedInteger"
import UnsignedMediumInteger from "../UnsignedMediumInteger"
import UnsignedSmallInteger from "../UnsignedSmallInteger"
import UnsignedTinyInteger from "../UnsignedTinyInteger"
import Uuid from "../Uuid"
import Year from "../Year"
import Geography from "../Geography"

export default class ColumnTypeList {

    static getByIdentifier(identifier: string): any {
        const type = ColumnTypeList.get()[identifier]

        if (type == undefined) {
            throw new Error(`Column type '${identifier}' not found`)
        }

        return type
    }

    static getArray(): any[] {
        return Object.values(ColumnTypeList.get())
    }

    static getEnabled(project: Project): any[] {
        return ColumnTypeList.getArray().filter((type) => type.enabled(project))
    }

    static get() {
        return {
            // bigIncrements: BigIncrements,
            bigInteger: BigInteger,
            binary: Binary,
            boolean: Boolean,
            char: Char,
            date: Date,
            dateTime: DateTime,
            dateTimeTz: DateTimeTz,
            decimal: Decimal,
            double: Double,
            enum: Enum,
            float: Float,
            foreignId: ForeignId,
            geometry: Geometry,
            geography: Geography,
            geometryCollection: GeometryCollection,
            // increments: Increments,
            integer: Integer,
            ipAddress: IpAddress,
            json: Json,
            jsonb: Jsonb,
            lineString: LineString,
            longText: LongText,
            macAddress: MacAddress,
            // mediumIncrements: MediumIncrements,
            mediumInteger: MediumInteger,
            mediumText: MediumText,
            multiLineString: MultiLineString,
            multiPoint: MultiPoint,
            multiPolygon: MultiPolygon,
            multiPolygonZ: MultiPolygonZ,
            point: Point,
            polygon: Polygon,
            set: Set,
            // smallIncrements: SmallIncrements,
            smallInteger: SmallInteger,
            string: String,
            text: Text,
            time: Time,
            timestamp: Timestamp,
            timestampTz: TimestampTz,
            timeTz: TimeTz,
            // tinyIncrements: TinyIncrements,
            tinyInteger: TinyInteger,
            // unsignedBigInteger: UnsignedBigInteger,
            // unsignedDecimal: UnsignedDecimal,
            // unsignedInteger: UnsignedInteger,
            // unsignedMediumInteger: UnsignedMediumInteger,
            // unsignedSmallInteger: UnsignedSmallInteger,
            // unsignedTinyInteger: UnsignedTinyInteger,
            uuid: Uuid,
            year: Year
        }
    }

}