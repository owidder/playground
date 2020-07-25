const csvToJson = require("convert-csv-to-json");
const fs = require("fs");

csvToJson.generateJsonFileFromCsv("/Users/oliverwidder/dev/github/my-projects/playground/script/datasets_228_482_diabetes.csv", "./diabetes.json");

const json = csvToJson.getJsonFromCsv("/Users/oliverwidder/dev/github/my-projects/playground/script/datasets_228_482_diabetes.csv");
const transformed = json.map(j => {
    const label = j.Outcome ? "no" : "yes";
    delete j.Outcome;
    const nj = Object.keys(j).reduce((o, key) => {
        return {...o, [key]: Number(j[key])}
    }, {});
    return {...nj, label};
})

fs.writeFileSync("./script/diabetes.json", JSON.stringify(transformed));
