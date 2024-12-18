chrome.runtime.onMessage.addListener(function (req, sender, sendResponse) {
    console.log('発火');
    if (req.type === 'generate_voice_data') {
        generateVoice(req.text, sendResponse);
        return true;
    }

});

const generateVoice = async (_text, sendResponse) => {
    //console.clear();
    console.log(_text);
    let response_data = { status: 0, data: "" };
    let text = encodeURIComponent(_text);
    let requestUrl = `http://localhost:50021/audio_query?text=${text}&speaker=8`;
    let requestOption = {
        "method": "POST",
        "headers": {
            "Content-Type": "application/json; charset=utf-8"
        }
    };
    console.log(requestUrl);
    console.log(requestOption);
    let audio_query = await fetch(requestUrl, requestOption)
        .then((res) => {
            console.log(res);
            return res.json();
        }).catch((error) => {
            console.error(error);
        });
    console.log(audio_query);

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
    }).then(res => {
        console.log(res);
        return res.arrayBuffer();
    }).catch((error) => {
        console.log(error);
    });
    console.log(audio_data);
    response_data.data = convertString(audio_data);
    console.log(response_data);
    sendResponse(response_data);
    audio_data = null;
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