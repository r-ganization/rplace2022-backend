"use strict";
exports.__esModule = true;
function routes(app) {
    app.get('/canvas', function (req, res) { return res.sendStatus(200); });
}
exports["default"] = routes;
// /pixelHistory?x=0&y=0
// Gets all changes to a pixel over the entire game
//     / userHistory ? id = abc
// Gets all changes made by a user
//     / canvasHistory ? start = 123 & end=789
// Gets all changes made to the canvas during a time period(idk if we need this though)
// /getImage?time=567
// Gives png of the canvas at a point in time
//     / getImage ? time = 567 & res=2
// Same as before, but with a resolution multiplier
