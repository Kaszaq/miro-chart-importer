let timeout;
function handleStatusUpdate(event) {
    let e = event.data; // unpack the event
    if (e.type == 'pasteStatusUpdate') {

        clearTimeout(timeout);
        let end = e.data.end;
        if (end) {
            timeout = setTimeout(miro.board.ui.closeBottomPanel, 1000);
            $("#progressBar").width("100%");
            if (end == "success") {
                $("#percentageText").text("100%");
                $("#statusText").text("Complete");
                $("#progressBar").css('background-color', '#77CC66');
            } else {
                $("#percentageText").text("");
                $("#statusText").text("Failure");
                $("#progressBar").css('background-color', '#D92929');
            }
        } else {
            timeout=
                setTimeout(miro.board.ui.closeBottomPanel, 15000);// todo: this is a workaround when for some reason the message with end doesnt get to the iframe so it would get closed at some point in time.
            let perc = Math.floor((e.data.perc == 1 ? 0.99 : e.data.perc) * 100) + "%";
            $("#progressBar").width(perc);
            $("#percentageText").text(perc);
            $("#statusText").text(e.data.statusText);
        }
    }
}

miro.onReady(() => {
    miro.addListener('DATA_BROADCASTED', handleStatusUpdate);
    timeout=
        setTimeout(miro.board.ui.closeBottomPanel, 15000);// todo: this is a workaround when for some reason the message with end doesnt get to the iframe so it would get closed at some point in time.
})
