class View {

    constructor() {
        this.map = null; // Declares the map property
        this.Graph = null; // Declares the Graph property
    }

    createMap(geoJSONData) {
        if (this.map !== null) {
            this.map.remove();
            this.map = null;
        }
        this.map = L.map('glasgowMap').setView([55.8642, -4.2518], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);

        L.geoJSON(geoJSONData, {
            onEachFeature: function (feature, layer) {
                console.log("Feature properties:", feature.properties); // Debugging
                if (feature.properties && feature.properties.description) {
                    let popupContent = 'Location: ' + feature.properties.description + '<br>' +
                        'Pedestrian Count: ' + feature.properties.pedestrianCount +
                        '<br>' + 'Dates Between:' + controller.getStartDate() + ' - ' + controller.getEndDate();
                    layer.bindPopup(popupContent).openPopup();
                }
            }
        }).addTo(this.map);
    }


    createGraph(graphData) {
        if (this.Graph !== null) {
            this.Graph.destroy();

        }

        const ctx = document.getElementById('glasgowGraph');

        // Extracting labels (street names) and data (pedestrian counts)
        const xAxis = Object.keys(graphData);
        console.log(Object.keys(graphData));
        const yAxis = xAxis.map(x => graphData[x].pedestrianCount);
        console.log(Object.values(graphData));


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
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }

            },

        });

    }


    downloadImage() {
        const imageLink = document.createElement('a');
        const canvas = document.getElementById('glasgowGraph');
        imageLink.download = 'Canvas123.png';
        imageLink.href = canvas.toDataURL('image/png', 1);
        imageLink.click()


    }


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
