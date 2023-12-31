class Model {


    async getDataFromAPI(startDate, endDate) {


        let url = `https://api.glasgow.gov.uk/mobility/v1/footfall/historical?format=json&startDate=${startDate}&endDate=${endDate}`;
        let localdata = `/TestData.json`


        try {
            const response = await fetch(url, {method: 'GET'});
            if (!response.ok) {
                throw new Error('API request did not go through')
            }
            const data = await response.json();
            return data;

        } catch (err) {
            console.error('Fetch error:', err);
        }
    }


    convertToGraphData(data) {

        const streetData = {}


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

