
const express = require('express');
const router = express.Router();
const config = require('../../config/config.json')
import { forwardRequest } from '../utils'

/**
 * @swagger
 * /api/v1/auth:
 *   post:
 *     description: Login to the application
 *     tags:
 *       - user
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: username
 *         description: Username to use for login.
 *         in: formData
 *         required: true
 *         type: string
 *       - name: password
 *         description: User's password.
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: "{\"token\": \"JWT_TOKEN_STRING\"}"
 *       403:
 *         description: Forbidden
 */
router.post('/auth', function (req, res) {
  const url = `${config[process.env.NODE_ENV].datalabUrl}/auth`
  forwardRequest(url, req, res)
});

/**
 * @swagger
 * /api/v1/profile:
 *   get:
 *     description: get profile of the user
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
 *         description: "{\"ID\": 1, \"Username\": \"testuser\",\"AuthType\": \"1\",\"Password\": \"\",\"Group\": \"dsd\",\"Namespace\": \"datalab-dsd\",\"UserToken\": \"1234567\"}"
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', function (req, res) {
  const url = `${config[process.env.NODE_ENV].datalabUrl}/profile`
  forwardRequest(url, req, res)
})

/**
 * @swagger
 * /api/v1/instancetypes:
 *   get:
 *     description: get instancetypes of the user
 *     tags:
 *       - user
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         type: string
 *         required: true
 *     responses:
 *       200:
 *         description: "{\"ID\":0,\"Name\":\"\",\"Description\":\"\",\"Group\":\"\",\"CPU\":0.0,\"GPU\":0.0,\"Memory\":0,\"MemoryScale\":\"\"}"
 *       401:
 *         description: "Unauthorized"
 */
router.get('/instancetypes', function (req, res) {
  const url = `${config[process.env.NODE_ENV].datalabUrl}/instancetypes`
  forwardRequest(url, req, res)
})

/**
 * @swagger
 * /api/v1/storages:
 *   get:
 *     description: get storages of the user
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
 *         description: "{\"CPUUsage\": 0,\"CPUTotal\": 0,\"GPUUsage\": 0,\"GPUTotal\": 0,\"MemoryUsage\": 0,\"MemoryTotal\": 0}"
 *       401:
 *         description: "Unauthorized"
 */
router.get('/storages', function (req, res) {
  const url = `${config[process.env.NODE_ENV].datalabUrl}/storages`
  forwardRequest(url, req, res)
})

/**
 * @swagger
 * /api/v1/resourcequota:
 *   get:
 *     description: get resourcequota of the user
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
 *         description: "{\"CPUTotal\":0.0,\"GPUTotal\":0.0,\"MemoryTotal\":0}"
 *       401:
 *         description: "Unauthorized"
 */
router.get('/resourcequota', function (req, res) {
  const url = `${config[process.env.NODE_ENV].datalabUrl}/resourcequota`
  forwardRequest(url, req, res)
})

module.exports = router;