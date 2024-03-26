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

    // This function will return a font size based on the window width
    getResponsiveFontSize() {
        const width = window.innerWidth;
        if (width > 1200) return 16; // Large screens
        if (width > 992) return 14; // Medium screens
        if (width > 768) return 12; // Small screens
        return 10; // Extra small screens
    }

    // This function will update the font sizes of the chart
    updateGraphFontSizes() {
        const fontSize = this.getResponsiveFontSize();
        this.Graph.options.scales.x.ticks.font.size = fontSize;
        this.Graph.options.scales.y.ticks.font.size = fontSize;
        // Also update the axis title sizes if needed
        this.Graph.options.scales.x.title.font.size = fontSize;
        this.Graph.options.scales.y.title.font.size = fontSize;
        this.Graph.update();
    }

    // This creates the interactive graph to show the data picked up from the sensors
    createGraph(graphData, dataType) {
        console.log(graphData);
        const fontSize = this.getResponsiveFontSize(); // Get the initial responsive font size
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
                        label: 'Glasgow Pedestrian Statistics ' + controller.getStartDate() + ' to ' + controller.getEndDate(),
                        data: yAxis,
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)', // pink
                            'rgba(54, 162, 235, 0.2)', // blue
                            'rgba(255, 206, 86, 0.2)', // yellow
                            'rgba(75, 192, 192, 0.2)', // green
                            'rgba(153, 102, 255, 0.2)', // purple
                            'rgba(255, 159, 64, 0.2)', // orange
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)',
                        ],
                        borderWidth: 1,
                        datalabels: {
                            font: {
                                size:fontSize,
                                weight: 'bold'
                            },
                            color: 'white',
                            align: 'center',
                        }
                    }]

                },
                plugins: [ChartDataLabels],

                options: {
                    plugins: {
                        legend: {
                            labels: {
                                color: 'black', // Set the legend text color
                                font: {
                                    size: fontSize, // Set the legend font size
                                    family: 'Times New Roman', // Set the legend font family
                                    weight: 'bold' // Set the legend font weight
                                },
                            },
                            // If you still see the background, try adding this:
                            backgroundColor: 'transparent', // Set the legend background to transparent


                        }
                    },
                    responsive: true,
                    maintainAspectRatio: false,
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
                        x: {
                            title: {
                                display: true,
                                text: 'Location of sensors during this time',
                                color: 'red',
                                font: {
                                    size: fontSize,
                                    family: 'Times New Roman',
                                    weight: 'bold'

                                }
                            },
                            ticks:{
                                font: {
                                    size: fontSize,
                                    family: 'Times New Roman'
                                }
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Number of Pedestrians',
                                color: 'red',
                                font: {
                                    size: fontSize,
                                    family: 'Times New Roman',
                                    weight: 'bold'

                                }

                            },
                            ticks:{
                                font: {
                                    size: fontSize,
                                    family: 'Times New Roman'
                                }
                            },
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
                        label: 'Glasgow Cyclist Statistics ' + controller.getStartDate() + ' to ' + controller.getEndDate(),
                        data: yAxis,
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)', // pink
                            'rgba(54, 162, 235, 0.2)', // blue
                            'rgba(255, 206, 86, 0.2)', // yellow
                            'rgba(75, 192, 192, 0.2)', // green
                            'rgba(153, 102, 255, 0.2)', // purple
                            'rgba(255, 159, 64, 0.2)', // orange
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)',
                        ],

                        borderWidth: 1,
                        datalabels: {
                            color: 'white',
                            align: 'center',
                        }
                    }]
                },
                plugins: [ChartDataLabels],
                options: {
                    plugins: {
                        legend: {
                            labels: {
                                color: 'black', // Set the legend text color
                                font: {
                                    size: fontSize, // Set the legend font size
                                    family: 'Times New Roman', // Set the legend font family
                                    weight: 'bold' // Set the legend font weight
                                },
                            },
                            // If you still see the background, try adding this:
                            backgroundColor: 'transparent', // Set the legend background to transparent


                        }
                    },
                    responsive: true,
                    maintainAspectRatio: false,
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
                        x: {
                            title: {
                                display: true,
                                text: 'Location of sensors during this time',
                                color: 'red',
                                font: {
                                    size: fontSize,
                                    family: 'Times New Roman',
                                    weight: 'bold'

                                }
                            },
                            ticks:{
                                font: {
                                    size: fontSize,
                                    family: 'Times New Roman'
                                }
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Number of Cyclists',
                                color: 'red',
                                font: {
                                    size: fontSize,
                                    family: 'Times New Roman',
                                    weight: 'bold'

                                }

                            },
                            ticks:{
                                font: {
                                    size: fontSize,
                                    family: 'Times New Roman'
                                }
                            },
                            beginAtZero: true
                        }

                    },

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
                        label: 'Glasgow Traffic Statistics ' + controller.getStartDate() + ' to ' + controller.getEndDate(),
                        data: yAxis,
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)', // pink
                            'rgba(54, 162, 235, 0.2)', // blue
                            'rgba(255, 206, 86, 0.2)', // yellow
                            'rgba(75, 192, 192, 0.2)', // green
                            'rgba(153, 102, 255, 0.2)', // purple
                            'rgba(255, 159, 64, 0.2)', // orange
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)',
                        ],
                        borderWidth: 1,
                        datalabels: {
                            color: 'white',
                            align: 'center',
                        }
                    }]
                },
                plugins: [ChartDataLabels],
                options: {
                    plugins: {
                        legend: {
                            labels: {
                                color: 'black', // Set the legend text color
                                font: {
                                    size: fontSize, // Set the legend font size
                                    family: 'Times New Roman', // Set the legend font family
                                    weight: 'bold' // Set the legend font weight
                                },
                            },
                            // If you still see the background, try adding this:
                            backgroundColor: 'transparent', // Set the legend background to transparent


                        }
                    },
                    responsive: true,
                    maintainAspectRatio: false,
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
                        x: {
                            title: {
                                display: true,
                                text: 'Location of sensors during this time',
                                color: 'red',
                                font: {
                                    size: fontSize,
                                    family: 'Times New Roman',
                                    weight: 'bold'

                                }
                            },
                            ticks:{
                            font: {
                                size: fontSize,
                                family: 'Times New Roman'
                            }
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Number of Vehicles',
                                color: 'red',
                                font: {
                                    size: fontSize,
                                    family: 'Times New Roman',
                                    weight: 'bold'

                                }

                            },
                            ticks:{
                                font: {
                                    size: fontSize,
                                    family: 'Times New Roman'
                                }
                            },
                            beginAtZero: true
                        }

                    },

                },

            });


        }
    }

// This function is responsible for downloading the graph as png.
    downloadImage() {
        const canvas = document.getElementById('glasgowGraph');

        // Create a new canvas element to avoid altering the original one
        // The reason for doing this is fixing a dark background issue
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = canvas.width;
        exportCanvas.height = canvas.height;

        const exportCtx = exportCanvas.getContext('2d');
        // Fill the background with white color this is so you can see the graph

        exportCtx.fillStyle = '#ffffff'; // Or any other color
        exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

        // Draw the original canvas content onto the new canvas
        exportCtx.drawImage(canvas, 0, 0);

        // Now you can convert the new canvas with the white background to a data URL
        const imageLink = document.createElement('a');
        imageLink.download = 'Glasgow-' + controller.getPageType() + '-Graph';
        imageLink.href = exportCanvas.toDataURL('image/png');
        imageLink.click();
    }

// This function is responsible for downloading the graph as a pdf
    downloadPDF() {
        const {jsPDF} = window.jspdf;
        // Create image
        const canvas = document.getElementById('glasgowGraph');
        const canvasImage = canvas.toDataURL('image/png', 1);
        // Image must go to PDF
        let pdf = new jsPDF('landscape');
        pdf.setFontSize(20);
        pdf.addImage(canvasImage, 'PNG', 15, 15, 280, 150);
        pdf.save('Glasgow-' + controller.getPageType() + '-Graph');


    }

    showDownloadButtons() {

        const imageButton = document.getElementById('imageButton');
        const pdfButton = document.getElementById('pdfButton');

        // Remove the 'hidden' attribute if it's set
        imageButton.removeAttribute('hidden');
        pdfButton.removeAttribute('hidden');

        // Change display style to 'block'
        imageButton.style.display = "block";
        pdfButton.style.display = "block";
        document.getElementById('hideZeroCounts').disabled = false;
        document.getElementById('topResultsDropdown').disabled = false;

    }

    displayAlert(message) {
        alert(message);
    }

    getStartDate() {
        return document.getElementById('startDate').value;
    }

    getEndDate() {
        return document.getElementById('endDate').value;
    }

}
