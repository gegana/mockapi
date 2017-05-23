# supermockapi
[![Build Status](https://travis-ci.org/gegana/mockapi.svg?branch=master)](https://travis-ci.org/gegana/mockapi)
[![This image on DockerHub](https://img.shields.io/docker/pulls/dsumiskum/supermockapi.svg)](https://hub.docker.com/r/dsumiskum/supermockapi/)
[![npm version](https://badge.fury.io/js/supermockapi.svg)](https://badge.fury.io/js/supermockapi)

A lightweight, user-friendly, and powerful tool for mocking API endpoints. Useful for testing API client integrations, or performance testing your application without sending traffic to your API dependencies.
Has an external dependency to a mongo database.

# Running in Docker
Runs in port 3000 by default.
```
docker run --name supermockapi -p 3000:3000 dsumiskum/supermockapi
```
Configure a different port.
```
docker run --name supermockapi -p 3000:5000 -e "PORT:5000" dsumiskum/supermockapi
```
Configure mongo connection string. By default it will connect to mongodb://localhost:27017.
```
docker run --name supermockapi -p 3000:3000 -e "MONGODB_CONNECTION_STRING:mongodb://mymongo:8081" dsumiskum/supermockapi
```
Specify initial mocked api routes specification through volume mapping a folder with a `routes.json` or the file itself to the container workdir (app is the workdir).
The application will look for a routes.json file in the workdir when booting up.
```
docker run --name supermockapi -p 3000:3000 -v "${pwd}/folder/routes.json:/app/routes.json" dsumiskum/supermockapi
```
Route specifications format (routes.json):
```
[
  {
    "path": "/product/:sku", // follows Express js route regexp
    "method": "GET",
    "status": 200, // status code will be returned
    "body": {
      "message": "Server received your request for sku {sku}" // supports tokenized fields from request URL param and querystring
    },
    "responseDelay": 5000 // ms
  },
  {
    "path": "/product/:sku", // follows Express js route regexp
    "method": "POST",
    "status": 500 // bugs!!!
  }
]
```
If you only plan to use the mock api endpoints defined in your routes.json and nothing else, run the application in stateless mode to
disable UI and storage features.
```
docker run --name supermockapi -p 3000:3000 -e "STATELESS=true" -v "${pwd}/folder/routes.json:/app/routes.json" dsumiskum/supermockapi
```
# Features
supermockapi is meant to be lightweight, easy to deploy, and works for your Continous Integration needs. A big problem with performance testing 
services is isolating the external dependencies to get more predictable metrics, which would be useful if you are benchmarking your metrics
overtime.

With supermockapi, you can deploy it with your application as a stack, with specified routes.json file. And/or you can use the super friendly UI to
manually add mock api endpoints. The UI comes with a console log stream, so that you can monitor incoming requests all in one place.

Features:
1. Create mocked API endpoints using Express JS pattern matching.
2. Specify default response code to return.
3. Specify default response body to return in json format.
4. Include values from the url parameter or querystring in the response body using pattern replacement. Ex. { "Hello {id}" }.
5. Simulate response delay.
6. Run in stateless mode passing pre-defined mocked API endpoints for your automated tests.
7. Run in stateful mode to manage mocked API endpoints via the web UI, and monitor traffic via a console stream embeded in the web UI.

# How it works
Built using express js, the mock api endpoints have 3 priority levels:
1. Routes hard coded in the application
2. Routes you inject via routes.json
3. Routes added dynamically via the API (/mockapi/route) that the UI uses

So if you specified endpoint configurations in routes.json, you will not be able to override it via the UI, and the UI will not be able to see it.
Those configurations are in memory.

# Contributing
If you want to contribute, the application is fairly standard node js app albeit it is using 7.0 features for async/await operators. So you will need:
1. Node 7.10.0
2. IDE like Visual Studio Code
3. Docker engine
