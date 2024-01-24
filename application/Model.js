class Model {


    async getDataFromAPI(startDate, endDate, dataType) {
        let url;
        let data;
        let urlPedestrian = `https://api.glasgow.gov.uk/mobility/v1/footfall/historical?format=json&startDate=${startDate}&endDate=${endDate}`;
        let urlCyclist = `https://api.glasgow.gov.uk/mobility/v1/Mobility_Measurements?format=json&period=day&type=bicycle&date=${startDate}&end=${endDate}`
        if (dataType === 'pedestrian') {
            url = urlPedestrian;
        }
        if (dataType === 'cyclist') {
            url = urlCyclist;
        }
        try {
            const response = await fetch(url, {method: 'GET'});
            if (!response.ok) {
                throw new Error('API request did not go through')
            }
            data = await response.json();

            if (dataType === 'cyclist') {
                data = await this.filterCyclistSensorAPI(data);
            }

            return data;

        } catch (err) {
            console.error('Fetch error:', err);
        }
    }

    async filterCyclistSensorAPI(cyclistData) {
        // Define the URL for the sensor location data
        let urlSensorLocation = `https://api.glasgow.gov.uk/mobility/v1/Mobility_Sites?format=json`;

        try {
            // Fetch the sensor location data from the API
            const response = await fetch(urlSensorLocation, {method: `GET`});
            // Check if the API request was successful
            if (!response.ok) {
                throw new Error('API request did not go through');
            }
            // Parse the JSON response to get sensor data
            const sensorData = await response.json();

            // Transform the sensor data array into a lookup object (map)
            const sensorLookup = sensorData.reduce((acc, sensor) => {
                // Map each sensor's id to its corresponding data for easy access
                acc[sensor.id] = {
                    name: sensor.name,
                    latitude: sensor.lat,
                    longitude: sensor.long
                };
                return acc; // Return the updated map
            }, {}); // Start with an empty object

            const aggregatedCounts = {};

            cyclistData.forEach(item => {
                const sensorInfo = sensorLookup[item.siteId];
                const bicycleData = item.crossingCountPerTimeInterval.find(interval => interval.class === 'bicycle');
                const count = bicycleData ? bicycleData.count : 0;

                // Create a unique key for each day and location
                const key = `${sensorInfo.latitude}-${sensorInfo.longitude}`;

                if (!aggregatedCounts[key]) {
                    aggregatedCounts[key] = {
                        sensorName: sensorInfo.name,
                        sensorLatitude: sensorInfo.latitude,
                        sensorLongitude: sensorInfo.longitude,
                        periodKey: item.periodKey,
                        count: 0
                    };
                }
                aggregatedCounts[key].count += count;

            });
            // Convert the aggregated data into an array for return
            const resultArray = Object.values(aggregatedCounts);

            return resultArray;

        } catch (err) {
            console.error('Fetch error:', err);
            return []; // Return an empty array as a fallback
        }
    }


    convertToGraphData(data, dataType) {
        const streetData = {}
        if (dataType === 'pedestrian') {

            data.forEach(item => {
                const street = item.location.description;
                const key = street;

                if (!streetData[key]) {
                    // If the street-month key doesn't exist, create it with initial values
                    streetData[key] = {
                        pedestrianCount: 0,

                    };
                }

                // Aggregate the pedestrian counts for the street-month key
                streetData[key].pedestrianCount += item.pedestrianCount;
            })
            console.log(streetData);

        }

        return streetData;


    }


    convertToGeoJSON(data) {
        // Create an object to hold the aggregated data by street
        const aggregatedData = {};

        data.forEach(item => {
            const street = item.location.description;
            const coordinates = [item.location.longitude, item.location.latitude];
            const date = new Date(item.processDate);
            const day = String(date.getUTCDate()).padStart(2, '0');
            const month = String(date.getUTCMonth() + 1).padStart(2, '0');
            const year = date.getUTCFullYear();
            const monthYear = `${year}-${month}-${day}`;

            if (!aggregatedData[street]) {
                // If the street key doesn't exist, create it with initial values
                aggregatedData[street] = {
                    pedestrianCount: 0,
                    coordinates: coordinates,
                    description: street,
                    dates: [] // Array to store all dates for this street
                };
            }

            // Aggregate the pedestrian counts for the street key
            aggregatedData[street].pedestrianCount += item.pedestrianCount;
            if (!aggregatedData[street].dates.includes(monthYear)) {
                aggregatedData[street].dates.push(monthYear);
            }
        });

        // Convert the aggregated data into an array of GeoJSON features
        const features = Object.keys(aggregatedData).map(key => {
            const item = aggregatedData[key];
            return {
                "type": "Feature",
                "properties": {
                    "pedestrianCount": item.pedestrianCount,
                    "dates": item.dates.join(', '), // Join dates as a string
                    "description": item.description
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": item.coordinates
                }
            };
        });
        console.log(features);
        return {
            "type": "FeatureCollection",
            "features": features
        };
    }
}

