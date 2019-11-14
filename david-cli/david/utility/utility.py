#!/usr/bin/env python
# encoding: utf-8

import requests

RAW_FUNCTION_CONTEXT = 'inline'
ZIP_FUNCTION_CONTEXT = 'zip'
GIT_FUNCTION_CONTEXT = 'git'

RUNNING_CODE = 'Running'
PENDING_CODE = 'Pending'
FAILED_CODE = 'Failed'
UNKNOWN_CODE = 'Unknown'
SUCCESS_CODE = 'Success'
KILLED_CODE = 'Killed'


def do_authorization(object):
    if object.token is None:
        data = {
            'Username': object.username,
            'Password': object.password
        }
        res = requests.post(
            "%s/api/v1/auth" %
            object.url, data=data, verify=False)
        if res.status_code == 200:
            resp_data = res.json()
            object.token = resp_data["token"]
        else:
            res.raise_for_status()

    object.http_header.update({'Authorization': 'Bearer %s' % object.token})
    res = requests.get(
        "%s/api/v1/datalab" %
        object.url,
        headers=object.http_header,
        verify=False)
    if res.status_code == 200:
        try:
            res.json()
        except BaseException:
            raise Exception("Unavailable token")
    else:
        res.raise_for_status()
