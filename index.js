const fetch = require("node-fetch");
const { Headers } = require("node-fetch");
const tabletojson = require("tabletojson").Tabletojson;
require("dotenv").config();

const fs = require("fs");
const path = require("path");

const date = new Date();
const year = date.getFullYear();
const month = date.getMonth();

var myHeaders = new Headers();
myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
myHeaders.append("Cookie", "ASP.NET_SessionId=x4xip2xdezqlj5t2ujdmtqix");

var urlencoded = new URLSearchParams();
urlencoded.append("txtTaiKhoan", process.env.ID);
urlencoded.append("txtMatKhau", process.env.PassWord);

var requestOptions = {
  method: 'POST',
  headers: myHeaders,
  body: urlencoded,
  redirect: 'follow'
};

var requestOptionsGet = {
  method: 'GET',
  headers: myHeaders,
  redirect: 'follow'
};

let yearStudy = "";
let termID = "";
let week = "";
/**
 * @param string
 * @description: get url html file in api-dlu module for rendering :D
 */
const urlHTMLFile = '/node_modules/api-dlu/index.html';

const yearImportRegex = new RegExp('^[0-9]{4}-[0-9]{4}$');
const termImportRegex = new RegExp('^(HK0[1-3])|(hk0[1-3])|(hK0[1-3])|(Hk0[1-3])$');

const getYearAndTermStudy = () => {
  if (
    (month === 0) |
    (month === 1) |
    (month === 2) |
    (month === 3) |
    (month === 4) |
    (month === 5) |
    (month === 6)
  ) {
    yearStudy = `${year - 1}-${year}`;
    termID = `HK02`;
  } else if (month === 7) {
    yearStudy = `${year - 1}-${year}`;
    termID = `HK03`;
  } else {
    console.log(`${year}-${year + 1}`);
    yearStudy = `${year}-${year + 1}`;
    termID = `HK01`;
  }
};

function getWeek(d) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  week = weekNo;
}

getYearAndTermStudy();
getWeek(new Date());
// getWeek();

async function postLogin(url, config) {
  await fetch(url, config)
    .then(response => response.text())
    .catch(error => console.log(error));
}

async function getScheduleFromURLAndWriteFile(url, config) {
  await fetch(url, config)
    .then(response => response.text())
    .then(result => {
      fs.writeFileSync(path.resolve(__dirname, "index.html"), result, "utf8", function (err) {
        if (err) throw err;
        else console.log("Ghi file thanh cong!");
      });
    })
    .catch(error => console.log(error));
}

/**
 * this function get json data
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
  console.log(result);
  console.log(typeof (result));
  return result;
}

/**
 * 
 * @param {number} idImport 
 * @param {number} yearImport 
 * @param {string} termImport 
 * @param {number} weekImport 
 * @description this function handle api
 * @requires idImport
 * @default yearImport, termImport, weekImport current value
 */
async function performSyncScheduleFunctions(idImport, yearImport, termImport, weekImport) {

  let urlLogin = await `http://online.dlu.edu.vn/Login`;
  await postLogin(urlLogin, requestOptions);

  if (idImport.indexOf('.') !== -1) {

    let url = await `http://online.dlu.edu.vn/Home/DrawingProfessorSchedule?YearStudy=${yearImportRegex.test(yearImport) ? yearImport : yearStudy
      }&TermID=${termImportRegex.test(termImport) ? termImport : termID
      }&Week=${(typeof (Number(weekImport)) === 'number' && Number(weekImport) >= 0) ? weekImport : week
      }&ProfessorID=${idImport}`;
    await getScheduleFromURLAndWriteFile(url, requestOptionsGet);

  } else if (typeof (Number(idImport)) === 'number' & Number(idImport) > 0) {
    let url = await `http://online.dlu.edu.vn/Home/DrawingStudentSchedule?StudentId=${Number(
      idImport
    )}&YearId=${yearImportRegex.test(yearImport) ? yearImport : yearStudy
      }&TermId=${termImportRegex.test(termImport) ? termImport : termID
      }&WeekId=${(typeof (Number(weekImport)) === 'number' && Number(weekImport) >= 0) ? weekImport : week
      }`
    await getScheduleFromURLAndWriteFile(url, requestOptionsGet);

  } else {
    let url = await `http://online.dlu.edu.vn/Home/DrawingClassStudentSchedules_Mau2?YearStudy=${yearImportRegex.test(yearImport) ? yearImport : yearStudy
      }&TermID=${termImportRegex.test(termImport) ? termImport : termID
      }&Week=${(typeof (Number(weekImport)) === 'number' && Number(weekImport) >= 0) ? weekImport : week
      }&ClassStudentID=${idImport}`;
    await getScheduleFromURLAndWriteFile(url, requestOptionsGet);
  }

  await handleDataScheduleToJSON();
}

module.exports = {
  performSyncScheduleFunctions,
  handleDataScheduleToJSON,
  urlHTMLFile
};
