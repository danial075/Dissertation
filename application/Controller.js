// Controller
class Controller {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.setupEventListeners();
    }


    setupEventListeners() {
       window.addEventListener('load',() => {
           document.querySelector('.spinner-wrapper').opacity = '0';

           setTimeout(() => {
               document.querySelector('.spinner-wrapper').style.display = 'none';
           },200);
       });



        document.addEventListener('DOMContentLoaded', function(event) {
            let endDateElement = document.getElementById('endDate');
            if (endDateElement) {
                let today = new Date().toISOString().split('T')[0];
                endDateElement.setAttribute('max', today);
            }
        });

        document.getElementById('settingDateParameters').addEventListener('submit', (event) => {
            event.preventDefault(); // Prevent the default form submission

            let startDate = controller.getStartDate();
            let endDate = controller.getEndDate();

            // Validate that start and end dates are different for 'traffic' pageType
            if (startDate === endDate && controller.getPageType() === 'traffic') {
                alert("Please ensure both dates are different");
            } else {
                this.handleGetData();
            }
        });


        document.getElementById('imageButton').addEventListener('click', () => this.view.downloadImage());
        document.getElementById('pdfButton').addEventListener('click', () => this.view.downloadPDF());
        document.getElementById('hideZeroCounts').addEventListener('change', () => this.handleCheckboxChange());
        document.getElementById('topResultsDropdown').addEventListener('change', () => this.handleGetData() );

    }

    handleCheckboxChange() {
        // Here, you call the methods to create the map and graph again with the updated checkbox state
        // It's important to have the updated data that's why we call handleGetData again
        this.handleGetData();
    }


    handleGetData() {
// Show loading spinner
        const spinner = document.querySelector('#submitButton .spinner-border');
        spinner.classList.remove('d-none');
        const startDate = this.getStartDate();
        const endDate = this.getEndDate();
        const pageType = document.body.getAttribute('data-page-type');


        this.model.getDataFromAPI(startDate, endDate, pageType).then(data => {
           console.log(data);
            const graphData = this.model.convertToGraphData(data, pageType);
            const geoJSONData = this.model.convertToGeoJSON(data, pageType);
            this.view.createGraph(graphData, pageType);
            this.view.createMap(geoJSONData, pageType);
            this.showDownloadButtons();
        }).catch(error => {
            console.error('Error fetching/handling data', error);
        })
            .finally(() => {
                // Hide loading spinner
                spinner.classList.add('d-none');
            });
    }


    getStartDate() {
        return document.getElementById('startDate').value;
    }

    getEndDate() {
        return document.getElementById('endDate').value;
    }

    getPageType() {
        return document.body.getAttribute('data-page-type');
    }

    getCheckBox() {
        return document.getElementById('hideZeroCounts');
    }

    getUserFilter() {
        return document.getElementById('topResultsDropdown').value;
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


}

const model = new Model();
const view = new View();
const controller = new Controller(model, view);
