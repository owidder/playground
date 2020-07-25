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

const testStr = fs.readFileSync("/Users/oliverwidder/dev/github/my-projects/playground/src/data/training.json");
const test = JSON.parse(testStr);
const newTest = transform(test);

const combined = [...newTrain, ...newTest]

fs.writeFileSync("./script/sepal.json", JSON.stringify(combined));
