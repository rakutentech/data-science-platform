


Install webpack
```
# React
yarn init -y
yarn add react react-dom react-router-dom
yarn add @babel/core @babel/polyfill @babel/preset-env babel-loader path --dev
yarn add @babel/plugin-proposal-class-properties --dev

# Webpack
yarn add webpack webpack-merge webpack-cli webpack-dev-server webpack-dashboard --dev
yarn add html-webpack-plugin html-loader extract-text-webpack-plugin postcss-cssnext --dev

# ESHint
yarn add eslint
yarn add babel-eslint eslint-plugin-react --dev

# Swagger Doc, build swagger.json for swagger/api
# Swagger URL: /api-docs
$ yarn run swagger
```

# Run

## Dev Fronent with FakeBackend
```
$ yarn run start:dev-front
```

## Dev Fronent with API Proxy
```
$ yarn run start:dev
```

## Prod Fronent on API Proxy
```
$ yarn run build:prod
$ yarn run start:prod
```

# Test 
```
$ yarn test
$ yarn lint
```

# Docker
```
$ docker build -t datalab-web .
$ docker run --rm -d -p 3001:3001 --name datalab-web datalab-web
```
