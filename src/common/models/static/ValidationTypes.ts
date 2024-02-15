export default class ValidationTypes {
    static get() {
        return [
            {
                text: 'accepted',
                description: 'The field under validation must be yes, on, 1, or true',
                link: 'https://laravel.com/docs/10.x/validation#rule-accepted'
            },
            {
                text: 'accepted_if:anotherfield,value,...',
                description: 'The field under validation must be "yes", "on", 1, or true if another field under validation is equal to a specified value.',
                link: 'https://laravel.com/docs/10.x/validation#rule-accepted-if'
            },
            {
                text: 'active_url',
                description: 'The field under validation must have a valid A or AAAA record according to the dns_get_record PHP function',
                link: 'https://laravel.com/docs/10.x/validation#rule-active-url'
            },
            {
                text: 'after:date',
                description: 'The field under validation must be a value after a given date',
                link: 'https://laravel.com/docs/10.x/validation#rule-after'
            },
            {
                text: 'after_or_equal:date',
                description: 'The field under validation must be a value after or equal to the given date',
                link: 'https://laravel.com/docs/10.x/validation#rule-after-or-equal'
            },
            {
                text: 'alpha',
                description: 'The field under validation must be entirely alphabetic characters.',
                link: 'https://laravel.com/docs/10.x/validation#rule-alpha'
            },
            {
                text: 'alpha:ascii',
                description: 'The field under validation must be entirely alphabetic characters (ASCII).',
                link: 'https://laravel.com/docs/10.x/validation#rule-alpha'
            },
            {
                text: 'alpha_dash',
                description: 'The field under validation may have alpha-numeric characters, as well as dashes and underscores.',
                link: 'https://laravel.com/docs/10.x/validation#rule-alpha-dash'
            },
            {
                text: 'alpha_dash:ascii',
                description: 'The field under validation may have alpha-numeric characters, as well as dashes and underscores. (ASCII)',
                link: 'https://laravel.com/docs/10.x/validation#rule-alpha-dash'
            },
            {
                text: 'alpha_num',
                description: 'The field under validation must be entirely alpha-numeric characters.',
                link: 'https://laravel.com/docs/10.x/validation#rule-alpha-num'
            },
            {
                text: 'alpha_num:ascii',
                description: 'The field under validation must be entirely alpha-numeric characters.',
                link: 'https://laravel.com/docs/10.x/validation#rule-alpha-num'
            },
            {
                text: 'array',
                description: 'The field under validation must be a PHP array.',
                link: 'https://laravel.com/docs/10.x/validation#rule-array'
            },
            {
                text: 'ascii',
                description: 'The field under validation must be entirely 7-bit ASCII characters.',
                link: 'https://laravel.com/docs/10.x/validation#rule-ascii'
            },
            {
                text: 'bail',
                description: 'Stop running validation rules after the first validation failure.',
                link: 'https://laravel.com/docs/10.x/validation#rule-bail'
            },
            {
                text: 'before:date',
                description: 'The field under validation must be a value preceding the given date',
                link: 'https://laravel.com/docs/10.x/validation#rule-before'
            },
            {
                text: 'before_or_equal:date',
                description: 'The field under validation must be a value preceding or equal to the given date',
                link: 'https://laravel.com/docs/10.x/validation#rule-before-or-equal'
            },
            {
                text: 'between:min,max',
                description: 'The field under validation must have a size between the given min and max',
                link: 'https://laravel.com/docs/10.x/validation#rule-between'
            },
            {
                text: 'boolean',
                description: 'The field under validation must be able to be cast as a boolean',
                link: 'https://laravel.com/docs/10.x/validation#rule-boolean'
            },
            {
                text: 'confirmed',
                description: 'The field under validation must have a matching field of foo_confirmation',
                link: 'https://laravel.com/docs/10.x/validation#rule-confirmed'
            },
            {
                text: 'current_password',
                description: "The field under validation must match the authenticated user's password",
                link: 'https://laravel.com/docs/10.x/validation#rule-current-password'
            },
            {
                text: 'current_password:web',
                description: "The field under validation must match the authenticated user's password",
                link: 'https://laravel.com/docs/10.x/validation#rule-current-password'
            },
            {
                text: 'current_password:api',
                description: "The field under validation must match the authenticated user's password",
                link: 'https://laravel.com/docs/10.x/validation#rule-current-password'
            },
            {
                text: 'date',
                description: 'The field under validation must be a valid, non-relative date according to the strtotime PHP function.',
                link: 'https://laravel.com/docs/10.x/validation#rule-date'
            },
            {
                text: 'date_equals:date',
                description: 'The field under validation must be equal to the given date',
                link: 'https://laravel.com/docs/10.x/validation#rule-date-equals'
            },
            {
                text: 'date_format:format',
                description: 'The field under validation must match the given format',
                link: 'https://laravel.com/docs/10.x/validation#rule-date-format'
            },
            {
                text: 'decimal:min,max',
                description: 'The field under validation must be a decimal with a maximum of digits including decimals',
                link: 'https://laravel.com/docs/10.x/validation#rule-decimal'
            },
            {
                text: 'decimal:2',
                description: 'The field under validation must be a decimal with a maximum of digits including decimals',
                link: 'https://laravel.com/docs/10.x/validation#rule-decimal'
            },
            {
                text: 'declined',
                description: 'The field under validation must be "no", "off", 0, or false.',
                link: 'https://laravel.com/docs/10.x/validation#rule-declined'
            },
            {
                text: 'declined_if:anotherfield,value,...',
                description: 'The field under validation must be "no", "off", 0, or false if another field under validation is equal to a specified value.',
                link: 'https://laravel.com/docs/10.x/validation#rule-declined-if'
            },
            {
                text: 'different:field',
                description: 'The field under validation must have a different value than field.',
                link: 'https://laravel.com/docs/10.x/validation#rule-different'
            },
            {
                text: 'digits:value',
                description: 'The field under validation must be numeric and must have an exact length of value.',
                link: 'https://laravel.com/docs/10.x/validation#rule-digits'
            },
            {
                text: 'digits_between:min,max',
                description: 'The field under validation must be numeric and must have a length between the given min and max.',
                link: 'https://laravel.com/docs/10.x/validation#rule-digits-between'
            },
            {
                text: 'dimensions:min_width=100,min_height=200',
                description: "The file under validation must be an image meeting the dimension constraints as specified by the rule's parameters: false Available constraints are: min_width, max_width, min_height, max_height, width, height, ratio",
                link: 'https://laravel.com/docs/10.x/validation#rule-dimensions'
            },
            {
                text: 'dimensions:ratio=3/2',
                description: "The file under validation must be an image meeting the dimension constraints as specified by the rule's parameters: false Available constraints are: min_width, max_width, min_height, max_height, width, height, ratio",
                link: 'https://laravel.com/docs/10.x/validation#rule-dimensions'
            },
            {
                text: 'distinct',
                description: 'When working with arrays, the field under validation must not have any duplicate values',
                link: 'https://laravel.com/docs/10.x/validation#rule-distinct'
            },
            {
                text: 'distinct:strict',
                description: 'When working with arrays, the field under validation must not have any duplicate values',
                link: 'https://laravel.com/docs/10.x/validation#rule-distinct'
            },
            {
                text: 'distinct:ignore_case',
                description: 'When working with arrays, the field under validation must not have any duplicate values',
                link: 'https://laravel.com/docs/10.x/validation#rule-distinct'
            },
            {
                text: 'email',
                description: 'The field under validation must be formatted as an e-mail address',
                link: 'https://laravel.com/docs/10.x/validation#rule-email'
            },
            {
                text: 'ends_with:foo,bar,...',
                description: 'The field under validation must end with one of the given values.',
                link: 'https://laravel.com/docs/10.x/validation#rule-ends-with'
            },
            {
                text: 'exclude',
                description: 'The field under validation will be excluded from the request data returned by the validate and validated methods.',
                link: 'https://laravel.com/docs/10.x/validation#rule-exclude'
            },
            {
                text: 'exclude_if:anotherfield,value',
                description: 'The field under validation will be excluded from the request data returned by the validate and validated methods if the anotherfield field is equal to value.',
                link: 'https://laravel.com/docs/10.x/validation#rule-exclude-if'
            },
            {
                text: 'exclude_unless:anotherfield,value',
                description: "The field under validation will be excluded from the request data returned by the validate and validated methods unless anotherfield's field is equal to value.",
                link: 'https://laravel.com/docs/10.x/validation#rule-exclude-unless'
            },
            {
                text: 'exclude_with:anotherfield',
                description: 'The field under validation will be excluded from the request data returned by the validate and validated methods if the anotherfield field is present.',
                link: 'https://laravel.com/docs/10.x/validation#rule-exclude-with'
            },
            {
                text: 'exclude_without:anotherfield',
                description: 'The field under validation will be excluded from the request data returned by the validate and validated methods if the anotherfield field is not present.',
                link: 'https://laravel.com/docs/10.x/validation#rule-exclude-without'
            },
            {
                text: 'exists:table,column',
                description: 'The field under validation must exist on a given database table.',
                link: 'https://laravel.com/docs/10.x/validation#rule-exists'
            },
            {
                text: 'extension:foo,bar,...',
                description: 'The file under validation must have a user-assigned extension corresponding to one of the listed extensions.',
                link: 'https://laravel.com/docs/10.x/validation#rule-extensions'
            },
            {
                text: 'file',
                description: 'The field under validation must be a successfully uploaded file.',
                link: 'https://laravel.com/docs/10.x/validation#rule-file'
            },
            {
                text: 'filled',
                description: 'The field under validation must not be empty when it is present.',
                link: 'https://laravel.com/docs/10.x/validation#rule-filled'
            },
            {
                text: 'gt:field',
                description: 'The field under validation must be greater than the given field',
                link: 'https://laravel.com/docs/10.x/validation#rule-gt'
            },
            {
                text: 'gte:field',
                description: 'The field under validation must be greater than or equal to the given field',
                link: 'https://laravel.com/docs/10.x/validation#rule-gte'
            },
            {
                type: 'hex_color',
                description: 'The field under validation must contain a valid color value in hexadecimal format.',
                link: 'https://laravel.com/docs/10.x/validation#rule-hex-color'
            },
            {
                text: 'image',
                description: 'The file under validation must be an image (jpeg, png, bmp, gif, svg, or webp)',
                link: 'https://laravel.com/docs/10.x/validation#rule-image'
            },
            {
                text: 'in:foo,bar,...',
                description: 'The field under validation must be included in the given list of values',
                link: 'https://laravel.com/docs/10.x/validation#rule-in'
            },
            {
                text: 'in_array:anotherfield.*',
                description: "The field under validation must exist in anotherfield's values.",
                link: 'https://laravel.com/docs/10.x/validation#rule-in-array'
            },
            {
                text: 'integer',
                description: 'The field under validation must be an integer',
                link: 'https://laravel.com/docs/10.x/validation#rule-integer'
            },
            {
                text: 'ip',
                description: 'The field under validation must be an IP address',
                link: 'https://laravel.com/docs/10.x/validation#rule-ip'
            },
            {
                text: 'json',
                description: 'The field under validation must be a valid JSON string.',
                link: 'https://laravel.com/docs/10.x/validation#rule-json'
            },
            {
                text: 'lt:field',
                description: 'The field under validation must be less than the given field',
                link: 'https://laravel.com/docs/10.x/validation#rule-lt'
            },
            {
                text: 'lte:field',
                description: 'The field under validation must be less than or equal to the given field',
                link: 'https://laravel.com/docs/10.x/validation#rule-lte'
            },
            {
                text: 'lowercase',
                description: 'The field under validation must be lowercase.',
                link: 'https://laravel.com/docs/10.x/validation#rule-lowercase'
            },
            {
                text: 'mac_address',
                description: 'The field under validation must be a MAC address.',
                link: 'https://laravel.com/docs/10.x/validation#rule-mac-address'
            },
            {
                text: 'max:value',
                description: 'The field under validation must be less than or equal to a maximum value',
                link: 'https://laravel.com/docs/10.x/validation#rule-max'
            },
            {
                text: 'max_digits:value',
                description: 'The integer under validation must have a maximum length of value.',
                link: 'https://laravel.com/docs/10.x/validation#rule-max-digits'
            },
            {
                text: 'mimetypes:text/plain,...',
                description: "The file under validation must match one of the given MIME types: false To determine the MIME type of the uploaded file, the file's contents will be read and the framework will attempt to guess the MIME type, which may be different from the client provided MIME type.",
                link: 'https://laravel.com/docs/10.x/validation#rule-mimetypes'
            },
            {
                text: 'mimetypes:image/jpeg,image/png,image/bmp,image/gif,image/svg,image/webp',
                description: "The file under validation must match one of the given MIME types: false To determine the MIME type of the uploaded file, the file's contents will be read and the framework will attempt to guess the MIME type, which may be different from the client provided MIME type.",
                link: 'https://laravel.com/docs/10.x/validation#rule-mimetypes'
            },
            {
                text: 'mimetypes:video/mp4,video/avi,video/mov,video/flv,video/wmv,video/3gp,video/webm,video/mkv',
                description: "The file under validation must match one of the given MIME types: false To determine the MIME type of the uploaded file, the file's contents will be read and the framework will attempt to guess the MIME type, which may be different from the client provided MIME type.",
                link: 'https://laravel.com/docs/10.x/validation#rule-mimetypes'
            },
            {
                text: 'mimes:foo,bar,...',
                description: 'The file under validation must have a MIME type corresponding to one of the listed extensions',
                link: 'https://laravel.com/docs/10.x/validation#rule-mimes'
            },
            {
                text: 'mimes:jpe,jpeg,jpg,png,gif,svg,webp',
                description: 'The file under validation must have a MIME type corresponding to one of the listed extensions',
                link: 'https://laravel.com/docs/10.x/validation#rule-mimes'
            },
            {
                text: 'mimes:mp4,avi,mov,flv,wmv,3gp,webm,mkv',
                description: 'The file under validation must have a MIME type corresponding to one of the listed extensions',
                link: 'https://laravel.com/docs/10.x/validation#rule-mimes'
            },
            {
                text: 'min:value',
                description: 'The field under validation must have a minimum value',
                link: 'https://laravel.com/docs/10.x/validation#rule-min'
            },
            {
                text: 'min_digits:value',
                description: 'The integer under validation must have a minimum length of value.',
                link: 'https://laravel.com/docs/10.x/validation#rule-min-digits'
            },
            {
                text: 'multiple_of:value',
                description: 'The field under validation must be a multiple of value.',
                link: 'https://laravel.com/docs/10.x/validation#rule-multiple-of'
            },
            {
                text: 'missing',
                description: 'The field under validation must not be present in the input data.',
                link: 'https://laravel.com/docs/10.x/validation#rule-missing'
            },
            {
                text: 'missing_if:anotherfield,value,...',
                description: 'The field under validation must not be present if the anotherfield field is equal to any value.',
                link: 'https://laravel.com/docs/10.x/validation#rule-missing-if'
            },
            {
                text: 'missing_unless:anotherfield,value',
                description: 'The field under validation must not be present unless the anotherfield field is equal to any value.',
                link: 'https://laravel.com/docs/10.x/validation#rule-missing-unless'
            },
            {
                text: 'missing_with:foo,bar,...',
                description: 'The field under validation must not be present only if any of the other specified fields are present.',
                link: 'https://laravel.com/docs/10.x/validation#rule-missing-with'
            },
            {
                text: 'missing_with_all:foo,bar,...',
                description: 'The field under validation must not be present only if all of the other specified fields are present.',
                link: 'https://laravel.com/docs/10.x/validation#rule-missing-with-all'
            },
            {
                text: 'not_in:foo,bar,...',
                description: 'The field under validation must not be included in the given list of values',
                link: 'https://laravel.com/docs/10.x/validation#rule-not-in'
            },
            {
                text: 'not_regex:pattern',
                description: 'The field under validation must not match the given regular expression',
                link: 'https://laravel.com/docs/10.x/validation#rule-not-regex'
            },
            {
                text: 'nullable',
                description: 'The field under validation may be null',
                link: 'https://laravel.com/docs/10.x/validation#rule-nullable'
            },
            {
                text: 'numeric',
                description: 'The field under validation must be numeric.',
                link: 'https://laravel.com/docs/10.x/validation#rule-numeric'
            },
            {
                text: 'password',
                description: "The field under validation must match the authenticated user's password",
                link: 'https://laravel.com/docs/10.x/validation#rule-password'
            },
            {
                text: 'present',
                description: 'The field under validation must be present in the input data but can be empty.',
                link: 'https://laravel.com/docs/10.x/validation#rule-present'
            },
            {
                text: 'regex:pattern',
                description: 'The field under validation must match the given regular expression',
                link: 'https://laravel.com/docs/10.x/validation#rule-regex'
            },
            {
                text: 'required',
                description: 'The field under validation must be present in the input data and not empty',
                link: 'https://laravel.com/docs/10.x/validation#rule-required'
            },
            {
                text: 'required_if:anotherfield,value,...',
                description: 'The field under validation must be present and not empty if the anotherfield field is equal to any value',
                link: 'https://laravel.com/docs/10.x/validation#rule-required-if'
            },
            {
                text: 'required_unless:anotherfield,value,...',
                description: 'The field under validation must be present and not empty unless the anotherfield field is equal to any value.',
                link: 'https://laravel.com/docs/10.x/validation#rule-required-unless'
            },
            {
                text: 'required_with:foo,bar,...',
                description: 'The field under validation must be present and not empty only if any of the other specified fields are present.',
                link: 'https://laravel.com/docs/10.x/validation#rule-required-with'
            },
            {
                text: 'required_with_all:foo,bar,...',
                description: 'The field under validation must be present and not empty only if all of the other specified fields are present.',
                link: 'https://laravel.com/docs/10.x/validation#rule-required-with-all'
            },
            {
                text: 'required_without:foo,bar,...',
                description: 'The field under validation must be present and not empty only when any of the other specified fields are not present.',
                link: 'https://laravel.com/docs/10.x/validation#rule-required-without'
            },
            {
                text: 'required_without_all:foo,bar,...',
                description: 'The field under validation must be present and not empty only when all of the other specified fields are not present.',
                link: 'https://laravel.com/docs/10.x/validation#rule-required-without-all'
            },
            {
                text: 'required_array_keys:foo,bar,...',
                description: 'The field under validation must be an array and must contain at least the specified keys.',
                link: 'https://laravel.com/docs/10.x/validation#rule-required-array-keys'
            },
            {
                text: 'same:field',
                description: 'The given field must match the field under validation.',
                link: 'https://laravel.com/docs/10.x/validation#rule-same'
            },
            {
                text: 'size:value',
                description: 'The field under validation must have a size matching the given value',
                link: 'https://laravel.com/docs/10.x/validation#rule-size'
            },
            {
                text: 'sometimes',
                description: 'The field under validation will only be validated if it is present.',
                link: 'https://laravel.com/docs/10.x/validation#rule-sometimes'
            },
            {
                text: 'starts_with:foo,bar,...',
                description: 'The field under validation must start with one of the given values.',
                link: 'https://laravel.com/docs/10.x/validation#rule-starts-with'
            },
            {
                text: 'string',
                description: 'The field under validation must be a string',
                link: 'https://laravel.com/docs/10.x/validation#rule-string'
            },
            {
                text: 'timezone',
                description: 'The field under validation must be a valid timezone identifier according to the timezone_identifiers_list PHP function.',
                link: 'https://laravel.com/docs/10.x/validation#rule-timezone'
            },
            {
                text: 'unique:table,column,except,idColumn',
                description: 'The field under validation must not exist within the given database table',
                link: 'https://laravel.com/docs/10.x/validation#rule-unique'
            },
            {
                text: 'uppercase',
                description: 'The field under validation must be uppercase.',
                link: 'https://laravel.com/docs/10.x/validation#rule-uppercase'
            },
            {
                text: 'url',
                description: 'The field under validation must be a valid URL.',
                link: 'https://laravel.com/docs/10.x/validation#rule-url'
            },
            {
                text: 'url:https',
                description: 'The field under validation must be a valid URL.',
                link: 'https://laravel.com/docs/10.x/validation#rule-url'
            },
            {
                text: 'ulid',
                description: 'The field under validation must be a valid Universally Unique Lexicographically Sortable Identifier (ULID).',
                link: 'https://laravel.com/docs/10.x/validation#rule-ulid'
            },
            {
                text: 'uuid',
                description: 'The field under validation must be a valid RFC 4122 (version 1, 3, 4, or 5) universally unique identifier (UUID).',
                link: 'https://laravel.com/docs/10.x/validation#rule-uuid'
            }
        ]
    }
}