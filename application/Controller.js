class Controller {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.setupEventListeners();

    }


    setupEventListeners() {

        // This event listener ensures a load spinner is shown between loading different pages
        window.addEventListener('load', () => {
            document.querySelector('.spinner-wrapper').opacity = '0';

            setTimeout(() => {
                document.querySelector('.spinner-wrapper').style.display = 'none';
            }, 200);
        });
        // This event listener ensures a load spinner is shown between loading different pages
        window.addEventListener('resize', () => {
            if (this.view.Graph) {
                this.view.updateGraphFontSizes();
            }
        });


        document.getElementById('settingDateParameters').addEventListener('submit', (event) => {
            event.preventDefault(); // Prevent the default form submission
            const startDate = controller.getStartDate();
            const endDate = controller.getEndDate();
            const pageType = controller.getPageType(); // Assuming you have a method in View to get the current page type

            // Aggregate validation messages
            let validationMessages = [
                ...this.model.isValidDate(startDate),
                ...this.model.isValidDate(endDate),
                ...this.model.isDateNotInFuture(startDate, endDate),
                ...this.model.isStartDateBeforeEndDate(startDate, endDate),
                ...this.model.isStartDateValidForPageType(startDate, endDate, pageType)
            ];

            // Remove potential duplicate messages
            validationMessages = [...new Set(validationMessages)];

            // Display validation messages, if any
            if (validationMessages.length > 0) {
                validationMessages.forEach(message => this.view.displayAlert(message));
            } else {
                this.handleGetData();
            }
        });


        document.getElementById('imageButton').addEventListener('click', () => this.view.downloadImage());
        document.getElementById('pdfButton').addEventListener('click', () => this.view.downloadPDF());
        document.getElementById('hideZeroCounts').addEventListener('change', () => this.handleGetData());
        document.getElementById('topResultsDropdown').addEventListener('change', () => this.handleGetData());

    }

    // handleCheckboxChange() {
    //     // Here, you call the methods to create the map and graph again with the updated checkbox state
    //     // It's important to have the updated data that's why we call handleGetData again
    //     this.handleGetData();
    // }


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
            this.view.showDownloadButtons();
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


}

const model = new Model();
const view = new View();
const controller = new Controller(model, view);
