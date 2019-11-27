// $(".target").hover(() => $(".target").focus());
$(".target").focus();
$(".target").hover(
    function () {
        $(".img-overlay").addClass("hover");
        $(".target").focus();
    }, function () {
        $(".img-overlay").removeClass("hover");
    }
);
$(".target").mousemove(function () {
        $(".target").focus();
    }
)

const target = document.querySelector('div.target'); //todo: rewrite to jquery... | but I copied paste it from stack overflow! | so what? | so.. it works? | duh...

let chartName = "gantt"
if (window.location.hash) {
    let end = window.location.hash.length;
    let questionMarkPos = window.location.hash.indexOf("?");
    if (questionMarkPos != -1) {
        end = questionMarkPos;
    }
    chartName = window.location.hash.substring(1, end);
}

if (chartName == "orgChart") {
    $(".text").append("<p class=\"miro-h1\">Paste organizational hierarchy data</p>" +
        "        <ol>" +
        "            <li>" +
        "                Copy organizational hierarchy data from spreadsheet. <b>Copy data without headers</b>, as shown on" +
        "                picture" +
        "                below." +
        "            </li>" +
        "" +
        "        </ol>" +
        "        <img src=\"img/orgChart_copy.png\">" +
        "        <ol start=\"2\">" +
        "            <li>" +
        "                Paste data into this window. You can do this by:" +
        "                <ul>" +
        "                    <li>CTRL + V [Windows]</li>" +
        "                    <li>Command + V [MacOS]</li>" +
        "                    <li>or just right-mouse click and select \"Paste\"</li>" +
        "                </ul>" +
        "            </li>" +
        "        </ol>")
} else if (chartName == "gantt") {
    $(".text").append("<p class=\"miro-h1\">Paste Gantt chart data</p>" +
        "        <ol>" +
        "            <li>" +
        "                Copy Gantt chart data from spreadsheet. <b>Copy data without headers</b>, as shown on" +
        "                picture below." +
        "            </li>" +
        "" +
        "        </ol>" +
        "        <img src=\"img/gantt_copy.png\">" +
        "        <ol start=\"2\">" +
        "            <li>" +
        "                Paste data into this window. You can do this by:" +
        "                <ul>" +
        "                    <li>CTRL + V [Windows]</li>" +
        "                    <li>Command + V [MacOS]</li>" +
        "                    <li>or just right-mouse click and select \"Paste\"</li>" +
        "                </ul>" +
        "            </li>" +
        "        </ol>")

}

function bootstrap() {
    target.addEventListener('paste', (event) => {
        let paste = (event.clipboardData || window.clipboardData).getData('text');
        miro.broadcastData({
            type: 'pasted_' + chartName,
            data: paste
        })
        event.preventDefault();
    });
}

miro.onReady(bootstrap);