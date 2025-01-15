export function createMemorialDataStructure(jsonData: string) {
    const data = JSON.parse(jsonData);
    const structure = {};
    
    // Dynamically create sections based on the incoming data
    Object.keys(data).forEach(section => {
        structure[section] = {};
        Object.keys(data[section]).forEach(field => {
            const value = data[section][field];
            // Convert dates if the field name contains 'date', 'dob', or 'dop'
            structure[section][field] = /date|dob|dop/i.test(field) 
                ? new Date(value) 
                : value;
        });
    });

    return structure;
}
