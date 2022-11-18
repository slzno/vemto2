module.exports = {
    "moduleDirectories": [
        "<rootDir>/node_modules",
        "node_modules"
    ],
    "transform": {
        "^.+\\.js$": "babel-jest"
    },
    "reporters": [
        "default",
    ],
    "projects": [
        {
            "displayName": "test-unit",
            "testMatch": [
                "<rootDir>/src/**/*.test.js"
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
                "<rootDir>/tests/jest/feature/**/*.test.js"
            ]
        }
    ]
}