
const express = require('express');
const router = express.Router();
const config = require('../../config/config.json')
import { forwardRequest } from '../utils'

/**
 * @swagger
 * /api/v1/datalab:
 *   get:
 *     description: Get datalab
 *     tags:
 *       - user
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Authorization
 *         description: User JWT Token (Start with \"Bearer \")
 *         in: header
 *         type: string
 *         required: true
 *     responses:
 *       200:
 *         description: "[{\"ID\": 1,\"Name\": \"TestLabInstance\",\"Description\": \"description of instance\",\"Group\": \"dsd\"}]"
 *       401:
 *         description: "Unauthorized"
 */
router.get('/', function (req, res) {
  const url = `${config[process.env.NODE_ENV].datalabUrl}/datalab`
  forwardRequest(url, req, res)
})

/**
 * @swagger
 * /api/v1/datalab/instances:
 *   get:
 *     description: Get datalab instances
 *     tags:
 *       - user
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Authorization
 *         description: User JWT Token (Start with \"Bearer \")
 *         in: header
 *         type: string
 *         required: true
 *     responses:
 *       200:
 *         description: "[{\"ID\":1,\"Name\":\"sample\",\"StorageScale\":\"GiB\",\"InstanceNumber\":1,\"Owner\":\"testuser\",\"CreateAt\":1234567,\"Namespace\":\"dsd\",\"IngressPath\":\"http://ingress.path\",\"LoadBalancer\":\"http://load.balancer\"}]"
 *       401:
 *         description: "Unauthorized"
 */
router.get('/instances', function (req, res) {
  const url = `${config[process.env.NODE_ENV].datalabUrl}/datalab/instances`
  forwardRequest(url, req, res)
})

/**
 * @swagger
 * /api/v1/datalab/instances:
 *   post:
 *     description: Create datalab instances
 *     tags:
 *       - user
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Authorization
 *         description: User JWT Token (Start with \"Bearer \")
 *         in: header
 *         type: string
 *         required: true
 *       - name: Instances
 *         description: Instance information in JSON
 *         in: body
 *         required: true
 *         type: null
 *         schema:
 *           $ref: "#components/schemas/lab_instance"
 *     responses:
 *       200:
 *         description: "{\"status\": \"ok\"}"
 *       401:
 *         description: "Unauthorized"
 *       403:
 *         description: "{\"message\":\"Access denied\",\"status\":\"failed\"}"
 */
router.post('/instances', function (req, res) {
  const url = `${config[process.env.NODE_ENV].datalabUrl}/datalab/instances`
  forwardRequest(url, req, res)
})

/**
 * @swagger
 * /api/v1/datalab/instances:
 *   delete:
 *     description: Delete a datalab instances
 *     tags:
 *       - user
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Authorization
 *         description: User JWT Token (Start with \"Bearer \")
 *         in: header
 *         type: string
 *         required: true
 *       - name: Instances
 *         description: Instance information in JSON
 *         in: body
 *         required: true
 *         type: null
 *         schema:
 *           $ref: "#components/schemas/user_delete"
 *     responses:
 *       200:
 *         description: "{\"status\": \"ok\"}"
 *       401:
 *         description: "Unauthorized"
 */
router.delete('/instances', function (req, res) {
  const url = `${config[process.env.NODE_ENV].datalabUrl}/datalab/instances`
  forwardRequest(url, req, res)
})

/**
 * @swagger
 * /api/v1/datalab/instances/{typeGroup}/{typeName}/{instanceName}:
 *   get:
 *     description: Get detail of the datalab instances
 *     tags:
 *       - user
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: typeGroup
 *         in: path
 *         description: Type Group
 *         required: true 
 *       - name: typeName
 *         in: path
 *         description: Type Name
 *         required: true
 *       - name: instanceName
 *         in: path
 *         description: Instance Name
 *         required: true
 *       - name: Authorization
 *         description: User JWT Token (Start with \"Bearer \")
 *         in: header
 *         type: string
 *         required: true
 *     responses:
 *       200:
 *         description: "{\"ID\":1,\"Name\":\"sample\",\"StorageScale\":\"GiB\",\"InstanceNumber\":1,\"Owner\":\"testuser\",\"CreateAt\":1234567,\"Namespace\":\"dsd\",\"IngressPath\":\"http://ingress.path\",\"LoadBalancer\":\"http://load.balancer\"}"
 *       401:
 *         description: "Unauthorized"
 */
router.get('/instances/:typeGroup/:typeName/:instanceName', function (req, res) {
  const url = `${config[process.env.NODE_ENV].datalabUrl}/datalab/instances/${req.params.typeGroup}/${req.params.typeName}/${req.params.instanceName}`
  forwardRequest(url, req, res)
})

/**
 * @swagger
 * /api/v1/datalab/instances/{typeGroup}/{typeName}/{instanceName}/log:
 *   get:
 *     description: Get datalab instances log
 *     tags:
 *       - user
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: typeGroup
 *         in: path
 *         description: Type Group
 *         required: true 
 *       - name: typeName
 *         in: path
 *         description: Type Name
 *         required: true
 *       - name: instanceName
 *         in: path
 *         description: Instance Name
 *         required: true
 *       - name: Authorization
 *         description: User JWT Token (Start with \"Bearer \")
 *         in: header
 *         type: string
 *         required: true
 *     responses:
 *       200:
 *         description: "PodName:functionin-uid-testnew-1558685503-033-65c7bc9955-nkqql\n---\neyJjb250ZXh0VHlwZSI6ImlubGluZSIs....%"
 *       400:
 *         description: Cannot get instance
 *       401:
 *         description: "Unauthorized"
 */
router.get('/instances/:typeGroup/:typeName/:instanceName/log', function (req, res) {
  const url = `${config[process.env.NODE_ENV].datalabUrl}/datalab/instances/${req.params.typeGroup}/${req.params.typeName}/${req.params.instanceName}/log`
  forwardRequest(url, req, res)
})

module.exports = router;