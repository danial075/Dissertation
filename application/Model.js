class Model {


// This function gets the data from the Pedestrian and Cyclist API
    async getDataFromAPI(startDate, endDate, dataType) {

        let url;
        let data;
        let urlPedestrian = `https://api.glasgow.gov.uk/mobility/v1/footfall/historical?format=json&startDate=${startDate}&endDate=${endDate}`;
        let urlCyclist = `https://api.glasgow.gov.uk/mobility/v1/Mobility_Measurements?format=json&period=day&type=bicycle&date=${startDate}&end=${endDate}`
        let urlTraffic = `https://api.glasgow.gov.uk/traffic/v1/movement/query?start=${startDate}&end=${endDate}&period=Day`;

        if (dataType === 'pedestrian') {
            url = urlPedestrian;
        }
        if (dataType === 'cyclist') {
            url = urlCyclist;
        }
        if (dataType === 'traffic') {
            url = urlTraffic
        }
        try {
            const response = await fetch(url, {method: 'GET'});
            if (!response.ok) {
                throw new Error('API request did not go through')
            }
            data = await response.json();

            if (dataType === 'cyclist') {
                data = await this.LocationToCyclistData(data, dataType);
            }
            if (dataType === 'traffic') {
                data = await this.LocationToCyclistData(data, dataType);

            }
            return data;


        } catch (err) {
            console.error('Fetch error:', err);
        }
    }

// This function adds the location and coordinates to the cyclist data
    async LocationToCyclistData(unsortedData, dataType) {
        if (dataType === 'cyclist') {
            let url = `https://api.glasgow.gov.uk/mobility/v1/Mobility_Sites?format=json`;

            try {
                const response = await fetch(url, {method: `GET`});

                // Check if the request was successful
                if (!response.ok) {
                    throw new Error('API request did not go through;');
                }
                const sensorData = await response.json();

                // Transform the sensor data array into a lookup object (map)
                const sensorLookup = sensorData.reduce((acc, sensor) => {
                    acc[sensor.id] = {
                        name: sensor.name,
                        latitude: sensor.lat,
                        longitude: sensor.long
                    };
                    return acc;
                })
                // Then use the sensor map to get the site id and add its location
                const updateCyclists = unsortedData.map(item => {
                    const sensorInfo = sensorLookup[item.siteId];
                    if (sensorInfo) {
                        return {
                            ...item,
                            sensorName: sensorInfo.name,
                            sensorLatitude: sensorInfo.latitude,
                            sensorLongitude: sensorInfo.longitude
                        };
                    }
                    return item;

                });
                return updateCyclists;
            } catch (err) {
                console.error('fetch error:', err);
                return [];
            }
        }
        if (dataType === 'traffic') {
            let url = `https://api.glasgow.gov.uk/traffic/v1/movement/sites`;
            try {
                const response = await fetch(url, {method: `GET`});

                // Check if the request was successful
                if (!response.ok) {
                    throw new Error('API request did not go through;');
                }
                const sensorData = await response.json();
                // Transform the sensor data array into a lookup object (map)
                const sensorLookup = sensorData.slice(1).reduce((acc, sensor) => {
                    acc[sensor.siteId] = {
                        name: sensor.from.description
                    };
                    return acc;
                });
                const updatedTraffic = unsortedData.map(item => {
                    const description = sensorLookup[item.meta.siteId].name;
                    return {...item, description};
                });
                return updatedTraffic;

            } catch (err) {
                console.error('fetch error:', err);
                return [];
            }
        }
    }

// This function aggregates the count for the pedestrian and cyclists along with the corresponding location
    convertToGraphData(data, dataType) {

        const streetData = {}

        if (dataType === 'pedestrian') {
            data.forEach(item => {
                if (!item.location || typeof item.location.description === 'undefined' || typeof item.pedestrianCount === 'undefined' || item.pedestrianCount === null) {
                    return; // Skip this iteration if location or description is not defined
                }

                const street = item.location.description;
                const key = street;


                // if (item.pedestrianCount > 0) {
                if (!streetData[key]) {
                    // If the street-month key doesn't exist, create it with initial values
                    streetData[key] = {
                        pedestrianCount: 0,

                    };
                }
                // }
                console.log(item);
                // Aggregate the pedestrian counts for the street-month key
                streetData[key].pedestrianCount += item.pedestrianCount;

            });


        }
        if (dataType === 'cyclist') {

            data.forEach(item => {
                // Assuming 'sensorName' is the street name and 'count' is within the 'crossingCountPerTimeInterval' array
                const street = item.sensorName; // Or however you extract the street name
                const counts = item.crossingCountPerTimeInterval; // This is an array of counts

                counts.forEach(countItem => {
                    // if (countItem.count > 0) {
                    const key = street;

                    if (!streetData[key]) {
                        streetData[key] = {
                            cyclistCount: 0,
                        };
                        // }


                        // Add the count to the street's cyclist count
                        streetData[key].cyclistCount += countItem.count;
                    }
                });
            });
        }
        if (dataType === 'traffic') {
            data.forEach(item => {
                const street = item.description; // street name of sensor
                const counts = item.history.averages // This is an array of averages/counts

                if (!streetData[street]) {
                    streetData[street] = {averageCount: 0};
                }
                const sumOfCounts = counts.reduce((sum, current) => sum + current.value, 0);
                streetData[street].averageCount += sumOfCounts;

            });

        }
        return streetData;


    }

// This function converts the data to GeoJSON so easy to plot on the map
    convertToGeoJSON(data, dataType,) {
        const aggregatedData = {};
        if (dataType === 'pedestrian') {


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
            return {
                "type": "FeatureCollection",
                "features": features
            };
        }
        if (dataType === 'cyclist') {
            data.forEach(item => {
                const street = item.sensorName;
                const coordinates = [item.sensorLongitude, item.sensorLatitude];

                if (typeof coordinates[0] === 'undefined' || typeof coordinates[0] === 'undefined') {
                    return;
                }

                const date = new Date(item.periodKey);
                const day = String(date.getUTCDate()).padStart(2, '0');
                const month = String(date.getUTCMonth() + 1).padStart(2, '0');
                const year = date.getUTCFullYear();
                const monthYear = `${day}-${month}-${year}`;

                if (!aggregatedData[street]) {
                    aggregatedData[street] = {
                        cyclistCount: 0,
                        coordinates: coordinates,
                        description: street,
                        dates: []
                    };
                }

                // Aggregate the pedestrian counts for the street key
                item.crossingCountPerTimeInterval.forEach(interval => {
                    if (interval.count > 0) {
                        aggregatedData[street].cyclistCount += interval.count;
                    }
                })
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
                        "cyclistCount": item.cyclistCount,
                        "dates": item.dates.join(', '), // Join dates as a string
                        "description": item.description
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": item.coordinates

                    }
                };
            });

            return {
                "type": "FeatureCollection",
                "features": features
            };


        }

        if (dataType === 'traffic') {
            data.forEach(item => {
                const street = item.description;
                const coordinates = [item.meta.from.long, item.meta.from.lat];

                if (!aggregatedData[street]) {
                    aggregatedData[street] = {
                        trafficCount: 0,
                        coordinates: coordinates,
                        description: street,
                    };
                }

                // Use reduce to sum up the values of the counts array
                const sumOfCounts = item.history.averages.reduce((sum, current) => {
                    // Assuming 'current' has a property 'value' which is the count
                    return sum + current.value;
                }, 0);

                // Add the sum to the traffic count for the street
                aggregatedData[street].trafficCount += sumOfCounts;

            });

            const features = Object.keys(aggregatedData).map(key => {
                const item = aggregatedData[key];
                return {
                    "type": "Feature",
                    "properties": {
                        "trafficCount": item.trafficCount,
                        "description": item.description
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": item.coordinates
                    }
                };
            });

            return {
                "type": "FeatureCollection",
                "features": features
            };
        }

    }


}

