// don't tink we are using it.
/ /**
 * Flattens nested JSON data into key-value pairs with dot notation.
 * 
 * @param {Object} jsonData - The JSON object to be flattened.
 * @returns {Object} - A flattened key-value pair object.
 */
function flattenJsonData(jsonData) {
    const flattenedData = {};

    /**
     * Recursive function to traverse the object and flatten keys.
     * @param {Object} obj - The current level of the JSON data.
     * @param {String} parentKey - The accumulated key for nesting levels.
     */
    function flattenHelper(obj, parentKey = '') {
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                const newKey = parentKey ? `${parentKey}.${key}` : key;

                // If the value is an object, recursively flatten it
                if (typeof obj[key] === 'object' && obj[key] !== null) {
                    flattenHelper(obj[key], newKey);
                } else {
                    // Otherwise, add the key-value pair to the result
                    flattenedData[newKey] = obj[key];
                }
            }
        }
    }

    flattenHelper(jsonData);
    return flattenedData;
}



 