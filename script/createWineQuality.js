const csvToJson = require("convert-csv-to-json");
const fs = require("fs");

const json = csvToJson.getJsonFromCsv("/Users/oliverwidder/dev/github/my-projects/playground/script/winequality-white.csv");
const data = json.map(j => {
    const label = string(j.quality);
    delete j.quality;
    const nj = Object.keys(j).reduce((o, key) => {
        return {...o, [key]: Number(j[key])}
    }, {});
    return {...nj, label};
})

const dataSource = {
    name: "Wine Quality Data Set (white)",
    description: "Model wine quality based on physicochemical tests",
    source: "http://archive.ics.uci.edu/ml/datasets/Wine+Quality",
    data
}

fs.writeFileSync("/Users/oliverwidder/dev/github/my-projects/playground/script/wine-white.json", JSON.stringify(dataSource, null, 4));
