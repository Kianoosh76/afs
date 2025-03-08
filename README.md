Advanced Flights System (AFS)

## Introduction

The Advanced Flights System (AFS) is an innovative platform designed to streamline flight operations and enhance passenger experience. Built with advanced technology, it ensures efficiency, reliability, and flexibility for airlines and travelers alike.

## Usage

The system is hosted at https://advanced-flights-system.replit.app. The Postman collection of the APIs is available [here](https://www.cs.toronto.edu/~kianoosh/courses/csc309h5/handouts/pp1/afs.postman_collection.json). Moreover, Swagger-style API docs can be found [here](https://www.cs.toronto.edu/~kianoosh/courses/csc309h5/handouts/pp1/afs.openapi). They can be imported to [Swagger Editor](https://editor.swagger.io/). The list of APIs, information about authorization, API descriptions, and request and response formats are all outlined there.


## Local development

To develop the AFS locally, first clone the repository and install the necessary dependencies:

```
npm install
```

To migrate the database, run

```
npm prisma migrate deploy
```

Finally, to run the server locally, use

```
npm run dev
```

## Imporing data

Below commands allow you to have a pre-populated database with more than 80 airports, 45 airlines, and 70,000 flights.

To import airlines and airports, use

```
node prisma/data/import_data
```

To generate flights data, run

```
node prisma/data/generate_flights
```

Finally, to create third-party users (aka agencies), add all student IDs to `prisma/data/agencies.js`, and run

```
node prisma/data/import_agencies
```

Each user will now become an agency, whose API key is the sha-256 hash of their student ID.