#!/usr/bin/env python
# encoding: utf-8


import requests
import inspect
import json
import re
import time
import urllib3
from david.utility.utility import *
from urllib3.exceptions import InsecureRequestWarning
urllib3.disable_warnings(InsecureRequestWarning)


class DataLabHandler(object):

    def __init__(
            self,
            cls,
            host,
            port,
            username=None,
            password=None,
            token=None,
            protocol='http'):
        self.cls = cls
        self.host = host
        self.port = port
        self.url = "%s://%s:%s" % (protocol, host, port)
        self.username = username
        self.password = password
        self.token = token
        self.protocol = protocol
        self.http_header = {
            'Connection': 'close',
            'Content-Type': 'application/json'}
        do_authorization(self)

    def get_instances(self):
        res = requests.get(
            '%s/api/v1/datalab/instances' %
            self.url,
            headers=self.http_header,
            verify=False)
        if res.status_code == 200:
            return res.json()
        else:
            res.raise_for_status()

    def get_instance(self, name, type_name):
        for instance in self.get_instances():
            if instance["Name"] == name and type_name == instance["TypeName"]:
                return DataLabInstance(self, instance)

    def get_types(self):
        res = requests.get(
            '%s/api/v1/datalab' %
            self.url,
            headers=self.http_header,
            verify=False)
        if res.status_code == 200:
            return res.json()
        else:
            res.raise_for_status()

    def create_datalab(self, name,
                       lab_name,
                       lab_group,
                       instance_type,
                       ephemeral_storage=10,
                       tags={}):  # ephemeral_storage unit: GBi

        data = {
            "TypeGroup": lab_group,
            "TypeName": lab_name,
            "Name": name,
            "InstanceTypeName": instance_type,
            "EphemeralStorage": ephemeral_storage,
            "Tags": tags
        }
        return self.__create_instance(name, lab_group, lab_name, data, None)

    def __create_instance(self, name, lab_group, lab_name, data, files):
        res = requests.post("%s/api/v1/datalab/instances" % (self.url),
                            headers=self.http_header,
                            files=files,
                            data=json.dumps(data),
                            verify=False)
        if res.status_code == 200:
            resp_data = res.json()
            if resp_data["status"] == "ok":
                instance = self.get_instance(name, lab_name)
                if instance is None:
                    raise Exception('Cannot retrieve instance:%s' % name)
                return instance
            else:
                raise Exception(resp_data["message"])
        else:
            res.raise_for_status()


class DataLabInstance(DataLabHandler):

    def __init__(self, handler, instance):
        DataLabHandler.__init__(
            self,
            handler.cls,
            handler.host,
            handler.port,
            handler.username,
            handler.password,
            handler.token,
            handler.protocol)
        self.__instance = instance

    def destroy(self):
        res = requests.delete("%s/api/v1/datalab/instances" % (self.url),
                              headers=self.http_header,
                              data=json.dumps({'ID': self.__instance["ID"]}),
                              verify=False)
        if res.status_code != 200:
            resp_data = res.json()
            if resp_data["status"] == "ok":
                res.raise_for_status()


class DataLab(object):
    @classmethod
    def connect(
            cls,
            host,
            port,
            username=None,
            password=None,
            token=None,
            protocol='http'):
        return DataLabHandler(
            cls,
            host,
            port,
            username,
            password,
            token,
            protocol)
