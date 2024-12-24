export default class Settings {
    is_horizontal: boolean; // 横書きならtrue
    is_exclude_ruby: boolean; // ルビを含まないならtrue
    scroll_smooth_lv: number; // スクロールの滑らかさ
    is_scroll_cache: boolean  // スクロール位置を記憶するか
    font_size: number; // 文字サイズ
    body_padding: number; // 本文のpadding
    theme_id: number; // テーマID
    is_voice_enable: boolean; // ボイス再生を有効にするか 未実装
    voice_actor_id: number; // ボイスアクターID 未実装
    voice_actor_name: string; // ボイスアクター名 未実装

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