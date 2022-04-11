"use strict";
exports.__esModule = true;
var express_1 = require("express");
var cors_1 = require("cors");
var config_1 = require("config");
var logger_1 = require("./utils/logger");
var routes_1 = require("./routes/routes");
var port = config_1["default"].get('port');
var app = (0, express_1["default"])();
app.use(express_1["default"].json());
app.use((0, cors_1["default"])());
app.all('/', function (req, res) {
    res.send("Recieved ".concat(req.method, " request"));
});
app.listen(port, function () {
    logger_1["default"].info("Server started on port ".concat(3036));
    (0, routes_1["default"])(app);
});
