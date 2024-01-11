export interface ColumnDefaultData {
    help?: string
    label?: string
    identifier?: string
    type: string
    hasLength?: boolean
    length?: number
    nullable?: boolean
    faker?: string
    input?: any
    validationRules?: any[]
    defaultValueTypeIsString?: boolean
    defaultValue?: string
    inputType?: string
    inputOptions?: any
}

export default class ColumnsDefaultDataList {
    static getSettingsByColumnName(name: string): ColumnDefaultData {
        let column = this.get()[name]

        if (!column) return null

        return column as ColumnDefaultData
    }

    static get(): Object {
        return {
            id: {
                type: "bigInteger",
            },

            html: {
                type: "text",
                faker: "fake()->randomHtml()",
                inputType: "html",
            },

            name: {
                type: "string",
                faker: "fake()->name()",
            },

            first_name: {
                type: "string",
                faker: "fake()->firstName()",
            },

            firstname: {
                type: "string",
                faker: "fake()->firstName()",
            },

            last_name: {
                type: "string",
                faker: "fake()->lastName()",
            },

            lastname: {
                type: "string",
                faker: "fake()->lastName()",
            },

            surname: {
                type: "string",
                faker: "fake()->lastName()",
            },

            status: {
                type: "string",
                faker: "fake()->word()",
            },

            remember_token: {
                type: "string",
                nullable: true,
                faker: "Str::random(10)",
            },

            phone: {
                type: "string",
                faker: "fake()->phoneNumber()",
            },

            phone_number: {
                type: "string",
                faker: "fake()->phoneNumber()",
            },

            mobile: {
                type: "string",
                faker: "fake()->phoneNumber()",
            },

            mobile_number: {
                type: "string",
                faker: "fake()->phoneNumber()",
            },

            title: {
                type: "string",
                faker: "fake()->sentence(10)",
            },

            count: {
                type: "integer",
                faker: "0",
            },

            views: {
                type: "bigInteger",
                faker: "0",
            },

            file_name: {
                type: "string",
                nullable: true,
                inputType: "file",
            },

            filename: {
                type: "string",
                nullable: true,
                inputType: "file",
            },

            file: {
                type: "string",
                nullable: true,
                inputType: "file",
            },

            document: {
                type: "string",
                nullable: true,
                inputType: "file",
            },

            original_name: {
                type: "string",
            },

            disk: {
                type: "string",
                faker: "'public'",
            },

            folder: {
                type: "string",
                faker: "'tmp'",
            },

            image: {
                type: "string",
                nullable: true,
                inputType: 'image',
            },

            image_url: {
                type: "string",
                nullable: true,
                inputType: 'image',
            },

            avatar: {
                type: "string",
                nullable: true,
                inputType: 'image',
            },

            avatar_url: {
                type: "string",
                nullable: true,
                inputType: 'image',
            },

            thumb: {
                type: "string",
                nullable: true,
                inputType: 'image',
            },

            thumb_url: {
                type: "string",
                nullable: true,
                inputType: 'image',
            },

            thumbnail: {
                type: "string",
                nullable: true,
                inputType: 'image',
            },

            thumbnail_url: {
                type: "string",
                nullable: true,
                inputType: 'image',
            },

            photo: {
                type: "string",
                nullable: true,
                inputType: 'image',
            },

            photo_url: {
                type: "string",
                nullable: true,
                inputType: 'image',
            },

            photography: {
                type: "string",
                nullable: true,
                inputType: 'image',
            },

            photography_url: {
                type: "string",
                nullable: true,
                inputType: 'image',
            },

            type: {
                type: "string",
                faker: "fake()->word()",
            },

            model_type: {
                type: "string",
            },

            email: {
                type: "string",
                faker: "fake()->unique()->safeEmail()",
                inputType: "email",
            },

            email_verified_at: {
                type: "timestamp",
                nullable: true,
                faker: "now()",
                avoidInputGenerationByDefault: true,
            },

            slug: {
                type: "string",
                faker: "fake()->slug()",
            },

            password: {
                type: "string",
                faker: "\Hash::make('password')",
                inputType: "password",
                validationRules: ["required", "string", "min:6"],
                updateValidationRules: ["nullable", "string", "min:6"],
            },

            login: {
                type: "string",
                faker: "fake()->userName()",
            },

            identifier: {
                type: "string",
                faker: "fake()->userName()",
            },

            address: {
                type: "string",
                faker: "fake()->address()",
            },

            city: {
                type: "string",
                faker: "fake()->city()",
            },

            street: {
                type: "string",
                faker: "fake()->streetName()",
            },

            postcode: {
                type: "string",
                faker: "fake()->postcode()",
            },

            cep: {
                type: "string",
                faker: "fake()->postcode()",
            },

            country: {
                type: "string",
                faker: "fake()->country()",
            },

            country_code: {
                type: "string",
                length: 3,
                faker: "fake()->countryCode()",
            },

            state: {
                type: "string",
                faker: "fake()->state()",
            },

            region: {
                type: "string",
                faker: "fake()->region()",
            },

            latitude: {
                type: "float",
                faker: "fake()->latitude()",
            },

            longitude: {
                type: "float",
                faker: "fake()->longitude()",
            },

            locale: {
                type: "string",
                length: 8,
                faker: "fake()->locale()",
            },

            currency: {
                type: "string",
                length: 3,
                faker: "fake()->currencyCode()",
            },

            currency_code: {
                type: "string",
                length: 3,
                faker: "fake()->currencyCode()",
                inputType: "select",
                inputOptions: "VMT:currency_codes",
            },

            emoji: {
                type: "string",
                faker: "fake()->emoji()",
                inputType: "select",
                inputOptions: "VMT:emojis",
            },

            description: {
                type: "text",
                faker: "fake()->sentence(15)",
            },

            biography: {
                type: "text",
                faker: "fake()->sentence(15)",
            },

            bio: {
                type: "text",
                faker: "fake()->sentence(15)",
            },

            observation: {
                type: "text",
                faker: "fake()->sentence(15)",
            },

            obs: {
                type: "text",
                faker: "fake()->sentence(15)",
            },

            label: {
                type: "string",
                faker: "fake()->word()",
            },

            comment: {
                type: "string",
                faker: "fake()->text()",
            },

            body: {
                type: "text",
                faker: "fake()->text()",
            },

            text: {
                type: "text",
                faker: "fake()->text()",
            },

            content: {
                type: "text",
                faker: "fake()->text()",
            },

            post: {
                type: "text",
                faker: "fake()->text()",
            },

            detail: {
                type: "text",
                faker: "fake()->sentence(20)",
            },

            details: {
                type: "text",
                faker: "fake()->sentence(20)",
            },

            message: {
                type: "text",
                faker: "fake()->sentence(20)",
            },

            payload: {
                type: "longText",
                faker: "fake()->text()",
            },

            meta: {
                type: "text",
                faker: "fake()->text()",
            },

            meta_description: {
                type: "text",
                faker: "fake()->text()",
            },

            date: {
                type: "date",
                faker: "fake()->date()",
            },

            birth: {
                type: "date",
                faker: "fake()->date()",
            },

            birthdate: {
                type: "date",
                faker: "fake()->date()",
            },

            birth_date: {
                type: "date",
                faker: "fake()->date()",
            },

            datetime: {
                type: "dateTime",
                faker: "fake()->date()",
            },

            date_time: {
                type: "dateTime",
                faker: "fake()->date()",
            },

            time: {
                type: "dateTime",
                faker: "fake()->date()",
            },

            gender: {
                type: "enum",
                faker: "\\Arr::random(['male', 'female', 'other'])",
                inputType: "select",
                inputOptions: ['male', 'female', 'other'],
                validationRules: [
                    'in:{IMPLODED_OPTIONS}'
                ]
            },

            sex: {
                type: "enum",
                faker: "\\Arr::random(['male', 'female', 'other'])",
                inputType: "select",
                inputOptions: ['male', 'female', 'other', 'other2'],
                validationRules: [
                    'in:{IMPLODED_OPTIONS}'
                ]
            },

            rg: {
                type: "string",
                length: 9,
                faker: "fake()->rg(false)",
            },

            cpf: {
                type: "string",
                length: 11,
                faker: "fake()->cpf(false)",
            },

            cnpj: {
                type: "string",
                length: 14,
                faker: "fake()->cnpj(false)",
            },

            cpf_cnpj: {
                type: "string",
                length: 14,
                faker: "fake()->cpf(false)",
            },

            cnpj_cpf: {
                type: "string",
                length: 14,
                faker: "fake()->cnpj(false)",
            },

            number: {
                type: "integer",
                faker: "fake()->randomNumber()",
            },

            quantity: {
                type: "integer",
                faker: "fake()->randomNumber()",
            },

            level: {
                type: "integer",
                faker: "fake()->randomNumber()",
            },

            color: {
                type: "string",
                length: 9,
                faker: "fake()->hexcolor()",
            },

            hexcolor: {
                type: "string",
                length: 9,
                faker: "fake()->hexcolor()",
                inputType: "color",
            },

            hex_color: {
                type: "string",
                length: 9,
                faker: "fake()->hexcolor()",
                inputType: "color",
            },

            color_name: {
                type: "string",
                faker: "fake()->colorName()",
            },

            price: {
                type: "decimal",
                faker: "fake()->randomFloat(2, 0, 9999)",
            },

            money: {
                type: "decimal",
                faker: "fake()->randomFloat(2, 0, 9999)",
            },

            fundings: {
                type: "decimal",
                faker: "fake()->randomFloat(2, 0, 9999)",
            },

            savings: {
                type: "decimal",
                faker: "fake()->randomFloat(2, 0, 9999)",
            },

            discount: {
                type: "decimal",
                faker: "fake()->randomFloat(2, 0, 9999)",
            },

            total: {
                type: "decimal",
                faker: "fake()->randomFloat(2, 0, 9999)",
            },

            distance: {
                type: "decimal",
                faker: "fake()->randomFloat(2, 0, 9999)",
            },

            size: {
                type: "decimal",
                faker: "fake()->randomFloat(2, 0, 9999)",
            },

            width: {
                type: "decimal",
                faker: "fake()->randomFloat(2, 0, 9999)",
            },

            height: {
                type: "decimal",
                faker: "fake()->randomFloat(2, 0, 9999)",
            },

            weight: {
                type: "decimal",
                faker: "fake()->randomFloat(2, 0, 9999)",
            },

            ip: {
                type: "ipAddress",
                faker: "fake()->ipv4()",
            },

            ip_address: {
                type: "ipAddress",
                faker: "fake()->ipv4()",
            },

            mac: {
                type: "macAddress",
                faker: "fake()->macAddress()",
            },

            mac_address: {
                type: "macAddress",
                faker: "fake()->macAddress()",
            },

            url: {
                type: "string",
                faker: "fake()->url()",
                inputType: "url",
            },

            domain: {
                type: "string",
                faker: "fake()->domainName()",
            },

            user_agent: {
                type: "string",
                faker: "fake()->userAgent()",
            },

            data: {
                type: "json",
                faker: "[]",
            },

            options: {
                type: "json",
                faker: "[]",
            },

            coordinates: {
                type: "geometry",
                faker: '"{fake()->latitude()},{fake()->longitude()}"',
            },

            position: {
                type: "geometry",
                faker: '"{fake()->latitude()},{fake()->longitude()}"',
            },

            positions: {
                type: "geometryCollection",
                faker: '"{fake()->latitude()},{fake()->longitude()}"',
            },

            year: {
                type: "year",
                faker: "fake()->year()",
            },

            uuid: {
                type: "uuid",
                faker: "fake()->uuid()",
            },

            active: {
                type: "boolean",
                faker: "fake()->boolean()",
            },

            temperable: {
                type: "boolean",
                faker: "fake()->boolean()",
            },

            verified_at: {
                type: "timestamp",
                faker: "fake()->dateTime()",
                nullable: true
            },

            reported_at: {
                type: "timestamp",
                faker: "fake()->dateTime()",
                nullable: true
            },

            delivered_at: {
                type: "timestamp",
                faker: "fake()->dateTime()",
                nullable: true
            },

            created_at: {
                type: "timestamp",
                faker: "fake()->dateTime()",
                nullable: true
            },

            updated_at: {
                type: "timestamp",
                faker: "fake()->dateTime()",
                nullable: true
            },

            deleted_at: {
                type: "timestamp",
                faker: "fake()->dateTime()",
                nullable: true
            },

            weekday: {
                type: "string",
                length: 32,
                faker: "fake()->dayOfWeek()",
            },

            month: {
                type: "enum",
                faker: "fake()->monthName()",
                inputOptions: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            },

            current_team_id: {
                type: "bigInteger",
                nullable: true,
                avoidInputGenerationByDefault: true, 
            },

            two_factor_confirmed_at: {
                type: "timestamp",
                nullable: true,
                avoidInputGenerationByDefault: true, 
            },

            profile_photo_path: {
                type: "string",
                nullable: true,
                avoidInputGenerationByDefault: true, 
            },
        }
    }
}
