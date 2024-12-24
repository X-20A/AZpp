<template>
  <div id="modal-bg">
    <div id="modal-container">
      <div id="header-box">
        <div id="nav">
          <span v-for="(tab, index) in tab_labels" :key="index" class="nav-content"
            :class="{ 'nav-selected': selected_tab === tab.name }" @click="changeTab(tab.name)">
            {{ tab.label }}
          </span>
        </div>
        <div id="controller-box">
          <p class="bookmark-icon update-bookmark"
            :class="{'bookmark-enable': content.fav_at !== 0, 'bookmark-disable': content.fav_at === 0}"
            @click="toggleBookmark(page_info.id)">
            <svg v-if="content.fav_at !== 0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M18,22A2,2 0 0,0 20,20V4C20,2.89 19.1,2 18,2H12V9L9.5,7.5L7,9V2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18Z" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M18,2A2,2 0 0,1 20,4V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V4A2,2 0 0,1 6,2H18M18,4H13V12L10.5,9.75L8,12V4H6V20H18V4Z" />
          </svg>
          </p>
          <p class="done-icon update-done"
            :class="{'done-enable': content.done_at !== 0, 'done-disable': content.done_at === 0}"
            @click="toggleDone(page_info.id)" style="margin-left: 3px;"></p>
        </div>
      </div>
      <div id="generate-area">
        <Bookmark v-show="selected_tab === 'Bookmark'" />
        <OpenedHistory v-show="selected_tab === 'OpenedHistory'" />
        <DoneHistory v-show="selected_tab === 'DoneHistory'" />
        <Setting v-show="selected_tab === 'Setting'" />
        <!-- <Audio v-show="selectedTab === 'Audio'" /> -->
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { watch, computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import useStore from '@/store';
import Bookmark from './components/Bookmark.vue';
import OpenedHistory from './components/OpenedHistory.vue';
import DoneHistory from './components/DoneHistory.vue';
import Setting from './components/Setting.vue';
// import Audio from './Audio.vue';


import { THEMES } from './classes/const';
import type { Theme } from './classes/const';
import type { SelectedTabType } from './type';

const store = useStore();

export default {
  components: {
    Bookmark,
    OpenedHistory,
    DoneHistory,
    Setting,
    // Audio
  },
  setup() {

    const { selected_tab, settings, page_info, current_content } = storeToRefs(store);
    const tab_labels = [
      { name: 'Bookmark', label: 'ブクマ' },
      { name: 'OpenedHistory', label: '閲覧履歴' },
      { name: 'DoneHistory', label: '読了履歴' },
      { name: 'Settings', label: '設定' },
    ];

    const body = document.body;

    const applyWritingMode = () => {
      const is_horizontal = store.settings.is_horizontal;
      if (is_horizontal) {
        body.style.writingMode = 'horizontal-tb';
      } else {
        body.style.writingMode = 'vertical-rl';
      }
    };

    const applyIsExcludeRuby = () => {
      const is_exclude_ruby = store.settings.is_exclude_ruby;
      const value = is_exclude_ruby ? "none" : "text";

      document.querySelectorAll("ruby rp, ruby rt").forEach((elem) => {
        (elem as HTMLElement).style.userSelect = value;
      });
    };

    const applyFontSize = () => {
      const font_size = store.settings.font_size;
      body.style.fontSize = `${font_size}px`;
    };

    const applyBodyPadding = () => {
      const is_horizontal = store.settings.is_horizontal;
      const body_padding = store.settings.body_padding;
      const value = is_horizontal 
        ? `10% ${body_padding}%` 
        : `${body_padding}% 10%`;

      body.style.padding = value;
    };

    const applyTheme = () => {
      const theme_id = store.settings.theme_id;
      const theme: Theme = THEMES[theme_id];

      body.style.backgroundColor = '#' + theme.bg_color;
      body.style.color = '#' + theme.font_color;
    };

    watch(() => settings.value.is_horizontal, applyWritingMode);

    watch(() => settings.value.is_exclude_ruby, applyIsExcludeRuby);

    watch(() => settings.value.font_size, applyFontSize);

    watch(() => [settings.value.is_horizontal, settings.value.body_padding], applyBodyPadding);

    watch(() => settings.value.theme_id, applyTheme);

    const wheel_event_listener = (event: WheelEvent) => {
      if (store.settings.is_horizontal) return; // 横書きの場合は処理を終了
      event.preventDefault(); // デフォルトの縦スクロールを無効化

      const totalScroll = -event.deltaY; // ホイール操作のスクロール量
      const steps = store.settings.scroll_smooth_lv; // 分割数 これを増やすほど滑らかになる
      const stepAmount = totalScroll / steps; // 1回のスクロール量
      let currentStep = 0;

      function smoothScroll() {
        if (currentStep >= steps) return; // 全てのステップが完了したら終了

        window.scrollTo(window.scrollX + stepAmount, 0); // 横スクロールの調整
        currentStep++;

        requestAnimationFrame(smoothScroll); // フレーム最適化
      }

      smoothScroll(); // アニメーション開始
    };

    /**
     * 任意の位置(右側からの百分率)にスクロール
     * @param {number} percentage 0 - 100
     */
    const scrollWithPercentage = (percentage: number) => {
        if (store.settings.is_horizontal) {
          scrollTo({
              left: body.scrollWidth * (-percentage / 100)
          });
        } else {
            scrollTo(
              0,
              (percentage / 100) * (document.documentElement.scrollHeight - document.documentElement.clientHeight)
            );
        }
    }

    const changeTab = (tab_type: string) => {
      store.updateSelectedTab(tab_type as SelectedTabType);
    };

    const toggleBookmark = (id: string) => {
      store.toggleFavAt(id);
    };

    const toggleDone = (id: string) => {
      store.toggleDoneAt(id);
    };

    const handleScroll = () => {
      store.refreshScrollPosition();
    };

    onMounted(async () => {
      await store.loadSaveData();

      // レイアウトを弄る前にスクロール位置を退避
      const scroll_position = store.current_content.last_scroll;

      body.style.margin = '0';

      applyWritingMode();
      applyIsExcludeRuby();
      applyFontSize();
      applyBodyPadding();
      applyTheme();

      if (store.settings.is_scroll_cache) {
        scrollWithPercentage(scroll_position);
      }

      window.addEventListener('scroll', handleScroll);
      window.addEventListener('wheel', wheel_event_listener, { passive: false });
    });

    return {
      Bookmark,
      OpenedHistory,
      DoneHistory,
      Setting,
      // Audio,
      selected_tab,
      tab_labels,
      content: current_content,
      page_info,
      changeTab,
      toggleBookmark,
      toggleDone,
    };
  }
};
</script>

<style>

</style>
