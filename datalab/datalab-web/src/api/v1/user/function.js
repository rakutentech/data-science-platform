
const express = require('express');
const router = express.Router();
const config = require('../../config/config.json')
import { forwardRequest } from '../utils'

/**
 * @swagger
 * /api/v1/function:
 *   get:
 *     description: Get functions
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
 *         description: "[{\"ID\": 1,\"Name\": \"testfunc\",\"Description\": \"example des\",\"ProgramLanguage\": \"python\",\"Trigger\": \"http\",\"LoadBalancer\": \"http://test.loadbalancer\",\"DefaultFunction\": \"eyJjb250ZXh0VHlwZSI6ImlubGluZSIsImZ1bmN0aW9uQ29udGV4dCI6eyJjb250ZXh0IjoiWkdWbUlHaGhibVJzWlhJb2NtVnhkV1Z6ZEN3Z2NtVnpjRzl1YzJVcE9nb2dJQ0FnY21WemRXeDBJRDBnSW5OamFXVnVZMlVpQ2lBZ0lDQnlaWE53YjI1elpTNXpaWFJmWkdGMFlTZ2lTR1ZzYkc4Z1JtRmhVeUVzSUhSb2FYTWdhWE1nWVNCN2ZTQnlaWEYxWlhOMExpQlNaWE4xYkhRNklIdDlJaTVtYjNKdFlYUW9jbVZ4ZFdWemRDNXRaWFJvYjJRc0lISmxjM1ZzZENrcCIsInJlcXVpcmVtZW50IjoiY21WeGRXVnpkSE05UFRJdU1Ua3VNUW89IiwiZW50cnlwb2ludCI6IiIsImJyYW5jaCI6IiIsImJlZm9yZUV4ZWN1dGlvbiI6IiIsImNvbW1hbmQiOiIiLCJhcmdzIjpudWxsLCJlbnYiOm51bGx9fQ==\",\"DefaultRequirement\": \"request\"}]"
 *       401:
 *         description: "Unauthorized"
 */
router.get('/', function (req, res) {
  const url = `${config[process.env.NODE_ENV].datalabUrl}/function`
  forwardRequest(url, req, res)
})

/**
 * @swagger
 * /api/v1/function/instances:
 *   get:
 *     description: Get function instances
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
 *         description: "[{\"ID\": 30,\"UUID\": \"functionin-uid-testnew-1558685503-033\",\"FunctionName\": \"py2-flask-normal\",\"Name\": \"testnew\",\"InstanceTypeName\": \"s1.small\",\"EphemeralStorage\": 0,\"StorageScale\": \"\",\"InstanceNumber\": 1,\"Owner\": \"uid\",\"CreateAt\":1558685503,\"Namespace\": \"datalab-dsd\",\"IngressPath\": \"testnew\",\"Trigger\": \"http\",\"FunctionContextType\": \"inline\",\"FunctionContext\": {\"Code\": \"print(\"hello\")\",\"Requirement\":\"requests==2.19.1\"},\"Tags\": {},\"URL\": \"http://END_POINT/testnew/\",\"Restarts\": 0,\"InternalEndpoints\": [\"functionin-uid-testnew-1558685503-033:5000\"],\"RunningInstances\": 1,\"PendingInstances\": 0}]"
 *       401:
 *         description: "Unauthorized"
 */
router.get('/instances', function (req, res) {
  const url = `${config[process.env.NODE_ENV].datalabUrl}/function/instances`
  forwardRequest(url, req, res)
})

/**
 * @swagger
 * /api/v1/function/instances:
 *   post:
 *     description: Add new function instances
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
 *       - name: FunctionInstanceBody
 *         description: Function Instance Body in JSON
 *         in: body
 *         type: null
 *         required: true
 *         schema:
 *           $ref: "#components/schemas/function_instance"
 *     responses:
 *       200:
 *         description: "{\"status\": \"ok\"}"
 *       401:
 *         description: "Unauthorized"
 */
router.post('/instances', function (req, res) {
  const url = `${config[process.env.NODE_ENV].datalabUrl}/function/instances`
  forwardRequest(url, req, res)
})

/**
 * @swagger
 * /api/v1/function/instances:
 *   put:
 *     description: Modify function instances
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
 *       - name: FunctionInstanceBody
 *         description: Function Instance Body in JSON
 *         in: body
 *         type: null
 *         required: true
 *         schema:
 *           $ref: "#components/schemas/function_instance_put"
 *     responses:
 *       200:
 *         description: "{\"status\": \"ok\"}"
 *       401:
 *         description: "Unauthorized"
 */
router.put('/instances', function (req, res) {
  const url = `${config[process.env.NODE_ENV].datalabUrl}/function/instances`
  forwardRequest(url, req, res)
})

/**
 * @swagger
 * /api/v1/function/instances:
 *   delete:
 *     description: Get function instances
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
 *       - name: FunctionInstanceBody
 *         description: Function Instance Body in JSON
 *         in: body
 *         type: null
 *         required: true
 *         schema:
 *           $ref: "#components/schemas/user_delete"
 *     responses:
 *       200:
 *         description: "{\"status\": \"ok\"}"
 *       401:
 *         description: "Unauthorized"
 */
router.delete('/instances', function (req, res) {
  const url = `${config[process.env.NODE_ENV].datalabUrl}/function/instances`
  forwardRequest(url, req, res)
})

/**
 * @swagger
 * /api/v1/function/instances/{trigger}/{instanceName}:
 *   get:
 *     description: Get function instances detail
 *     tags:
 *       - user
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: trigger
 *         in: path
 *         description: function trigger type
 *         required: true 
 *       - name: instanceName
 *         in: path
 *         description: function instanceName
 *         required: true
 *       - name: Authorization
 *         description: User JWT Token (Start with \"Bearer \")
 *         in: header
 *         type: string
 *         required: true
 *     responses:
 *       200:
 *         description: "{\"ID\": 30,\"UUID\": \"functionin-uid-testnew-1558685503-033\",\"FunctionName\": \"py2-flask-normal\",\"Name\": \"testnew\",\"InstanceTypeName\": \"s1.small\",\"EphemeralStorage\": 0,\"StorageScale\": \"\",\"InstanceNumber\": 1,\"Owner\": \"uid\",\"CreateAt\":1558685503,\"Namespace\": \"datalab-dsd\",\"IngressPath\": \"testnew\",\"Trigger\": \"http\",\"FunctionContextType\": \"inline\",\"FunctionContext\": {\"Code\": \"print(\"hello\")\",\"Requirement\":\"requests==2.19.1\"},\"Tags\": {},\"URL\": \"http://FUNCTION_URL/testnew/\",\"Restarts\": 0,\"InternalEndpoints\": [\"functionin-uid-testnew-1558685503-033:5000\"],\"RunningInstances\": 1,\"PendingInstances\": 0}"
 *       400:
 *         description: "{\"message\":\"Cannot get instance\",\"status\":\"failed\"}"
 *       401:
 *         description: "Unauthorized"
 */
router.get('/instances/:trigger/:instanceName', function (req, res) {
  const url = `${config[process.env.NODE_ENV].datalabUrl}/function/instances/${req.params.trigger}/${req.params.instanceName}`
  forwardRequest(url, req, res)
})

/**
 * @swagger
 * /api/v1/function/instances/{trigger}/{instanceName}/log:
 *   get:
 *     description: Get function instances
 *     tags:
 *       - user
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: trigger
 *         in: path
 *         description: function trigger type
 *         required: true 
 *       - name: instanceName
 *         in: path
 *         description: function instanceName
 *         required: true
 *       - name: Authorization
 *         description: User JWT Token (Start with \"Bearer \")
 *         in: header
 *         type: string
 *         required: true
 *     responses:
 *       200:
 *         description: "{\"ID\": \"0\", \"Name\": \"sample instance\", ....}"
 *       400:
 *         description: "{\"message\":\"Cannot get instance\",\"status\":\"failed\"}"
 *       401:
 *         description: "Unauthorized"
 */
router.get('/instances/:trigger/:instanceName/log', function (req, res) {
  const url = `${config[process.env.NODE_ENV].datalabUrl}/function/instances/${req.params.trigger}/${req.params.instanceName}/log`
  forwardRequest(url, req, res)
})

/**
 * @swagger
 * /api/v1/function/instances/{trigger}/{instanceName}/restart:
 *   post:
 *     description: Restart the function instances' job
 *     tags:
 *       - user
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: trigger
 *         in: path
 *         description: function trigger type
 *         required: true 
 *       - name: instanceName
 *         in: path
 *         description: function instanceName
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
 *         description: "{\"message\":\"Cannot get instance\",\"status\":\"failed\"}"
 *       401:
 *         description: "Unauthorized"
 */
router.post('/instances/:trigger/:instanceName/restart', function (req, res) {
  const url = `${config[process.env.NODE_ENV].datalabUrl}/function/instances/${req.params.trigger}/${req.params.instanceName}/restart`
  forwardRequest(url, req, res)
})

/**
 * @swagger
 * /api/v1/function/instances/{trigger}/{instanceName}/jobs:
 *   get:
 *     description: Get function instances
 *     tags:
 *       - user
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: trigger
 *         in: path
 *         description: function trigger type
 *         required: true 
 *       - name: instanceName
 *         in: path
 *         description: function instanceName
 *         required: true
 *       - name: Authorization
 *         description: User JWT Token (Start with \"Bearer \")
 *         in: header
 *         type: string
 *         required: true
 *     responses:
 *       200:
 *         description: "[{\"ID\":123,\"JobID\":\"fakejobid\",\"InstanceName\":\"funcname\",\"UUID\":\"uniqueid\",\"InstanceTypeName\":\"datascience\",\"Namespace\":\"datalab-dsd\",\"Owner\":\"INDEX\",\"InstanceNumber\":1,\"CreateAt\":1234567,\"FinishAt\":1234576,\"Duration\":32,\"Status\":\"Success\",\"Parameters\":\"\"}]"
 *       400:
 *         description: "{\"message\":\"Cannot get instance\",\"status\":\"failed\"}"
 *       401:
 *         description: "Unauthorized"
 */
router.get('/instances/:trigger/:instanceName/jobs', function (req, res) {
  const url = `${config[process.env.NODE_ENV].datalabUrl}/function/instances/${req.params.trigger}/${req.params.instanceName}/jobs`
  forwardRequest(url, req, res)
})

/**
 * @swagger
 * /api/v1/function/instances/{trigger}/{instanceName}/jobs/{jobID}:
 *   get:
 *     description: Get job from one function
 *     tags:
 *       - user
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: trigger
 *         in: path
 *         description: function trigger type
 *         required: true 
 *       - name: instanceName
 *         in: path
 *         description: function instanceName
 *         required: true
 *       - name: jobID
 *         in: path
 *         description: jobID
 *         required: true
 *       - name: Authorization
 *         description: User JWT Token (Start with \"Bearer \")
 *         in: header
 *         type: string
 *         required: true
 *     responses:
 *       200:
 *         description: "{\"ID\":123,\"JobID\":\"fakejobid\",\"InstanceName\":\"funcname\",\"UUID\":\"uniqueid\",\"InstanceTypeName\":\"datascience\",\"Namespace\":\"datalab-dsd\",\"Owner\":\"INDEX\",\"InstanceNumber\":1,\"CreateAt\":1234567,\"FinishAt\":1234576,\"Duration\":32,\"Status\":\"Success\",\"Parameters\":\"\"}"
 *       400:
 *         description: "{\"message\":\"Cannot get instance\",\"status\":\"failed\"}"
 *       401:
 *         description: "Unauthorized"
 */
router.get('/instances/:trigger/:instanceName/jobs/:jobID', function (req, res) {
  const url = `${config[process.env.NODE_ENV].datalabUrl}/function/instances/${req.params.trigger}/${req.params.instanceName}/jobs/${req.params.jobID}`
  forwardRequest(url, req, res)
})

/**
 * @swagger
 * /api/v1/function/instances/{trigger}/{instanceName}/jobs/{jobID}/log:
 *   get:
 *     description: Get function instances' log
 *     tags:
 *       - user
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: trigger
 *         in: path
 *         description: function trigger type
 *         required: true 
 *       - name: instanceName
 *         in: path
 *         description: function instanceName
 *         required: true
 *       - name: jobID
 *         in: path
 *         description: jobID
 *         required: true
 *       - name: Authorization
 *         description: User JWT Token (Start with \"Bearer \")
 *         in: header
 *         type: string
 *         required: true
 *     responses:
 *       200:
 *         description: "PodName:functionin-uid-testnew-1558685503-033-65c7bc9955-nkqql\n---\neyJjb250ZXh0VHlwZSI6ImlubGluZSIs....%"
 *       401:
 *         description: "Unauthorized"
 */
router.get('/instances/:trigger/:instanceName/jobs/:jobID/log', function (req, res) {
  const url = `${config[process.env.NODE_ENV].datalabUrl}/function/instances/${req.params.trigger}/${req.params.instanceName}/jobs/${req.params.jobID}/log`
  forwardRequest(url, req, res)
})

/**
 * @swagger
 * /api/v1/function/instances/{trigger}/{instanceName}/jobs/{jobID}/kill:
 *   delete:
 *     description: kill function jobs
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
 *       - name: trigger
 *         in: path
 *         description: function trigger type
 *         required: true 
 *       - name: instanceName
 *         in: path
 *         description: function instanceName
 *         required: true
 *       - name: jobID
 *         in: path
 *         description: jobID
 *         required: true
 *       - name: Authorization
 *         in: header
 *         type: string
 *         required: true
 *     responses:
 *       200:
 *         description: "{\"status\": \"ok\"}"
 *       401:
 *         description: "Unauthorized"
 */
router.delete('/instances/:trigger/:instanceName/jobs/:jobID/kill', function (req, res) {
  const url = `${config[process.env.NODE_ENV].datalabUrl}/function/instances/${req.params.trigger}/${req.params.instanceName}/jobs/${req.params.jobID}/kill`
  forwardRequest(url, req, res)
})
    
module.exports = router;
