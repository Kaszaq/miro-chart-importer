const MINIMAL_BOX_WIDTH = 250;
const COLUMN_DIRECT_REPORT_IDENT_WIDTH = 30;
const SPACE_BETWEEN_COLUMNS = 20;//todo: for test different value
const SPACE_BETWEEN_ROWS = 10;//todo: for test different value

const BOX_HEIGHT = 50;

class Person {
    constructor(username, parentUsername, displayName, title) {
        this.username = username;
        this.parentUsername = parentUsername;
        if (displayName == null || displayName == "") {
            displayName = username;
        }
        this.displayName = displayName;
        this.title = title;
        this.directReports = [];
        this.columnsBelowCount = 1; // todo: diff name is needed. This basically states how many columns will be created below this node, can be directly or indirectly via further node below
    }

    addDirectReport(person) {
        this.directReports.push(person);
    }
}

// todo: parsing - check for uniquness of usernames, check for "multiple roots", check for missing parents or usernames
// todo: add trimming of whitespaces to usernames



const colors = ["#9510ac", "#414bb2", "#0ca789", "#8fd14f", "#cee741", "#fef445", "#fac710", "#f24726", "#da0063"]

function getColorForLevel(levelNo) {
    return colors[levelNo % colors.length];
}

function parseUserData(data) {
    let nodesMap = new Map();
    let lines = data.split("\n");
    for (var i = 0; i < lines.length; i++) {
        let row = lines[i].split("\t");
        if (row[0] != "") nodesMap.set(row[0], new Person(row[0], row[1], row[2], row[3]));
    }
    return nodesMap;
}

function findRoot(nodesMap) {
    let orgRoot;
    for (var [username, person] of nodesMap) {
        if (!person.parentUsername || person.parentUsername == "") {
            if (orgRoot == null) {
                orgRoot = person;
            } else {
                    throw new ParsingDataError("Multiple top level managers found - "+orgRoot.displayName+" and "+person.displayName+". Please fix your data. ")
            }
        } else {
            let parent = nodesMap.get(person.parentUsername);
            if (parent == null) {
                throw new ParsingDataError("Manager username "+person.parentUsername+" of "+ person.displayName +" was not defined in provided data. Please fix your data.")
            }
            person.parent = parent;
            parent.addDirectReport(person);
        }
    }
    return orgRoot;
}

function countPeopleonLevel(node, level) {
    let peopleBelowCount = 0;
    for (var i = 0; i < node.directReports.length; i++) {
        peopleBelowCount += countPeopleonLevel(node.directReports[i], level + 1);
    }
    node.peopleBelowCount = peopleBelowCount;
    return peopleBelowCount + 1;
}

function getNumberOfColumns(node, proposedNumberOfColumns) {
    let columnsReq = node.directReports.length;
    if (columnsReq > proposedNumberOfColumns || proposedNumberOfColumns == 1) {
        return 1;
    } else if (columnsReq == proposedNumberOfColumns) {
        node.columnsBelowCount = columnsReq;
        return columnsReq;
    }

    let columnsToShare = proposedNumberOfColumns - columnsReq;
    node.columnsBelowCount = 0;
    // todo: handle case when there is no directReports? or it doesnt matter?
    for (var i = 0; i < node.directReports.length; i++) {
        node.columnsBelowCount += getNumberOfColumns(node.directReports[i], 1 + Math.round(node.directReports[i].peopleBelowCount / node.peopleBelowCount * columnsToShare));
    }
    return node.columnsBelowCount;
}

function findMaxIndents(node, indentCount) {
    let incr = 0;
    if (node.columnsBelowCount == 1) {
        incr = 1;
    }
    node.indent = indentCount;
    let maxIndent = indentCount;
    for (var i = 0; i < node.directReports.length; i++) {
        let directReportsIndentsCount = findMaxIndents(node.directReports[i], indentCount + incr);
        if (directReportsIndentsCount > maxIndent) {
            maxIndent = directReportsIndentsCount;
        }
    }
    return maxIndent;
}

function getWidgetsToCreate(widgetsToCreate, initialPosX, initialPosY, node, columnNo, rowNo, maxIdents, maxColumnWidth, levelNo) {
    node.width = node.columnsBelowCount * (MINIMAL_BOX_WIDTH + (maxIdents - node.indent) * COLUMN_DIRECT_REPORT_IDENT_WIDTH)
        + (node.columnsBelowCount - 1) * SPACE_BETWEEN_COLUMNS;
    node.height = BOX_HEIGHT;
    node.x = initialPosX + columnNo * (maxColumnWidth + SPACE_BETWEEN_COLUMNS) + node.indent * COLUMN_DIRECT_REPORT_IDENT_WIDTH + node.width / 2 + node.height / 2
    node.y = initialPosY + rowNo * (BOX_HEIGHT + SPACE_BETWEEN_ROWS);

    let tempColumnNo = columnNo;
    let tempRowNo = rowNo + 1;
    for (var i = 0; i < node.directReports.length; i++) {
        getWidgetsToCreate(widgetsToCreate, initialPosX, initialPosY, node.directReports[i], tempColumnNo, tempRowNo, maxIdents, maxColumnWidth, levelNo + 1);
        if (node.columnsBelowCount > 1) {
            tempColumnNo += node.directReports[i].columnsBelowCount;
        } else {
            tempRowNo += node.directReports[i].peopleBelowCount + 1;
        }
    }
    let text = "<p><strong>" + node.displayName + "</strong></p>";
    if (node.title != null) {
        text = "<p>" + node.title + "</p>" + text;
    }
    widgetsToCreate.push({
        type: 'shape',
        text: text,
        x: node.x,
        y: node.y,
        width: node.width,
        height: node.height,
        style: {
            textColor: '#000',
            backgroundColor: getColorForLevel(levelNo),
            borderColor: 'transparent',
            shapeType: 7,
            fontSize: 14
        }
    });

}

async function createOrgChart(data, statusUpdateListener) {

    //parse data
    statusUpdateListener.update("Parsing data");
    nodesMap = parseUserData(data);

    //find a root
    statusUpdateListener.update("Finding top level manager");
    orgRoot = findRoot(nodesMap);

    countPeopleonLevel(orgRoot, 0);
    let proposedNumberOfColumns = Math.floor(Math.sqrt(orgRoot.peopleBelowCount + 1));

    // count columns below each node
    statusUpdateListener.update("Estimating number of columns");
    getNumberOfColumns(orgRoot, proposedNumberOfColumns);

    let maxIdents = findMaxIndents(orgRoot, 0);
    let maxColumnWidth = MINIMAL_BOX_WIDTH + maxIdents * COLUMN_DIRECT_REPORT_IDENT_WIDTH;
    let viewport = await miro.board.viewport.getViewport();
    let x = viewport.x + 0.3 * viewport.width;
    let y = viewport.y + 0.3 * viewport.height;
    let widgetsToCreate = [];
    statusUpdateListener.update("Calculating widgets positions");
    getWidgetsToCreate(widgetsToCreate, x, y, orgRoot, 0, 0, maxIdents, maxColumnWidth, 0);

    let widgetsCreator = new WidgetsCreator(widgetsToCreate.length);
    await widgetsCreator.createWidgets(widgetsToCreate, "Creating widgets");

}


// let testData = `A		George Orwell	Head of heads		A
// B	A
// C	B
// D	B	Luca Film	El Ziomero
// E	A
// F	C
// G	C
// H	D
// I	D
// J	C
// K	D
// L	C
// M	D
// N	D
// O	A
// P	B
// R	N
// S	N
// T	R
// U	R
//
//
//
// 						`;