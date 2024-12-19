chrome.runtime.onMessage.addListener(function (req, sender, sendResponse) {
    if (req.type === 'generate_voice_data') {
        generateVoice(req.text, sendResponse);
        return true;
    }

});

const generateVoice = async (_text, sendResponse) => {
    // console.clear();
    let response_data = { data: null, error: null };
    let text = encodeURIComponent(_text);
    try {
        let requestUrl = `http://localhost:50021/audio_query?text=${text}&speaker=8`;
        let requestOption = {
            "method": "POST",
            "headers": {
                "Content-Type": "application/json; charset=utf-8"
            }
        };
        // console.log(requestUrl);
        // console.log(requestOption);
        let audio_query = await fetch(requestUrl, requestOption)
            .then((res) => {
                if (!res.ok) throw new Error(`Audio Query API エラー: ${res.status} ${res.statusText}`);
                return res.json();
            });
        // console.log(audio_query);

        requestUrl = 'http://localhost:50021/synthesis?speaker=10';
        let _settings = {
            intonationScale: "1",
            pitchScale: "0",
            pauseLengthScale: 0.5,
            postPhonemeLength: 0,
            prePhonemeLength: 0,
            speedScale: "1.1",
            urlType: 3,
            volumeScale: "0.8"
        }
        let audio_data = await fetch(requestUrl, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json; charset=utf-8",
            },
            body: JSON.stringify({ ...audio_query, ..._settings })
        }).then((res) => {
            if (!res.ok) throw new Error(`Synthesis API エラー: ${res.status} ${res.statusText}`);
            return res.arrayBuffer();
        });

        // console.log(audio_data);
        response_data.data = convertString(audio_data);
    } catch (e) {
        response_data.error = e.message;
    }
    // console.log(response_data);
    sendResponse(response_data);
}
convertString = (buf) => {
    var tmp = [];
    var len = 1024;
    try {
        for (var p = 0; p < buf.byteLength; p += len) {
            tmp.push(String.fromCharCode.apply("", new Uint16Array(buf.slice(p, p + len))));
        }
    } catch (e) { }
    return tmp.join("");
}