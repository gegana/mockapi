# supermockapi
[![Build Status](https://travis-ci.org/gegana/supermockapi.svg?branch=master)](https://travis-ci.org/gegana/supermockapi)
[![This image on DockerHub](https://img.shields.io/docker/pulls/dsumiskum/supermockapi.svg)](https://hub.docker.com/r/dsumiskum/supermockapi/)
[![npm version](https://badge.fury.io/js/supermockapi.svg)](https://badge.fury.io/js/supermockapi)

A lightweight, user-friendly, and powerful tool for mocking API endpoints. Useful for testing API client integrations, or performance testing your application without sending traffic to your API dependencies.
Has an external dependency to a mongo database.

# Running in Docker
Runs in port 3000 by default.
```shell
docker run --name supermockapi -p 3000:3000 dsumiskum/supermockapi
```
Configure a different port.
```shell
docker run --name supermockapi -p 3000:5000 -e "PORT:5000" dsumiskum/supermockapi
```
Configure mongo connection string. By default it will connect to mongodb://localhost:27017.
```shell
docker run --name supermockapi -p 3000:3000 -e "MONGODB_CONNECTION_STRING:mongodb://mymongo:8081" dsumiskum/supermockapi
```
Specify initial mocked api routes specification through volume mapping a folder with a `routes.json` or the file itself to the container workdir (app is the workdir).
The application will look for a routes.json file in the workdir when booting up.
```shell
docker run --name supermockapi -p 3000:3000 -v "${pwd}/folder/routes.json:/app/routes.json" dsumiskum/supermockapi
```
Route specifications format (routes.json):
```json
[
  {
    "path": "/product/:sku", 
    "method": "GET",
    "status": 200, 
    "body": {
      "message": "Server received your request for sku {sku}" 
    },
    "responseDelay": 5000 
  },
  {
    "path": "/product/:sku", 
    "method": "POST",
    "status": 500
  }
]
```
If you only plan to use the mock api endpoints defined in your routes.json and nothing else, run the application in stateless mode to
disable UI and storage features.
```shell
docker run --name supermockapi -p 3000:3000 -e "STATELESS=true" -v "${pwd}/folder/routes.json:/app/routes.json" dsumiskum/supermockapi
```
# Features
supermockapi is meant to be lightweight, easy to deploy, and works for your Continous Integration needs. A big problem with performance testing 
services is isolating the external dependencies to get more predictable metrics, which would be useful if you are benchmarking your metrics
overtime.

With supermockapi, you can deploy it with your application as a stack, with specified routes.json file. And/or you can use the super friendly UI to
manually add mock api endpoints. The UI comes with a console log stream, so that you can monitor incoming requests all in one place.

## Create mocked API endpoints using Express JS pattern matching
You can do this via the UI or by configuring a routes.json file. Json file example where you take a parameter sku in the base path:
```json
{
  "path": "/product/:sku"
}
```

## Specify default response code
You can do this via the UI or by configuring a routes.json file. Json file example for returning a 200:
```json
{
  "path": "/product/:sku",
  "status": 200
}
```

## Specify default response body in json
You can do this via the UI or by configuring a routes.json file. Json file example for returning a simple message:
```json
{
  "path": "/product/:sku",
  "status": 200,
  "body": {
    "message": "Hello world!"
  }
}
```
You can include values from the tokens bag in your response body. The syntax for this is `{token}`.
```json
{
  "path": "/product/:sku",
  "status": 200,
  "body": {
    "sku": "{sku}"
  }
}
```
What is included in tokens:
1. Any parameters in the base URL
2. Any parameters in the querystring
3. The request body `{body}`
4. The number of calls made to the base URL `{calls}`
5. A random number between 1 and 100 `{random}`
6. The current timestamp `{timestamp}`

## Simulate response delay
You can do this via the UI or by configuring a routes.json file. Json file example for delaying response by 5 seconds:
```json
{
  "responseDelay": 5000
}
```

## Specify conditional behaviors
You can do this via the UI or by configuring a routes.json file. Json file example of a weighted response scenario using conditional behaviors:
```json
{
    "path": "/random",
    "method": "GET",
    "status": 200,
    "conditionalBehaviors": [{
        "condition": "{random} <= 30",
        "status": 500,
        "body": {
          "message": "[Condition Triggered] Random = {random}"
        }
      },
      {
        "condition": "{random} <= 60",
        "status": 404,
        "body": {
          "message": "[Condition Triggered] Random = {random}"
        }
      },
      {
        "condition": "{random} <= 90",
        "status": 200,
        "body": {
          "message": "[Condition Triggered] Random = {random}"
        }
      },
      {
        "condition": "{random} <= 100",
        "status": 206,
        "body": {
          "message": "[Condition Triggered] Random = {random}"
        }
      }
    ],
    "body": {
      "message": "Number of calls = {calls}"
    }
  }
```

# How it works
Built using express js, the mock api endpoints have 3 priority levels:
1. Routes hard coded in the application
2. Routes you inject via routes.json
3. Routes added dynamically via the API (/mockapi/route) that the UI uses

The routes.json configurations are in memory, while the routes added dynamically via the UI are stored in mongodb.
When you create routes.json file, make sure to include the required fields: path, method, and status.

# Contributing
If you want to contribute, the application is fairly standard node js app albeit it is using 7.0 features for async/await operators. So you will need:
1. Node 7.10.0
2. IDE like Visual Studio Code
3. Docker engine
