/**
 * Google Apps Script: รับคำตอบจาก index.html แล้วบันทึกลง Google Sheet
 *
 * วิธีติดตั้ง
 * 1. สร้าง Google Sheet ใหม่ > Extensions > Apps Script แล้ววางโค้ดนี้
 * 2. Deploy > New deployment > Web app
 *    Execute as: Me · Who has access: Anyone
 * 3. คัดลอก Web app URL ไปใส่ในตัวแปร SUBMIT_URL ใน index.html
 *
 * แถวแรกของชีตจะเป็นหัวคอลัมน์ (สร้างอัตโนมัติจากคำตอบแรก)
 * คอลัมน์ใหม่ที่เพิ่มภายหลังจะถูกต่อท้ายให้อัตโนมัติ
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Responses') ||
      SpreadsheetApp.getActiveSpreadsheet().insertSheet('Responses');
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
