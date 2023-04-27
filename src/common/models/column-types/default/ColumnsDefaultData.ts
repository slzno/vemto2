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
                type: 'bigInteger',
            },

            html: {
                type: 'text',
                faker: 'fake()->randomHtml()',
            },

            name: {
                type: 'string',
                faker: 'fake()->name()',
            },

            first_name: {
                type: 'string',
                faker: 'fake()->firstName()',
            },

            firstname: {
                type: 'string',
                faker: 'fake()->firstName()',
            },

            last_name: {
                type: 'string',
                faker: 'fake()->lastName()',
            },

            lastname: {
                type: 'string',
                faker: 'fake()->lastName()',
            },

            surname: {
                type: 'string',
                faker: 'fake()->lastName()',
            },

            status: {
                type: 'string',
                faker: 'fake()->word()',
            },

            phone: {
                type: 'string',
                faker: 'fake()->phoneNumber()',
            },

            phone_number: {
                type: 'string',
                faker: 'fake()->phoneNumber()',
            },

            mobile: {
                type: 'string',
                faker: 'fake()->phoneNumber()',
            },

            mobile_number: {
                type: 'string',
                faker: 'fake()->phoneNumber()',
            },

            title: {
                type: 'string',
                faker: 'fake()->sentence(10)',
            },

            count: {
                type: 'integer',
                faker: '0',
            },

            views: {
                type: 'bigInteger',
                faker: '0',
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
                faker: "'public'"
            },

            folder: {
                type: 'string',
                faker: "'tmp'"
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
                faker: 'fake()->word()',
            },

            model_type: {
                type: 'string',
            },

            email: {
                type: 'string',
                faker: 'fake()->email()',
            },

            slug: {
                type: 'string',
                faker: 'fake()->slug()',
            },

            password: {
                type: 'string',
                faker: 'fake()->password()',
            },

            login: {
                type: 'string',
                faker: 'fake()->userName()',
            },

            identifier: {
                type: 'string',
                faker: 'fake()->userName()',
            },

            address: {
                type: 'string',
                faker: 'fake()->address()',
            },

            city: {
                type: 'string',
                faker: 'fake()->city()',
            },

            street: {
                type: 'string',
                faker: 'fake()->streetName()',
            },

            postcode: {
                type: 'string',
                faker: 'fake()->postcode()',
            },

            cep: {
                type: 'string',
                faker: 'fake()->postcode()',
            },

            country: {
                type: 'string',
                faker: 'fake()->country()',
            },

            country_code: {
                type: 'string',
                length: 3,
                faker: 'fake()->countryCode()',
            },

            state: {
                type: 'string',
                faker: 'fake()->state()',
            },

            region: {
                type: 'string',
                faker: 'fake()->region()',
            },

            latitude: {
                type: 'float',
                faker: 'fake()->latitude()',
            },

            longitude: {
                type: 'float',
                faker: 'fake()->longitude()',
            },

            locale: {
                type: 'string',
                length: 8,
                faker: 'fake()->locale()',
            },

            currency: {
                type: 'string',
                length: 3,
                faker: 'fake()->currencyCode()',
            },

            currency_code: {
                type: 'string',
                length: 3,
                faker: 'fake()->currencyCode()',
            },

            emoji: {
                type: 'string',
                faker: 'fake()->emoji()',
            },

            description: {
                type: 'text',
                faker: 'fake()->sentence(15)',
            },

            biography: {
                type: 'text',
                faker: 'fake()->sentence(15)',
            },

            bio: {
                type: 'text',
                faker: 'fake()->sentence(15)',
            },

            observation: {
                type: 'text',
                faker: 'fake()->sentence(15)',
            },

            obs: {
                type: 'text',
                faker: 'fake()->sentence(15)',
            },

            label: {
                type: 'string',
                faker: 'fake()->word()',
            },

            comment: {
                type: 'string',
                faker: 'fake()->text()',
            },

            body: {
                type: 'text',
                faker: 'fake()->text()',
            },

            text: {
                type: 'text',
                faker: 'fake()->text()',
            },

            content: {
                type: 'text',
                faker: 'fake()->text()',
            },

            post: {
                type: 'text',
                faker: 'fake()->text()',
            },

            detail: {
                type: 'text',
                faker: 'fake()->sentence(20)',
            },

            details: {
                type: 'text',
                faker: 'fake()->sentence(20)',
            },

            message: {
                type: 'text',
                faker: 'fake()->sentence(20)',
            },

            payload: {
                type: 'longText',
                faker: 'fake()->text()',
            },

            meta: {
                type: 'text',
                faker: 'fake()->text()',
            },

            meta_description: {
                type: 'text',
                faker: 'fake()->text()',
            },

            date: {
                type: 'date',
                faker: 'fake()->date()',
            },

            birth: {
                type: 'date',
                faker: 'fake()->date()',
            },

            birthdate: {
                type: 'date',
                faker: 'fake()->date()',
            },

            birth_date: {
                type: 'date',
                faker: 'fake()->date()',
            },

            datetime: {
                type: 'dateTime',
                faker: 'fake()->date()',
            },

            date_time: {
                type: 'dateTime',
                faker: 'fake()->date()',
            },

            time: {
                type: 'dateTime',
                faker: 'fake()->date()',
            },

            gender: {
                type: 'enum',
                faker: "\\Arr::random(['male', 'female', 'other'])",
            },
            
            sex: {
                type: 'enum',
                faker: "\\Arr::random(['male', 'female', 'other'])",
            },

            rg: {
                type: 'string',
                length: 9,
                faker: 'fake()->rg(false)',
            },

            cpf: {
                type: 'string',
                length: 11,
                faker: 'fake()->cpf(false)',
            },

            cnpj: {
                type: 'string',
                length: 14,
                faker: 'fake()->cnpj(false)',
            },

            cpf_cnpj: {
                type: 'string',
                length: 14,
                faker: 'fake()->cpf(false)',
            },

            cnpj_cpf: {
                type: 'string',
                length: 14,
                faker: 'fake()->cnpj(false)',
            },

            number: {
                type: 'integer',
                faker: 'fake()->randomNumber()',
            },

            quantity: {
                type: 'integer',
                faker: 'fake()->randomNumber()',
            },

            level: {
                type: 'integer',
                faker: 'fake()->randomNumber()',
            },

            color: {
                type: 'string',
                length: 9,
                faker: 'fake()->hexcolor()',
            },
            
            hexcolor: {
                type: 'string',
                length: 9,
                faker: 'fake()->hexcolor()',
            },

            hex_color: {
                type: 'string',
                length: 9,
                faker: 'fake()->hexcolor()',
            },
            
            color_name: {
                type: 'string',
                faker: 'fake()->colorName()',
            },

            price: {
                type: 'decimal',
                faker: 'fake()->randomFloat(2, 0, 9999)',
            },

            money: {
                type: 'decimal',
                faker: 'fake()->randomFloat(2, 0, 9999)',
            },

            fundings: {
                type: 'decimal',
                faker: 'fake()->randomFloat(2, 0, 9999)',
            },

            savings: {
                type: 'decimal',
                faker: 'fake()->randomFloat(2, 0, 9999)',
            },

            discount: {
                type: 'decimal',
                faker: 'fake()->randomFloat(2, 0, 9999)',
            },

            total: {
                type: 'decimal',
                faker: 'fake()->randomFloat(2, 0, 9999)',
            },

            distance: {
                type: 'decimal',
                faker: 'fake()->randomFloat(2, 0, 9999)',
            },

            size: {
                type: 'decimal',
                faker: 'fake()->randomFloat(2, 0, 9999)',
            },

            width: {
                type: 'decimal',
                faker: 'fake()->randomFloat(2, 0, 9999)',
            },

            height: {
                type: 'decimal',
                faker: 'fake()->randomFloat(2, 0, 9999)',
            },

            weight: {
                type: 'decimal',
                faker: 'fake()->randomFloat(2, 0, 9999)',
            },

            ip: {
                type: 'ipAddress',
                faker: 'fake()->ipv4()',
            },

            ip_address: {
                type: 'ipAddress',
                faker: 'fake()->ipv4()',
            },

            mac: {
                type: 'macAddress',
                faker: 'fake()->macAddress()',
            },

            mac_address: {
                type: 'macAddress',
                faker: 'fake()->macAddress()',
            },

            url: {
                type: 'string',
                faker: 'fake()->url()',
            },

            domain: {
                type: 'string',
                faker: 'fake()->domainName()',
            },

            user_agent: {
                type: 'string',
                faker: 'fake()->userAgent()',
            },

            data: {
                type: 'json',
                faker: '[]',
            },

            options: {
                type: 'json',
                faker: '[]',
            },

            coordinates: {
                type: 'geometry',
                faker: '"{fake()->latitude()},{fake()->longitude()}"',
            },

            position: {
                type: 'geometry',
                faker: '"{fake()->latitude()},{fake()->longitude()}"',
            },

            positions: {
                type: 'geometryCollection',
                faker: '"{fake()->latitude()},{fake()->longitude()}"',
            },

            year: {
                type: 'year',
                faker: 'fake()->year()',
            },

            uuid: {
                type: 'uuid',
                faker: 'fake()->uuid()',
            },

            active: {
                type: 'boolean',
                faker: 'fake()->boolean()',
            },

            temperable: {
                type: 'boolean',
                faker: 'fake()->boolean()',
            },

            verified_at: {
                type: 'timestamp',
                faker: 'fake()->dateTime()',
            },

            reported_at: {
                type: 'timestamp',
                faker: 'fake()->dateTime()',
            },

            delivered_at: {
                type: 'timestamp',
                faker: 'fake()->dateTime()',
            },

            created_at: {
                type: 'timestamp',
                faker: 'fake()->dateTime()',
            },

            updated_at: {
                type: 'timestamp',
                faker: 'fake()->dateTime()',
            },

            deleted_at: {
                type: 'timestamp',
                faker: 'fake()->dateTime()',
            },

            weekday: {
                type: 'string',
                length: 32,
                faker: 'fake()->dayOfWeek()',
            },

            month: {
                type: 'enum',
                faker: 'fake()->monthName()',
            },
        }
    }
}