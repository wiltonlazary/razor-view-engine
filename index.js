var engine_1 = require("./lib/engine");
var fs = require("fs");
let engine = new engine_1.default();
fs.readFile(__dirname + "/sample.html", (err, data) => {
    fs.writeFile(__dirname + "/sample.transformed.html", engine.compile(data.toString("utf8"), {
        title: "test 1"
    }), (err_write) => {
        console.log(err, err_write);
    });
});
//# sourceMappingURL=index.js.map