const MAX_TOP_BAR_ELEMENTS = 20;
const DAY_BOX_HEIGHT = 25;
const MONTH_BOX_HEIGHT = 25;
const PROJECT_BOX_HEIGHT = 25;
const PROJECT_BOX_SPACING = 5;
let PROJECT_NAME_WIDTH = 350;
function parseDate(textDate) {
    let d = new Date(textDate);
    if(!isNaN(d)){
        return moment(textDate); //todo: consider dropping moment.js
    }
    textDate = textDate || "empty date field";
    throw new ParsingDataError("Provided date is invalid: " + textDate + ". Please fix your data.");
}
class Project {
    constructor(projectName, dateStart, dateEnd, percentageComplete) {
        this.projectName = projectName;
        this.dateStart = dateStart;
        this.dateEnd =dateEnd;

        let tempPercComplete = parseFloat(percentageComplete);
        if (!isNaN(tempPercComplete)) {
            this.percentageComplete = tempPercComplete / 100.0;
        } else {
            this.percentageComplete = 0
        }
    }
}


const DAYS_COLORS = ["#fac710", "#fef445", "#8fd14f", "#cee741"];
const MONTH_COLORS = ["#f27726", "#4eaa40"];
const SINGLE_BAR_COLORS = ["#8fd14f", "#4eaa40"];

function getDayColor(moment) {
    return DAYS_COLORS[moment.isoWeek() % 2 + 2 * (moment.month() % 2)];
}

function getMonthColor(moment) {
    return MONTH_COLORS[moment.month() % 2];
}

function getSingleTopBarColor(number) {
    return SINGLE_BAR_COLORS[number % 2];
}

function parseProjectData(data) {
    let projects = [];

    let lines = data.split("\n");
    for (var i = 0; i < lines.length; i++) {
        let row = lines[i].split("\t");
        let dateStart = parseDate(row[1]);
        let dateEnd = parseDate(row[2]);
        if (row[0] != "") projects.push(new Project(row[0], dateStart, dateEnd, row[3]));
    }
    return projects;
}

function getMinMaxDates(projects) {
    let minDate = projects[0].dateStart;
    let maxDate = projects[0].dateEnd;
    for (var i = 0; i < projects.length; i++) {
        minDate = moment.min(minDate, projects[i].dateStart);
        maxDate = moment.max(maxDate, projects[i].dateEnd);
    }

    minDate = minDate.clone().isoWeekday(1);
    maxDate = maxDate.clone().isoWeekday(7);
    return {minDate: minDate, maxDate: maxDate}
}


async function createTable(initialPosX, initialPosY, projects, minDate, maxDate, dayWidth, drawDays, drawBackground, widgetsCreator) {

    let widgetsToCreate = [];
    let tempMoment = minDate.clone();
    let firstMonthDrawn = false;

    let tableHeight = projects.length * (PROJECT_BOX_HEIGHT + PROJECT_BOX_SPACING * 2);
    let tableYShift = tableHeight / 2;
    let table5Width = (dayWidth * 5);
    let table2Width = (dayWidth * 2);
    let table5XShift = table5Width / 2;
    let table2XShift = table2Width / 2;

    let daysShift = 0;
    let topBarType;
    let topBarFormat;
    if (Math.ceil(maxDate.diff(minDate, 'months', true)) <= MAX_TOP_BAR_ELEMENTS) {
        topBarType = 'month';
        topBarFormat = 'MMMM YYYY';
    } else {
        topBarType = 'year';
        topBarFormat = 'YYYY';
    }


    let lastDay = tempMoment;
    while (tempMoment.isSameOrBefore(maxDate)) {
        // draw months
        if (!firstMonthDrawn || tempMoment.isAfter(lastDay)) {
            firstMonthDrawn = true;
            lastDay = tempMoment.clone().endOf(topBarType);

            let days = moment.min(maxDate, lastDay).diff(tempMoment, 'days') + 1;
            let width = days * dayWidth;
            let height = MONTH_BOX_HEIGHT;
            widgetsToCreate.push({
                type: 'shape',
                text: "<p><strong>" + tempMoment.format(topBarFormat) + "</strong></p>",
                x: initialPosX + PROJECT_NAME_WIDTH + daysShift * dayWidth + width / 2,
                y: initialPosY + height / 2,
                width: width,
                height: height,
                style: {
                    textColor: '#000',
                    backgroundColor: drawDays ? getMonthColor(tempMoment) : getSingleTopBarColor(tempMoment.get(topBarType)),
                    borderColor: 'transparent',
                    shapeType: 3,
                    fontSize: 12
                }
            });
        }

        // draw days
        if (drawDays) {

            widgetsToCreate.push({
                type: 'shape',
                text: tempMoment.date().toString(),
                x: initialPosX + PROJECT_NAME_WIDTH + daysShift * dayWidth + dayWidth / 2,
                y: initialPosY + DAY_BOX_HEIGHT / 2 + DAY_BOX_HEIGHT,
                width: dayWidth,
                height: DAY_BOX_HEIGHT,
                style: {
                    textColor: '#000',
                    backgroundColor: getDayColor(tempMoment),
                    borderColor: 'transparent',
                    shapeType: 3,
                    fontSize: 12,
                    bold: 1
                }
            });
        }
        // draw background [this relies on the fact that drawn are all weeks
        if (drawBackground) {
            if (tempMoment.isoWeekday() == 1) {
                // draw 5 days
                widgetsToCreate.push({
                    type: 'shape',
                    text: "",
                    x: initialPosX + PROJECT_NAME_WIDTH + daysShift * dayWidth + table5XShift,
                    y: initialPosY + (drawDays ? 2 : 1) * DAY_BOX_HEIGHT + tableYShift,
                    width: table5Width,
                    height: tableHeight,
                    style: {
                        textColor: '#000',
                        backgroundColor: "#fbfbfb",
                        borderColor: 'transparent',
                        shapeType: 3,
                        fontSize: 12,
                        bold: 1
                    }
                });
            } else if (tempMoment.isoWeekday() == 6) {
                //draw weekend
                widgetsToCreate.push({
                    type: 'shape',
                    text: "",
                    x: initialPosX + PROJECT_NAME_WIDTH + daysShift * dayWidth + table2XShift,
                    y: initialPosY + 2 * DAY_BOX_HEIGHT + tableYShift,
                    width: table2Width,
                    height: tableHeight,
                    style: {
                        textColor: '#000',
                        backgroundColor: "#e6e6e6",
                        borderColor: 'transparent',
                        shapeType: 3,
                        fontSize: 12,
                        bold: 1
                    }
                });
            }
        }
        // go on with life
        daysShift++;
        tempMoment.add(1, 'days');
    }
    widgetsCreator.createWidgets(widgetsToCreate, "Creating table");
}

async function createProjects(initialPosX, initialPosY, projects, minDate, maxDate, dayWidth, drawDays, widgetsCreator) {
    let widgetsToCreate = [];
    let projectsNamesYShift = initialPosY + MONTH_BOX_HEIGHT + PROJECT_BOX_HEIGHT / 2 + PROJECT_BOX_SPACING + (drawDays ? DAY_BOX_HEIGHT : 0);
    let projectsNamesXShift = initialPosX + PROJECT_NAME_WIDTH / 2;
    let boardWidth = (maxDate.diff(minDate, 'days') + 1) * dayWidth;

    for (let i = 0; i < projects.length; i++) {
        let project = projects[i];
        let leftProjectWidget = {
            type: 'shape',
            x: projectsNamesXShift - 3,
            y: projectsNamesYShift + i * (PROJECT_BOX_HEIGHT + PROJECT_BOX_SPACING * 2),
            width: PROJECT_NAME_WIDTH,
            height: PROJECT_BOX_HEIGHT + PROJECT_BOX_SPACING * 2,
            text: project.projectName + "  ",
            style: {
                textColor: '#000',
                backgroundColor: 'transparent',
                borderColor: 'transparent',
                fontSize: 14,
                textAlign: 'r'
            }
        };
        widgetsToCreate.push(leftProjectWidget);

    }

    // create lines

    for (let i = 0; i < projects.length; i += 2) {
        widgetsToCreate.push({
            type: 'shape',
            x: initialPosX + PROJECT_NAME_WIDTH + boardWidth / 2,
            y: projectsNamesYShift + i * (PROJECT_BOX_HEIGHT + PROJECT_BOX_SPACING * 2),
            width: boardWidth,
            height: (PROJECT_BOX_HEIGHT + PROJECT_BOX_SPACING * 2),
            style: {
                backgroundColor: "transparent",
                backgroundOpacity: 1,
                bold: 0,
                borderColor: "#808080",
                borderOpacity: 1,
                borderStyle: 1,
                borderWidth: 1,
                fontFamily: 0,
                fontSize: 12,
                highlighting: "",
                italic: 0,
                shapeType: 3,
                strike: 0,
                textAlign: "l",
                textAlignVertical: "m",
                textColor: "#000000",
                underline: 0
            }
        });


    }

    //create project bars
    for (let i = 0; i < projects.length; i++) {
        let project = projects[i];
        let width = (project.dateEnd.diff(project.dateStart, 'days') + 1) * dayWidth;
        let daysSinceMinDate = project.dateStart.diff(minDate, 'days');
        widgetsToCreate.push({
            type: 'shape',
            x: initialPosX + PROJECT_NAME_WIDTH + daysSinceMinDate * dayWidth + width / 2,
            y: projectsNamesYShift + i * (PROJECT_BOX_HEIGHT + PROJECT_BOX_SPACING * 2),
            width: width,
            height: PROJECT_BOX_HEIGHT,
            text: "",
            style: {
                textColor: '#000',
                borderColor: 'transparent',
                fontSize: 12,
                shapeType: 7,
                backgroundColor: "#98c6ea",
                textAlign: 'l'
            }
        });
        if (project.percentageComplete > 0) {
            let widthComplete = width * project.percentageComplete;
            widgetsToCreate.push({
                type: 'shape',
                x: initialPosX + PROJECT_NAME_WIDTH + daysSinceMinDate * dayWidth + widthComplete / 2,
                y: projectsNamesYShift + i * (PROJECT_BOX_HEIGHT + PROJECT_BOX_SPACING * 2),
                width: widthComplete,
                height: PROJECT_BOX_HEIGHT,
                text: "",
                style: {
                    textColor: '#000',
                    borderColor: 'transparent',
                    fontSize: 12,
                    shapeType: 7,
                    backgroundColor: "#2d9bf0",
                    textAlign: 'l'
                }
            });
        }
    }
    widgetsCreator.createWidgets(widgetsToCreate, "Creating projects");
}


async function createGanttChart(data, statusUpdateListener) {
    statusUpdateListener.update("Parsing data");
    let projects = parseProjectData(data);
    let minMaxDates = getMinMaxDates(projects);
    let minDate = minMaxDates.minDate;
    let maxDate = minMaxDates.maxDate; // todo: program should fail currently when someone passes too wide duration. I mean, come on, 1000 years? :)  go with 5 years.
    let viewport = await miro.board.viewport.getViewport();
    let x = viewport.x + 0.3 * viewport.width;
    let y = viewport.y + 0.3 * viewport.height;
    //todo: creation of widgets should be replaced with some kind of throttling

    statusUpdateListener.update("Drawing table");
    let totalDays = maxDate.diff(minDate, 'days');
    let totalMonths = Math.ceil(maxDate.diff(minDate, 'months', true));
    let totalWeeks = Math.ceil(maxDate.diff(minDate, 'weeks', true));
    let totalYears =  Math.ceil(maxDate.diff(minDate, 'years', true));
    if (totalYears >25){
        throw new ParsingDataError("Data has duration longer than 25 years. Use data with duration of all projects that is shorter than 25 years.");
    }
    let drawDays = totalMonths < 4;
    let drawBackground = totalWeeks < 20;

    let totalTopBarElements = totalMonths <= MAX_TOP_BAR_ELEMENTS ? totalMonths : totalYears;

    let totalWidgetsToCreate = (drawDays ? totalDays : 0)
        + totalTopBarElements
        + (drawBackground ? totalWeeks * 2 : 0)
        + 4 * projects.length;

    let dayWidth = 2000 / totalDays;
    let widgetsCreator = new WidgetsCreator(totalWidgetsToCreate);
    createTable(x, y, projects, minDate, maxDate, dayWidth, drawDays, drawBackground, widgetsCreator);
    await createProjects(x, y, projects, minDate, maxDate, dayWidth, drawDays, widgetsCreator);
}

// let testData = `Project A1	2019-11-17	2019-12-01	36%
// Project A2	2019-12-03	2019-12-25	73%
// Project A3	2019-12-23	2020-01-18	42%
// Project A4	2020-01-15	2020-01-18	42%
// Project A5	2020-01-14	2020-02-11	57%
// Project A6	2020-02-12	2020-02-27	59%
// Project A7	2020-02-29	2020-03-11	53%
// Project A8	2020-03-08	2020-03-21	17%
// Project A9	2020-03-24	2020-03-24	81%
// Project A10	2020-03-22	2020-04-13	1%
// Project A11	2020-04-11	2020-04-25	80%
// Project A12	2020-04-28	2020-05-02	67%
// Project A13	2020-05-01	2020-05-21	16%
// Project A14	2020-05-20	2020-05-24	19%
// Project A15	2020-05-25	2020-06-14	88%
// Project A16	2020-06-15	2020-07-01	54%
// Project A17	2020-07-04	2020-07-21	85%
// Project A18	2020-07-22	2020-08-14	13%
// Project A19	2020-08-14	2020-08-19	5%
// Project A20	2020-08-21	2020-09-09	55%
// Project A21	2020-09-08	2020-10-01	15%
// Project A22	2020-09-30	2020-10-27	82%
// Project A23	2020-10-24	2020-11-19	85%
// Project A24	2020-11-22	2020-11-22	36%
// Project A25	2020-11-20	2020-11-30	18%
// Project A26	2020-12-03	2020-12-25	40%
// Project A27	2020-12-29	2021-01-12	78%
// Project A28	2021-01-13	2021-02-08	53%
// Project A29	2021-02-11	2021-02-21	4%
// Project A30	2021-02-21	2021-02-28	43%
// Project A31	2021-02-28	2021-03-25	72%
// Project A32	2021-03-24	2021-03-29	41%
// Project A33	2021-03-26	2021-04-02	57%
// Project A34	2021-04-01	2021-04-11	72%
// Project A35	2021-04-14	2021-04-20	68%
// Project A36	2021-04-21	2021-05-11	13%
// Project A37	2021-05-11	2021-05-18	26%
// Project A38	2021-05-18	2021-06-10	96%
// Project A39	2021-06-12	2021-07-11	52%
// Project A40	2021-07-11	2021-07-29	46%
// Project A41	2021-07-29	2021-08-26	77%
// Project A42	2021-08-28	2021-08-30	61%
// Project A43	2021-08-26	2021-09-10	47%
// Project A44	2021-09-08	2021-10-08	70%
// Project A45	2021-10-11	2021-10-23	20%
// Project A46	2021-10-25	2021-11-05	98%
// Project A47	2021-11-02	2021-11-08	35%
// Project A48	2021-11-05	2021-12-05	38%
// Project A49	2021-12-02	2021-12-27	47%
// Project A50	2021-12-29	2022-01-06	39%
// Project A51	2022-01-04	2022-01-16	41%
// Project A52	2022-01-13	2022-02-09	69%
// Project A53	2022-02-06	2022-02-08	16%
// Project A54	2022-02-08	2022-03-03	91%
// Project A55	2022-02-28	2022-03-12	69%
// Project A56	2022-03-11	2022-03-30	77%
// Project A57	2022-03-31	2022-03-31	69%
// Project A58	2022-04-04	2022-04-13	52%
// Project A59	2022-04-15	2022-04-30	9%
// Project A60	2022-04-30	2022-05-07	17%
// Project A61	2022-05-09	2022-05-10	7%
// Project A62	2022-05-10	2022-05-31	33%
// Project A63	2022-05-30	2022-06-12	15%
// Project A64	2022-06-10	2022-06-14	82%
// Project A65	2022-06-13	2022-06-25	19%
// Project A66	2022-06-26	2022-07-08	39%
// Project A67	2022-07-11	2022-07-14	46%
// Project A68	2022-07-12	2022-07-28	64%
// Project A69	2022-07-29	2022-08-13	39%
// Project A70	2022-08-10	2022-08-11	36%
// Project A71	2022-08-09	2022-08-22	20%
// Project A72	2022-08-26	2022-09-05	96%
// Project A73	2022-09-08	2022-10-07	4%
// Project A74	2022-10-03	2022-10-21	3%
// Project A75	2022-10-20	2022-11-02	49%
// Project A76	2022-10-30	2022-11-01	45%
// Project A77	2022-11-02	2022-11-14	87%
// Project A78	2022-11-13	2022-11-29	12%
// Project A79	2022-11-30	2022-11-30	85%
// Project A80	2022-12-02	2022-12-15	14%
//
//
// 				`