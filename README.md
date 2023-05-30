# gsAppointmentSignup
Google Form script for appointment sign up

.gs Script included with example CSV for a Google Spreadsheet (if reusing this script _"as-is"_)

## Description
Script to execute in the **Google Drive** environment for a **_Google Form_** file. The script demonstrates how to dynamically modify Form elements, access external Spreadsheets, and change branch conditions based on input and time availabilities.

Feel free to modify to fit specific .gs scripting needs, otherwise, as-is setup is described below.

### Functionality
_In its current form, this script reads a Google Spreadsheet to find available times (by weekday) for someone to sign up for an appointment._

_availability(e)_ is run by a **time trigger execution**. It gathers the Form object, and creates two empty arrays which are populated by with available timeslots described in an external Google Spreadsheet. These timeslots are then used to modify _multiple choice_ questions for each day's timeslots.

Successfully making an appointment modifies the external Google Spreadsheet of timeslots. Information is also reset in the event the user wants to make another appointment. **In the event that a timeslot is taken before a user submits their requested time,** the laset section is jumped to informing the user that someone else took the timeslot (indicating it is no longer available). This is achieved by invoking _submitTimes(e)_ as a trigger **On form submit**.

## As-is Procedures
 - Create a Form with 8 sections:
  - Section 1 requires _three items_:
    - Section header requiring an email address
    - Short answer for a name
    - A multiple choice question
  - Sections 2 through 7 require _two items_:
    - Section header
    - A multiple choice question
  - Section 8 requires _two items_
    - Section header
    - A multiple choice question
      - One question that resets form

The sections are as follows:
  - Description, collect email, name, pick date
  - Monday
  - Tuesday
  - Wednesday
  - Thursday
  - Friday
  - Saturday
  - Slot taken, restart form

A separate Google Spreadsheet is required with columns for each day of the week listed. The second row is the date associated with that day of the week (**past dates will not be read**). An appointment will nullify the timeslot by pushing the name of the person into the cell for the corresponding timeslot they selected.

Replace the string in the const SPREADSHEET_ID with the string representing your Google Spreadsheet ID.
