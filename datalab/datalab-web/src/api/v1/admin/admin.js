
const express = require('express');
const router = express.Router();
const config = require('../../config/config.json')
import { forwardRequest } from '../utils'

/**
 * @swagger
 * /api/v1/admin/auth:
 *   post:
 *     description: Login to the application
 *     tags:
 *       - admin
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: username
 *         description: admin account to login.
 *         in: formData
 *         required: true
 *         type: string
 *       - name: password
 *         description: admin's password.
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: "{\"token\": \"JWT_TOKEN_STRING\"}"
 *       403:
 *         description: "Invaild username or password"
 */
router.post('/auth', function (req, res) {
  const url = `${config[process.env.NODE_ENV].adminUrl}/auth`
  forwardRequest(url, req, res)
});

/**
 * @swagger
 * /api/v1/admin/clusterinfo:
 *   get:
 *     description: Get information of the cluster
 *     tags:
 *       - admin
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
 *         description: "{\"CPUUsage\": 0, \"CPUTotal\": 0, \"GPUUsage\": 0, \"GPUTotal\": 0, ...}" 
 *       401:
 *         description: "Unauthorized"
 */
router.get('/clusterinfo', function (req, res) {
  const url = `${config[process.env.NODE_ENV].adminUrl}/clusterinfo`
  forwardRequest(url, req, res)
})

/**
 * @swagger
 * /api/v1/admin/users:
 *   get:
 *     description: Get information of the users
 *     tags:
 *       - admin
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
 *         description: "[{\"ID\": 1,\"Username\": \"testuser\",\"AuthType\": \"1\",\"Password\": \"testuser\",\"Group\": \"dsd\",\"Namespace\": \"datalab-dsd\"}]" 
 *       401:
 *         description: "Unauthorized"
 */
router.get('/users', function (req, res) {
  const url = `${config[process.env.NODE_ENV].adminUrl}/users`
  forwardRequest(url, req, res)
})

/**
 * @swagger
 * /api/v1/admin/users:
 *   post:
 *     description: Add new user
 *     tags:
 *       - admin
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Authorization
 *         description: User JWT Token (Start with \"Bearer \")
 *         in: header
 *         type: string
 *         required: true
 *       - name: Username
 *         description: New Username.
 *         in: formData
 *         required: true
 *         type: string
 *       - name: Password
 *         description: Password for new User.
 *         in: formData
 *         required: false
 *         type: string
 *       - name: AuthType
 *         description: AuthType for new User
 *         in: formData
 *         required: true
 *         type: string
 *       - name: Group
 *         description: Group for new User
 *         in: formData
 *         required: true
 *         type: string
 *       - name: Namespace
 *         description: Namespace for new User
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: "{\"status\": \"ok\"}"
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: "Bad Request"
 *         
 */
router.post('/users', function (req, res) {
  const url = `${config[process.env.NODE_ENV].adminUrl}/users`
  forwardRequest(url, req, res)
})

/**
 * @swagger
 * /api/v1/admin/users:
 *   put:
 *     description: Modify information of user
 *     tags:
 *       - admin
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Authorization
 *         description: User JWT Token (Start with \"Bearer \")
 *         in: header
 *         type: string
 *         required: true
 *       - name: UserInfo
 *         description: User information in JSON
 *         in: body
 *         required: true
 *         type: null
 *         schema:
 *           $ref: "#components/schemas/user"
 *     responses:
 *       200:
 *         description: "{\"status\": \"ok\"}"
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: "Bad Request"
 */
router.put('/users', function (req, res) {
  const url = `${config[process.env.NODE_ENV].adminUrl}/users`
  forwardRequest(url, req, res)
})

/**
 * @swagger
 * /api/v1/admin/users:
 *   delete:
 *     description: Delete user from cluster
 *     tags:
 *       - admin
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Authorization
 *         description: User JWT Token (Start with \"Bearer \")
 *         in: header
 *         type: string
 *         required: true
 *       - name: UserID
 *         description: User ID to be deleted in JSON.
 *         in: body
 *         required: true
 *         type: null
 *         schema:
 *           $ref: "#components/schemas/delete_operation"
 *     responses:
 *       200:
 *         description: "{\"status\": \"ok\"}"
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: "Bad Request"
 */
router.delete('/users', function (req, res) {
  const url = `${config[process.env.NODE_ENV].adminUrl}/users`
  forwardRequest(url, req, res)
})

/**
 * @swagger
 * /api/v1/admin/groups:
 *   get:
 *     description: Get information of the groups
 *     tags:
 *       - admin
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
 *         description: "[{\"ID\": 1,\"Name\": \"dsd\"}]"
 *       401:
 *         description: "Unauthorized"
 */
router.get('/groups', function (req, res) {
  const url = `${config[process.env.NODE_ENV].adminUrl}/groups`
  forwardRequest(url, req, res)
})

/**
 * @swagger
 * /api/v1/admin/groups:
 *   post:
 *     description: Add new group to cluster
 *     tags:
 *       - admin
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Authorization
 *         description: User JWT Token (Start with \"Bearer \")
 *         in: header
 *         type: string
 *         required: true
 *       - name: Name
 *         description: Group Name.
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: "{\"status\": \"ok\"}"
 *       401:
 *         description: "Unauthorized"
 */
router.post('/groups', function (req, res) {
  const url = `${config[process.env.NODE_ENV].adminUrl}/groups`
  forwardRequest(url, req, res)
})

/**
 * @swagger
 * /api/v1/admin/groups:
 *   put:
 *     description: Modify a group in cluster
 *     tags:
 *       - admin
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Authorization
 *         description: User JWT Token (Start with \"Bearer \")
 *         in: header
 *         type: string
 *         required: true
 *       - name: GourpInfo
 *         description: Group infomation in JSON
 *         in: body
 *         required: true
 *         type: null
 *         schema:
 *           $ref: "#components/schemas/groups"
 *     responses:
 *       200:
 *         description: "{\"status\": \"ok\"}" 
 *       401:
 *         description: "Unauthorized"
 */
router.put('/groups', function (req, res) {
  const url = `${config[process.env.NODE_ENV].adminUrl}/groups`
  forwardRequest(url, req, res)
})

/**
 * @swagger
 * /api/v1/admin/groups:
 *   delete:
 *     description: Delete a group from cluster
 *     tags:
 *       - admin
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Authorization
 *         description: User JWT Token (Start with \"Bearer \")
 *         in: header
 *         type: string
 *         required: true
 *       - name: GourpInfo
 *         description: Group infomation in JSON
 *         in: body
 *         required: true
 *         type: null
 *         schema:
 *           $ref: "#components/schemas/delete_operation"
 *     responses:
 *       200:
 *         description: "{\"status\": \"ok\"}"
 *       401:
 *         description: "Unauthorized"
 */
router.delete('/groups', function (req, res) {
  const url = `${config[process.env.NODE_ENV].adminUrl}/groups`
  forwardRequest(url, req, res)
})

/**
 * @swagger
 * /api/v1/admin/datalab:
 *   get:
 *     description: Get information of the datalab instances
 *     tags:
 *       - admin
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
 *         description: "[{\"ID\": 1,\"Name\": \"TestLabInstance\",\"Group\": \"dsd\",\"Description\": \"hello world lab instance\",\"LoadBalancer\": \"http://load.balancer.tester\",\"Public\": false,\"TemplatePath\": \"./data\",\"DeploymentTemplate\": \"\",\"ServiceTemplate\": \"\",\"IngressTemplate\": \"\",\"AccessibleUsers\": [],\"AccessibleGroups\": [\"dsd\"]}]"
 *       401:
 *         description: "Unauthorized"
 */
router.get('/datalab', function (req, res) {
  const url = `${config[process.env.NODE_ENV].adminUrl}/datalab`
  forwardRequest(url, req, res);
})

/**
 * @swagger
 * /api/v1/admin/datalab:
 *   post:
 *     description: Add a datalab instances
 *     tags:
 *       - admin
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Authorization
 *         description: User JWT Token (Start with \"Bearer \")
 *         in: header
 *         type: string
 *         required: true
 *       - name: Name
 *         description: Name for New lab instance
 *         in: formData
 *         required: true
 *         type: string
 *       - name: Group
 *         description: Group for New lab inatance
 *         in: formData
 *         required: true
 *         type: string
 *       - name: Description
 *         description: Description of New lab instance
 *         in: formData
 *         required: true
 *         type: string
 *       - name: LoadBalancer
 *         description: Balancer for New lab inatance
 *         in: formData
 *         required: true
 *         type: string
 *       - name: Public
 *         description: If this lab instance is public
 *         in: formData
 *         required: true
 *         type: boolean
 *     responses:
 *       200:
 *         description: "{\"status\": \"ok\"}"
 *       401:
 *         description: "Unauthorized"
 */
router.post('/datalab', function (req, res) {
  const url = `${config[process.env.NODE_ENV].adminUrl}/datalab`
  forwardRequest(url, req, res);
})

/**
 * @swagger
 * /api/v1/admin/datalab:
 *   put:
 *     description: Modify a datalab instances
 *     tags:
 *       - admin
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Authorization
 *         description: User JWT Token (Start with \"Bearer \")
 *         in: header
 *         type: string
 *         required: true
 *       - name: LabData
 *         description: Data for new Lab instance in JSON
 *         in: body
 *         required: true
 *         type: null
 *         schema:
 *           $ref: "#components/schemas/datalab"
 *     responses:
 *       200:
 *         description: "{\"status\": \"ok\"}"
 *       401:
 *         description: "Unauthorized"
 */
router.put('/datalab', function (req, res) {
  const url = `${config[process.env.NODE_ENV].adminUrl}/datalab`
  forwardRequest(url, req, res);
})

/**
 * @swagger
 * /api/v1/admin/datalab:
 *   delete:
 *     description: Add a datalab instances
 *     tags:
 *       - admin
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Authorization
 *         description: User JWT Token (Start with \"Bearer \")
 *         in: header
 *         type: string
 *         required: true
 *       - name: LabID
 *         description: Lab ID in JSON
 *         in: body
 *         required: true
 *         type: null
 *         schema:
 *           $ref: "#components/schemas/delete_operation"
 *     responses:
 *       200:
 *         description: "{\"status\": \"ok\"}"
 *       401:
 *         description: "Unauthorized"
 */
router.delete('/datalab', function (req, res) {
  const url = `${config[process.env.NODE_ENV].adminUrl}/datalab`
  forwardRequest(url, req, res);
})

/**
 * @swagger
 * /api/v1/admin/datalabgroups:
 *   get:
 *     description: Get information of the datalab groups
 *     tags:
 *       - admin
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
 *         description: "[{\"ID\": 1,\"Name\": \"datalab-dsd\"}]"
 *       401:
 *         description: "Unauthorized"
 */
router.get('/datalabgroups', function (req, res) {
  const url = `${config[process.env.NODE_ENV].adminUrl}/datalabgroups`
  forwardRequest(url, req, res);
})

/**
 * @swagger
 * /api/v1/admin/datalabgroups:
 *   post:
 *     description: Add a new datalab groups
 *     tags:
 *       - admin
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Authorization
 *         description: User JWT Token (Start with \"Bearer \")
 *         in: header
 *         type: string
 *         required: true
 *       - name: Name
 *         description: Datalab Group name
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: "{\"status\": \"ok\"}"
 *       401:
 *         description: "Unauthorized"
 */
router.post('/datalabgroups', function (req, res) {
  const url = `${config[process.env.NODE_ENV].adminUrl}/datalabgroups`
  forwardRequest(url, req, res);
})

/**
 * @swagger
 * /api/v1/admin/datalabgroups:
 *   put:
 *     description: Modify a datalab groups
 *     tags:
 *       - admin
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Authorization
 *         description: User JWT Token (Start with \"Bearer \")
 *         in: header
 *         type: string
 *         required: true
 *       - name: DatalabGroupsData
 *         description: Datalab Groups Data to be modified in JSON
 *         in: body
 *         required: true
 *         type: null
 *         schema:
 *           $ref: "#components/schemas/datalabgroups"
 *     responses:
 *       200:
 *         description: "{\"status\": \"ok\"}"
 *       401:
 *         description: "Unauthorized"
 */
router.put('/datalabgroups', function (req, res) {
  const url = `${config[process.env.NODE_ENV].adminUrl}/datalabgroups`
  forwardRequest(url, req, res);
})

/**
 * @swagger
 * /api/v1/admin/datalabgroups:
 *   delete:
 *     description: Delete datalab groups
 *     tags:
 *       - admin
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Authorization
 *         description: User JWT Token (Start with \"Bearer \")
 *         in: header
 *         type: string
 *         required: true
 *       - name: DatalabGroupsIDData
 *         description: Datalab Groups Data to be deleted in JSON
 *         in: body
 *         required: true
 *         type: null
 *         schema:
 *           $ref: "#components/schemas/delete_operation"
 *     responses:
 *       200:
 *         description: "{\"status\": \"ok\"}"
 *       401:
 *         description: "Unauthorized"
 */
router.delete('/datalabgroups', function (req, res) {
  const url = `${config[process.env.NODE_ENV].adminUrl}/datalabgroups`
  forwardRequest(url, req, res);
})

/**
 * @swagger
 * /api/v1/admin/function:
 *   get:
 *     description: Get information of the functions
 *     tags:
 *       - admin
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
 *         description: "[{\"ID\": 1,\"Name\": \"testfunc\",\"Description\": \"example des\",\"ProgramLanguage\": \"python\",\"Trigger\": \"http\",\"Public\": false,\"LoadBalancer\": \"http://test.loadbalancer\",\"TemplatePath\": \"./data\",\"DefaultFunction\": \"eyJjb250ZXh0VHlwZSI6ImlubGluZSIsImZ1bmN0aW9uQ29udGV4dCI6eyJjb250ZXh0IjoiWkdWbUlHaGhibVJzWlhJb2NtVnhkV1Z6ZEN3Z2NtVnpjRzl1YzJVcE9nb2dJQ0FnY21WemRXeDBJRDBnSW5OamFXVnVZMlVpQ2lBZ0lDQnlaWE53YjI1elpTNXpaWFJmWkdGMFlTZ2lTR1ZzYkc4Z1JtRmhVeUVzSUhSb2FYTWdhWE1nWVNCN2ZTQnlaWEYxWlhOMExpQlNaWE4xYkhRNklIdDlJaTVtYjNKdFlYUW9jbVZ4ZFdWemRDNXRaWFJvYjJRc0lISmxjM1ZzZENrcCIsInJlcXVpcmVtZW50IjoiY21WeGRXVnpkSE05UFRJdU1Ua3VNUW89IiwiZW50cnlwb2ludCI6IiIsImJyYW5jaCI6IiIsImJlZm9yZUV4ZWN1dGlvbiI6IiIsImNvbW1hbmQiOiIiLCJhcmdzIjpudWxsLCJlbnYiOm51bGx9fQ==\",\"DefaultRequirement\": \"request\",\"DeploymentTemplate\": \"\",\"ServiceTemplate\": \"\",\"IngressTemplate\": \"\",\"JobTemplate\": \"\",\"AccessibleUsers\": [],\"AccessibleGroups\": []}]"
 *       401:
 *         description: "Unauthorized"
 */
router.get('/function', function (req, res) {
  const url = `${config[process.env.NODE_ENV].adminUrl}/function`
  forwardRequest(url, req, res);
})

/**
 * @swagger
 * /api/v1/admin/function:
 *   post:
 *     description: Add new functions
 *     tags:
 *       - admin
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Authorization
 *         description: User JWT Token (Start with \"Bearer \")
 *         in: header
 *         type: string
 *         required: true
 *       - name: FunctionData
 *         description: Function Data in JSON
 *         in: body
 *         required: true
 *         type: null
 *         schema:
 *           $ref: "#components/schemas/function_post"
 *     responses:
 *       200:
 *         description: "{\"status\": \"ok\"}"
 *       401:
 *         description: "Unauthorized"
 */
router.post('/function', function (req, res) {
  const url = `${config[process.env.NODE_ENV].adminUrl}/function`
  forwardRequest(url, req, res);
})

/**
 * @swagger
 * /api/v1/admin/function:
 *   put:
 *     description: Modify functions
 *     tags:
 *       - admin
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Authorization
 *         description: User JWT Token (Start with \"Bearer \")
 *         in: header
 *         type: string
 *         required: true
 *       - name: FunctionData
 *         description: Function Data in JSON
 *         in: body
 *         required: true
 *         type: null
 *         schema:
 *           $ref: "#components/schemas/function"
 *     responses:
 *       200:
 *         description: "{\"status\": \"ok\"}"
 *       401:
 *         description: "Unauthorized"
 */
router.put('/function', function (req, res) {
  const url = `${config[process.env.NODE_ENV].adminUrl}/function`
  forwardRequest(url, req, res);
})

/**
 * @swagger
 * /api/v1/admin/function:
 *   delete:
 *     description: Delete a functions
 *     tags:
 *       - admin
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Authorization
 *         description: User JWT Token (Start with \"Bearer \")
 *         in: header
 *         type: string
 *         required: true
 *       - name: FunctionID
 *         description: Function ID Data in JSON
 *         in: body
 *         required: true
 *         type: null
 *         schema:
 *           $ref: "#components/schemas/delete_operation"
 *     responses:
 *       200:
 *         description: "{\"status\": \"ok\"}"
 *       401:
 *         description: "Unauthorized"
 */
router.delete('/function', function (req, res) {
  const url = `${config[process.env.NODE_ENV].adminUrl}/function`
  forwardRequest(url, req, res);
})

/**
 * @swagger
 * /api/v1/admin/instancetypegroups:
 *   get:
 *     description: Get information of the Instance type group
 *     tags:
 *       - admin
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
 *         description: "[{\"ID\": 1, \"Name\": \"datascience\"}]"
 *       401:
 *         description: "Unauthorized"
 */
router.get('/instancetypegroups', function (req, res) {
  const url = `${config[process.env.NODE_ENV].adminUrl}/instancetypegroups`
  forwardRequest(url, req, res);
})

/**
 * @swagger
 * /api/v1/admin/instancetypegroups:
 *   post:
 *     description: Get information of the Instance type group
 *     tags:
 *       - admin
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Authorization
 *         description: User JWT Token (Start with \"Bearer \")
 *         in: header
 *         type: string
 *         required: true
 *       - name: Name
 *         description: instance type group name
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: "{\"status\": \"ok\"}"
 *       401:
 *         description: "Unauthorized"
 */
router.post('/instancetypegroups', function (req, res) {
  const url = `${config[process.env.NODE_ENV].adminUrl}/instancetypegroups`
  forwardRequest(url, req, res);
})

/**
 * @swagger
 * /api/v1/admin/instancetypegroups:
 *   put:
 *     description: Get information of the Instance type group
 *     tags:
 *       - admin
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Authorization
 *         description: User JWT Token (Start with \"Bearer \")
 *         in: header
 *         type: string
 *         required: true
 *       - name: InstanceTypeGroupsData
 *         description: instance type group data in JSON
 *         in: body
 *         required: true
 *         type: null
 *         schema:
 *           $ref: "#components/schemas/instancetypegroups"
 *     responses:
 *       200:
 *         description: "{\"status\": \"ok\"}"
 *       401:
 *         description: "Unauthorized"
 */
router.put('/instancetypegroups', function (req, res) {
  const url = `${config[process.env.NODE_ENV].adminUrl}/instancetypegroups`
  forwardRequest(url, req, res);
})

/**
 * @swagger
 * /api/v1/admin/instancetypegroups:
 *   delete:
 *     description: Get information of the Instance type group
 *     tags:
 *       - admin
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Authorization
 *         description: User JWT Token (Start with \"Bearer \")
 *         in: header
 *         type: string
 *         required: true
 *       - name: InstanceTypeGroupsID
 *         description: instance type group id in JSON
 *         in: body
 *         required: true
 *         type: null
 *         schema:
 *           $ref: "#components/schemas/delete_operation"
 *     responses:
 *       200:
 *         description: "{\"status\": \"ok\"}"
 *       401:
 *         description: "Unauthorized"
 */
router.delete('/instancetypegroups', function (req, res) {
  const url = `${config[process.env.NODE_ENV].adminUrl}/instancetypegroups`
  forwardRequest(url, req, res);
})

/**
 * @swagger
 * /api/v1/admin/instancetypes:
 *   get:
 *     description: Get information of the instances' type
 *     tags:
 *       - admin
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
 *         description: "[{\"ID\": 1,\"Name\": \"testinstance\",\"Description\": \"test instance\",\"Group\": \"whatever\",\"CPU\": 0,\"GPU\": 0,\"Memory\": 0,\"MemoryScale\": \"\",\"Public\": false,\"AccessibleUsers\": [],\"AccessibleGroups\": [],\"Tags\": {}}]"
 *       401:
 *         description: "Unauthorized"
 */
router.get('/instancetypes', function (req, res) {
  const url = `${config[process.env.NODE_ENV].adminUrl}/instancetypes`
  forwardRequest(url, req, res);
})

/**
 * @swagger
 * /api/v1/admin/instancetypes:
 *   post:
 *     description: Add instance
 *     tags:
 *       - admin
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Authorization
 *         description: User JWT Token (Start with \"Bearer \")
 *         in: header
 *         type: string
 *         required: true
 *       - name: Name
 *         description: Instance Type Name
 *         in: formData
 *         required: true
 *         type: string
 *       - name: Description
 *         description: Description
 *         in: formData
 *         required: false
 *         type: string
 *       - name: Group
 *         description: User token.
 *         in: formData
 *         required: falase
 *         type: string
 *       - name: CPU
 *         description: CPU
 *         in: formData
 *         required: false
 *         type: number
 *       - name: GPU
 *         description: GPU
 *         in: formData
 *         required: false
 *         type: number
 *       - name: Memory
 *         description: Memory
 *         in: formData
 *         required: false
 *         type: int64
 *       - name: MemoryScale
 *         description: Memory Scala
 *         in: formData
 *         required: false
 *         type: string
 *       - name: Public
 *         description: Public
 *         in: formData
 *         required: false
 *         type: boolean
 *     responses:
 *       200:
 *         description: "{\"status\": \"ok\"}"
 *       401:
 *         description: "Unauthorized"
 */
router.post('/instancetypes', function (req, res) {
  const url = `${config[process.env.NODE_ENV].adminUrl}/instancetypes`
  forwardRequest(url, req, res);
})

/**
 * @swagger
 * /api/v1/admin/instancetypes:
 *   put:
 *     description: Modify instance
 *     tags:
 *       - admin
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Authorization
 *         description: User JWT Token (Start with \"Bearer \")
 *         in: header
 *         type: string
 *         required: true
 *       - name: InstanceTypesData
 *         description: instance type data in JSON
 *         in: body
 *         required: true
 *         type: null
 *         schema:
 *           $ref: "#components/schemas/instancetypes"
 *     responses:
 *       200:
 *         description: "{\"status\": \"ok\"}"
 *       401:
 *         description: "Unauthorized"
 */
router.put('/instancetypes', function (req, res) {
  const url = `${config[process.env.NODE_ENV].adminUrl}/instancetypes`
  forwardRequest(url, req, res);
})

/**
 * @swagger
 * /api/v1/admin/instancetypes:
 *   delete:
 *     description: Delete instance
 *     tags:
 *       - admin
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Authorization
 *         description: User JWT Token (Start with \"Bearer \")
 *         in: header
 *         type: string
 *         required: true
 *       - name: InstanceTypesID
 *         description: instance type id in JSON
 *         in: body
 *         required: true
 *         type: null
 *         schema:
 *           $ref: "#components/schemas/delete_operation"
 *     responses:
 *       200:
 *         description: "{\"status\": \"ok\"}"
 *       401:
 *         description: "Unauthorized"
 */
router.delete('/instancetypes', function (req, res) {
  const url = `${config[process.env.NODE_ENV].adminUrl}/instancetypes`
  forwardRequest(url, req, res);
})

/**
 * @swagger
 * /api/v1/admin/storages:
 *   get:
 *     description: Get information of the storage
 *     tags:
 *       - admin
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
 *         description: "[{\"ID\": 1,\"Label\": \"samplestorage\",\"Value\": 0}]"
 *       401:
 *         description: "Unauthorized"
 */
router.get('/storages', function (req, res) {
  const url = `${config[process.env.NODE_ENV].adminUrl}/storages`
  forwardRequest(url, req, res);
})

/**
 * @swagger
 * /api/v1/admin/storages:
 *   post:
 *     description: Add storage
 *     tags:
 *       - admin
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Authorization
 *         description: User JWT Token (Start with \"Bearer \")
 *         in: header
 *         type: string
 *         required: true
 *       - name: Label
 *         description: Unique Label for storage
 *         in: formData
 *         required: true
 *         type: string
 *       - name: Value
 *         description: Value of the storage
 *         in: formData
 *         required: false
 *         type: int64
 *     responses:
 *       200:
 *         description: "{\"status\": \"ok\"}"
 *       401:
 *         description: "Unauthorized"
 */
router.post('/storages', function (req, res) {
  const url = `${config[process.env.NODE_ENV].adminUrl}/storages`
  forwardRequest(url, req, res);
})

/**
 * @swagger
 * /api/v1/admin/storages:
 *   put:
 *     description: Modify information of the storage
 *     tags:
 *       - admin
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Authorization
 *         description: User JWT Token (Start with \"Bearer \")
 *         in: header
 *         type: string
 *         required: true
 *       - name: StorageData
 *         description: Data for storage in JSON
 *         in: body
 *         required: true
 *         type: null
 *         schema:
 *           $ref: "#components/schemas/storages"
 *     responses:
 *       200:
 *         description: "{\"status\": \"ok\"}"
 *       401:
 *         description: "Unauthorized"
 */
router.put('/storages', function (req, res) {
  const url = `${config[process.env.NODE_ENV].adminUrl}/storages`
  forwardRequest(url, req, res);
})

/**
 * @swagger
 * /api/v1/admin/storages:
 *   delete:
 *     description: Delete the storage
 *     tags:
 *       - admin
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Authorization
 *         description: User JWT Token (Start with \"Bearer \")
 *         in: header
 *         type: string
 *         required: true
 *       - name: StorageID
 *         description: ID for storage in JSON
 *         in: body
 *         required: true
 *         type: null
 *         schema:
 *           $ref: "#components/schemas/delete_operation"
 *     responses:
 *       200:
 *         description: "{\"status\": \"ok\"}"
 *       401:
 *         description: "Unauthorized"
 */
router.delete('/storages', function (req, res) {
  const url = `${config[process.env.NODE_ENV].adminUrl}/storages`
  forwardRequest(url, req, res);
})

module.exports = router;