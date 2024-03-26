Danial Sheikh

Glasgow on the go: visualsing urban mobility in Glasgow
Dissertation 

Prerequisites
Before running the ‘Glasgow on the Go’ application is it important to check the device you are using:
•	Is Wi-Fi enabled.
•	You are running the latest browser on Chrome or Safari.
•	If using Safari, ensure it is only on mobile as there can be glitches when using the application on a laptop or PC.


Accessing as a User 
You can access the application using the link below that will take you to the homepage:
https://devweb2023.cis.strath.ac.uk/~rgb20145/finalproject/index.html
12.3	Deploying the Application as Maintainer or Developer 
Please use this link to access the Glasgow Open Data Hub’s numerous APIs https://developer.glasgow.gov.uk/api-details#api=mobility.

Local Setup and Libraries: Before launching the application, verify that all local libraries cited within the HTML files are downloaded and appropriately linked. This guarantees full functionality offline and removes dependency on external Content Delivery Networks (CDNs).
Application Structure: The index.html file functions as the home page of the application. Additional HTML files, specifically pedestrian.html, cyclist.html, and traffic.html, correspond to their respective sections of the application. Homepage-style.css style sheet is applied exclusively for the homepage (index.html). Page-syle.css is applied to the individual pedestrian, cyclist and traffic HTML pages. Segregating styles in this manner allows for easier maintenance and modifications to the visual aspects of distinct sections within the application without unintended effects.

MVC Architecture: The application adheres to the Model-View-Controller (MVC) architecture. For seamless operation, confirm that the subsequent scripts are incorporated and executed in the given sequence:
•	model.js: Contains the logic for data management.
•	view.js: Manages the user interface components.
•	controller.js: Facilitates communication between the model and view.

Hosting: At present, the application is hosted on the DEVWEB server, though it is feasible to deploy it to alternative hosting environments. Should you opt for migration, ensure the chosen platform is compatible with the application’s technology stack and that environmental variables along with server configurations are correctly established.

Testing: For testing purposes, execute test.html within a web browser. This document should be linked to the unit-testing.js script which contains the tests. Verify that the tests encompass all functionalities and are successfully passed without discrepancies.

Directory Structure: Maintain an organised structure by placing all files, encompassing HTML, CSS, JavaScript, and any supplementary resources, within the same directory to avert issues related to file paths. 

Deployment: For the deployment process, the codebase can be pushed to a Git repository and subsequently to a server. 



