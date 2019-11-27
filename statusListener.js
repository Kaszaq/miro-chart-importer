class StatusListener {

    async update(text, perc) {
        text = text || "Loading";
        perc = perc || 0;
        perc = perc > 1 ? 1 : perc;

        miro.broadcastData({
            type: 'pasteStatusUpdate',
            data: {
                perc: perc,
                statusText: text
            }
        })
    }

    success() {
        miro.broadcastData({
            type: 'pasteStatusUpdate',
            data: {
                end: "success"
            }
        })
    }
    fail() {
        miro.broadcastData({
            type: 'pasteStatusUpdate',
            data: {
                end: "failure"
            }
        })
    }
}
