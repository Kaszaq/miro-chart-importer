function handleStatusUpdate(event) {
    let e = event.data; // unpack the event
    if (e.type == 'pasteStatusUpdate') {
        let end = e.data.end;
        if (end) {
            setTimeout(miro.board.ui.closeBottomPanel, 1000);
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
            let perc = Math.floor((e.data.perc == 1 ? 0.99 : e.data.perc) * 100) + "%";
            $("#progressBar").width(perc);
            $("#percentageText").text(perc);
            $("#statusText").text(e.data.statusText);
        }
    }
}

miro.onReady(() => {
    miro.addListener('DATA_BROADCASTED', handleStatusUpdate);
})
