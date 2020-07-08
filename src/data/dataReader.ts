export const test = require("./testing.json");
export const train = require("./training.json");

export const dataReader = async (relPath: string): Promise<string> => {
    const response = await fetch(relPath);
    return response.text();
}
