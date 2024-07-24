<script setup lang="ts">
    import UiButton from "@Renderer/components/ui/UiButton.vue"
    import { useProjectStore } from "@Renderer/stores/useProjectStore"
    import { ref, Ref, onMounted } from "vue"
    import UiText from "@Renderer/components/ui/UiText.vue"
    import UiCheckbox from "@Renderer/components/ui/UiCheckbox.vue"
    import { PlusIcon } from "@heroicons/vue/24/outline"
    import { Wunderbaum } from "wunderbaum"
    import Main from "@Renderer/services/wrappers/Main"

    const projectStore = useProjectStore(),
        templates = ref([]) as Ref<string[]>,
        files = ref([]) as Ref<any[]>

    onMounted(() => {
        loadTemplates()

    })

    const loadTemplates = async () => {
        setTimeout(async () => {
            templates.value = await Main.API.listTemplates()
            files.value = generateStructure(templates.value)

            const tree = new Wunderbaum({
          element: document.getElementById("templates-tree") as HTMLDivElement,
          source: generateStructure(templates.value),
          init: (e) => {
            e.tree.setFocus();
          },
          activate: (e) => {
            // alert(`Thank you for activating ${e.node}.`);
          },
        });
        }, 100)
    }

    const generateStructure = (filePaths) => {
  const structure = [];

  filePaths.forEach(filePath => {
    const parts = filePath.split('/').filter(part => part);
    let currentLevel = structure;

    parts.forEach((part, index) => {
      let existingPath = currentLevel.find(item => item.title === part);
      if (!existingPath) {
        existingPath = {
          title: part,
          expanded: true,
          children: [],
        };
        if (index === parts.length - 1) {
          existingPath.path = filePath;
          delete existingPath.children;
        }
        currentLevel.push(existingPath);
      }
      currentLevel = existingPath.children || [];
    });
  });

  return structure;
}
</script>

<template>
    <div class="mb-3 flex space-x-2">
        <!-- <UiButton>
            <PlusIcon class="w-4 h-4 mr-1 text-red-500" />
            Add Section
        </UiButton> -->
    </div>

    <div class="bg-slate-950 p-3 rounded-lg border border-slate-700 h-screen  overflow-y-auto pb-48">
        <div id="templates-tree"></div>
    </div>
</template>