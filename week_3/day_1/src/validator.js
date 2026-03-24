import { readFile, writeFile } from 'node:fs/promises';

const norms = {
    temperature_K: { min: 553, max: 873 },
    water_level_meters: { min: 5.0, max: 15.0 },
    voltage_supply_v: { min: 229.0, max: 231.0 },
    pressure_bar: { min: 60, max: 160 },
    humidity_percent: { min: 40.0, max: 80.0 },
}

const validFiles = [];

export async function getInvalidFiles() {
    const invalidFileNames = [];
    for (let i = 1; i <= 9999; i++) {
        const fileName = String(i).padStart(4, '0');
        const path = `./workspace/${fileName}.json`;

        try {
            const text = await readFile(path, 'utf8');
            const data = JSON.parse(text);

            const unexpectedNonZero = getUnexpectedNonZeroFields(data);

            if (unexpectedNonZero.length > 0) {
                console.log(`Niepoprawne dane: ${fileName}.json`);
                invalidFileNames.push(fileName);
            } else {
                const paramsOutOfNorm = getParamsOutOfNorm(data);

                if (paramsOutOfNorm.length > 0) {
                    console.log(`Parametry poza normą: ${fileName}.json`);

                    invalidFileNames.push(fileName);
                } else {
                    //Dane poprawne 
                    validFiles.push({fileName: fileName, description: data.operator_notes})
                }
            }
        } catch (err) {
            console.error(`Błąd w pliku ${fileName}.json:`, err.message);
        }
    }


    console.log('-----VALIDATOR RESULT-----');
    return invalidFileNames;
}

export async function getValidFiles() {
    return validFiles;
}

const fieldToSensorTypeMap = {
    temperature_K: 'temperature',
    water_level_meters: 'water',
    voltage_supply_v: 'voltage',
    pressure_bar: 'pressure',
    humidity_percent: 'humidity',
};

const getUnexpectedNonZeroFields = (record) => {
    const allowedSensorTypes = new Set(
        (record.sensor_type || '')
            .split('/')
            .map(type => type.trim())
            .filter(Boolean)
    );

    return Object.entries(fieldToSensorTypeMap)
        .filter(([fieldName, sensorType]) => {
            const value = record[fieldName];

            return (
                typeof value === 'number' &&
                value !== 0 &&
                !allowedSensorTypes.has(sensorType)
            );
        })
        .map(([fieldName, sensorType]) => ({
            field: fieldName,
            value: record[fieldName],
            expectedSensorType: sensorType,
        }));
};


const getParamsOutOfNorm = (record) => {
    return Object.entries(norms)
        .filter(([fieldName, { min, max }]) => {
            const value = record[fieldName];

            return (
                typeof value === 'number' &&
                value !== 0 &&
                (value < min || value > max)
            );
        })
        .map(([fieldName, { min, max }]) => ({
            field: fieldName,
            value: record[fieldName],
            expectedRange: { min, max },
        }));
};


