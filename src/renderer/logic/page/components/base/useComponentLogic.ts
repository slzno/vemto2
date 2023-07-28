import { ref, watch, onMounted } from "vue"

export default function useComponentLogic(baseComponent, emit) {
    const component = ref(null)

    onMounted(() => {
        component.value = baseComponent
    })

    watch(component, () => {
        emit('update', component.value)
    }, { deep: true })

    return { component }
}