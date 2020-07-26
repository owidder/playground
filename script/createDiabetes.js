const csvToJson = require("convert-csv-to-json");
const fs = require("fs");

const json = csvToJson.getJsonFromCsv("/Users/oliverwidder/dev/github/my-projects/playground/script/datasets_228_482_diabetes.csv");
const data = json.map(j => {
    const label = j.Outcome == "0" ? "no" : (j.Outcome == "1" ? "yes" : "unknown");
    delete j.Outcome;
    const nj = Object.keys(j).reduce((o, key) => {
        return {...o, [key]: Number(j[key])}
    }, {});
    return {...nj, label};
})

const dataSource = {
    name: "Pima Indians Diabetes Database",
    description: "Predict the onset of diabetes based on diagnostic measures",
    source: "https://www.kaggle.com/uciml/pima-indians-diabetes-database",
    data
}

fs.writeFileSync("/Users/oliverwidder/dev/github/my-projects/playground/script/diabetes.json", JSON.stringify(dataSource, null, 4));
