const CLIENT_ID = "3074457346884149773";
const WIDGETS_BATCH_SIZE = 200;
const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

class WidgetsCreator {
    totalWidgetsCreated = 0;
    constructor(totalWidgetsCount) {
        this.totalWidgetsCount = totalWidgetsCount;
    }

    async createWidgets(widgets, statusText) {
        let widgetsCreated = [];
        let widgetCreationPromises = [];
        let i = 0;
        while (i < widgets.length) {
            widgetCreationPromises.push(miro.board.widgets.create(widgets.slice(i, i + WIDGETS_BATCH_SIZE)));

            i += WIDGETS_BATCH_SIZE;
            this.totalWidgetsCreated += (i > widgets.length ? widgets.length : i);
            statusUpdateListener.update(statusText, this.totalWidgetsCreated/this.totalWidgetsCount);

            // throttling. Could be 0 if /care but should stay to allow miro to actually draw these objects, as otherwise the UX sux of this.
            // This throttling won't work if we call this method multiple times async. Currently this method is not based on queue as
            // this would break line drawing functionality which actually needs to await for widget to be created in order to draw the lines.
            // If lines drawing gets fixed/changed at some point this would no longer be an issue, and this could be reimplemented to be based on queue
            // as the result won't actually be required.
            await sleep(20);

        }
        for (let i = 0; i < widgetCreationPromises.length; i++) {
            let widgetsCreatedTemp = await widgetCreationPromises[i];
            widgetsCreated = widgetsCreated.concat(widgetsCreatedTemp);
        }
        return widgetsCreated;
    }
}