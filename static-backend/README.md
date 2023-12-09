Australian Cycleway Stats (Backend)
====================================

Makes queries to Overpass Turbo (for OpenStreetMap data) and for Wikidata, and generates a JSON
file for the frontend.


See `static-backend/src/config.ts` for setting config options (like Overpass instance).

## Setup

- Install Node Version Manager (nvm) (https://github.com/nvm-sh/nvm)
- Use correct node version from `.nvmrc`: `nvm use`
- Install packages: `npm install`

## Dev server

`npm run start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

## Production build

`yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />

## Tests

`yarn test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.
