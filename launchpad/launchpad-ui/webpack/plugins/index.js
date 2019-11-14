const common_plugins = [];

common_plugins.push(
  ...(require('./htmlPlugin')),
  require('./extractPlugin'),
  require('./copyPlugin'),
);

const dev_plugins = common_plugins.slice();
const prod_plugins = common_plugins.slice();

dev_plugins.push(require('./dashboardPlugin'));


const plugins = {
  dev: dev_plugins,
  prod: prod_plugins
};

module.exports = plugins;