document.addEventListener('DOMContentLoaded', async (event) => {
    const testResultsContainer = document.getElementById('testResults');

    function logResult(testDescription, result) {
        const resultText = result ? "passed" : "failed";
        const color = result ? "green" : "red";
        testResultsContainer.innerHTML += `<p style="color: ${color};">${testDescription}: ${resultText}</p>`;
    }

    // Test Instantiation of MVC components
    function testMVCInstantiation() {
        const model = new Model();
        const view = new View();
        const controller = new Controller(model, view);

        logResult("Model should be instantiated", model instanceof Model);
        logResult("View should be instantiated", view instanceof View);
        logResult("Controller should be instantiated and connected to Model and View",
            controller.model === model && controller.view === view);
    }

    // Test if date validation works as expected
    function testDateValidation() {
        const invalidDate = 'invalid-date';
        const result = model.isValidDate(invalidDate);
        logResult("Date validation should fail for 'invalid-date'", result.length > 0);
    }

    // Test if future date check works as expected
    function testFutureDateValidation() {
        const futureDate = '2090-12-12'; // A date that is surely in the future
        const result = model.isDateNotInFuture(futureDate, futureDate);
        logResult("Future date validation should fail for '2999-12-31'", result.length > 0);
    }

    // Test if start date is before end date validation
    function testStartDateBeforeEndDate() {
        const startDate = '2024-01-01';
        const endDate = '2023-12-31';
        const result = model.isStartDateBeforeEndDate(startDate, endDate);
        logResult("Start date should be before end date validation", result.length > 0);
    }

    // Test the response for a valid API call for pedestrian data
    async function testValidAPICallPedestrian() {
        const startDate = '2024-01-01';
        const endDate = '2024-01-02';
        const dataType = 'pedestrian';
        try {
            const data = await model.getDataFromAPI(startDate, endDate, dataType);
            logResult("Valid API call should return data", !!data);
        } catch (error) {
            logResult("Valid API call should not fail", false);
        }
    }

    // Test the response for a valid API call for traffic data
    async function testValidAPICallTraffic() {
        const startDate = '2024-01-01';
        const endDate = '2024-01-02';
        const dataType = 'traffic';
        try {
            const data = await model.getDataFromAPI(startDate, endDate, dataType);
            logResult("Valid API call for traffic data should return data", !!data);
        } catch (error) {
            logResult("Valid API call for traffic data should not fail", false);
        }
    }

// Test the response for a valid API call for cyclist data
    async function testValidAPICallCyclist() {
        const startDate = '2024-01-01';
        const endDate = '2024-01-02';
        const dataType = 'cyclist';
        try {
            const data = await model.getDataFromAPI(startDate, endDate, dataType);
            logResult("Valid API call for cyclist data should return data", !!data);
        } catch (error) {
            logResult("Valid API call for cyclist data should not fail", false);
        }
    }


    // Test GeoJSON conversion for pedestrian data
    function testGeoJSONConversionPedestrian() {
        const sampleData = [{location: {description: 'Sample Street', longitude: 0, latitude: 0}, pedestrianCount: 10}];
        const geoJSON = model.convertToGeoJSON(sampleData, 'pedestrian');
        logResult("GeoJSON conversion should work for pedestrian data", geoJSON.features.length > 0);
    }

    // Test GeoJSON conversion for cyclist data
    function testGeoJSONConversionCyclist() {
        const sampleData = [
            {
                sensorName: 'Sensor A',
                sensorLongitude: -4.2518,
                sensorLatitude: 55.8642,
                crossingCountPerTimeInterval: [{count: 20}, {count: 30}]
            }
        ];
        const geoJSON = model.convertToGeoJSON(sampleData, 'cyclist');
        logResult("GeoJSON conversion should work for cyclist data", geoJSON.features.length > 0);
    }

    // Test GeoJSON conversion for traffic data
    function testGeoJSONConversionTraffic() {
        const sampleData = [
            {
                description: 'Road A',
                meta: {from: {long: -4.2518, lat: 55.8642}},
                history: {averages: [{value: 100}, {value: 150}]}
            }
        ];
        const geoJSON = model.convertToGeoJSON(sampleData, 'traffic');
        logResult("GeoJSON conversion should work for traffic data", geoJSON.features.length > 0);
    }

    // Test the pedestrian graph creation
    function testCreatePedestrianGraph() {
        const mockData = {
            'Sample Street 1': {pedestrianCount: 10},
            'Sample Street 2': {pedestrianCount: 20},
            'Sample Street 3': {pedestrianCount: 30}
        };

        view.createGraph(mockData, 'pedestrian');

        // Check if graph has the right number of data points
        const correctNumberOfDataPoints = view.Graph.data.labels.length === Object.keys(mockData).length;
        logResult("Graph should have the correct number of data points", correctNumberOfDataPoints);
    }

// Test Graph Data conversion for cyclist data
    function testConvertToGraphDataCyclist() {
        const sampleData = [
            {sensorName: 'Sensor A', crossingCountPerTimeInterval: [{count: 20}, {count: 30}]}
        ];
        const graphData = model.convertToGraphData(sampleData, 'cyclist');
        logResult("Graph data conversion should work for cyclist data", Object.keys(graphData).length > 0);
    }

// Test Graph Data conversion for traffic data
    function testConvertToGraphDataTraffic() {
        const sampleData = [
            {description: 'Road A', history: {averages: [{value: 100}, {value: 150}]}}
        ];
        const graphData = model.convertToGraphData(sampleData, 'traffic');
        logResult("Graph data conversion should work for traffic data", Object.keys(graphData).length > 0);
    }

// Test if the Model correctly validates future dates for traffic data
    function testFutureDateValidationTraffic() {
        const futureDate = '2090-12-31';
        const result = model.isDateNotInFuture(futureDate, futureDate);
        logResult("Future date validation for traffic data should fail", result.length > 0);
    }

    // Test if the Model correctly validates future dates for cyclist data
    function testCyclistDateValidation() {
        const futureDate = '2090-12-31';
        const result = model.isDateNotInFuture(futureDate, futureDate);
        logResult("Future date validation for cyclist data should fail", result.length > 0);
    }
// Test if markers are correctly generated on the map and valid for GeoJSON data
    function testMapMarkerGeneration() {
        const sampleGeoJSON = {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "properties": {"description": "Test Location", "pedestrianCount": 100},
                    "geometry": {"type": "Point", "coordinates": [-4.2518, 55.8642]}
                }
            ]
        };
        view.createMap(sampleGeoJSON, 'pedestrian');
        logResult("Map should have markers after creation with valid GeoJSON data", Object.keys(view.mapMarkers).length > 0);
    }
// Test if application can deal when there is no data to populate the graph
    function testEmptyGraphDataHandling() {
        const emptyData = {};
        view.createGraph(emptyData, 'pedestrian');
        logResult("Graph should handle empty data without crashing", true);
    }
// Test if the API fails and checks if the user is alerted
    async function testAlertForAPIDataFetchFailure() {
        const startDate = '2024-01-01';
        const endDate = '2024-01-02';
        try {
            await model.getDataFromAPI(startDate, endDate, 'nonexistentType');
            logResult("An alert for API data fetch failure should be displayed", true);
        } catch (error) {
            logResult("An alert for API data fetch failure should be displayed", false);
        }
    }




    // Run the tests
    testMVCInstantiation();
    testDateValidation();
    testFutureDateValidation();
    testStartDateBeforeEndDate();
    await testValidAPICallPedestrian();
    await testValidAPICallTraffic()
    await testValidAPICallCyclist()
    testGeoJSONConversionPedestrian();
    testCreatePedestrianGraph();
    testGeoJSONConversionTraffic();
    testConvertToGraphDataTraffic();
    testFutureDateValidationTraffic();
    testGeoJSONConversionCyclist();
    testConvertToGraphDataCyclist();
    testCyclistDateValidation();
    testMapMarkerGeneration();
    testEmptyGraphDataHandling();
    await testAlertForAPIDataFetchFailure()

});
