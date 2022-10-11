module.exports = {
    extends: [
        // add more generic rulesets here, such as:
        "plugin:vue/vue3-essential",
        "eslint:recommended",
        "@vue/eslint-config-typescript",
        // "@vue/eslint-config-prettier",
    ],
    rules: {
        // override/add rules settings here, such as:
        // 'vue/no-unused-vars': 'error'
        'no-undef': 'off',
    },
}
