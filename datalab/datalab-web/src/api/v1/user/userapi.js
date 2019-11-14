
const express = require('express');
const router = express.Router();
const config = require('../../config/config.json')
import { forwardRequest } from '../utils'

/**
 * @swagger
 * /api/v1/apis/{username}/{instanceName}:
 *   post:
 *     description: Trigger one function job
 *     tags:
 *       - user
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: username
 *         in: path
 *         description: User Name
 *         required: true
 *       - name: instanceName
 *         in: path
 *         description: the instanceName
 *         required: true
 *       - name: InstanceBody
 *         description: Instance Body in JSON
 *         in: body
 *         type: string
 *         example: "'DATA'"
 *         required: true
 *       - name: Authorization
 *         description: User JWT Token (Start with \"Bearer \")
 *         in: header
 *         type: string
 *         required: true
 *     responses:
 *       200:
 *         description: "{\"job_id\":\"job-uid-test-py2-039999000\",\"status\":\"ok\",\"url\":\"/functions/jobs/job-uid-test-py2-039999000\"}"
 *       401:
 *         description: "Unauthorized"
 */
router.post('/:username/:instanceName', function (req, res) {
  const url = `${config[process.env.NODE_ENV].datalabUrl}/apis/${req.params.username}/${req.params.instanceName}`
  forwardRequest(url, req, res)
})

module.exports = router;
