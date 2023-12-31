// //
// // document.addEventListener('DOMContentLoaded', function () {
// //
// //     getDataFromAPI();
// // });
//
//
//
// document.getElementById('submitButton').addEventListener('click', function () {
//     const startDate = document.getElementById('startDate').value;
//     const endDate = document.getElementById('endDate').value;
//     getDataFromAPI(startDate, endDate);
// });
//
//
// function getDataFromAPI(startDate, endDate) {
//     console.log('Start Date:', startDate); // Should log a date string, not undefined
//     console.log('End Date:', endDate);     // Should log a date string
//
//     const url = `https://api.glasgow.gov.uk/mobility/v1/footfall/historical?format=json&startDate=${startDate}&endDate=${endDate}`;
//     const localdata = `/TestData.json`
//     fetch(localdata, {
//         method: 'GET',
//
//     })
//         .then(response => {
//             if (!response.ok) {
//                 throw new Error('File response was not ok');
//             }
//             return response.json(); // Parse the response as JSON
//         })
//         .then(data => {
//             // Convert the object into an JSON array for easy consumption
//             const result = Object.values(data);
//
//             // Takes the JSON array result and
//             const geoJSONData = convertToGeoJSON(result);
//
//
//             createMap(geoJSONData);
//
//             // Display the result in the 'demo' element and log to the console
//             document.getElementById('demo').textContent = JSON.stringify(result);
//
//
//         })
//         .catch(err => {
//             console.error('Fetch error:', err);
//         });
// }
//
// // function convertToGeoJSONold(data) {
// //         return {
// //             "type": "FeatureCollection",
// //             "features": data.map(item => ({
// //                 "type": "Feature",
// //                 "properties": {
// //                     "pedestrianCount": item.pedestrianCount,
// //                     "processDate": item.processDate,
// //                     "description": item.location.description
// //                 },
// //                 "geometry": {
// //                     "type": "Point",
// //                     "coordinates": [item.location.longitude, item.location.latitude]
// //                 }
// //             }))
// //         }
// //     }
// function convertToGeoJSON(data) {
//     // Create an object to hold the grouped data by street and month
//     const groupedData = {};
//
//     data.forEach(item => {
//         const date = new Date(item.processDate);
//         const day = String(date.getUTCDate()).padStart(2, '0');
//         const month = String(date.getUTCMonth() + 1).padStart(2, '0');
//         const year = date.getUTCFullYear();
//         const monthYear = `${year}-${month}-${day}`;
//         const street = item.location.description;
//         const key = street + '-' + monthYear; // Unique key for each street and month
//
//         if (!groupedData[key]) {
//             // If the street-month key doesn't exist, create it with initial values
//             groupedData[key] = {
//                 pedestrianCount: 0,
//                 coordinates: [item.location.longitude, item.location.latitude],
//                 description: street,
//                 monthYear: monthYear
//             };
//         }
//
//         // Aggregate the pedestrian counts for the street-month key
//         groupedData[key].pedestrianCount += item.pedestrianCount;
//         console.log(groupedData);
//     });
//
//     // Convert the grouped data into an array of GeoJSON features
//     const features = Object.keys(groupedData).map(key => {
//         const item = groupedData[key];
//
//         return {
//             "type": "Feature",
//             "properties": {
//                 "pedestrianCount": item.pedestrianCount,
//                 "monthYear": item.monthYear,
//                 "description": item.description
//             },
//             "geometry": {
//                 "type": "Point",
//                 "coordinates": item.coordinates
//             }
//         };
//     });
//
//     return {
//         "type": "FeatureCollection",
//         "features": features
//     };
// }
//
//
// function createMap(geoJSONData) {
//     // Generate a map of Glasgow and tiles
//     const map = L.map('glasgowMap').setView([55.8642, -4.2518], 13);
//     L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//         attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//     }).addTo(map);
//
//     // Add the GeoJSON layer to the map with onEachFeature defined
//     L.geoJSON(geoJSONData, {
//         onEachFeature: function (feature, layer) {
//             // Check if the feature has properties and if it has the property 'monthYear'
//             if (feature.properties && feature.properties.monthYear) {
//                 // Bind a popup to the layer with the 'monthYear' property
//                 layer.bindPopup('Month/Year: ' + feature.properties.monthYear + '<br>' +
//                     'Location: ' + feature.properties.description + '<br>' +
//                     'Pedestrian Count: ' + feature.properties.pedestrianCount);
//             }
//         }
//     }).addTo(map);
// }
//
//
//
//
//
//
//
//
//
//
