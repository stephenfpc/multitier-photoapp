Project Description:
The project is a photo management application built on a client-server architecture. 
The client-side is developed in Python, which provides an interactive command-line interface for users to send requests to the server.
The server-side is developed in JavaScript, which utilizes REST APIs to receive requests, communicates with the backend AWS service, and responds with the results to users.

Project Features:
1. Upload: upload an image as an asset to S3. (The application automatically compresses the images on S3 to optimize storage usage.)
2. Download: download images from S3.
3. Search: search images based on user, date, and location criteria.
4. Resource Management: add or update a new user into database, or print user, asset, and storage information.


Getting Started:
Execute the following commands to run the client and server in separate CLIs
- Python Client
Step 1: cd client
Step 2: python3 main.py

- Node.js Server
Step 1: cd server
Step 2: node app.js