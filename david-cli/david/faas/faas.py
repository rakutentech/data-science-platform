#!/usr/bin/env python
# encoding: utf-8


import requests
import inspect
import json
import re
import time
import urllib3
import zipfile
import base64
import os
from david.utility.utility import *
from urllib3.exceptions import InsecureRequestWarning
urllib3.disable_warnings(InsecureRequestWarning)


class FaaSHandler(object):

    def __init__(self, cls, host, port, username=None, password=None,
                 token=None, protocol='http'):
        self.cls = cls
        self.host = host
        self.port = port
        self.url = "%s://%s:%s" % (protocol, host, port)
        self.username = username
        self.password = password
        self.token = token
        self.protocol = protocol
        self.cookies = None
        self.http_header = {'Connection': 'close',
                            'Content-Type': 'application/json'}
        do_authorization(self)

    def get_function_context(self, function):
        return inspect.getsource(function)

    def get_instances(self):
        res = requests.get(
            '%s/api/v1/function/instances' % self.url,
            headers=self.http_header,
            verify=False
        )
        if res.status_code == 200:
            return res.json()
        else:
            res.raise_for_status()

    def get_instance(self, name):
        for instance in self.get_instances():
            if instance["Name"] == name:
                if instance["Trigger"] == 'http':
                    return HttpFaaSInstance(self, instance)
                elif instance["Trigger"] == 'event':
                    return EventFaaSInstance(self, instance)
                else:
                    raise Exception(
                        "Unsupported trigger [%s]"
                        % instance["Trigger"]
                    )

    def get_job(self, instance_name, job_id):
        res = requests.get('%s/api/v1/function/instances/event/%s/jobs/%s'
                           % (self.url, instance_name, job_id),
                           headers=self.http_header,
                           verify=False)
        if res.status_code == 200:
            return JobInstance(self, res.json())
        else:
            res.raise_for_status()
        return

    def create_function(self, name,
                        trigger,
                        function_name,
                        instance_type,
                        function_code="",
                        function_requirement="",
                        git_repo="",
                        git_branch="master",
                        git_entrypoint="",
                        zip_file_path="",
                        zip_entrypoint="",
                        instance_number=1,
                        ingress_path="",
                        tags={}):
        files = {}
        context_type = -1
        file_name = ''
        if len(function_code) > 0:
            context_type = RAW_FUNCTION_CONTEXT
        elif len(git_repo) > 0:
            context_type = GIT_FUNCTION_CONTEXT
        elif len(zip_file_path) > 0:
            context_type = ZIP_FUNCTION_CONTEXT
            files = base64.b64encode(
                open(
                    zip_file_path,
                    "rb").read()).decode('ascii')
            file_name = os.path.basename(zip_file_path)
        else:
            raise Exception("Empty function context")

        if trigger not in ('http', 'event'):
            raise Exception('Unsupported trigger [%s]' % trigger)

        functionContext = {
            'Code': function_code,
            'Requirement': function_requirement,
            'GitRepo': git_repo,
            'GitBranch': git_branch,
            'GitEntrypoint': git_entrypoint,
            'ZipFileData': files,
            'ZipFileName': file_name,
            'ZipEntrypoint': zip_entrypoint
        }

        data = {
            'Name': name,
            'Trigger': trigger,
            'FunctionName': function_name,
            'InstanceTypeName': instance_type,
            'InstanceNumber': instance_number,
            'IngressPath': ingress_path,
            'FunctionContextType': context_type,
            'FunctionContext': functionContext,
            'Tags': tags
        }
        return self.__create_instance(name, data, files)

    def __create_instance(self, name, data, files):
        res = requests.post("%s/api/v1/function/instances" % self.url,
                            headers=self.http_header,
                            data=json.dumps(data),
                            verify=False)
        if res.status_code == 200:
            resp_data = res.json()
            if resp_data["status"] == "ok":
                instance = self.get_instance(name)
                if instance is None:
                    raise Exception('Cannot retrieve instance:%s' % name)
                return instance
            else:
                raise Exception(resp_data["message"])
        else:
            res.raise_for_status()


class FaaSInstance(FaaSHandler):

    def __init__(self, handler, instance):
        FaaSHandler.__init__(
            self,
            handler.cls,
            handler.host,
            handler.port,
            handler.username,
            handler.password,
            handler.token,
            handler.protocol)
        self.__instance = instance

    def get_endpoint(self):
        return self.__instance["URL"]

    def check_status(self):
        '''
        Return (IsAvailableEndpoint, RunningCount)
        '''
        for instance in self.get_instances():
            if instance["Name"] == self.__instance["Name"]:
                self.__instance = instance
        return len(self.__instance["URL"]
                   ) > 0, self.__instance["RunningInstances"]

    def destroy(self):
        res = requests.delete("%s/api/v1/function/instances" % (self.url),
                              headers=self.http_header,
                              data=json.dumps({'ID': self.__instance["ID"]}),
                              verify=False)
        if res.status_code != 200:
            resp_data = res.json()
            if resp_data["status"] == "ok":
                res.raise_for_status()

    def update(self,
               instance_number=1,
               function_code="",
               function_requirement="",
               git_repo="",
               git_branch="",
               git_entrypoint="",
               zip_file_path="",
               zip_entrypoint=""):

        file_name = ''
        files = {}
        if len(zip_file_path) > 0:
            files = base64.b64encode(
                open(
                    zip_file_path,
                    "rb").read()).decode('ascii')
            file_name = os.path.basename(zip_file_path)

        functionContext = {
            'Code': function_code,
            'Requirement': function_requirement,
            'GitRepo': git_repo,
            'GitBranch': git_branch,
            'GitEntrypoint': git_entrypoint,
            'ZipFileData': files,
            'ZipFileName': file_name,
            'ZipEntrypoint': zip_entrypoint
        }

        data = {
            'ID': self.__instance["ID"],
            'InstanceNumber': instance_number,
            'FunctionContext': functionContext
        }
        res = requests.put("%s/api/v1/function/instances" % (self.url),
                           headers=self.http_header,
                           data=json.dumps(data),
                           files=files,
                           verify=False)

        if res.status_code == 200:
            resp_data = res.json()
            if resp_data["status"] != "ok":
                raise Exception(resp_data["message"])
        else:
            res.raise_for_status()


class HttpFaaSInstance(FaaSInstance):

    def __init__(self, handler, instance):
        FaaSInstance.__init__(self, handler, instance)
        self.__instance = instance

    def restart(self):
        res = requests.post(
            "%s/api/v1/function/instances/%s/%s/restart" %
            (self.url,
             self.__instance["Trigger"],
             self.__instance["Name"]),
            headers=self.http_header,
            data=json.dumps(
                {
                    'ID': self.__instance["ID"]}),
            verify=False)
        if res.status_code == 200:
            resp_data = res.json()
            if resp_data["status"] != "ok":
                raise Exception(resp_data["message"])

    def get(self, headers=None, data=None, files=None):
        return requests.get(
            self.get_endpoint(),
            headers=headers,
            data=data,
            files=files,
            verify=False)

    def post(self, headers=None, data=None, files=None):
        return requests.post(
            self.get_endpoint(),
            headers=headers,
            data=data,
            files=files,
            verify=False)

    def delete(self, headers=None, data=None, files=None):
        return requests.delete(
            self.get_endpoint(),
            headers=headers,
            data=data,
            files=files,
            verify=False)

    def put(self, headers=None, data=None, files=None):
        return requests.put(
            self.get_endpoint(),
            headers=headers,
            data=data,
            files=files,
            verify=False)


class EventFaaSInstance(FaaSInstance):

    def __init__(self, handler, instance):
        FaaSInstance.__init__(self, handler, instance)
        self.__instance = instance

    def submit_job(
            self,
            instance_type_name="",
            before_execution="",
            command="",
            args=[],
            env={}):
        data = {
            "instance_type_name": instance_type_name,
            "beforeExecution": before_execution,
            "command": command,
            "args": args,
            "env": env
        }
        res = requests.post(
            "%s/api/v1/apis/%s/%s" %
            (self.url,
             self.__instance["Owner"],
             self.__instance["Name"]),
            headers=self.http_header,
            data=json.dumps(data),
            verify=False)
        if res.status_code == 200:
            resp_data = res.json()
            if resp_data["status"] == "ok":
                return self.get_job(
                    self.__instance["Name"],
                    resp_data["jobID"])
            else:
                raise Exception(resp_data["message"])
        else:
            res.raise_for_status()


class JobInstance(object):

    def __init__(self, handler, job):
        self.cls = handler.cls
        self.host = handler.host
        self.port = handler.port
        self.url = handler.url
        self.username = handler.username
        self.password = handler.password
        self.token = handler.token
        self.protocol = handler.protocol
        self.http_header = handler.http_header
        self.__job = job
        self.__log = None

    def getstatusoutput(self):
        """
        @return status code, finish, log
        """
        if (self.__job["Status"] == RUNNING_CODE or
                self.__job["Status"] == PENDING_CODE):
            while (self.__job["Status"] == RUNNING_CODE or
                   self.__job["Status"] == PENDING_CODE):
                try:
                    res = requests.get(
                        '%s/api/v1/function/instances/event/%s/jobs/%s' %
                        (self.url,
                         self.__job["InstanceName"],
                            self.get_id()),
                        headers=self.http_header,
                        verify=False)
                    if res.status_code == 200:
                        self.__job = res.json()
                        time.sleep(2)
                    else:
                        res.raise_for_status()
                except BaseException:
                    import traceback
                    traceback.print_exc()
                    print("Fetch job error: status=[%s], "
                          "reason=[%s], body=[%s]" %
                          (res.status_code, res.reason, res.text))
                    time.sleep(2)
            if self.__job["Status"] == SUCCESS_CODE:
                return 0, self.__get_log()
            else:
                return 1, self.__get_log()
        else:
            if self.__job["Status"] == SUCCESS_CODE:
                return 0, self.__get_log()
            else:
                return 1, self.__get_log()

    def kill(self):
        res = requests.delete(
            '%s/api/v1/function/instances/event/%s/jobs/%s/kill' %
            (self.url, self.__job["InstanceName"], self.__job["JobID"]),
            headers=self.http_header,
            verify=False)
        if res.status_code == 200:
            resp_data = res.json()
            if resp_data["status"] != "ok":
                raise Exception(resp_data["message"])
        else:
            res.raise_for_status()

    def get_id(self):
        return self.__job["JobID"]

    def get_function_log(self):
        status, output = self.getstatusoutput()
        if status == 0:
            m = re.search(
                r"<----BATCH_EXECUTE_START---->\n"
                "(.+?)\n<----BATCH_EXECUTE_END---->",
                output,
                re.DOTALL)
            return "" if m is None else m.group(1)
        else:
            return ""

    def __get_log(self):
        if self.__log:
            return self.__log

        res = requests.get(
            "%s/api/v1/function/instances/event/%s/jobs/%s/log" %
            (self.url,
             self.__job["InstanceName"],
             self.get_id()),
            headers=self.http_header,
            verify=False)
        if res.status_code == 200:
            self.__log = res.json()
            return self.__log
        else:
            res.raise_for_status()


class FaaS(object):
    @classmethod
    def connect(
            cls,
            host,
            port,
            username=None,
            password=None,
            token=None,
            protocol='http'):
        return FaaSHandler(
            cls,
            host,
            port,
            username,
            password,
            token,
            protocol)
