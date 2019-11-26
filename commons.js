const CLIENT_ID = "3074457346884149773";

async function createWidgets(widgets){
    let widgetsCreated=[];
    let widgetCreationPromises=[];
    let i=0;
    while (i<widgets.length){
        widgetCreationPromises.push(miro.board.widgets.create(widgets.slice(i,i+200)));
        i+=200;
    }
    for(let i=0;i<widgetCreationPromises.length;i++){
        let widgetsCreatedTemp = await widgetCreationPromises[i];
        widgetsCreated = widgetsCreated.concat(widgetsCreatedTemp);
    }
    return widgetsCreated;
}