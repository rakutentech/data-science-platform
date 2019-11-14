#!/usr/bin/env python
# encoding: utf-8

import requests
import urllib3
import json
from urllib3.exceptions import InsecureRequestWarning
urllib3.disable_warnings(InsecureRequestWarning)


class Admin(object):
    @classmethod
    def connect(cls, admin_url, username=None, password=None, protocol='http'):
        data = {
            'Username': username,
            'Password': password
        }
        res = requests.post(
            "%s/api/v1/admin/auth" %
            admin_url, data=data, verify=False)
        if res.status_code == 200:
            token = res.json()["token"]
            return AdminHandler(admin_url, token)
        else:
            res.raise_for_status()


class AdminHandler(object):
    def __init__(self, url, token):
        self.url = url
        self.http_header = {
            'Connection': 'close',
            'Content-Type': "application/json",
            'Authorization': 'Bearer %s' % token}

    def list(self, setting_type):
        res = requests.get(
            '%s/api/v1/admin/%s' %
            (self.url,
             setting_type),
            headers=self.http_header,
            verify=False)
        if res.status_code == 200:
            return res.json()
        else:
            res.raise_for_status()

    def __check_status(self, res):
        if res.status_code == 200 or res.status_code == 400:
            resp_data = res.json()
            if resp_data["status"] == "ok":
                return True
            else:
                raise Exception(resp_data["message"])
        else:
            res.raise_for_status()

    def __create_group(self, setting_type, group):
        service_path_map = {
            "datalab": "datalabgroups",
            "instancetypes": "instancetypegroups",
            "users": "groups"}
        res = requests.get(
            "%s/api/v1/admin/%s" %
            (self.url,
             service_path_map.get(setting_type)),
            headers=self.http_header,
            verify=False)
        is_exist = None
        if res.status_code == 200:
            for g in res.json():
                if(group == (g['Name'])):
                    is_exist = True
                    break
        else:
            res.raise_for_status()

        if not is_exist:
            response = requests.post(
                "%s/api/v1/admin/%s" %
                (self.url,
                 service_path_map.get(setting_type)),
                data=json.dumps(
                    {
                        "Name": group}),
                headers=self.http_header,
                verify=False)
            if response.status_code == 200:
                print('create group %s success' % group)
            else:
                response.raise_for_status()

    def create(self, setting_type, data):
        if (
            setting_type == "datalab" or
            setting_type == "instancetypes" or
            setting_type == "users"
        ):
            self.__create_group(setting_type, data["Group"])
        res = requests.post("%s/api/v1/admin/%s" % (self.url, setting_type),
                            headers=self.http_header,
                            data=json.dumps(data),
                            verify=False)
        return self.__check_status(res)

    def update(self, setting_type, setting_id, data):
        data.update({"ID": setting_id})
        res = requests.put("%s/api/v1/admin/%s" % (self.url, setting_type),
                           headers=self.http_header,
                           data=json.dumps(data),
                           verify=False)
        return self.__check_status(res)

    def delete(self, setting_type, setting_id):
        res = requests.delete("%s/api/v1/admin/%s" % (self.url, setting_type),
                              headers=self.http_header,
                              data=json.dumps({"ID": setting_id}),
                              verify=False)
        return self.__check_status(res)
