
$(".target").hover(() => $(".target").focus());
$(".target").focus();

const target = document.querySelector('div.target'); //todo: rewrite to jquery... | but I copied paste it from stack overflow! | so what? | so.. it works? | duh...

function bootstrap() {
    target.addEventListener('paste', (event) => {
        let paste = (event.clipboardData || window.clipboardData).getData('text');
        createChart(paste).then(() => {
            miro.board.ui.closeModal();
        }); // todo: add error handling so it would be easy to put a message to end users if pasting failed for whatever reason
        event.preventDefault();
    });
}

miro.onReady(bootstrap);