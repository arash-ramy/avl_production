const express = require("express");
const router = express.Router();
const { headerAuth } = require("../utils/authHeader");
const deviceController = require("../controller/device");
const testcontroller = require("../controller/DeviceReports");

// Device Commands
router.get("/cmd/reset/:IMEI", headerAuth, deviceController.resetDevice);
router.get("/cmd/interval/:IMEI/:interval", headerAuth, deviceController.setInterval);
router.get("/cmd/interval/:IMEI/:apnname", headerAuth, deviceController.setAPN);
router.get("/cmd/sos/:IMEI/:sos", headerAuth, deviceController.setSOS);
router.get("/cmd/sos/:IMEI/:sos", headerAuth, deviceController.configure);

// Device Information
router.get("/last", headerAuth, deviceController.getLastLocationOfAllDevice);
router.get("/", deviceController.getDevices);
router.get("/tests", headerAuth, deviceController.tests);
router.post("/getinfo", headerAuth, deviceController.getBachInfoViaIMEI);

// Device Management
router.post("/add", headerAuth, deviceController.addDevice);
router.put("/", headerAuth, deviceController.editDevice);
router.delete("/deleteStatus/:id", headerAuth, deviceController.deleteDeviceStatus);


// Device Models
router.post("/models/add", headerAuth, deviceController.addDeviceModels);
router.get("/models/get", headerAuth, deviceController.getDeviceModels);
router.get("/models/getberif", headerAuth, deviceController.getDeviceModelsBerif);

// Alarms and Settings
router.post("/alarmsettings", headerAuth, deviceController.setAlarmSettings);
router.get("/alarmsettings/:IMEI/:settingsType", headerAuth, deviceController.getAlarmSettings);

// Status and Reports
router.post("/status", headerAuth, deviceController.setDeviceStatus);
router.post("/report/alarms", headerAuth, testcontroller.reportDeviceAlarms);
router.post("/report/alarms/pdf", headerAuth, deviceController.exportDeviceAlarmsReportToPdf);
router.post("/report/status", headerAuth, testcontroller.reportDeviceStatus2);
router.post("/report/status/pdf", headerAuth, deviceController.exportDeviceStatusReportToPdf);
router.post("/report/changes", headerAuth, testcontroller.reportDeviceChanges);
router.post("/report/changes/pdf", headerAuth, deviceController.exportDeviceChangesReportToPdf);
router.post("/report/vehicles", headerAuth, testcontroller.reportDriverVehicles);
router.post("/report/vehicles/pdf", headerAuth, deviceController.exportDriverVehiclesReportToPdf);
router.post("/report/locations", headerAuth, testcontroller.reportDeviceLocations);
router.post("/report/locations/pdf", headerAuth, deviceController.exportDeviceLocationsReportToPdf);
router.post("/report/locations-ct", headerAuth, testcontroller.reportDeviceLocationsCustome);

// Polygon Management
router.post("/addpolygon", headerAuth, deviceController.setPolygon);
router.delete("/polygon/:id", headerAuth, deviceController.deletePolygon);

// Device Location
router.post("/lastlocationsinp", headerAuth, deviceController.getLastLocationsOfDeviceInP);

// Additional Testing
router.post("/tests", headerAuth, deviceController.tests);

module.exports = router;
 













// this is pattern of swagger every times you need can use them 


/**
 * @swagger
 * /api/v1/device/:
 *   get:
 *     summary: Get all devices
 *     description: Retrieve information about all devices.
 *     security:
 *       - apiKeyAuth: []  # If authentication is required
 *     responses:
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 allVehicles:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       deviceIMEI:
 *                         type: string
 *                       driverName:
 *                         type: string
 *                       driverPhoneNumber:
 *                         type: string
 *                       gpsDataCount:
 *                         type: number
 *                       lastLocation:
 *                         type: object  # Assuming it's an object, adjust as needed
 *                       plate:
 *                         type: string
 *                       simNumber:
 *                         type: string
 *                       trackerModel:
 *                         type: string
 *                       vehicleName:
 *                         type: string
 *                       speedAlarm:
 *                         type: object  # Assuming it's an object, adjust as needed
 *                       maxSpeed:
 *                         type: number
 *                       maxPMDistance:
 *                         type: number
 *                       createDate:
 *                         type: string  # Assuming it's a string, adjust as needed
 *                       permissibleZone:
 *                         type: object  # Assuming it's an object, adjust as needed
 *                       vehicleStatus:
 *                         type: object  # Assuming it's an object, adjust as needed
 *                       zoneAlarm:
 *                         type: object  # Assuming it's an object, adjust as needed
 *                       fuel:
 *                         type: number
 *                       currentMonthDistance:
 *                         type: number
 *                       usage:
 *                         type: number
 *                       model:
 *                         type: object  # Assuming it's an object, adjust as needed
 *                 # Add more properties as needed based on your actual schema
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 messageSys:
 *                   type: string
 *                 code:
 *                   type: number
 */

