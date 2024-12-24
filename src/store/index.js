import { defineStore } from 'pinia';
import Settings from '@/classes/settings';
import PageInfo from '@/classes/pageInfo';
import Content from '@/classes/content';
import azppDatabase from '@/classes/db';
/**
 * スクロールバーが終端までの何%の位置にあるか取得
 * @returns {number}
 */
function getScrollbarPositionFromTop() {
    const scrollTop = document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercentage = (scrollTop / scrollHeight) * 100;
    return scrollPercentage;
}
/**
 * スクロールバーが左端までの何%の位置にあるか取得
 * @returns {number}
 */
function getScrollbarPositionFromRight() {
    // ドキュメントの全幅
    const documentWidth = document.documentElement.scrollWidth;
    // 現在のスクロール位置（左端からの位置）
    const scrollLeft = document.documentElement.scrollLeft * -1;
    // ドキュメント全幅に対する右からの割合
    const percentageFromRight = 100 - ((documentWidth - scrollLeft) / documentWidth) * 100;
    return percentageFromRight;
}
const useStore = defineStore('main', {
    state: () => ({
        settings: new Settings(), // 設定系
        page_info: new PageInfo(), // 現在のページの情報
        contents: [], // Content 型の配列
        azppDatabase: new azppDatabase(), // azppDatabase のインスタンス
        selected_tab: 'Bookmark', // 現在のタブの種類
    }),
    actions: {
        // Settings系
        updateIsHorizontal(value) {
            this.settings.is_horizontal = value;
        },
        updateFontSize(value) {
            this.settings.font_size = value;
        },
        updateScrollSmoothLv(value) {
            this.settings.scroll_smooth_lv = value;
        },
        updateIsExcludeRuby(value) {
            this.settings.is_exclude_ruby = value;
        },
        updateIsScrollCache(value) {
            this.settings.is_scroll_cache = value;
        },
        updateBodyPadding(value) {
            this.settings.body_padding = value;
        },
        updateThemeId(value) {
            this.settings.theme_id = value;
        },
        // Content系
        toggleFavAt(id) {
            const content = this.getContentById(id);
            if (content)
                content.fav_at = content.fav_at === 0 ? Date.now() : 0;
        },
        deleteOpenedAt(id) {
            const content = this.getContentById(id);
            if (content)
                content.opened_at = 0;
        },
        toggleDoneAt(id) {
            const content = this.getContentById(id);
            if (content)
                content.done_at = content.done_at === 0 ? Date.now() : 0;
        },
        updateSelectedTab(value) {
            this.selected_tab = value;
        },
        refreshScrollPosition() {
            const scroll_position = this.settings.is_horizontal
                ? getScrollbarPositionFromTop()
                : getScrollbarPositionFromRight();
            const current_content = this.getContentById(this.page_info.id);
            if (current_content)
                current_content.last_scroll = scroll_position;
        },
        async loadSaveData() {
            try {
                const db = this.azppDatabase;
                // データベースから既存データを取得
                const saved_settings = await db.settings.get('root');
                if (saved_settings) {
                    this.settings = saved_settings;
                }
                else {
                    await db.settings.add(this.settings);
                }
                this.contents = await db.contents.toArray();
                const current_content = this.getContentById(this.page_info.id);
                if (current_content) {
                    current_content.opened_at = new Date().getTime();
                    await db.contents.put(current_content);
                }
                else {
                    const new_content = new Content();
                    this.contents.push(new_content);
                    await db.contents.add(new_content);
                }
            }
            catch (error) {
                console.error("データの読み込みまたは保存中にエラーが発生しました:", error);
            }
        },
        getContentById(id) {
            return this.contents.find((content) => content.id === id);
        },
    },
    getters: {
        current_content: (state) => {
            return state.contents.find((content) => content.id === state.page_info.id) || new Content();
        },
        bookmarks: (state) => {
            return state.contents.filter((content) => content.fav_at !== 0).sort((a, b) => b.fav_at - a.fav_at);
        },
        opened_histories: (state) => {
            return state.contents.filter((content) => content.opened_at !== 0).sort((a, b) => b.opened_at - a.opened_at);
        },
        done_histories: (state) => {
            return state.contents.filter((content) => content.done_at !== 0).sort((a, b) => b.done_at - a.done_at);
        },
    },
});
export default useStore;
//# sourceMappingURL=index.js.map