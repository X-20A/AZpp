window.onload = async function () {
    let playing_flag = false; // 再生中であるか
    let processing_flag = false; // データ生成中であるか
    let is_first = true;
    let selected_index = -1;
    let generate_num = -1;
    let playing_num = -1;
    let wavs = [];
    let audioContext = null;
    let audio_source = null;
    let is_communication_open = true;

    const page_info = {
        id: extractId(),
        title: document.querySelector('.title').textContent,
        author: document.querySelector('head meta[name="DC.Creator"]').getAttribute('content'),
    };

    // 設定系はlocalStorage
    // 作品関係はIndexedDB

    // localStorage
    const initialSettings = {
        is_horizontal: true, // 横書きならtrue
        is_exclude_ruby: true, // ルビを含まないならtrue
        scroll_smooth_lv: 12,
        is_scroll_cache: true,
        // palette: [], // highlightに使うカラー '252525'とか 一旦採用見送り
        font_size: 22,
        body_padding: 8,
        // カラー系は初期値に戻せるだけじゃなくて継承も選べるといいかも(他の拡張機能との競合を避けたい)
        theme: 0,
        is_voice_enable: false,
        voice_actor_id: 3,
        voice_actor_name: 'ずんだもん(ノーマル)',
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

    // IndexedDB こっちは都度手動で保存
    const content = {
        id: page_info.id,
        title: page_info.title,
        author: page_info.author,
        last_scroll: 0,
        // highlight: [], // [120, 145, '252525'] [start, end, color] 採用見送り
        fav_at: "",
        opened_at: new Date().getTime(),
        done_at: "", // 読了した時刻 とりあえずユーザーが手動で操作したら設定
    };

    const db = new Dexie('AZ_index');

    db.version(1).stores({
        contents: 'id,title,author,last_scroll,fav_at,opened_at,done_at'
    });

    db.open().then(() => {
        console.log('Database opened successfully.');
    }).catch((err) => {
        console.error("Database open failed.: ", err);
    });

    // 開いている作品の情報を登録、ないし更新
    // ※fav_atやdone_atはこのあと書き換わり得るのでcontentからは取得しない 紛らわしいので修正したい
    const existingContent = await getContent(content.id);
    if (existingContent) {
        Object.assign(content, existingContent);
        content.opened_at = new Date().getTime();
        await saveCurrentContent(content);
    } else {
        await db.contents.add(content);
    }

    // スクロールでlast_scroll更新
    window.onscroll = function () {
        // console.log('getScrollbarPositionFromRight: ', getScrollbarPositionFromRight());
        // console.log('getScrollbarPositionFromTop: ', getScrollbarPositionFromTop());
        content.last_scroll = settings.is_horizontal ? getScrollbarPositionFromTop() : getScrollbarPositionFromRight();
        saveCurrentContent(content);
    }

    const modal_html = `
        <div id="modal-bg">
            <div id="modal-container">
                <div id="header-box">
                    <div id="nav">
                        <span class="nav-content nav-selected" data-tab="0">ブクマ</span>
                        <span class="nav-content" data-tab="1">閲覧履歴</span>
                        <span class="nav-content" data-tab="2">読了履歴</span>
                        <span class="nav-content" data-tab="3">設定</span>
                        <span class="nav-content" data-tab="4">音声</span>
                    </div>
                    <div id="controller-box">
                        <p class="bookmark-icon update-bookmark ${content.fav_at === '' ? "bookmark-disable" : "bookmark-enable"} reload icon" data-id="${page_info.id}"></p>
                        <p class="done-icon update-done ${content.done_at === '' ? "done-disable" : "done-enable"} reload icon" data-id="${page_info.id}" style="margin-left: 3px;"></p>
                    </div>
                </div>
                <div id="generate-area">
                    <div id="bookmark-top" class="list-box"}>${await generateTab('bookmark')}</div>
                    <div id="opened-history-top" class="list-box" style="display: none;"}>${await generateTab('opened_history')}</div>
                    <div id="done-history-top" class="list-box" style="display: none;"}>${await generateTab('done_history')}</div>
                    <div id="setting-top" class="list-box" style="display: none;"}>${await generateTab('setting')}</div>
                    <div id="audio-top" class="list-box" style="display: none;"}>${await generateTab('audio')}</div>
                </div>
            </div>
        </div>
    `;

    // オンオフするイベントリスナー
    let wheel_event_listener = null;
    let mouseover_event_listener = null;
    let mouseout_event_listener = null;

    const body = document.querySelector("body");

    body.insertAdjacentHTML('beforeend', modal_html);

    const modal = document.getElementById('modal-bg');

    const interface_html = `
        <div id="interface">
            <p id="menu-icon-box">
                <svg viewBox="0 0 24 24">
                    <path id="menu-icon" fill="#ececec" d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z" />
                </svg>
            </p>
        </div>
    `;

    body.insertAdjacentHTML('beforeend', interface_html);

    const interface = document.getElementById('interface');

    const audio_controller_html = `
        <div id="audio-controller-container">
            <div id="audio-disable" class="audio-controller" title="読み上げる段落を選択して下さい">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path fill="#5F6670" d="M8,5.14V19.14L19,12.14L8,5.14Z" />
                </svg>
            </div>
            <div id="audio-play" class="audio-controller">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path fill="#2196F2" d="M8,5.14V19.14L19,12.14L8,5.14Z" />
                </svg>
            </div>
            <div id="audio-suspend" class="audio-controller">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path fill="#2196F2" d="M14,19H18V5H14M6,19H10V5H6V19Z" />
                </svg>
            </div>
        </div>
    `;

    body.insertAdjacentHTML('beforeend', audio_controller_html);

    reflectLayout(); // レイアウト反映

    // 扱いやすいように本文をspanで囲む
    function wrapTextNodesWithSpan(element) {
        const childNodes = Array.from(element.childNodes);
        let buffer = ''; // 現在処理中の行を保持
        const nodesToRemove = []; // 削除対象ノードリスト

        childNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE || node.nodeName === 'RUBY') {
                // テキストまたは <ruby> 要素をバッファに追加
                buffer += node.outerHTML || node.textContent;
                nodesToRemove.push(node);
            } else if (node.nodeName === 'BR') {
                // 行が終了するタイミング
                if (buffer.trim() !== '') {
                    const span = document.createElement('span');
                    span.className = 'blocks';
                    span.innerHTML = buffer;

                    element.insertBefore(span, node);
                    buffer = ''; // 次の行に向けてバッファをクリア
                }
                // <br> はそのまま残すためスキップ
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                // 子要素がある場合は再帰的に処理
                wrapTextNodesWithSpan(node);
            }
        });

        // 最後のバッファが残っている場合も処理
        if (buffer.trim() !== '') {
            const span = document.createElement('span');
            span.className = 'blocks';
            span.innerHTML = buffer;
            element.appendChild(span);
        }

        // 元ノードの削除
        nodesToRemove.forEach(node => element.removeChild(node));
    }

    // 実行対象の要素
    const main_text = document.querySelector('.main_text');
    wrapTextNodesWithSpan(main_text);



    // ここまで読込時処理

    /**
     * モーダル内に表示するhtml生成
     * @param {'bookmark' | 'opened_history' | 'done_history' | 'setting'} type 
     */
    async function generateTab(type) {
        let html = '';
        switch (type) {
            case 'bookmark':
                const bookmarks = await getContents('fav_at');
                const bookmark_length = bookmarks.length;
                if (!bookmark_length) {
                    html = '<p class="empty">empty</p>'
                }
                for (let i = 0; i < bookmark_length; i++) {
                    const bookmark = bookmarks[i];
                    const id = bookmark.id;
                    const title = bookmark.title;
                    const author = bookmark.author;
                    const content_url = reconstructUrl(id, 'content');
                    const author_url = reconstructUrl(id, 'author');

                    html += `
                        <div class="list-items">
                            <div style="flex: 2;display: flex;align-items: center;">
                                <p class="bookmark-icon update-bookmark bookmark-enable icon" data-id="${id}">
                                    
                                </p>
                                <p class="list-title"><a href="${content_url}" target="_blank" rel="noopener noreferrer">${title}</a></p>
                            </div>
                            <p style="flex: 1;"><a href="${author_url}" target="_blank" rel="noopener noreferrer">${author}</a></p>
                        </div>
                    `;
                }
                break;
            case 'opened_history':
                const opened_histories = await getContents('opened_at');
                const opened_histories_length = opened_histories.length;
                if (!opened_histories_length) {
                    html = '<p class="empty">empty</p>'
                }
                for (let i = 0; i < opened_histories_length; i++) {
                    const opened_history = opened_histories[i];
                    const id = opened_history.id;
                    const title = opened_history.title;
                    const author = opened_history.author;
                    const content_url = reconstructUrl(id, 'content');
                    const author_url = reconstructUrl(id, 'author');

                    html += `
                        <div class="list-items">
                            <div style="flex: 2;display: flex;align-items: center;">
                                <p class="list-title"><a href="${content_url}" target="_blank" rel="noopener noreferrer">${title}</a></p>
                            </div>
                            <p style="flex: 1;"><a href="${author_url}" target="_blank" rel="noopener noreferrer">${author}</a></p>
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
                const done_histories_length = done_histories.length;
                if (!done_histories_length) {
                    html = '<p class="empty">empty</p>'
                }
                for (let i = 0; i < done_histories_length; i++) {
                    const done_history = done_histories[i];
                    const id = done_history.id;
                    const title = done_history.title;
                    const author = done_history.author;
                    const content_url = reconstructUrl(id, 'content');
                    const author_url = reconstructUrl(id, 'author');

                    html += `
                        <div class="list-items">
                            <div style="flex: 2;display: flex;align-items: center;">
                                <p class="done-icon update-done done-enable icon" data-id="${id}">

                                </p>
                                <p class="list-title"><a href="${content_url}" target="_blank" rel="noopener noreferrer">${title}</a></p>
                            </div>
                            <p style="flex: 1;"><a href="${author_url}" target="_blank" rel="noopener noreferrer">${author}</a></p>
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
                                <button class="setting-is-horizontal custom-radio ${settings.is_horizontal ? " radio-selected" : ""}" value="1">横書き</button>
                                <button class="setting-is-horizontal custom-radio ${!settings.is_horizontal ? "radio-selected" : ""}" value="0">縦書き</button>
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
                                <button class="setting-theme custom-radio ${settings.theme === 0 ? "radio-selected" : ""}" value="0">明</button>
                                <button class="setting-theme custom-radio ${settings.theme === 1 ? "radio-selected" : ""}" value="1">翠</button>
                                <button class="setting-theme custom-radio ${settings.theme === 2 ? "radio-selected" : ""}" value="2">空</button>
                                <button class="setting-theme custom-radio ${settings.theme === 3 ? "radio-selected" : ""}" value="3">紺</button>
                                <button class="setting-theme custom-radio ${settings.theme === 4 ? "radio-selected" : ""}" value="4">暗</button>
                            </div>
                        </div>
                    </div>
                `;
                break;
            case 'audio':
                html = `
                    <div class="setting-box">
                        <div>
                            <span class="setting-key">VOICEVOXによる読み上げを有効にする</span>
                        </div>
                        <div class="toggle-button-box">
                            <label class="toggle-button">
                                <input type="checkbox" class="audio-is-voice-enable toggle-button__checkbox" ${settings.is_voice_enable ? "checked" : ""} />
                            </label>
                        </div>
                    </div>
                    <div class="setting-box">
                        <div>
                            <span class="setting-key">VOICE:</span>
                        </div>
                        <div class="toggle-button-box">
                            <input type="button" id="open-actor-selector" class="custom-button" value="${settings.voice_actor_name}" />
                        </div>
                    </div>
                `;
                break;
            default:
                return;
        }
        return html;
    }

    document.addEventListener('mouseover', function(e) {
        const target = e.target;
        if (target.classList.contains('blocks') && !target.classList.contains('now-playing') && !target.classList.contains('selected-block')) {
            if (playing_flag) return;
            target.style.backgroundColor = '#6aa9a6';
        }
    });
    document.addEventListener('mouseout', function (e) {
        const target = e.target;
        if (target.classList.contains('blocks') && !target.classList.contains('selected-block')) {
            if (playing_flag) return;
            target.style.backgroundColor = '';
        }
    });
    document.addEventListener('mousedown', function(e) {
        const target = e.target;
        const class_list = target.classList;
        if (class_list.contains('blocks')) {
            if (playing_flag) return;
            document.querySelectorAll('.blocks').forEach(item =>  {
                item.classList.remove('selected-block');
                item.style.backgroundColor = '';
            });
            if (!class_list.contains('now-playing')) {
                target.style.backgroundColor = '#6aa9a6';
                class_list.add('selected-block');
                toggleAudioButton('play');
            }
            return;
        }
        if (target.closest('#audio-play')) {
            console.log('audio-play');
            if (document.querySelector('.selected-block')) {
                speak();
            } else {
                toggleAudio();
            }
            toggleAudioButton('suspend');
            return;
        }
        if(target.closest('#audio-suspend')) {
            console.log('audio-suspend');
            toggleAudio();
        }
    });

    document.addEventListener('keydown', e => {
        // 変数eventの中身はKeyboardEventオブジェクト
        switch(e.keyCode) {
            case 13: // Enter
            case 32: // Space
                e.stopPropagation();
                speak();
                break;
            case 75: // K
                toggleAudio();
                break;
        }
    });

    /**
     * 音声の 再生 | 一時停止 切替
     */
    function toggleAudio() {
        console.log('toggleAudio');
        if (!audioContext) return;
        if (audioContext.state === 'running') { // 再生 | 一時停止 切替
            playing_flag = false;
            audioContext.suspend();
            toggleAudioButton('play');
        } else if (audioContext.state === 'suspended') {
            playing_flag = true;
            audioContext.resume();
            toggleAudioButton('suspend');
        } 
    }

    /**
     * Audioボタン切替
     * @param {'hide' | 'disable' | 'play' | 'suspend'} type 
     */
    function toggleAudioButton(type) {
        document.querySelectorAll('.audio-controller').forEach(item => {
            item.style.display = 'none';
        });
        switch(type) {
            case 'hide':
            case 'disable':
                break;
            case 'play':
                document.querySelector('#audio-play').style.display = 'block';
                break;
            case 'suspend':
                document.querySelector('#audio-suspend').style.display = 'block';
                break;
        }
    }

    /**
     * フラグをあれこれしてstartProcessを発火する
     * 操作系からはこれを呼び出す
     */
    async function speak() {
        console.log('speak');
        console.log('playing_flag: ', playing_flag);
        if (playing_flag) return;
        console.log('到達');

        if (processing_flag) { // 既にprocessが回ってたら中断し、準備が整うのを待つ
            processing_flag = false;
            audio_source = null;
            audioContext = null;

            try {
                let attempts = 0;
                while (!is_communication_open || attempts < 150) {
                    if (attempts >= 10000) {
                        console.log('timeout');
                        throw new Error('timeout');
                    }
                    attempts++;
                    await new Promise((resolve) => setTimeout(resolve, 20)); // 20ms待機
                }
            } catch (e) {
                console.error(e);
                return; // タイムアウトの場合は処理を中断
            }
        }

        wavs.length = 0;
        const blocks = document.querySelectorAll('.blocks');
        selected_index = Array.from(blocks).findIndex(block => block.classList.contains('selected-block'));
        document.querySelector('.selected-block').classList.remove('selected-block');
        processing_flag = true;
        is_first = true;
        generate_num = selected_index;
        startProcess();
    }

    /**
     * 音声合成のコントローラー的なアレ
     */
    async function startProcess() {
        let block_text = getBlockText(generate_num);

        while (block_text) {
            if (!processing_flag) return;

            let splited_texts = splitText(block_text, 60, 120);
            const block_num = generate_num;

            for (let text of splited_texts) {
                if (!processing_flag) return;

                while (wavs.length >= 5) {
                    await new Promise((resolve) => setTimeout(resolve, 100));
                }

                try {
                    const response = await generateVoiceDataAsync(text);
                    await decodeWav(response, block_num);
                } catch (error) {
                    console.error("Error during processing:", error);
                    return;
                }

                if (is_first) {
                    is_first = false;
                    playNext();
                }
            }

            generate_num++;
            block_text = getBlockText(generate_num);
        }

        processing_flag = false;
    }

    /**
     * かますとキャンセルしやすくなるらしい
     * @param {string} text 
     */
    function generateVoiceDataAsync(text) {
        return new Promise((resolve, reject) => {
            generateVoiceData(text, function (response) {
                if (!processing_flag) return reject("Processing canceled");
                resolve(response);
            });
        });
    }

    /**
     * voicevox_engineで音声合成するためにbackground.jsと通信
     * @param {string} text 
     * @param {CallbackType} callback 
     */
    function generateVoiceData(text, callback) {
        if (!processing_flag) return;

        is_communication_open = false;

        // メッセージ送信前の最終確認
        if (!processing_flag) {
            is_communication_open = true;
            return;
        }

        chrome.runtime.sendMessage({ type: "generate_voice_data", text: text }, function (response) {
            if (!processing_flag) {
                is_communication_open = true;
                return;
            }
            if (response.error) {
                console.error(response.error);
                if (response.error === 'Failed to fetch') {
                    alert('VOICEVOX_engineを起動してください');
                }
                is_communication_open = true;
                return;
            }

            try {
                let wavedata = new Uint16Array([].map.call(response.data, function (c) {
                    return c.charCodeAt(0);
                })).buffer;
                callback(wavedata);
            } catch (e) {
                console.error("エラー:", e);
            } finally {
                is_communication_open = true;
            }
        });
    }

    /**
     * synthesisからのレスポンスをいい感じに成型
     * @param {string} wavData 
     * @param {number} block_num 
     * @returns 
     */
    function decodeWav(wavData, block_num) {
        if (!audioContext) {
            audioContext = new AudioContext();
        }
        if (!processing_flag) return; // デコード開始前に確認

        audioContext.decodeAudioData(wavData, function (decodedData) {
            if (!processing_flag) return; // デコード後に確認
            try {
                let source = audioContext.createBufferSource();
                source.buffer = decodedData;
                if (processing_flag) { // 最終確認
                    wavs.push({
                        source: source,
                        block_num: block_num,
                    });
                }
            } catch (e) {
                console.log(`許容エラー : ${e}`);
            }
        }).catch(function (error) {
            console.error("decodeAudioDataエラー:", error);
        });
    }

    /**
     * デコードしたデータを再生
     */
    function playNext() {
        let retry = 0;
        if (wavs.length === 0) {
            //初めの1回は必ずデータがあるが2回目以降は再生が追い越してデータが無いことがあり得る
            //その場合、200ms待機して再帰呼び出しを繰り返す
            //50回やってもデータが来なければキャンセル
            retry++;
            if (retry > 49) {
                return;
            }
            setTimeout(function () {
                playNext();
            }, 200);
            return;
        }
        retry = 0;
        const wav_data = wavs.shift();
        audio_source = wav_data.source;
        playing_num = wav_data.block_num;
        selected_index = playing_num;
        audio_source.connect(audioContext.destination);
        audio_source.onended = function () {
            setTimeout(function () {
                if (wavs) {
                    playNext();
                } else {
                    //再生プロセス終了
                    playing_flag = false;
                }
            }, 500);
        }
        audio_source.start(0);
        playing_flag = true;
        highlightBlock();
        scrollToBlock();
    }

    /**
     * .blocks[num]を取得
     * @param {number} num 
     * @returns {string | null}
     */
    function getBlockText(num) {
        return document.querySelectorAll('.blocks')[num]?.innerHTML.replace(/<ruby>(.*?)<\/ruby>/g, (match) => {
            // <ruby>タグ内の<rt>部分を取り出す
            const rtText = match.replace(/<rb>.*?<\/rb>/g, '')  // <rb>タグを削除
                .match(/<rt.*?>(.*?)<\/rt>/)[1];  // <rt>タグの内容を取り出す

            return rtText;  // 置き換えた<rt>内容を返す
        }) || null;
    }

    /**
     * min～max文字の範囲で「。」を探し、見つからなければmax文字で分割
     * @param {string} text 
     * @param {number} min 
     * @param {number} max 
     * @returns {string[]}
     * @throws {Error} 不正な引数が渡された場合にエラーをスロー
     */
    // 
    function splitText(text, min, max) {
        if (typeof text !== 'string') {
            throw new Error("引数 'text' は文字列である必要があります。");
        }
        if (typeof min !== 'number' || typeof max !== 'number') {
            throw new Error("引数 'min' と 'max' は数値である必要があります。");
        }
        if (min <= 0 || max <= 0 || min > max) {
            throw new Error("'min' は正の数で、'max' より小さい必要があります。");
        }

        const result = [];
        let current = text;

        while (current.length > 0) {
            if (current.length <= max) {
                result.push(current);
                break;
            }

            let splitIndex = -1;

            
            for (let i = min; i <= max; i++) {
                if (current[i] === '。') {
                    splitIndex = i + 1; // 「。」の次で分割
                    break;
                }
            }

            if (splitIndex === -1) {
                splitIndex = max;
            }

            result.push(current.slice(0, splitIndex).trim());
            current = current.slice(splitIndex);
        }

        return result;
    }

    // modal表示
    interface.addEventListener('mousedown', function () {
        modal.style.display = 'flex';
    });
    // modal非表示
    modal.addEventListener('mousedown', function () {
        modal.style.display = 'none';
    });
    // modal内のクリックイベント
    document.getElementById('modal-container').addEventListener('mousedown', async function (event) {
        event.stopPropagation(); // ここで止めてるのでmodal内のクリックイベントはbodyには行かない
        if (event.button !== 0) return; // 左クリック以外は無視
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
            if (radio.classList.contains('setting-is-horizontal')) {
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
            if (is_to_enable) {
                bookmark_target.classList.replace('bookmark-disable', 'bookmark-enable');
            } else {
                bookmark_target.classList.replace('bookmark-enable', 'bookmark-disable');
            }
            if (bookmark_target.classList.contains('reload')) {
                document.getElementById('bookmark-top').innerHTML = await generateTab('bookmark');
            }
            return;
        }

        // 閲覧履歴削除
        const opened_target = target.closest('.delete-icon-box');
        if (opened_target) {
            await deleteOpenedAt(opened_target.dataset.id);
            opened_target.closest('.list-items').remove();
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
            if (done_target.classList.contains('reload')) {
                document.getElementById('done-history-top').innerHTML = await generateTab('done_history');
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

    /**
     * なければ新規追加、あれば更新
     * @param {Content} content 登録するContent
     */
    async function saveCurrentContent(content) {
        // console.trace();
        await db.contents.put(content);
    }

    /**
     * 指定したキーの時刻を 現在時刻 or 空文字で更新
     * @param {string} id 
     * @param {string} key 
     * @param {boolean} is_to_enable 
     */
    async function updateTime(id, key, is_to_enable) {
        // console.trace();
        const new_time = is_to_enable ? new Date().getTime() : "";
        await db.contents.update(id, {
            [key]: new_time
        });
    }

    /**
     * idを指定して閲覧履歴削除
     * @param {string} id 
     */
    async function deleteOpenedAt(id) {
        await db.contents.update(id, {
            'opened_at': ""
        });
    }

    /**
     * idでcontentを取得
     * @param {string} id 
     * @returns {Content}
     */
    async function getContent(id) {
        return await db.contents.get(id);
    }

    /**
     * keyを指定してcontentを取得 at系専用
     * @param {string} key 
     * @param {number} limit 未実装 取得数上限
     * @returns {Content} 該当データ丸ごと
     */
    async function getContents(key, limit) {
        const results = await db.contents
            .where(key)
            .notEqual('') // 空文字でない
            // .limit(limit)
            .toArray(); // 配列で取得

        // keyの降順で並び替え
        results.sort((a, b) => b[key] - a[key]);

        return results;
    }

    /**
     * urlからid抽出
     * @returns {string} 作者idと作品idを'e'で連結した文字列
     */
    function extractId() {
        const numbers = location.href.match(/\d+/g);
        return numbers ? numbers.join('e') : '';
    }

    /**
     * idからurl構築
     * @param {number} id 
     * @param {'content' | 'author'} type content(作者ページ) | author(作品ページ)
     * @returns 
     */
    function reconstructUrl(id, type) {
        const parts = id.split('e');
        if (parts.length !== 3) {
            throw new Error('Invalid input format');
        }
        if (type === 'content') {
            return `https://www.aozora.gr.jp/cards/${parts[0]}/files/${parts[1]}_${parts[2]}.html`;
        } else if (type === 'author') {
            return `https://www.aozora.gr.jp/index_pages/person${Number(parts[0])}.html`;
        }
    }

    /**
     * settingsを参照してレイアウトに反映
     * @param {string} key 未実装
     */
    function reflectLayout(key) {
        // TODO: 読込時以外は変更があったプロパティだけレイアウトを更新する

        const last_scroll = content.last_scroll; // レイアウト変更で変わっちゃうので退避

        if (settings.is_horizontal) {
            body.style.writingMode = 'horizontal-tb';
        } else {
            body.style.writingMode = 'vertical-rl';
        }

        // ルビを選択に含めない
        if (settings.is_exclude_ruby) {
            document.querySelectorAll("ruby rp, ruby rt").forEach((elem) => {
                elem.style.userSelect = "none";
            });
        } else {
            document.querySelectorAll("ruby rp, ruby rt").forEach((elem) => {
                elem.style.userSelect = "text";
            });
        }

        body.style.margin = '0';
        body.style.padding = settings.is_horizontal ? `10% ${settings.body_padding}%` : `${settings.body_padding}% 10%`;
        body.style.fontSize = settings.font_size + 'px'; // h1, h2とかは除外する？

        // テーマ切替
        // 0: 通常, 1: 空, 2: 翠, 3: 暗, 4: 紺
        let bg_color = 'fff';
        let font_color = '000';
        let icon_color = 'ececec';
        let hover_interface_color = 'ececec';
        let hover_menu_icon_color = '000';
        switch (settings.theme) {
            case 0:
                bg_color = 'fff';
                font_color = '000';
                icon_color = 'ececec';
                hover_interface_color = 'ececec';
                hover_menu_icon_color = 'fff';
                break;
            case 1:
                bg_color = 'C4E6CD';
                font_color = '000';
                icon_color = '8dde97';
                hover_interface_color = 'a8e5b8';
                hover_menu_icon_color = 'fff';
                break;
            case 2:
                bg_color = 'CDE8FF';
                font_color = '000';
                icon_color = '95d7eb';
                hover_interface_color = 'b0e2ff';
                hover_menu_icon_color = 'fff';
                break;
            case 3:
                bg_color = '102042';
                font_color = 'fff';
                icon_color = '4b71c8';
                hover_interface_color = '3d5380';
                hover_menu_icon_color = 'fff';
                break;
            case 4:
                bg_color = '000';
                font_color = 'fff';
                icon_color = '8b8b8b';
                hover_interface_color = '424242';
                hover_menu_icon_color = 'fff';
                break;

        }
        body.style.backgroundColor = '#' + bg_color;
        body.style.color = '#' + font_color;
        interface.style.backgroundColor = '#' + bg_color;
        document.getElementById('menu-icon').style.fill = '#' + icon_color;

        // 縦書きレイアウトの為にスクロールをカスタム処理
        if (wheel_event_listener) {
            body.removeEventListener('wheel', wheel_event_listener, {
                passive: false
            });
            wheel_event_listener = null;
        }
        if (!settings.is_horizontal) {
            wheel_event_listener = (event) => {
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

            body.addEventListener('wheel', wheel_event_listener, {
                passive: false
            });
        }

        // interface部のデザインをテーマごとに調整
        if (mouseover_event_listener) {
            interface.removeEventListener('mouseover', mouseover_event_listener);
            mouseover_event_listener = null;
        }
        if (mouseout_event_listener) {
            interface.removeEventListener('mouseout', mouseout_event_listener);
            mouseout_event_listener = null;
        }

        mouseover_event_listener = (event) => {
            interface.style.backgroundColor = '#' + hover_interface_color;
            document.getElementById('menu-icon').style.fill = '#' + hover_menu_icon_color;
        };
        mouseout_event_listener = (event) => {
            interface.style.backgroundColor = '#' + bg_color;
            document.getElementById('menu-icon').style.fill = '#' + icon_color;
        };

        interface.addEventListener('mouseover', mouseover_event_listener);
        interface.addEventListener('mouseout', mouseout_event_listener);

        // 縦書き | 横書き を切り替えたときの為にスクロール位置調整
        requestAnimationFrame(() => {
            scrollWithPercentage(last_scroll);
        });

    }

    /**
     * 任意の位置(右側からの百分率)にスクロール
     * @param {number} percentage 0 - 100
     */
    function scrollWithPercentage(percentage) {
        if (settings.is_horizontal) {
            scrollTo(0, (percentage / 100) * (document.documentElement.scrollHeight - document.documentElement.clientHeight));
        } else {
            scrollTo({
                left: document.querySelector('body').scrollWidth * (-percentage / 100)
            });
        }
    }

    /**
     * .blocks[playing_num]へスクロール
     */
    function scrollToBlock() {
        const block = document.querySelectorAll('.blocks')[playing_num];
        if (!block) return;

        // 要素の位置とサイズを取得
        const rect = block.getBoundingClientRect();

        // 現在のスクロール位置
        const scrollX = window.scrollX || window.pageXOffset;
        const scrollY = window.scrollY || window.pageYOffset;

        // 要素の中心座標を計算
        const elementCenterX = rect.left + rect.width / 2;
        const elementCenterY = rect.top + rect.height / 2;

        // 表示領域（ビューポート）の中心座標
        const viewportCenterX = window.innerWidth / 2;
        const viewportCenterY = window.innerHeight / 2;

        // スクロール位置を調整
        window.scrollTo({
            top: scrollY + (elementCenterY - viewportCenterY),
            left: scrollX + (elementCenterX - viewportCenterX),
            behavior: "smooth", // スムーズなスクロールアニメーション
        });
    }

    /**
     * .blocks[playing_num]をハイライト
     */
    function highlightBlock() {
        const blocks = document.querySelectorAll('.blocks');
        blocks.forEach(item => {
            item.style.backgroundColor = '';
        });
        blocks[playing_num].style.backgroundColor = '#2f5d5b';
        
    }

    /**
     * スクロールバーが左端までの何%の位置にあるか取得
     * @returns {number}
     */
    // 
    function getScrollbarPositionFromRight() {
        // ドキュメントの全幅
        const documentWidth = document.documentElement.scrollWidth;
        // 現在のスクロール位置（左端からの位置）
        const scrollLeft = document.documentElement.scrollLeft * -1;

        // ドキュメント全幅に対する右からの割合
        const percentageFromRight = 100 - ((documentWidth - scrollLeft) / documentWidth) * 100;

        return percentageFromRight;
    }

    /**
     * スクロールバーが終端までの何%の位置にあるか取得
     * @returns {number}
     */
    function getScrollbarPositionFromTop() {
        // scrollTopはdocument.documentElementを優先して取得
        const scrollTop = document.documentElement.scrollTop;
        // scrollHeightは、document.documentElement.scrollHeight - clientHeightを使ってページ全体の高さを考慮
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;

        // scrollTopの位置がページのどの位置にいるかの割合を計算
        const scrollPercentage = (scrollTop / scrollHeight) * 100;
        return scrollPercentage;
    }
};