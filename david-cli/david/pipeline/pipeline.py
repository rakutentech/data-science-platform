#!/usr/bin/env python
# encoding: utf-8

import pickle
from jinja2 import Template
import inspect
import os
import requests
import urllib3
from urllib3.exceptions import InsecureRequestWarning
urllib3.disable_warnings(InsecureRequestWarning)


class Pipeline(object):

    @classmethod
    def connect(cls, host, port, username=None, password=None, protocol='http'):
        from david import FaaS
        return PipelineHandler(FaaS.connect(host, port, username, password, protocol))


class PipelineHandler(object):

    def __init__(self, faas_handler):
        self.faas_handler = faas_handler
        self.model = None
        self.model_path = None
        self.instance_name = ""

    def deploy(self, model,
               model_path,
               instance_name,
               function_name,
               ingress_path = None,
               instance_type="s1.large",
               instance_number=1):
        """
        :param model: The model object to be deployed
        :param model_path: Path of the model
        :param instance_name: instance name
        :param function_name: function name
        :param instance_type: the spec/type of the deployed instance
        :param instance_number: define how many instance is necessary
        :return: the function instance
        """
        if ingress_path is None:
            ingress_path = "/{}/invocations".format(instance_name)
        self.instance_name = instance_name
        python_version = 3
        if "2" in function_name:
            python_version = 2
        elif "3" in function_name:
            python_version = 3
        model_type_full = str(inspect.getmodule(model).__name__).split('.')
        if len(model_type_full) > 0:
            model_type = model_type_full[0]
        else:
            return None
        self.model = model
        self.model_path = '/'.join(model_path.split("/")[3:])
        pickle.dump(model, open(self.model_path, 'wb'))
        code = create_function_contents(self.model_path, model_type, python_version)
        instance = self.faas_handler.create_function(
            name=instance_name,
            trigger='http',
            function_name=function_name,
            instance_type=instance_type,
            function_code=code,
            instance_number=instance_number,
            ingress_path=ingress_path
        )
        return instance

    def load(self, instance_name):
        """
        Load FaaS instance via name
        :param instance_name:
        :return: the existing instance, return None if no matching
        """
        for instance in self.faas_handler.get_instances():
            if instance["Name"] == instance_name:
                self.instance_name = instance_name
                try:
                    self.faas_handler.get_instance(instance_name)
                    return "{} loaded.".format(instance_name)
                except Exception:
                    raise Exception("Can't load instance, check the Pipeline initialization and instance name")
        return "Can't load instance, check the instance name"

    def get_instances(self):
        """
        Get all the deployed FaaS instances' name
        :return:
        """
        try:
            instance_list = [d['Name'] for d in self.faas_handler.get_instances()]
        except Exception:
            raise Exception("Can't get instances list, check the Pipeline initialization")
        return instance_list

    def get_endpoint(self, instance_name = ""):
        """
        Get endpoint of the deployed instances via instance name
        :param instance_name:
        :return:
        """
        request_instance_name = instance_name if instance_name != "" else self.instance_name
        try:
            return self.faas_handler.get_instance(request_instance_name).get_endpoint()
        except Exception:
            raise Exception("Can't get instance endpoint, check the Pipeline initialization and instance name")

    def predict(self, row):
        """
        :param row: input row to be predicted
        :return: result of the predict
        """
        endpoint = self.faas_handler.get_instance(self.instance_name).get_endpoint()
        row_json = {}
        if "pandas" in str(type(row)):
            row_json["records"] = row.to_dict('split')["data"]
        elif "list" in str(type(row)):
            row_json["records"] = row
        elif "dict" in str(type(row)):
            row_json = row
        else:
            raise Exception('Unsupported data format, pipeline support JSON, List and Pandas data frame')
        result = requests.post(endpoint, json=row_json, verify=False)
        ret_array = result.json()['predictions']
        return ret_array


def create_function_contents(model_path, model_type, python_version):
    with open('{}/func_template_{}.py'.format(os.path.dirname(os.path.realpath(__file__)),
                                              model_type), 'r') as template_contents:
        template = Template(template_contents.read())
    return template.render(the_model_path=model_path)


