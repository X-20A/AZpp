window.onload = async function(){
    /*
        ToDo
        ・highlight実装
        ・設定&favスイッチ実装
    */

    // 設定系はlocalStorage
    // 作品関係はIndexedDB

    const body = document.querySelector("body");

    let wheel_event_listner = null;

    let current_tab = 'bookmark';

    const page_info = {
        id: extractId(),
        title: document.querySelector("body > h1").textContent,
        author: document.querySelector('head meta[name="DC.Creator"]').getAttribute('content'),
    };

    // localStorage

    const initialSettings = {
        is_horizontal: true, // 縦書きならtrue
        is_exclude_ruby: true, // ルビを含まないならtrue
        scroll_smooth_lv: 12,
        is_scroll_cache: true,
        palette: [], // highlightに使うカラー '252525'とか
        font_size: 22,
        font_color: '000',
        body_padding: 8,
        background_color: 'fff',
        // カラー系は初期値に戻せるだけじゃなくて継承も選べるといいかも(他の拡張機能との競合を避けたい)
        theme: 0,
    };

    let local = localStorage.getItem('settings');
    if (local) {
        Object.assign(initialSettings, JSON.parse(local));
    } else {
        localStorage.setItem('settings', JSON.stringify(initialSettings));
    }

    // settingsのプロパティを操作すると自動でlocalStorageへ保存 & レイアウトを更新
    // ネストくらいならともかく配列を含んだりすると厄介(pushやfilterは不発する)で、あんまり汎用性はないかも
    const settings = new Proxy(initialSettings, {
        set(target, property, value) {
            target[property] = value; // プロパティに値を設定

            localStorage.setItem("settings", JSON.stringify(target));

            reflectLayout(); // レイアウト反映

            return true; // 設定成功を示すtrueを返す
        },
    });

    console.log(settings);
    // settings.is_horizontal = true; // test
    // settings.font_size = 22; // test

    // IndexedDB こっちは都度手動で保存
    const content = {
        id: page_info.id,
        title: page_info.title,
        author: page_info.author,
        last_scroll: 0,
        highlight: [], // [120, 145, '252525'] [start, end, color]
        done_at: "", // 読了した時刻 とりあえずユーザーが手動で操作したら設定
        opened_at: new Date().getTime(),
        fav_at: "",
    };

    const db = new Dexie('AZ_index');

    db.version(1).stores({
        contents: 'id,title,author,last_scroll,highlight,done_at,opened_at,updated_at,fav_at'
    });

    db.open().then(() => {
        console.log('Database opened successfully.');
    }).catch((err) => {
        console.error("Database open failed.: ", err);
    });

    // 開いている作品の情報を登録、ないし更新
    console.log('content.id : ', content.id);
    const existingContent = await db.contents.get(content.id);
    if (existingContent) {
        Object.assign(content, existingContent);
        content.opened_at = new Date().getTime();
        await saveCurrentContent(content);
    } else {
        await db.contents.add(content);
    }

    reflectLayout(); // レイアウト反映

    if (settings.is_scroll_cache) scrollWithPercentage(content.last_scroll); // 前回のスクロール位置へジャンプ

    // last_scroll更新
    window.onscroll = function() {
        console.log('getScrollbarPositionFromRight: ', getScrollbarPositionFromRight);
        console.log('getScrollbarPositionFromTop: ', getScrollbarPositionFromTop);
        content.last_scroll = settings.is_horizontal ? getScrollbarPositionFromRight() : getScrollbarPositionFromTop();
        saveCurrentContent(content);
    }

    const modal_html = `
        <div id="modal-bg">
            <div id="modal-container">
                <div id="nav">
                    <span class="nav-content nav-selected" data-tab="0">ブクマ</span>
                    <span class="nav-content" data-tab="1">閲覧履歴</span>
                    <span class="nav-content" data-tab="2">読了履歴</span>
                    <span class="nav-content" data-tab="3">設定</span>
                </div>
                <div id="generate-area">
                    ${await generateTab('bookmark', true)}
                    ${await generateTab('opened_history', false)}
                    ${await generateTab('done_history', false)}
                    ${await generateTab('setting', false)}
                </div>
            </div>
        </div>
    `;

    body.insertAdjacentHTML('beforeend', modal_html); // test

    console.log(document.querySelector('#modal-bg'));

    const modal = document.getElementById('modal-bg');
    const generate_area = document.getElementById('generate-area');

    const interfece_html = `
        <div id="interface">
            <p id="menu-icon"></p>
        </div>
    `;

    body.insertAdjacentHTML('beforeend', interfece_html); // test

    const interface = document.getElementById('interface');

    // モーダル内に表示するhtml生成
    // type: 'bookmark' | 'opened_history' | 'done_history' | 'setting'
    async function generateTab(type, is_visible) {
        let html = '';
        switch(type) {
            case 'bookmark':
                const bookmarks = await getContents('fav_at');
                console.log('bookmarks', bookmarks);
                const bookmark_length = bookmarks.length;
                if(!bookmark_length) {
                    html = '<p id="empty">empty</p>'
                }
                for(let i = 0;i < bookmark_length;i++) {
                    const bookmark = bookmarks[i];
                    console.log('bookmark', bookmark);
                    const id = bookmark.id;
                    const title = bookmark.title;
                    const author = bookmark.author;
                    const content_url = reconstructUrl(id, 'content');
                    const author_url = reconstructUrl(id, 'author');

                    html += `
                        <div class="bookmark-list list-items">
                            <div style="flex: 2;display: flex;align-items: center;">
                                <p class="bookmark-icon update-bookmark bookmark-enable icon" data-id="${id}">
                                    
                                </p>
                                <p><a href="${content_url}">${title}</a></p>
                            </div>
                            <p style="flex: 1;"><a href="${author_url}">${author}</a></p>
                        </div>
                    `;
                }
                break;
            case 'opened_history':
                const opened_histories = await getContents('opened_at');
                console.log('opened_histories', opened_histories);
                const opened_histories_length = opened_histories.length;
                if (!opened_histories_length) {
                    html = '<p id="empty">empty</p>'
                }
                for (let i = 0; i < opened_histories_length; i++) {
                    const opened_history = opened_histories[i];
                    console.log('opened_history', opened_history);
                    const id = opened_history.id;
                    const title = opened_history.title;
                    const author = opened_history.author;
                    const content_url = reconstructUrl(id, 'content');
                    const author_url = reconstructUrl(id, 'author');

                    html += `
                        <div class="opened_history-list list-items">
                            <div style="flex: 2;display: flex;align-items: center;">
                                <p><a href="${content_url}">${title}</a></p>
                            </div>
                            <p style="flex: 1;"><a href="${author_url}">${author}</a></p>
                            <p class="delete-icon-box icon" data-id="${id}">
                                <svg viewBox="0 0 24 24">
                                    <path class="delete-icon" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"></path>
                                </svg>
                            </p>
                        </div>
                    `;
                }
                break;
            case 'done_history':
                const done_histories = await getContents('done_at');
                console.log('opened_histories', done_histories);
                const done_histories_length = done_histories.length;
                if (!done_histories_length) {
                    html = '<p id="empty">empty</p>'
                }
                for (let i = 0; i < done_histories_length; i++) {
                    const done_history = done_histories[i];
                    console.log('done_history', done_history);
                    const id = done_history.id;
                    const title = done_history.title;
                    const author = done_history.author;
                    const content_url = reconstructUrl(id, 'content');
                    const author_url = reconstructUrl(id, 'author');

                    html += `
                        <div class="done-list list-items">
                            <div style="flex: 2;display: flex;align-items: center;">
                                <p class="done-icon update-done done-enable icon" data-id="${id}">

                                </p>
                                <p><a href="${content_url}">${title}</a></p>
                            </div>
                            <p style="flex: 1;"><a href="${author_url}">${author}</a></p>
                        </div>
                    `;
                }
            break;
            case 'setting':
                html = `
                    <div class="setting-box">
                        <div>
                            <span class="setting-key">書式</span>
                        </div>
                        <div>
                            <div class="setting-switch">
                                <button class="setting-is-horizonal custom-radio ${!settings.is_horizontal ? "radio-selected" : ""}" value="0">縦書き</button>
                                <button class="setting-is-horizonal custom-radio ${settings.is_horizontal ? " radio-selected" : ""}" value="1">横書き</button>
                            </div>
                        </div>
                    </div>
                    <div class="setting-box">
                        <div>
                            <span class="setting-key">文字の大きさ(px)</span>
                        </div>
                        <div>
                            <input class="custom-input setting-font-size" type="number" min="1" max="50" value="${settings.font_size}">
                        </div>
                    </div>
                    <div class="setting-box">
                        <div>
                            <span class="setting-key">スクロールの滑らかさ</span>
                        </div>
                        <div>
                            <input class="custom-input setting-scroll-smooth-lv" type="number" min="3" max="30" value="${settings.scroll_smooth_lv}">
                        </div>
                    </div>
                    <div class="setting-box">
                        <div>
                            <span class="setting-key">テキスト選択にルビを含まない</span>
                        </div>
                        <div class="toggle-button-box">
                            <label class="toggle-button">
                                <input type="checkbox" class="setting-is-exclude-ruby toggle-button__checkbox" ${settings.is_exclude_ruby ? "checked" : ""} />
                            </label>
                        </div>
                    </div>
                    <div class="setting-box">
                        <div>
                            <span class="setting-key">スクロール位置を記憶</span>
                        </div>
                        <div class="toggle-button-box">
                            <label class="toggle-button">
                                <input type="checkbox" class="setting-is-scroll-cache toggle-button__checkbox" ${settings.is_scroll_cache ? "checked" : ""}  />
                            </label>
                        </div>
                    </div>
                    <div class="setting-box">
                        <div>
                            <span class="setting-key">テキスト欄の幅(%)</span>
                        </div>
                        <div>
                            <input class="custom-input setting-body-padding" type="number" min="1" max="100" value="${100 - settings.body_padding * 2}">
                        </div>
                    </div>
                    <div class="setting-box">
                        <div>
                            <span class="setting-key">テーマ</span>
                        </div>
                        <div>
                            <div class="setting-switch">
                                <button class="setting-theme custom-radio ${settings.theme === 0 ? "radio-selected" : ""}" value="0">素</button>
                                <button class="setting-theme custom-radio ${settings.theme === 1 ? "radio-selected" : ""}" value="1">空</button>
                                <button class="setting-theme custom-radio ${settings.theme === 2 ? "radio-selected" : ""}" value="2">翠</button>
                                <button class="setting-theme custom-radio ${settings.theme === 3 ? "radio-selected" : ""}" value="3">暗</button>
                                <button class="setting-theme custom-radio ${settings.theme === 4 ? "radio-selected" : ""}" value="4">紺</button>
                            </div>
                        </div>
                    </div>
                `;
                break;
            default:
                return;
        }
        html = `<div class="list-box" ${!is_visible ? 'style="display: none;"' : ''}>${html}</div>`;
        return html;
    }

    interface.addEventListener('click', function() {
        modal.style.display = 'flex';
    });
    modal.addEventListener('mousedown', function() {
        modal.style.display = 'none';
    });
    document.getElementById('modal-container').addEventListener('mousedown', async function(event) {
        event.stopPropagation(); // ここで止めてるのでmodal内のクリックイベントはbodyには行かない
        const target = event.target;

        const nav_target = target.closest('.nav-content');
        if (nav_target && !nav_target.classList.contains('nav-selected')) {
            const tab_num = Number(nav_target.dataset.tab);
            document.querySelectorAll('.list-box').forEach((item, index) => {
                item.style.display = index === tab_num ? 'block' : 'none';
            });
            document.querySelectorAll('.nav-content').forEach((item, index) => {
                item.classList.toggle('nav-selected', index === tab_num);
            });
        }

        // ラジオボタン処理
        const radio = target.closest('.custom-radio');
        if (radio) {
            if (radio.classList.contains('radio-selected')) return;

            // 表示切替
            radio.classList.add('radio-selected');
            radio.parentElement.querySelectorAll('.custom-radio').forEach(btn => {
                if (btn !== radio) btn.classList.remove('radio-selected');
            });

            // 設定更新
            if (radio.classList.contains('setting-is-horizonal')) {
                settings.is_horizontal = radio.value === "1";
            } else if (radio.classList.contains('setting-theme')) {
                settings.theme = Number(radio.value);
            }
            return;
        }

        // トグルボタン処理
        const toggle = target.closest('.toggle-button__checkbox');
        if (toggle) {
            if (toggle.classList.contains('setting-is-exclude-ruby')) {
                settings.is_exclude_ruby = !settings.is_exclude_ruby;
            } else if (toggle.classList.contains('setting-is-scroll-cache')) {
                settings.is_scroll_cache = !settings.is_scroll_cache;
            }
            return;
        }

        // ブックマーク更新
        const bookmark_target = target.closest('.update-bookmark');
        if (bookmark_target) {
            const is_to_enable = bookmark_target.classList.contains('bookmark-disable');
            await updateTime(bookmark_target.dataset.id, 'fav_at', is_to_enable);
            if(is_to_enable) {
                bookmark_target.classList.replace('bookmark-disable', 'bookmark-enable');
            } else {
                bookmark_target.classList.replace('bookmark-enable', 'bookmark-disable');
            }
            if (bookmark_target.classList.contains('reload') && current_tab === 'bookmark') {
                generate_area.innerHTML = await generateTab('bookmark');
            }
            return;
        }

        // 閲覧履歴削除
        const opened_target = target.closest('.delete-icon-box');
        if (opened_target) {
            await deleteOpenedAt(opened_target.dataset.id);
            opened_target.closest('.opened_history-list').remove();
            return;
        }

        // 読了履歴更新
        const done_target = target.closest('.update-done');
        if (done_target) {
            const is_to_enable = done_target.classList.contains('done-disable');
            await updateTime(done_target.dataset.id, 'done_at', is_to_enable);
            if (is_to_enable) {
                done_target.classList.replace('done-disable', 'done-enable');
            } else {
                done_target.classList.replace('done-enable', 'done-disable');
            }
            if (done_target.classList.contains('reload') && current_tab === 'done') {
                generate_area.innerHTML = await generateTab('done');
            }
            return;
        }
    });

    // 設定 > 数値系
    document.getElementById('modal-container').addEventListener('input', function (event) {
        const target = event.target;

        if (target.classList.contains('custom-input')) {
            const val = Number(target.value);
            if (isNaN(val) || val < 0) return;

            // 設定更新
            if (target.classList.contains('setting-font-size')) {
                settings.font_size = val;
            } else if (target.classList.contains('setting-scroll-smooth-lv')) {
                settings.scroll_smooth_lv = val;
            } else if (target.classList.contains('setting-body-padding')) {
                settings.body_padding = (100 - val) / 2;
            }
        }
    });

    // IndexedDB
    async function saveCurrentContent(content) {
        // console.trace();
        await db.contents.put(content);
    }

    // 指定したキーの時刻を 現在時刻 or 空文字で更新
    async function updateTime(id, key, is_to_enable) {
        // console.trace();
        const new_time = is_to_enable ? new Date().getTime() : "";
        await db.contents.update(id, { [key]: new_time });
    }

    async function deleteOpenedAt(id) {
        await db.contents.update(id, { 'opened_at': "" });
    } 
    
    async function getContents(key, limit) {
        const results = await db.contents
            // .where(key)
            // .notEqual('') // 空文字でない
            // .limit(limit)
            .toArray(); // 配列で取得

        // keyの降順で並び替え
        results.sort((a, b) => b[key] - a[key]);

        return results;
    }

    // urlからid抽出
    function extractId() {
        const numbers = location.href.match(/\d+/g);
        return numbers ? numbers.join('e') : '';
    }

    // idからurl構築
    // type: content(作者ページ) | author(作品ページ)
    function reconstructUrl(id, type) {
        const parts = id.split('e');
        if (parts.length !== 3) {
            throw new Error('Invalid input format');
        }
        if(type === 'content') {
            return `https://www.aozora.gr.jp/cards/${parts[0]}/files/${parts[1]}_${parts[2]}.html`;
        } else if(type === 'author') {
            return `https://www.aozora.gr.jp/index_pages/person${Number(parts[0])}.html`;
        }
    }

    function reflectLayout() {
        // 必ずしも全てのtextが.main_textに入ってない
        // const main_text = document.querySelector(".main_text");

        if(settings.is_horizontal) {
            body.style.writingMode = 'vertical-rl';
        } else {
            body.style.writingMode = 'horizontal-tb';
        }

        scrollWithPercentage(content.last_scroll);

        if(settings.is_exclude_ruby) {
            // ルビを選択に含めない
            document.querySelectorAll("ruby rp, ruby rt").forEach((elem) => {
                elem.style.userSelect = "none";
            });
        } else {
            document.querySelectorAll("ruby rp, ruby rt").forEach((elem) => {
                elem.style.userSelect = "auto";
            });
        }

        body.style.margin = '0';
        body.style.padding = `${settings.body_padding}% 10%`;
        body.style.fontSize = settings.font_size + 'px'; // h1, h2とかは除外する？

        // テーマ切替
        // 0: 通常, 1: 空, 2: 翠, 3: 暗, 4: 紺
        let bg_color = 'fff';
        let font_color = '000';
        switch(settings.theme) {
            case 0:
                bg_color = 'fff';
                font_color = '000';
                break;
            case 1:
                bg_color = 'CDE8FF';
                font_color = '000';
                break;
            case 2:
                bg_color = 'C4E6CD';
                font_color = '000';
                break;
            case 3:
                bg_color = '000';
                font_color = 'fff';
                break;
            case 4:
                bg_color = '102042';
                font_color = 'fff';
                break;
        }
        body.style.backgroundColor = '#' + bg_color;
        body.style.color = '#' + font_color;

        // 縦書きレイアウトの為にスクロールをカスタム処理

        if (wheel_event_listner) {
            body.removeEventListener('wheel', wheel_event_listner, { passive: false });
            wheel_event_listner = null;
        }
        if (settings.is_horizontal) {
            wheel_event_listner = (event) => {
                event.preventDefault(); // デフォルトの縦スクロールを無効化

                const totalScroll = -event.deltaY; // ホイール操作のスクロール量
                const steps = settings.scroll_smooth_lv; // 分割数 これを増やすほど滑らかになる
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

            body.addEventListener('wheel', wheel_event_listner, { passive: false });
        }
    }

    // 任意の位置(右側からの百分率)にスクロール
    function scrollWithPercentage(percentage) {
        if(settings.is_horizontal) {
            scrollTo({ left: document.querySelector('body').scrollWidth * (percentage / 100) });
        } else {
            scrollTo({ bottom: document.querySelector('body').scrollHeight * (percentage / 100) });
        }
    }

    // スクロールバーが左端までの何%の位置にあるか取得
    function getScrollbarPositionFromRight() {
        // ドキュメントの全幅
        const documentWidth = document.documentElement.scrollWidth;
        // 現在のスクロール位置（左端からの位置）
        const scrollLeft = document.documentElement.scrollLeft * -1;
    
        // ドキュメント全幅に対する右からの割合
        const percentageFromRight = ((documentWidth - scrollLeft) / documentWidth) * 100 - 100;
    
        return percentageFromRight;
    }

    function getScrollbarPositionFromTop() {
        // ドキュメントの全高
        const documentHeight = document.documentElement.scrollHeight;
        // 現在のスクロール位置（上端からの位置）
        const scrollTop = document.documentElement.scrollTop;

        // ドキュメント全高に対する上からの割合
        const percentageFromTop = (scrollTop / (documentHeight - window.innerHeight)) * 100;

        return percentageFromTop;
    }

};