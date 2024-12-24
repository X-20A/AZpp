import PageInfo from './pageInfo';
export default class Content {
    id; // 作者idと作品idを'e'で連結した文字列
    title; // 作品タイトル
    author; // 作者名
    last_scroll; // 最後にスクロールした位置
    fav_at; // お気に入り登録日時
    opened_at; // 開いた日時
    done_at; // 読了日時
    constructor() {
        const page_info = new PageInfo();
        this.id = page_info.id;
        this.title = page_info.title;
        this.author = page_info.author;
        this.last_scroll = 0;
        this.fav_at = 0;
        this.opened_at = new Date().getTime();
        this.done_at = 0;
    }
    /**
     * Content.idからurl構築
     * @param {'content' | 'author'} type content(作者ページ) | author(作品ページ)
     * @returns
     */
    reconstructUrl(type) {
        const parts = this.id.split('e');
        if (parts.length !== 3) {
            throw new Error('Invalid input format');
        }
        if (type === 'content') {
            return `https://www.aozora.gr.jp/cards/${parts[0]}/files/${parts[1]}_${parts[2]}.html`;
        }
        else if (type === 'author') {
            return `https://www.aozora.gr.jp/index_pages/person${Number(parts[0])}.html`;
        }
        // type が正しくない場合にエラーを投げる
        throw new Error('Invalid type');
    }
}
//# sourceMappingURL=content.js.map