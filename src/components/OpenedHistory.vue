<template>
  <div>
    <p v-if="!openedHistories.length" class="empty">empty</p>
    <div v-for="content in openedHistories" :key="content.id" class="list-items">
      <div style="flex: 2; display: flex; align-items: center;">
        <p class="list-title">
          <a :href="content.reconstructUrl('content')" target="_blank" rel="noopener noreferrer">
            {{ content.title }}
          </a>
        </p>
      </div>
      <p style="flex: 1;">
        <a :href="content.reconstructUrl('author')" target="_blank" rel="noopener noreferrer">
          {{ content.author }}
        </a>
      </p>
      <p class="delete-icon-box icon" @click="deleteItem(content.id)">
        <svg viewBox="0 0 24 24">
          <path class="delete-icon" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"></path>
        </svg>
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { onMounted } from "vue";
import useStore from '@/store';

const store = useStore();

export default {
  name: "OpenedHistory",
  setup() {
    const openedHistories = store.opened_histories;

    const deleteItem = (id: string) => {
      store.deleteOpenedAt(id);
    };

    onMounted(() => {

    });

    return {
      openedHistories,
      deleteItem,
    };
  },
};
</script>

<style scoped>

</style>
