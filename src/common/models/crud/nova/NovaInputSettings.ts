import { NovaInputType } from "./NovaInputTypesList";

export default interface NovaInputSettings {
    inputType: NovaInputType;

    default: string;
    readonly: boolean;
    helpText: string;
    fullWidth: boolean;
    filterable: boolean;

    // Audio
    preload: string;

    // Avatar
    squared: boolean;

    // Badge
    map: string[];
    types: string[];
    addTypes: string[];
    withIcons: boolean;
    icons: string[];
    label: string;
    labels: string[];

    // Boolean
    trueValue: string;
    falseValue: string;

    // BooleanGroup
    options: string[];
    hideFalseValues: boolean;
    hideTrueValues: boolean;
    noValueText: string;

    // Code
    isJson: boolean;
    language: 'dockerfile' | 'htmlmixed' | 'javascript' | 'markdown' | 'nginx' | 'php' | 'ruby' | 'sass' | 'shell' | 'sql' | 'twig' | 'vim' | 'vue' | 'xml' | 'yaml-frontmatter' | 'yaml';

    // Currency
    currency: string;
    min: number;
    max: number;
    step: number;
    locale: string;

    // File
    disk: string;
    disableDownload: boolean;
    storeOriginalName: string;
    storeSize: string;
    deletable: boolean;
    prunable: boolean;
    path: string;
    acceptedTypes: string[];
    
    // Image
    maxWidth: number;
    indexWidth: number;
    detailWidth: number;

    // Markdown
    alwaysShow: boolean;
    preset: 'default' | 'commonmark' | 'zero';
    withFiles: boolean;

    // MultiSelect
    displayUsingLabels: boolean;

    // Password
    onlyOnForms: boolean;

    // Select
    searchable: boolean;

    // Slug
    from: string;
    separator: string;

    // Text
    suggestions: string[];
    asHtml: boolean;
    copyable: boolean;
    maxLength: number;
    enforceMaxLength: boolean;
    textAlign: 'left' | 'center' | 'right';

    // Textarea
    rows: number;
}