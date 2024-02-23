class View {


    constructor() {
        this.map = null; // Declares the map property
        this.Graph = null; // Declares the Graph property
        this.mapMarkers = {}; // store the markers for reference between the graph


    }


    // This creates the interactive map and plots the points where the sensors are located
    createMap(geoJSONData, pageType) {
        let checkBox = document.getElementById('hideZeroCounts');
        if (this.map !== null) {
            this.map.remove();
            this.map = null;
        }


        if (pageType === 'pedestrian') {

            this.map = L.map('glasgowMap').setView([55.8642, -4.2518], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(this.map);
            let sortedFeatures = geoJSONData.features.sort((a, b) => {
                return b.properties.pedestrianCount - a.properties.pedestrianCount;
            });
            // Get the selection value for the top N features
            let selectionValue = controller.getUserFilter(); // Assuming this returns 'top-5', 'top-10', etc., or 'all'
            if (selectionValue !== 'all') {
                let topN = parseInt(selectionValue.replace('top-', ''), 10);
                sortedFeatures = sortedFeatures.slice(0, topN); // Keep only the top N features
            }


            L.geoJSON(sortedFeatures, {
                filter: function (feature) {
                    return !(feature.properties.pedestrianCount === 0 && checkBox.checked);
                },
                onEachFeature: (feature, layer) => {

                    if (feature.properties && feature.properties.description) {
                        let popupContent = 'Location: ' + feature.properties.description + '<br>' +
                            'Pedestrian Count: ' + feature.properties.pedestrianCount +
                            '<br>' + 'Dates Between:' + controller.getStartDate() + ' - ' + controller.getEndDate();
                        if (feature.properties.pedestrianCount === 0 && checkBox.checked === true) {
                            return;
                        }
                        layer.bindPopup(popupContent).openPopup();
                    }


                    this.mapMarkers[feature.properties.description] = layer;
                }


            }).addTo(this.map);


        }

        if (pageType === 'cyclist') {
            this.map = L.map('glasgowMap').setView([55.8642, -4.2518], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(this.map);

            let sortedFeatures = geoJSONData.features.sort((a, b) => {
                return b.properties.cyclistCount - a.properties.cyclistCount;
            });

            // Get the selection value for the top N features
            let selectionValue = controller.getUserFilter(); // Assuming this returns 'top-5', 'top-10', etc., or 'all'
            if (selectionValue !== 'all') {
                let topN = parseInt(selectionValue.replace('top-', ''), 10);
                sortedFeatures = sortedFeatures.slice(0, topN); // Keep only the top N features
            }

            L.geoJSON(sortedFeatures, {
                filter: function (feature) {
                    return !(feature.properties.cyclistCount === 0 && checkBox.checked);
                },
                onEachFeature: (feature, layer) => {
                    if (feature.properties.cyclistCount === 0 && checkBox.checked === true) {
                        return;
                    }

                    // Proceed if the feature has properties and a description
                    if (feature.properties && feature.properties.description) {
                        let popupContent = 'Location: ' + feature.properties.description + '<br>' +
                            'Cyclist Count: ' + feature.properties.cyclistCount +
                            '<br>' + 'Dates Between: ' + controller.getStartDate() + ' to ' + controller.getEndDate();
                        layer.bindPopup(popupContent);
                        layer.addTo(this.map); // Add the layer to the map if not skipping
                        this.mapMarkers[feature.properties.description] = layer; // Store the reference if not skipping
                    }

                }


            }).addTo(this.map);

        }


        if (pageType === 'traffic') {
            this.map = L.map('glasgowMap').setView([55.8642, -4.2518], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(this.map);

            let sortedFeatures = geoJSONData.features.sort((a, b) => {
                return b.properties.trafficCount - a.properties.trafficCount;
            });

            // Get the selection value for the top N features
            let selectionValue = controller.getUserFilter(); // Assuming this returns 'top-5', 'top-10', etc., or 'all'
            if (selectionValue !== 'all') {
                let topN = parseInt(selectionValue.replace('top-', ''), 10);
                sortedFeatures = sortedFeatures.slice(0, topN); // Keep only the top N features
            }


            L.geoJSON(sortedFeatures, {
                filter: function (feature) {
                    return !(feature.properties.trafficCount === 0 && checkBox.checked);
                },
                onEachFeature: (feature, layer) => {
                    if (feature.properties && feature.properties.description) {
                        let popupContent = 'Location: ' + feature.properties.description + '<br>' +
                            'Traffic Count: ' + feature.properties.trafficCount +
                            '<br>' + 'Dates Between: ' + controller.getStartDate() + ' to ' + controller.getEndDate();
                        layer.bindPopup(popupContent).openPopup();


                    }
                    this.mapMarkers[feature.properties.description] = layer;
                }
            }).addTo(this.map);
        }
    }

    // This creates the interactive graph to show the data picked up from the sensors
    createGraph(graphData, dataType) {
        console.log(graphData);

        if (this.Graph !== null) {
            this.Graph.destroy();

        }
        if (dataType === 'pedestrian') {
            const ctx = document.getElementById('glasgowGraph');

            // Extracting labels (street names) and data (pedestrian counts)
            let xAxis = Object.keys(graphData);
            let yAxis = xAxis.map(x => graphData[x].pedestrianCount);

            // If checkbox is checked, filter out zero counts
            if (controller.getCheckBox().checked === true) {
                const filteredIndices = yAxis
                    .map((count, index) => ({count, index}))
                    .filter(item => item.count > 0)
                    .map(item => item.index);

                xAxis = filteredIndices.map(index => xAxis[index]);
                yAxis = filteredIndices.map(index => yAxis[index]);
            }

            let selectionValue = controller.getUserFilter();
            if (controller.getUserFilter() !== 'all') {
                selectionValue = parseInt(selectionValue.replace('top-', ''), 10);
                let sortedData = yAxis
                    .map((count, index) => ({count, index}))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, selectionValue);
                xAxis = sortedData.map(item => xAxis[item.index]);
                yAxis = sortedData.map(item => item.count);
            }

            this.Graph = new Chart(ctx, {

                type: 'bar',
                data: {
                    labels: xAxis,
                    datasets: [{
                        label: 'Glasgow Pedestrian Statistics',
                        data: yAxis,
                        borderWidth: 1
                    }]
                },

                options: {
                    onClick: (event, elements,) => {
                        if (elements.length) {
                            const firstPoint = elements[0];
                            // Corrected from firstElement to firstPoint
                            const label = this.Graph.data.labels[firstPoint.index];
                            const marker = this.mapMarkers[label];
                            if (marker) {
                                marker.openPopup();
                                this.map.setView(marker.getLatLng(), 14); // Or any other zoom level
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }

                    },
                }

            });


        }
        if (dataType === 'cyclist') {
            const ctx = document.getElementById('glasgowGraph');

            // Extracting labels (street names) and data (pedestrian counts)
            let xAxis = Object.keys(graphData);

            let yAxis = xAxis.map(x => graphData[x].cyclistCount);

            if (controller.getCheckBox().checked === true) {
                const filteredIndices = yAxis
                    .map((count, index) => ({count, index}))
                    .filter(item => item.count > 0)
                    .map(item => item.index);
                xAxis = filteredIndices.map(index => xAxis[index]);
                yAxis = filteredIndices.map(index => yAxis[index]);
            }

            let selectionValue = controller.getUserFilter();
            if (controller.getUserFilter() !== 'all') {
                selectionValue = parseInt(selectionValue.replace('top-', ''), 10);
                let sortedData = yAxis
                    .map((count, index) => ({count, index}))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, selectionValue);
                xAxis = sortedData.map(item => xAxis[item.index]);
                yAxis = sortedData.map(item => item.count);
            }


            this.Graph = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: xAxis,
                    datasets: [{
                        label: 'Glasgow Cyclist Statistics',
                        data: yAxis,
                        borderWidth: 1
                    }]
                },

                options: {
                    onClick: (event, elements,) => {
                        if (elements.length) {
                            const firstPoint = elements[0];
                            // Corrected from firstElement to firstPoint
                            const label = this.Graph.data.labels[firstPoint.index];
                            const marker = this.mapMarkers[label];
                            if (marker) {
                                marker.openPopup();
                                this.map.setView(marker.getLatLng(), 14); // Or any other zoom level
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }

                },

            });


        }
        if (dataType === 'traffic') {
            const ctx = document.getElementById('glasgowGraph');

            // Extracting labels (street names) and data (traffic counts)
            let xAxis = Object.keys(graphData);

            let yAxis = xAxis.map(x => graphData[x].averageCount);

            if (controller.getCheckBox().checked === true) {
                const filteredIndices = yAxis
                    .map((count, index) => ({count, index}))
                    .filter(item => item.count > 0)
                    .map(item => item.index);
                xAxis = filteredIndices.map(index => xAxis[index]);
                yAxis = filteredIndices.map(index => yAxis[index]);
            }
            let selectionValue = controller.getUserFilter();
            if (controller.getUserFilter() !== 'all') {
                selectionValue = parseInt(selectionValue.replace('top-', ''), 10);
                let sortedData = yAxis
                    .map((count, index) => ({count, index}))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, selectionValue);
                xAxis = sortedData.map(item => xAxis[item.index]);
                yAxis = sortedData.map(item => item.count);
            }


            this.Graph = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: xAxis,
                    datasets: [{
                        label: 'Glasgow Traffic Statistics',
                        data: yAxis,
                        borderWidth: 1
                    }]
                },

                options: {
                    onClick: (event, elements,) => {
                        if (elements.length) {
                            const firstPoint = elements[0];
                            // Corrected from firstElement to firstPoint
                            const label = this.Graph.data.labels[firstPoint.index];
                            const marker = this.mapMarkers[label];
                            if (marker) {
                                marker.openPopup();
                                this.map.setView(marker.getLatLng(), 14); // Or any other zoom level
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }

                },

            });


        }
    }

// This function is responsible for downloading the graph as png
    downloadImage() {
        const imageLink = document.createElement('a');
        const canvas = document.getElementById('glasgowGraph');
        imageLink.download = 'Canvas123.png';
        imageLink.href = canvas.toDataURL('image/png', 1);
        imageLink.click()


    }

// This function is responsible for downloading the graph as a pdf
    downloadPDF() {
        // Create image
        const canvas = document.getElementById('glasgowGraph');
        const canvasImage = canvas.toDataURL('image/png', 1);
        // Image must go to PDF
        let pdf = new jsPDF('landscape');
        pdf.setFontSize(20);
        pdf.addImage(canvasImage, 'PNG', 15, 15, 280, 150);
        pdf.save('Glasgow-hub');


    }

}
