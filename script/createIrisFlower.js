const fs = require("fs");

const transform = (json) => {
    return json.map(j => {
        const label = j.species;
        delete j.species;
        return {...j, label}
    })
}

const trainStr = fs.readFileSync("/Users/oliverwidder/dev/github/my-projects/playground/src/data/training.json");
const train = JSON.parse(trainStr);
const newTrain = transform(train);

const testStr = fs.readFileSync("/Users/oliverwidder/dev/github/my-projects/playground/src/data/testing.json");
const test = JSON.parse(testStr);
const newTest = transform(test);

const data = [...newTrain, ...newTest]

const dataSource = {
    name: "Iris Dataset (JSON Version)",
    description: "A JSON version of the popular Iris Dataset",
    source: "https://www.kaggle.com/rtatman/iris-dataset-json-version",
    data
}

fs.writeFileSync("/Users/oliverwidder/dev/github/my-projects/playground/script/irisFlower.json", JSON.stringify(dataSource, null, 4));
