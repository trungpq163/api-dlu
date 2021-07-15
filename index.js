const axios = require('axios');
const qs = require('qs');
const tabletojson = require("tabletojson").Tabletojson;

require("dotenv").config();

const fs = require("fs");
const path = require("path");

/**
 * @description: get url html file in api-dlu module for rendering :D
 */
const urlHTMLFile = '/node_modules/api-dlu/index.html';

const date = new Date();
const year = date.getFullYear();
const month = date.getMonth();

const yearImportRegex = new RegExp('^[0-9]{4}-[0-9]{4}$');
const termImportRegex = new RegExp('^(HK0[1-3])|(hk0[1-3])|(hK0[1-3])|(Hk0[1-3])$');

const sessionId = '0u4nhabk0pxplvl1sxtvbt5z';

const data = qs.stringify({
  'txtTaiKhoan': process.env.STUDENT_ID,
  'txtMatKhau': process.env.PASSWORD
});

const configPost = {
  method: 'post',
  url: 'http://online.dlu.edu.vn/Login',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Cookie': `ASP.NET_SessionId=${sessionId}`
  },
  data: data
};

// Handle Year, Term, Week
let yearStudy = "";
let termID = "";
let week = "";

const getYearAndTermStudy = () => {
  if (
    (month === 0) |
    (month === 1) |
    (month === 2) |
    (month === 3) |
    (month === 4) |
    (month === 5) |
  ) {
    yearStudy = `${year - 1}-${year}`;
    termID = `HK02`;
  } else if (month === 6) {
    yearStudy = `${year - 1}-${year}`;
    termID = `HK03`;
  } else {
    yearStudy = `${year}-${year + 1}`;
    termID = `HK01`;
  }
};

const getWeek = d => {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  week = weekNo;
}

// Call Function Hanle Year, Term, Week
getYearAndTermStudy();
getWeek(new Date());

// Post Login 
async function postLogin(config) {
  await axios(config)
    .then(response => JSON.stringify(response.data))
    .catch(error => console.log('error post login', error));
}

// Get Data and Write to index.html file
async function getScheduleFromURLAndWriteFile(config) {
  await axios(config)
    .then(response => JSON.stringify(response.data))
    .then(result => {
      fs.writeFileSync(path.resolve(__dirname, "index.html"), result, "utf8", function (err) {
        if (err) throw err;
        else console.log("Ghi file thanh cong!");
      });
    })
    .catch(error => console.log('error get scheduke', error))
}

/**
 * handle data schedule from index.html and convert to json :D
 */
async function handleDataScheduleToJSON() {
  const fileIndexHTML = await fs.readFileSync(
    path.resolve(__dirname, "index.html"),
    { encoding: "UTF-8" }
  );
  let tablesAsJson = await tabletojson.convert(fileIndexHTML, {
    useFirstRowForHeadings: true
  });
  let result = await tablesAsJson[0];
  return result;
}

/**
 * 
 * @param {string} idImport 
 * @param {string} yearImport 
 * @param {string} termImport 
 * @param {string} weekImport 
 * @description main function, it handle api :D
 * @requires idImport
 * @default yearImport, termImport, weekImport current value
 */
async function performSyncScheduleFunctions(idImport, yearImport, termImport, weekImport) {
  await postLogin(configPost);

  if (idImport.indexOf('.') !== -1) {
    let url = await `http://online.dlu.edu.vn/Home/DrawingProfessorSchedule?YearStudy=${yearImportRegex.test(yearImport) ? yearImport : yearStudy
      }&TermID=${termImportRegex.test(termImport) ? termImport : termID
      }&Week=${(typeof (Number(weekImport)) === 'number' && Number(weekImport) >= 0) ? weekImport : week
      }&ProfessorID=${idImport}`;

    let configGet = await {
      method: 'get',
      url: url,
      headers: {
        'Cookie': `ASP.NET_SessionId=${sessionId}`
      }
    };

    await getScheduleFromURLAndWriteFile(configGet);

  } else if (typeof (Number(idImport)) === 'number' & Number(idImport) > 0) {
    let url = await `http://online.dlu.edu.vn/Home/DrawingStudentSchedule?StudentId=${Number(
      idImport
    )}&YearId=${yearImportRegex.test(yearImport) ? yearImport : yearStudy
      }&TermId=${termImportRegex.test(termImport) ? termImport : termID
      }&WeekId=${(typeof (Number(weekImport)) === 'number' && Number(weekImport) >= 0) ? weekImport : week
      }`;

    let configGet = await {
      method: 'get',
      url: url,
      headers: {
        'Cookie': `ASP.NET_SessionId=${sessionId}`
      }
    };

    await getScheduleFromURLAndWriteFile(configGet);

  } else {
    let url = await `http://online.dlu.edu.vn/Home/DrawingClassStudentSchedules_Mau2?YearStudy=${yearImportRegex.test(yearImport) ? yearImport : yearStudy
      }&TermID=${termImportRegex.test(termImport) ? termImport : termID
      }&Week=${(typeof (Number(weekImport)) === 'number' && Number(weekImport) >= 0) ? weekImport : week
      }&ClassStudentID=${idImport}`;

    let configGet = await {
      method: 'get',
      url: url,
      headers: {
        'Cookie': `ASP.NET_SessionId=${sessionId}`
      }
    };

    await getScheduleFromURLAndWriteFile(configGet);
  }
  await handleDataScheduleToJSON();
}

/**
 * @param {string} studentId
 * Function show api in console
 */
async function consoleLogAPI(studentId) {
  await performSyncScheduleFunctions(studentId);
  const data = await handleDataScheduleToJSON();
  console.log(data);
}

// consoleLogAPI("1710289");

module.exports = {
  performSyncScheduleFunctions,
  handleDataScheduleToJSON,
  consoleLogAPI,
  urlHTMLFile
};