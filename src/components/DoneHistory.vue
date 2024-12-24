<template>
  <div>
    <!-- 履歴が空の場合 -->
    <p v-if="doneHistories.length === 0" class="empty">empty</p>

    <!-- 履歴リスト -->
    <div v-else>
      <div class="list-items" v-for="content in doneHistories" :key="content.id">
        <div style="flex: 2; display: flex; align-items: center;">
          <p
            class="done-icon update-done done-enable icon"
            :data-id="content.id"
          ></p>
          <p class="list-title">
            <a
              :href="content.reconstructUrl('content')"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ content.title }}
            </a>
          </p>
        </div>
        <p style="flex: 1;">
          <a
            :href="content.reconstructUrl('author')"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ content.author }}
          </a>
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from "vue";
import useStore from '@/store';

const store = useStore();

export default defineComponent({
  name: "DoneHistories",
  setup() {
    const doneHistories = store.done_histories;

    onMounted(() => {

    });

    return {
      doneHistories,
    };
  },
});
</script>

<style scoped>

</style>
