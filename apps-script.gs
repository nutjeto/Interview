/**
 * Google Apps Script: รับคำตอบจาก index.html แล้วบันทึกลง Google Sheet
 *
 * วิธีติดตั้ง (ไม่ต้องใช้เมนู Extensions)
 * 1. เปิด https://script.google.com > New project แล้ววางโค้ดนี้ทับโค้ดเดิม > Save
 * 2. เลือกฟังก์ชัน setup แล้วกด Run (ครั้งแรกจะให้กดยอมรับสิทธิ์)
 *    สคริปต์จะสร้าง Google Sheet ชื่อ "New Employee Survey – Responses" ใน Drive ให้อัตโนมัติ
 * 3. Deploy > New deployment > Web app
 *    Execute as: Me · Who has access: Anyone
 * 4. คัดลอก Web app URL ไปใส่ในตัวแปร SUBMIT_URL ใน index.html
 *
 * ถ้าวางโค้ดนี้ผ่าน Google Sheet > Extensions > Apps Script จะบันทึกลง Sheet นั้นแทน
 * แถวแรกของชีตจะเป็นหัวคอลัมน์ (สร้างอัตโนมัติจากคำตอบแรก)
 * คอลัมน์ใหม่ที่เพิ่มภายหลังจะถูกต่อท้ายให้อัตโนมัติ
 */
function setup() {
  Logger.log('Sheet: ' + book_().getUrl());
}

// The bound spreadsheet if there is one, otherwise a spreadsheet this script creates once and remembers.
function book_() {
  var active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) return active;
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('SHEET_ID');
  if (id) return SpreadsheetApp.openById(id);
  var ss = SpreadsheetApp.create('New Employee Survey – Responses');
  props.setProperty('SHEET_ID', ss.getId());
  return ss;
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var data = JSON.parse(e.postData.contents);
    var book = book_();
    var sheet = book.getSheetByName('Responses') || book.insertSheet('Responses');
    var headers = sheet.getLastRow() ? sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0] : [];
    Object.keys(data).forEach(function (k) {
      if (headers.indexOf(k) < 0) headers.push(k);
    });
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.appendRow(headers.map(function (h) { return data[h] === undefined ? '' : data[h]; }));
    return ContentService.createTextOutput('ok');
  } finally {
    lock.releaseLock();
  }
}
