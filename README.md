# SelectiveoutlinesThreejsDrei
Created with CodeSandbox

 https://github.com/Sean-Bradley/R3F-Pack

# r3f
R3F-Pack runs very similar to how react-scripts works, and your project structure remains the same.

It serves the dev version on port 3000
It auto opens the browser at address http://localhost:3000
It enables Hot Module Reloading (HMR) with fast refresh
It serves the development version from the ./public folder
npm run build builds a production quality version of your app, and will copy all static files & folders under ./public to the ./build folder ready for deployment
Production bundle.js contains a hash in its name to prevent caching
It supports building with TypeScript
It indicates 0 vulnerabilities when running npm install, at the time of writing this message
Zero vulnerabilities

Starting a new Project
To start a brand-new React project, run

npx new-cra@latest my-app
Or, to also include TypeScript

npx new-cra@latest my-app -ts
This will create a very basic React application named my-app that you can start developing from.

After the installation has finished,

cd my-app
npm start
Visit http://127.0.0.1:3000

You don't have to name your app my-app, you could name it anything or whatever.

npx new-cra anything
cd anything
npm start
It's your choice, use any name you like. The name should only contain characters that are lowercase, alphanumeric, hyphens and/or underscores.

Installing R3F-pack for Existing React Projects
If you already have an existing app that currently uses react-scripts, and you want to convert it to use R3F-pack, then use these steps below.

First uninstall react-scripts

npm uninstall react-scripts
Next, install r3f-pack

npm install r3f-pack --save-dev
And then replace the start and build commands in your existing scripts node in your projects package.json

{
...
"scripts": {
-       "start": "react-scripts start",
+       "start": "r3f-pack start",
-       "build": "react-scripts build",
+       "build": "r3f-pack build"
  },
  ...
  }
  Development
  To start in development mode,

npm start
Visit http://127.0.0.1:3000

Production
To build production

npm run build
A production quality bundle.js will be compiled and all static files and folders under ./public will be copied to the ./build folder ready for deployment.

Upload or deploy the contents of the ./build folder to the location served by your web server.

To test your production build locally you can use http-server

Install it if you don't already have it.

npm install --global http-server
Start it

http-server .\build\
or if using PowerShell

http-server.cmd .\build\
Visit http://127.0.0.1:8080


# react-three-rapier
https://github.com/pmndrs/react-three-rapier

https://codesandbox.io/p/sandbox/react-three-rapier-auto-colliders-b4coz1?file=%2Fsrc%2Findex.tsx%3A7%2C1

react-three/rapier(或r3/rapier) 是围绕 Rapier ( https://rapier.rs/docs/user_guides/javascript ) 基于 WASM 的物理引擎的包装库，旨在无缝插入react-three/fiber管道中。

该库的目标是提供一个快速的物理引擎，具有最小的摩擦和小型、直接的 API。

https://github.com/pmndrs/react-three-rapier


