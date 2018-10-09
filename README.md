# labs-platoniq

> Labs Platoniq/Decidim

Experimental visualizations made with [VueJS](https://vuejs.org/).

Uses the APIs of [Goteo](https://goteo.org) and [Decidim](https://decidim.org).

## Configure

1. Create a `config.json` file using `config.example.json` as base:
   `cp config.example.json config.json`
2. Go to https://goteo.org/dashboard/settings/apikey and get a user/api key values
3. Edit `config.json` and put your values in there
4. Run `npm run dev` to launch the development server

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build
```

For detailed explanation on how things work, consult the [docs for vue-loader](http://vuejs.github.io/vue-loader).

Ivan Verges @platoniq
