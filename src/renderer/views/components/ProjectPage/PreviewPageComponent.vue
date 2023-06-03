<script lang="ts">
    import { compile, h } from "vue"
    import { unescape } from "lodash"

    export default {
        props: {
            baseComponent: {
                type: Object,
                default: null,
            },
        },
        data() {
            return { 
                component: null,
            }
        },
        watch: {
            component: {
                handler() {
                    this.$emit("update", this.component)
                },
                deep: true,
            },
        },
        created() {
            this.component = this.baseComponent
        },
        methods: {
            htmlToText(html) {
                return unescape(html)
            },
        },
        setup(props) {
            const fullTemplate = `<div v-if="component">${props.baseComponent.getPreviewCode()}</div>`
            return compile(fullTemplate)
        },
    }
</script>
