//Change to your Google Spreadsheet ID
const SPREADSHEET_ID = "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";

function availability(e) {
  let form = FormApp.getActiveForm();
  let signup = [];
  let timeIndices = [];
  getTimeslots(signup, timeIndices);
  fillAvailableDays(signup, form.getItems());
}

//Time gathering functions below
function weekDayIndexToString(value)
{
  let wDay = "";
  switch (value)
  {
    case 0: wDay = "Monday"; break;
    case 1: wDay = "Tuesday"; break;
    case 2: wDay = "Wednesday"; break;
    case 3: wDay = "Thursday"; break;
    case 4: wDay = "Friday"; break;
    case 5: wDay = "Saturday"; break;
  }
  return wDay;
}
function listWeekdays(slots, formElements)
{
  //First, gather days with any time slots
  let aDays = [];
  for (let i = 0; i < slots.length; ++i)
  {
    //First entry is just the Date at midnight
    if (slots[i].length > 1)aDays.push(i);
  }
  //Second, build the choice elements and link them to their respective sections
  let daysList = [];
  let daysSection = formElements[1].asMultipleChoiceItem();
  if (aDays.length === 0)
  {
    daysSection.setChoices([daysSection.createChoice("Sorry, No Available Days", 
                            FormApp.PageNavigationType.RESTART)]);
  }
  else
  {
    for (let i = 0; i < aDays.length; ++i)
    {
      let weekDay = weekDayIndexToString(aDays[i]);
      for (let find = 0; find < formElements.length; ++find)
      {
        let e = formElements[find];
        if (e.getTitle() === weekDay)
        {
          daysList.push(daysSection.createChoice(weekDay, e.asPageBreakItem()));
          break;
        }
      }
    }
    daysSection.setChoices(daysList);
  }
}
function fillAvailableDays(slots, formElements)
{
  listWeekdays(slots, formElements);
  for (let i = 0; i < slots.length; ++i)
  {
    let weekDay = weekDayIndexToString(i);
    if (weekDay === "")continue;
    for (let find = 0; find < formElements.length; ++find)
    {
      let e = formElements[find];
      if (e.getTitle() === weekDay)
      {
        e.asPageBreakItem().setHelpText((slots[i][0].getMonth() + 1).toString() + "/" + 
                                         slots[i][0].getUTCDate().toString() + "/" +
                                         slots[i][0].getFullYear().toString());
        let eID = e.getIndex() + 1;
        let activeElement = formElements[eID].asMultipleChoiceItem();
        let curTimes = [];
        if (slots[i].length === 1) curTimes.push(activeElement.createChoice("No Times Available"));
        else 
        {
          for (let j = 1; j < slots[i].length; ++j) {
            let text = slots[i][j].getHours().toString() + ":";
            let min = slots[i][j].getMinutes();
            text += ((min < 10) ? "0" + min.toString() : min.toString());
            curTimes.push(activeElement.createChoice(text));
            curTimes[0]
          }
        }
        activeElement.setChoices(curTimes);
        break;//No need to iterate through this loop more for the current weekday
      }
    }
  }
}

function getTimeslots(slots, indices)
{
  let sheet = SpreadsheetApp.openById(SPREADSHEET_ID);

  let src = sheet.getDataRange().getValues();
  let today = new Date();
  for (let i = 1; i < src.length; ++i)
    for (let j = 0; j < src[i].length; ++j)
    {
      if (i === 1)
      {
        let arr = [];
        arr.push(src[i][j]);
        slots.push(arr);
        indices.push([1]);
      }
      else
      {
        let temp = new Date(src[i][j]);
        if (isNaN(temp))continue;
        if (today > slots[j][0])continue;
        slots[j].push(temp);//first access is to column of the original data (therefore daily schedule)
        indices[j].push(i);
      }
    }
}

//Response and form submission functions below
function findWeekday(formElements, output)
{
  let resp = formElements.getResponses();
  for (let i = 0; i < resp.length; ++i)
  {
    let itemResp = resp[i].getItemResponses();
    for (let j = 0; j < itemResp.length; ++j)
    {
      output.push(itemResp[j].getResponse());
    }
  }
  return 0;
}

function fillTimeslot(formResults)
{
  validTime = 1;

  let sheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  if (sheet === null || formResults.length < 3)return -1;

  let weekDay = 'H';
  if (formResults[1] === "Monday")weekDay = 'A';
  else if (formResults[1] === "Tuesday")weekDay = 'B';
  else if (formResults[1] === "Wednesday")weekDay = 'C';
  else if (formResults[1] === "Thursday")weekDay = 'D';
  else if (formResults[1] === "Friday")weekDay = 'E';
  else if (formResults[1] === "Saturday")weekDay = 'F';

  let index = 0;
  for (let itr = 3; itr < 25; ++itr)
  {
    //Find the time slot
    sheet.setCurrentCell(sheet.getRange(weekDay + (itr).toString()));
    let cur = sheet.getSelection().getCurrentCell();
    let ctr = cur.getValue().toString().indexOf(formResults[2]);
    if (ctr !== -1)
    {
      //Then verify this is not a mismatched time substring
      if (cur.getValue().toString().charAt(ctr - 1) !== '1')
      {
        index = itr;
        break;
      }
    }
  }

  if (index === 0) validTime = 0;
  else {
    sheet.setCurrentCell(sheet.getRange(weekDay + (index).toString()));
    let modCell = sheet.getSelection().getCurrentCell();
    let testDate = new Date(modCell.getValue());
    if (isNaN(testDate)) validTime = 0;
    else {
      modCell.setValue(formResults[2] + " " + formResults[0]);
    }
  }

  return validTime;
}

function submitTimes(e)
{
  let form = FormApp.getActiveForm();
  let output = []
  findWeekday(form, output);
  //Output has the form data needed to update the spreadsheet
  //[Name, Weekday, Time]
  let result = fillTimeslot(output);
  
  if (result === 0)
  {
    //Logger.log("report occurrence?");
  }
  form.deleteAllResponses();
}
