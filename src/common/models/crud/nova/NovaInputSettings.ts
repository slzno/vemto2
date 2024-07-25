import { NovaInputType } from "./NovaInputTypesList";

export interface NovaKeyValueData {
    value: string
    label: string
}

export interface NovaBadgeIconData {
    value: string
    icon: string
}

export enum NovaInputCodeLanguage {
    Dockerfile = 'dockerfile',
    HtmlMixed = 'htmlmixed',
    JavaScript = 'javascript',
    Markdown = 'markdown',
    Nginx = 'nginx',
    Php = 'php',
    Ruby = 'ruby',
    Sass = 'sass',
    Shell = 'shell',
    Sql = 'sql',
    Twig = 'twig',
    Vim = 'vim',
    Vue = 'vue',
    Xml = 'xml',
    YamlFrontmatter = 'yaml-frontmatter',
    Yaml = 'yaml'
}

export default interface NovaInputSettings {
    inputType: NovaInputType;

    default: string;
    readonly: boolean;
    helperText: string;
    fullWidth: boolean;
    filterable: boolean;

    // Audio
    preload: string;

    // Avatar
    squared: boolean;
    rounded: boolean;

    // Badge
    map: NovaKeyValueData[];
    types: NovaKeyValueData[];
    addTypes: NovaKeyValueData[];
    withIcons: boolean;
    icons: NovaBadgeIconData[];
    label: string;
    labels: NovaKeyValueData[];

    // Boolean
    trueValue: string;
    falseValue: string;

    // BooleanGroup
    hideFalseValues: boolean;
    hideTrueValues: boolean;
    noValueText: string;

    // Code
    isJson: boolean;
    language: NovaInputCodeLanguage;

    // Currency
    currency: string;
    locale: string;

    min: number;
    max: number;
    step: number;

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
    withFiles: string;

    // MultiSelect
    displayUsingLabels: boolean;

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