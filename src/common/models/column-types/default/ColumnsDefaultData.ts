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

            html: {
                type: 'text',
                faker: '$faker->randomHtml()',
            },

            name: {
                type: 'string',
                faker: '$faker->name()',
            },

            first_name: {
                type: 'string',
                faker: '$faker->firstName()',
            },

            firstname: {
                type: 'string',
                faker: '$faker->firstName()',
            },

            last_name: {
                type: 'string',
                faker: '$faker->lastName()',
            },

            lastname: {
                type: 'string',
                faker: '$faker->lastName()',
            },

            surname: {
                type: 'string',
                faker: '$faker->lastName()',
            },

            status: {
                type: 'string',
                faker: '$faker->word()',
            },

            phone: {
                type: 'string',
                faker: '$faker->phoneNumber()',
            },

            phone_number: {
                type: 'string',
                faker: '$faker->phoneNumber()',
            },

            mobile: {
                type: 'string',
                faker: '$faker->phoneNumber()',
            },

            mobile_number: {
                type: 'string',
                faker: '$faker->phoneNumber()',
            },

            title: {
                type: 'string',
                faker: '$faker->sentence(10)',
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
                faker: '$faker->word()',
            },

            model_type: {
                type: 'string',
            },

            email: {
                type: 'string',
                faker: '$faker->email()',
            },

            slug: {
                type: 'string',
                faker: '$faker->slug()',
            },

            password: {
                type: 'string',
                faker: '$faker->password()',
            },

            login: {
                type: 'string',
                faker: '$faker->userName()',
            },

            identifier: {
                type: 'string',
                faker: '$faker->userName()',
            },

            address: {
                type: 'string',
                faker: '$faker->address()',
            },

            city: {
                type: 'string',
                faker: '$faker->city()',
            },

            street: {
                type: 'string',
                faker: '$faker->streetName()',
            },

            postcode: {
                type: 'string',
                faker: '$faker->postcode()',
            },

            cep: {
                type: 'string',
                faker: '$faker->postcode()',
            },

            country: {
                type: 'string',
                faker: '$faker->country()',
            },

            country_code: {
                type: 'string',
                length: 3,
                faker: '$faker->countryCode()',
            },

            state: {
                type: 'string',
                faker: '$faker->state()',
            },

            region: {
                type: 'string',
                faker: '$faker->region()',
            },

            latitude: {
                type: 'float',
                faker: '$faker->latitude()',
            },

            longitude: {
                type: 'float',
                faker: '$faker->longitude()',
            },

            locale: {
                type: 'string',
                length: 8,
                faker: '$faker->locale()',
            },

            currency: {
                type: 'string',
                length: 3,
                faker: '$faker->currencyCode()',
            },

            currency_code: {
                type: 'string',
                length: 3,
                faker: '$faker->currencyCode()',
            },

            emoji: {
                type: 'string',
                faker: '$faker->emoji()',
            },

            description: {
                type: 'text',
                faker: '$faker->sentence(15)',
            },

            biography: {
                type: 'text',
                faker: '$faker->sentence(15)',
            },

            bio: {
                type: 'text',
                faker: '$faker->sentence(15)',
            },

            observation: {
                type: 'text',
                faker: '$faker->sentence(15)',
            },

            obs: {
                type: 'text',
                faker: '$faker->sentence(15)',
            },

            label: {
                type: 'string',
                faker: '$faker->word()',
            },

            comment: {
                type: 'string',
                faker: '$faker->text()',
            },

            body: {
                type: 'text',
                faker: '$faker->text()',
            },

            text: {
                type: 'text',
                faker: '$faker->text()',
            },

            content: {
                type: 'text',
                faker: '$faker->text()',
            },

            post: {
                type: 'text',
                faker: '$faker->text()',
            },

            detail: {
                type: 'text',
                faker: '$faker->sentence(20)',
            },

            details: {
                type: 'text',
                faker: '$faker->sentence(20)',
            },

            message: {
                type: 'text',
                faker: '$faker->sentence(20)',
            },

            payload: {
                type: 'longText',
                faker: '$faker->text()',
            },

            meta: {
                type: 'text',
                faker: '$faker->text()',
            },

            meta_description: {
                type: 'text',
                faker: '$faker->text()',
            },

            date: {
                type: 'date',
                faker: '$faker->date()',
            },

            birth: {
                type: 'date',
                faker: '$faker->date()',
            },

            birthdate: {
                type: 'date',
                faker: '$faker->date()',
            },

            birth_date: {
                type: 'date',
                faker: '$faker->date()',
            },

            datetime: {
                type: 'dateTime',
                faker: '$faker->date()',
            },

            date_time: {
                type: 'dateTime',
                faker: '$faker->date()',
            },

            time: {
                type: 'dateTime',
                faker: '$faker->date()',
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
                faker: '$faker->rg(false)',
            },

            cpf: {
                type: 'string',
                length: 11,
                faker: '$faker->cpf(false)',
            },

            cnpj: {
                type: 'string',
                length: 14,
                faker: '$faker->cnpj(false)',
            },

            cpf_cnpj: {
                type: 'string',
                length: 14,
                faker: '$faker->cpf(false)',
            },

            cnpj_cpf: {
                type: 'string',
                length: 14,
                faker: '$faker->cnpj(false)',
            },

            number: {
                type: 'integer',
                faker: '$faker->randomNumber()',
            },

            quantity: {
                type: 'integer',
                faker: '$faker->randomNumber()',
            },

            level: {
                type: 'integer',
                faker: '$faker->randomNumber()',
            },

            color: {
                type: 'string',
                length: 9,
                faker: '$faker->hexcolor()',
            },
            
            hexcolor: {
                type: 'string',
                length: 9,
                faker: '$faker->hexcolor()',
            },

            hex_color: {
                type: 'string',
                length: 9,
                faker: '$faker->hexcolor()',
            },
            
            color_name: {
                type: 'string',
                faker: '$faker->colorName()',
            },

            price: {
                type: 'decimal',
                faker: '$faker->randomFloat(2, 0, 9999)',
            },

            money: {
                type: 'decimal',
                faker: '$faker->randomFloat(2, 0, 9999)',
            },

            fundings: {
                type: 'decimal',
                faker: '$faker->randomFloat(2, 0, 9999)',
            },

            savings: {
                type: 'decimal',
                faker: '$faker->randomFloat(2, 0, 9999)',
            },

            discount: {
                type: 'decimal',
                faker: '$faker->randomFloat(2, 0, 9999)',
            },

            total: {
                type: 'decimal',
                faker: '$faker->randomFloat(2, 0, 9999)',
            },

            distance: {
                type: 'decimal',
                faker: '$faker->randomFloat(2, 0, 9999)',
            },

            size: {
                type: 'decimal',
                faker: '$faker->randomFloat(2, 0, 9999)',
            },

            width: {
                type: 'decimal',
                faker: '$faker->randomFloat(2, 0, 9999)',
            },

            height: {
                type: 'decimal',
                faker: '$faker->randomFloat(2, 0, 9999)',
            },

            weight: {
                type: 'decimal',
                faker: '$faker->randomFloat(2, 0, 9999)',
            },

            ip: {
                type: 'ipAddress',
                faker: '$faker->ipv4()',
            },

            ip_address: {
                type: 'ipAddress',
                faker: '$faker->ipv4()',
            },

            mac: {
                type: 'macAddress',
                faker: '$faker->macAddress()',
            },

            mac_address: {
                type: 'macAddress',
                faker: '$faker->macAddress()',
            },

            url: {
                type: 'string',
                faker: '$faker->url()',
            },

            domain: {
                type: 'string',
                faker: '$faker->domainName()',
            },

            user_agent: {
                type: 'string',
                faker: '$faker->userAgent()',
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
                faker: '"{$faker->latitude()},{$faker->longitude()}"',
            },

            position: {
                type: 'geometry',
                faker: '"{$faker->latitude()},{$faker->longitude()}"',
            },

            positions: {
                type: 'geometryCollection',
                faker: '"{$faker->latitude()},{$faker->longitude()}"',
            },

            year: {
                type: 'year',
                faker: '$faker->year()',
            },

            uuid: {
                type: 'uuid',
                faker: '$faker->uuid()',
            },

            active: {
                type: 'boolean',
                faker: '$faker->boolean()',
            },

            temperable: {
                type: 'boolean',
                faker: '$faker->boolean()',
            },

            verified_at: {
                type: 'timestamp',
                faker: '$faker->dateTime()',
            },

            reported_at: {
                type: 'timestamp',
                faker: '$faker->dateTime()',
            },

            delivered_at: {
                type: 'timestamp',
                faker: '$faker->dateTime()',
            },

            created_at: {
                type: 'timestamp',
                faker: '$faker->dateTime()',
            },

            updated_at: {
                type: 'timestamp',
                faker: '$faker->dateTime()',
            },

            deleted_at: {
                type: 'timestamp',
                faker: '$faker->dateTime()',
            },

            weekday: {
                type: 'string',
                length: 32,
                faker: '$faker->dayOfWeek()',
            },

            month: {
                type: 'enum',
                faker: '$faker->monthName()',
            },
        }
    }
}