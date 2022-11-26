module.exports = {
    "moduleDirectories": [
        "<rootDir>/node_modules",
        "node_modules"
    ],
    "transform": {
        "^.+\\.(js|ts)$": "babel-jest"
    },
    "reporters": [
        "default",
        "<rootDir>/tests/base/DiffReporter.js"
    ],
    "projects": [
        {
            "displayName": "test-unit",
            "testMatch": [
                "<rootDir>/src/**/*.test.js",
                "<rootDir>/src/**/*.test.ts",
            ]
        },
        {
            "displayName": "test-templates",
            "testMatch": [
                "<rootDir>/tests/jest/template/**/*.test.js"
            ]
        },
        {
            "displayName": "test-features",
            "testMatch": [
                "<rootDir>/src/**/*.spec.js",
                "<rootDir>/src/**/*.spec.ts",
            ]
        }
    ]
}