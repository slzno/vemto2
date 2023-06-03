<script lang="ts">
    import { compile, h } from "vue"
    import { unescape } from "lodash"

    export default {
        props: {
            component: {
                type: Object,
                default: null,
            },
        },
        data() {
            return { 
                internalComponent: null,
            }
        },
        watch: {
            internalComponent: {
                handler() {
                    this.$emit("update", this.internalComponent)
                },
                deep: true,
            },
        },
        created() {
            this.internalComponent = this.component
        },
        methods: {
            htmlToText(html) {
                return unescape(html)
            },
        },
        setup(props) {
            const fullTemplate = `<div v-if="internalComponent">${props.component.getPreviewCode()}</div>`
            return compile(fullTemplate)
        },
    }
</script>
