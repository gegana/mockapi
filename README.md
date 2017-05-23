# mockapi
[![Build Status](https://travis-ci.org/gegana/mockapi.svg?branch=master)](https://travis-ci.org/gegana/mockapi)
[![This image on DockerHub](https://img.shields.io/docker/pulls/dsumiskum/mockapi.svg)](https://hub.docker.com/r/dsumiskum/mockapi/)

A lightweight, user-friendly, and powerful tool for mocking API endpoints. Useful for testing API client integrations, or performance testing your application without sending traffic to your API dependencies.
Has an external dependency to a mongo database.

# Running in Docker
Runs in port 3000 by default.
```
docker run --name mockapi -p 3000:3000 dsumiskum/mockapi
```
Configure a different port.
```
docker run --name mockapi -p 3000:5000 -e "PORT:5000" dsumiskum/mockapi
```
Configure mongo connection string. By default it will connect to mongodb://localhost:27017.
```
docker run --name mockapi -p 3000:3000 -e "MONGODB_CONNECTION_STRING:mongodb://mymongo:8081" dsumiskum/mockapi
```
Specify initial mocked api routes specification through volume mapping a folder with a `routes.json` file to the container workdir (app is the workdir).
The application will look for a routes.json file in the workdir when booting up.
```
docker run --name mockapi -p 3000:3000 -v "${pwd}/folder:/app" dsumiskum/mockapi
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

# Features
Mockapi is meant to be lightweight, easy to deploy, and works for your Continous Integration needs. A big problem with performance testing 
services is isolating the external dependencies to get more predictable metrics, which would be useful if you are benchmarking your metrics
overtime.

With Mockapi, you can deploy it with your application as a stack, with specified routes.json file. And/or you can use the super friendly UI to
manually add mock api endpoints. The UI comes with a console log stream, so that you can monitor incoming requests all in one place.

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
