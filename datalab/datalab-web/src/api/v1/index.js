import RootProxy from './user/root'
import DataLabProxy from './user/datalab'
import FunctionProxy from './user/function'
import AdminProxy from './admin/admin'
import UserAPIProxy from './user/userapi'

let bodyParser = require('body-parser');
let express = require('express');
let router = express.Router();

router.use(bodyParser.json()); // to support JSON-encoded bodies
router.use(bodyParser.urlencoded()); // to support URL-encoded bodies

const subPaths = {
  RootPath: '/',
  DataLabPath: '/datalab',
  FunctionPath: '/function',
  AdminPath: '/admin',
  UserAPIPath: '/apis'
}

router.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

router.use(subPaths.RootPath, RootProxy)
router.use(subPaths.DataLabPath, DataLabProxy)
router.use(subPaths.FunctionPath, FunctionProxy)
router.use(subPaths.AdminPath, AdminProxy)
router.use(subPaths.UserAPIPath, UserAPIProxy)

router.get('/', function (req, res) {
  res.send(Object.values(subPaths));
});

module.exports = router;
