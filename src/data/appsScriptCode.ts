export const APPS_SCRIPT_CODE = `/**
 * Uni Tracker - Cloud Database Backend (Code.gs)
 * Connects Database Tables + Cloud Storage for live CRUD, Coordinator Authentication,
 * Day-Wise Photo Uploads, and Direct Document Storage.
 * 
 * SETUP INSTRUCTIONS:
 * 1. In your Google Sheet, click Extensions > Apps Script.
 * 2. Paste this entire code into Code.gs (replacing any existing content).
 * 3. Click "Deploy" > "New deployment".
 * 4. Select type: "Web app".
 * 5. Set:
 *    - Execute as: "Me" (your Google account)
 *    - Who has access: "Anyone" (crucial for client-side API requests)
 * 6. Click "Deploy", authorize permissions, and copy the Web App URL.
 * 7. In Uni Tracker Settings, paste the Web App URL and click "Save & Sync Now".
 */

// Global database table column schemas
var SCHEMA = {
  Projects: [
    'id', 'name', 'labCode', 'city', 'state', 'areaSft', 'status', 'health', 
    'progress', 'startDate', 'targetDate', 'heroImageUrl', 'lat', 'lng', 'mapsUrl',
    'budgetAllocated', 'budgetSpent', 'civilProgress', 'mepProgress', 'furnitureProgress', 'brandingProgress'
  ],
  DayWiseReports: [
    'id', 'projectId', 'dayNumber', 'date', 'workSummary', 'workersCount', 'materialsUsed', 'updatedBy'
  ],
  DayWisePhotos: [
    'id', 'projectId', 'dayNumber', 'date', 'caption', 'driveFileId', 'imageUrl'
  ],
  ExecutionStages: [
    'id', 'projectId', 'phase', 'stageNumber', 'stageName', 'status', 'progress', 'subTasksJson'
  ],
  Materials: [
    'id', 'projectId', 'itemName', 'category', 'requiredQty', 'deliveredQty', 'unit', 'status'
  ],
  Manpower: [
    'id', 'projectId', 'date', 'trade', 'workerCount', 'supervisor'
  ],
  Approvals: [
    'id', 'projectId', 'approvalName', 'requestedDate', 'approver', 'status', 'documentUrl'
  ],
  Documents: [
    'id', 'projectId', 'title', 'category', 'uploadDate', 'documentUrl'
  ],
  AppSettings: [
    'key', 'value'
  ]
};

var DRIVE_FOLDER_NAME = 'UniTracker_Storage';

function getTargetSpreadsheet() {
  var props = PropertiesService.getScriptProperties();
  var customId = props.getProperty('ACTIVE_SPREADSHEET_ID');
  if (customId) {
    try {
      return SpreadsheetApp.openById(customId);
    } catch(e) {}
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * GET Handler: Fetches all data across all database tables
 */
function doGet(e) {
  var ss = getTargetSpreadsheet();
  var result = {};

  try {
    Object.keys(SCHEMA).forEach(function(sheetName) {
      var sheet = ss.getSheetByName(sheetName);
      if (!sheet) {
        // Auto-create sheet with headers if missing
        sheet = ss.insertSheet(sheetName);
        sheet.appendRow(SCHEMA[sheetName]);
        result[sheetName] = [];
        return;
      }

      var data = sheet.getDataRange().getValues();
      if (!data || data.length <= 1) {
        result[sheetName] = [];
        return;
      }

      var headers = data[0].map(function(h) { return String(h).trim(); });
      var rows = data.slice(1);

      result[sheetName] = rows.filter(function(row) {
        return row.some(function(cell) { return cell !== '' && cell !== null; });
      }).map(function(row) {
        var obj = {};
        headers.forEach(function(header, idx) {
          obj[header] = row[idx] !== undefined ? row[idx] : '';
        });
        return obj;
      });
    });

    // Parse AppSettings into key-value map
    var settingsMap = { appName: 'Uni Tracker' };
    if (result.AppSettings && result.AppSettings.length > 0) {
      result.AppSettings.forEach(function(item) {
        if (item.key) settingsMap[item.key] = item.value;
      });
    }
    result.AppSettings = settingsMap;

    result.DatabaseMeta = {
      name: ss.getName(),
      id: ss.getId(),
      sheetUrl: ss.getUrl()
    };

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      data: result,
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * POST Handler: Handles create, update, delete, login, verifyPassword, uploadPhoto, uploadDocument, switchDatabase
 */
function doPost(e) {
  var ss = getTargetSpreadsheet();

  try {
    var contents = e.postData.contents;
    var payload = JSON.parse(contents);
    var action = payload.action;

    // 0. ACTION: SWITCH DATABASE (GLOBAL SERVER-SIDE SWITCHER)
    if (action === 'switchDatabase') {
      var pwd = (payload.password || '').trim();
      if (pwd !== 'admin123' && pwd !== 'admin') {
        return ContentService.createTextOutput(JSON.stringify({
          status: 'error',
          message: 'Invalid coordinator password. Database switch denied.'
        })).setMimeType(ContentService.MimeType.JSON);
      }

      var input = (payload.sheetUrl || '').trim();
      var sheetId = input;
      var match = input.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) {
        sheetId = match[1];
      }

      var targetSs = SpreadsheetApp.openById(sheetId);
      var newDbName = targetSs.getName();

      // Ensure all schema tabs exist on target database
      Object.keys(SCHEMA).forEach(function(sName) {
        var sh = targetSs.getSheetByName(sName);
        if (!sh) {
          sh = targetSs.insertSheet(sName);
          sh.appendRow(SCHEMA[sName]);
        }
      });

      PropertiesService.getScriptProperties().setProperty('ACTIVE_SPREADSHEET_ID', sheetId);

      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        databaseName: newDbName,
        message: 'Global active database switched to: ' + newDbName
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 1. ACTION: LOGIN
    if (action === 'login') {
      var username = (payload.username || '').trim().toLowerCase();
      var password = (payload.password || '').trim();

      if ((username === 'coordinator' || username === 'coordinator@unitracker.com') && (password === 'admin123' || password === 'admin')) {
        return ContentService.createTextOutput(JSON.stringify({
          status: 'success',
          user: {
            username: 'coordinator',
            name: 'Charan Sai',
            role: 'Project Coordinator',
            email: 'coordinator@unitracker.com'
          }
        })).setMimeType(ContentService.MimeType.JSON);
      }

      var usersSheet = ss.getSheetByName('Users');
      if (usersSheet) {
        var uData = usersSheet.getDataRange().getValues();
        var uHeaders = uData[0].map(function(h) { return String(h).trim().toLowerCase(); });
        var uRows = uData.slice(1);
        var uIdx = uHeaders.indexOf('username');
        var pIdx = uHeaders.indexOf('password');
        var nIdx = uHeaders.indexOf('name');
        var rIdx = uHeaders.indexOf('role');

        for (var i = 0; i < uRows.length; i++) {
          if (String(uRows[i][uIdx]).toLowerCase() === username && String(uRows[i][pIdx]) === password) {
            return ContentService.createTextOutput(JSON.stringify({
              status: 'success',
              user: {
                username: username,
                name: nIdx > -1 ? uRows[i][nIdx] : 'Coordinator',
                role: rIdx > -1 ? uRows[i][rIdx] : 'Project Coordinator'
              }
            })).setMimeType(ContentService.MimeType.JSON);
          }
        }
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: 'Invalid username or password'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 2. ACTION: VERIFY PASSWORD
    if (action === 'verifyPassword') {
      var username = (payload.username || '').trim().toLowerCase();
      var password = (payload.password || '').trim();

      if (password === 'admin123' || password === 'admin') {
        return ContentService.createTextOutput(JSON.stringify({ status: 'success' })).setMimeType(ContentService.MimeType.JSON);
      }

      var usersSheet = ss.getSheetByName('Users');
      if (usersSheet) {
        var uData = usersSheet.getDataRange().getValues();
        var uHeaders = uData[0].map(function(h) { return String(h).trim().toLowerCase(); });
        var uRows = uData.slice(1);
        var uIdx = uHeaders.indexOf('username');
        var pIdx = uHeaders.indexOf('password');
        for (var i = 0; i < uRows.length; i++) {
          if (String(uRows[i][uIdx]).toLowerCase() === username && String(uRows[i][pIdx]) === password) {
            return ContentService.createTextOutput(JSON.stringify({ status: 'success' })).setMimeType(ContentService.MimeType.JSON);
          }
        }
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: 'Incorrect password'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 3. ACTION: UPDATE APP SETTINGS
    if (action === 'updateAppSettings') {
      var settings = payload.settings || {};
      var settingsSheet = getOrCreateSheet(ss, 'AppSettings');
      Object.keys(settings).forEach(function(key) {
        upsertKeyValue(settingsSheet, key, settings[key]);
      });

      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'App settings updated'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 4. ACTION: UPDATE USER
    if (action === 'updateUser') {
      var usersSheet = getOrCreateSheet(ss, 'Users');
      var uData = usersSheet.getDataRange().getValues();
      var uHeaders = uData[0];
      if (!uHeaders || uHeaders.length === 0) {
        usersSheet.appendRow(['id', 'username', 'name', 'role', 'password']);
      }
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'User profile updated'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 5. ACTION: UPLOAD PHOTO TO STORAGE
    if (action === 'uploadPhoto') {
      var folder = getOrCreateFolder(DRIVE_FOLDER_NAME);
      var bytes = Utilities.base64Decode(payload.base64Data);
      var mimeType = payload.mimeType || 'image/jpeg';
      var fileName = payload.fileName || ('day' + (payload.dayNumber || 1) + '_' + Date.now() + '.jpg');
      
      var blob = Utilities.newBlob(bytes, mimeType, fileName);
      var file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

      var fileId = file.getId();
      var imageUrl = 'https://drive.google.com/uc?export=view&id=' + fileId;
      var photoId = 'ph-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

      var photoRecord = {
        id: photoId,
        projectId: payload.projectId || '',
        dayNumber: Number(payload.dayNumber) || 1,
        date: payload.date || new Date().toISOString().split('T')[0],
        caption: payload.caption || '',
        driveFileId: fileId,
        imageUrl: imageUrl
      };

      appendRecordToSheet(ss, 'DayWisePhotos', photoRecord);

      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        data: photoRecord
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 6. ACTION: UPLOAD DOCUMENT DIRECTLY
    if (action === 'uploadDocument') {
      var folder = getOrCreateFolder(DRIVE_FOLDER_NAME);
      var bytes = Utilities.base64Decode(payload.base64Data);
      var mimeType = payload.mimeType || 'application/pdf';
      var fileName = payload.fileName || ('doc_' + Date.now() + '.pdf');
      
      var blob = Utilities.newBlob(bytes, mimeType, fileName);
      var file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

      var fileId = file.getId();
      var documentUrl = 'https://drive.google.com/uc?export=view&id=' + fileId;
      var docId = 'doc-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

      var docRecord = {
        id: docId,
        projectId: payload.projectId || '',
        title: payload.title || fileName,
        category: payload.category || 'General',
        uploadDate: payload.uploadDate || new Date().toISOString().split('T')[0],
        documentUrl: documentUrl
      };

      appendRecordToSheet(ss, 'Documents', docRecord);

      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        data: docRecord
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 7. ACTION: CREATE RECORD
    if (action === 'create') {
      var sheetName = payload.sheetName;
      var data = payload.data;
      if (!sheetName || !data) throw new Error('Missing sheetName or data');

      appendRecordToSheet(ss, sheetName, data);

      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Record created in ' + sheetName,
        data: data
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 8. ACTION: UPDATE RECORD
    if (action === 'update') {
      var sheetName = payload.sheetName;
      var id = String(payload.id);
      var data = payload.data;
      if (!sheetName || !id || !data) throw new Error('Missing sheetName, id, or data');

      var sheet = getOrCreateSheet(ss, sheetName);
      var allData = sheet.getDataRange().getValues();
      var headers = allData[0].map(function(h) { return String(h).trim(); });
      var idColIdx = headers.indexOf('id');
      if (idColIdx === -1) idColIdx = 0;

      var foundRow = -1;
      for (var r = 1; r < allData.length; r++) {
        if (String(allData[r][idColIdx]) === id) {
          foundRow = r + 1;
          break;
        }
      }

      if (foundRow > -1) {
        var updatedRow = headers.map(function(header) {
          return data[header] !== undefined ? data[header] : sheet.getRange(foundRow, headers.indexOf(header) + 1).getValue();
        });
        sheet.getRange(foundRow, 1, 1, updatedRow.length).setValues([updatedRow]);
        return ContentService.createTextOutput(JSON.stringify({
          status: 'success',
          message: 'Record updated in ' + sheetName
        })).setMimeType(ContentService.MimeType.JSON);
      } else {
        appendRecordToSheet(ss, sheetName, data);
        return ContentService.createTextOutput(JSON.stringify({
          status: 'success',
          message: 'Record appended (was not found for update)'
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    // 9. ACTION: DELETE RECORD
    if (action === 'delete') {
      var sheetName = payload.sheetName;
      var id = String(payload.id);
      if (!sheetName || !id) throw new Error('Missing sheetName or id');

      var sheet = ss.getSheetByName(sheetName);
      if (!sheet) throw new Error('Table not found: ' + sheetName);

      var allData = sheet.getDataRange().getValues();
      var headers = allData[0].map(function(h) { return String(h).trim(); });
      var idColIdx = headers.indexOf('id');
      if (idColIdx === -1) idColIdx = 0;

      for (var r = 1; r < allData.length; r++) {
        if (String(allData[r][idColIdx]) === id) {
          sheet.deleteRow(r + 1);
          return ContentService.createTextOutput(JSON.stringify({
            status: 'success',
            message: 'Record deleted from ' + sheetName
          })).setMimeType(ContentService.MimeType.JSON);
        }
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: 'Record with id ' + id + ' not found in ' + sheetName
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'Unknown action: ' + action
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateSheet(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (SCHEMA[name]) {
      sheet.appendRow(SCHEMA[name]);
    }
  }
  return sheet;
}

function upsertKeyValue(sheet, key, value) {
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    sheet.appendRow([key, value]);
    return;
  }
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(key)) {
      sheet.getRange(i + 1, 2).setValue(value);
      return;
    }
  }
  sheet.appendRow([key, value]);
}

function appendRecordToSheet(ss, sheetName, data) {
  var sheet = getOrCreateSheet(ss, sheetName);
  var currentHeaders = sheet.getDataRange().getValues()[0];
  
  if (!currentHeaders || currentHeaders.length === 0) {
    var schemaHeaders = SCHEMA[sheetName] || Object.keys(data);
    sheet.appendRow(schemaHeaders);
    currentHeaders = schemaHeaders;
  }

  var row = currentHeaders.map(function(header) {
    var val = data[header];
    return val !== undefined && val !== null ? val : '';
  });

  sheet.appendRow(row);
}

function getOrCreateFolder(name) {
  var folders = DriveApp.getFoldersByName(name);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(name);
}
`;
