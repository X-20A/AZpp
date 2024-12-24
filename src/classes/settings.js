export default class Settings {
    is_horizontal; // 横書きならtrue
    is_exclude_ruby; // ルビを含まないならtrue
    scroll_smooth_lv; // スクロールの滑らかさ
    is_scroll_cache; // スクロール位置を記憶するか
    font_size; // 文字サイズ
    body_padding; // 本文のpadding
    theme_id; // テーマID
    is_voice_enable; // ボイス再生を有効にするか 未実装
    voice_actor_id; // ボイスアクターID 未実装
    voice_actor_name; // ボイスアクター名 未実装
    constructor() {
        this.is_horizontal = false;
        this.is_exclude_ruby = true;
        this.scroll_smooth_lv = 12;
        this.is_scroll_cache = true;
        this.font_size = 22;
        this.body_padding = 8;
        this.theme_id = 0;
        this.is_voice_enable = false;
        this.voice_actor_id = 3;
        this.voice_actor_name = 'ずんだもん(ノーマル)';
    }
}
//# sourceMappingURL=settings.js.map