// Controller
class Controller {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('submitButton').addEventListener('click', () => this.handleGetData());
        document.getElementById('imageButton').addEventListener('click', () => this.view.downloadImage());
        document.getElementById('pdfButton').addEventListener('click', () => this.view.downloadPDF());
    }

    handleGetData() {

        const startDate = this.getStartDate();
        const endDate = this.getEndDate();
        const pageType = document.body.getAttribute('data-page-type');


        this.model.getDataFromAPI(startDate, endDate, pageType).then(data => {
            const graphData = this.model.convertToGraphData(data, pageType);
            const geoJSONData = this.model.convertToGeoJSON(data, pageType);
            this.view.createGraph(graphData, pageType);
            this.view.createMap(geoJSONData, pageType);
            this.showDownloadButtons();
        }).catch(error => {
            console.error('Error fetching/handling data', error);
        });
    }

    getStartDate() {
        return document.getElementById('startDate').value;
    }

    getEndDate() {
        return document.getElementById('endDate').value;
    }

    showDownloadButtons() {
        document.getElementById('imageButton').style.display = "block";
        document.getElementById('pdfButton').style.display = "block";

    }


}

const model = new Model();
const view = new View();
const controller = new Controller(model, view);
