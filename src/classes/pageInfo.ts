export default class PageInfo {
    id: string;
    title: string;
    author: string;

    constructor() {
        this.id = extractId();
        this.title = document.querySelector('.title')?.textContent || 'Unknown Title';
        this.author = document.querySelector('head meta[name="DC.Creator"]')?.getAttribute('content') || 'Unknown Author';
    }
}

/**
 * urlからid抽出
 * @returns {string} 作者idと作品idを'e'で連結した文字列
 */
function extractId() {
    const numbers = location.href.match(/\d+/g);
    return numbers ? numbers.join('e') : '';
}