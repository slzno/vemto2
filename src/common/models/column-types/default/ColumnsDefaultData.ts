import ColumnsDefaultDataInterface from './base/ColumnsDefaultDataInterface'

export default class ColumnsDefaultData {
    static getSettingsByColumnName(name: string): ColumnsDefaultDataInterface {
        let column = this.get()[name]

        if(!column) return null

        return column as ColumnsDefaultDataInterface
    }

    static get(): Object {
        return {
            id: {
                type: 'bigInteger'
            },

            name: {
                type: 'string'
            },

            first_name: {
                type: 'string'
            },

            firstname: {
                type: 'string'
            },

            last_name: {
                type: 'string'
            },

            lastname: {
                type: 'string'
            },

            surname: {
                type: 'string',
            },

            status: {
                type: 'string'
            },

            phone: {
                type: 'string'
            },

            phone_number: {
                type: 'string'
            },

            mobile: {
                type: 'string'
            },

            mobile_number: {
                type: 'string'
            },

            title: {
                type: 'string'
            },

            count: {
                type: 'integer',
            },

            views: {
                type: 'bigInteger',
            },

            file_name: {
                type: 'string',
                nullable: true,
            },

            filename: {
                type: 'string',
                nullable: true,
            },

            file: {
                type: 'string',
                nullable: true,
            },

            document: {
                type: 'string',
                nullable: true,
            },

            original_name: {
                type: 'string',
            },

            disk: {
                type: 'string',
            },

            folder: {
                type: 'string',
            },

            image: {
                type: 'string',
                nullable: true,
            },

            image_url: {
                type: 'string',
                nullable: true,
            },

            avatar: {
                type: 'string',
                nullable: true,
            },

            avatar_url: {
                type: 'string',
                nullable: true,
            },

            thumb: {
                type: 'string',
                nullable: true,
            },

            thumb_url: {
                type: 'string',
                nullable: true,
            },

            thumbnail: {
                type: 'string',
                nullable: true,
            },

            thumbnail_url: {
                type: 'string',
                nullable: true,
            },

            photo: {
                type: 'string',
                nullable: true,
            },

            photo_url: {
                type: 'string',
                nullable: true,
            },

            photography: {
                type: 'string',
                nullable: true,
            },

            photography_url: {
                type: 'string',
                nullable: true,
            },

            type: {
                type: 'string',
            },

            model_type: {
                type: 'string'
            },

            email: {
                type: 'string',
            },

            slug: {
                type: 'string',
            },

            password: {
                type: 'string',
            },

            login: {
                type: 'string',
            },

            identifier: {
                type: 'string',
            },

            address: {
                type: 'string',
            },

            city: {
                type: 'string',
            },

            street: {
                type: 'string',
            },

            postcode: {
                type: 'string',
            },

            cep: {
                type: 'string',
            },

            country: {
                type: 'string',
            },

            country_code: {
                type: 'string',
                length: 3,
            },

            state: {
                type: 'string',
            },

            region: {
                type: 'string',
            },

            latitude: {
                type: 'float',
            },

            longitude: {
                type: 'float',
            },

            locale: {
                type: 'string',
                length: 8,
            },

            currency: {
                type: 'string',
                length: 3,
            },

            currency_code: {
                type: 'string',
                length: 3,
            },

            emoji: {
                type: 'string',
            },

            description: {
                type: 'text',
            },

            biography: {
                type: 'text',
            },

            bio: {
                type: 'text',
            },

            observation: {
                type: 'text',
            },

            obs: {
                type: 'text',
            },

            label: {
                type: 'string',
            },

            comment: {
                type: 'string',
            },

            body: {
                type: 'text',
            },

            text: {
                type: 'text',
            },

            content: {
                type: 'text',
            },

            post: {
                type: 'text',
            },

            detail: {
                type: 'text',
            },

            details: {
                type: 'text',
            },

            message: {
                type: 'text',
            },

            payload: {
                type: 'longText',
            },

            meta: {
                type: 'text',
            },

            meta_description: {
                type: 'text',
            },

            date: {
                type: 'date',
            },

            birth: {
                type: 'date',
            },

            birthdate: {
                type: 'date',
            },

            birth_date: {
                type: 'date',
            },

            datetime: {
                type: 'dateTime',
            },

            date_time: {
                type: 'dateTime',
            },

            time: {
                type: 'dateTime',
            },

            gender: {
                type: 'enum',
            },
            
            sex: {
                type: 'enum',
            },

            rg: {
                type: 'string',
                length: 9,
            },

            cpf: {
                type: 'string',
                length: 11,
            },

            cnpj: {
                type: 'string',
                length: 14,
            },

            cpf_cnpj: {
                type: 'string',
                length: 14,
            },

            cnpj_cpf: {
                type: 'string',
                length: 14,
            },

            number: {
                type: 'integer',
            },

            quantity: {
                type: 'integer',
            },

            level: {
                type: 'integer',
            },

            color: {
                type: 'string',
                length: 9,
            },
            
            hexcolor: {
                type: 'string',
                length: 9,
            },

            hex_color: {
                type: 'string',
                length: 9,
            },
            
            color_name: {
                type: 'string',
            },

            price: {
                type: 'decimal',
            },

            money: {
                type: 'decimal',
            },

            fundings: {
                type: 'decimal',
            },

            savings: {
                type: 'decimal',
            },

            discount: {
                type: 'decimal',
            },

            total: {
                type: 'decimal',
            },

            distance: {
                type: 'decimal',
            },

            size: {
                type: 'decimal',
            },

            width: {
                type: 'decimal',
            },

            height: {
                type: 'decimal',
            },

            weight: {
                type: 'decimal',
            },

            ip: {
                type: 'ipAddress',
            },

            ip_address: {
                type: 'ipAddress',
            },

            mac: {
                type: 'macAddress',
            },

            mac_address: {
                type: 'macAddress',
            },

            url: {
                type: 'string',
            },

            domain: {
                type: 'string',
            },

            user_agent: {
                type: 'string',
            },

            data: {
                type: 'json',
            },

            options: {
                type: 'json',
            },

            coordinates: {
                type: 'geometry',
            },

            position: {
                type: 'geometry',
            },

            positions: {
                type: 'geometryCollection',
            },

            year: {
                type: 'year',
            },

            uuid: {
                type: 'uuid',
            },

            active: {
                type: 'boolean',
            },

            temperable: {
                type: 'boolean',
            },

            verified_at: {
                type: 'timestamp',
            },

            reported_at: {
                type: 'timestamp',
            },

            delivered_at: {
                type: 'timestamp',
            },

            created_at: {
                type: 'timestamp',
            },

            updated_at: {
                type: 'timestamp',
            },

            deleted_at: {
                type: 'timestamp',
            },

            weekday: {
                type: 'string',
                length: 32,
            },

            month: {
                type: 'enum',
            },
        }
    }
}