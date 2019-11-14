#!/usr/bin/env python
# encoding: utf-8

import getopt
import sys
import yaml
import traceback
from david.admin.admin import Admin
from david.faas.faas import FaaS
from david.datalab.datalab import DataLab
from .usage import Usage


class CommandInvoker(object):
    """
    Singleton Pattern:
    - Inheritance object
    - Override __new__
    """

    __instance = None

    def __new__(cls, *args, **keys):
        if cls.__instance is None:
            cls.__instance = object.__new__(cls)
        return cls.__instance

    def __init__(self):
        self.__commands = {}

    def mapping(self, command_type, command_name):
        def receive(cls):
            if command_type not in self.__commands:
                self.__commands[command_type] = {}
            c = cls()
            c.set_command_name(command_name)
            self.__commands[command_type][command_name] = c

        return receive

    def execute(self, command_type, command_name, config, argv):
        self.__commands[command_type][command_name].execute(config, argv)

    def __getitem__(self, key):
        if len(key) == 2:
            return self.__commands[key[0]][key[1]]

    def list_command_types(self):
        return self.__commands.keys()

    def list_commands(self, command_type):
        return self.__commands[command_type].keys()


invoker = CommandInvoker()


class BaseCommand(object):
    def __init__(self):
        self.help_message = ""
        self.longopts = []
        self.vars = {}
        self.command_name = "unknown"

    def set_command_name(self, command_name):
        self.command_name = command_name

    def prepare(self, argv, config):
        pass

    def execute(self, config, argv):
        self.prepare(argv, config)
        self.do_execute()

    def do_execute(self):
        print("Unsupported command")

    def build_api_result(self, response):
        if response.status_code == 200 or response.status_code == 201:
            return True, response.status_code, response.json()
        else:
            return False, response.status_code, ""


class AdminCommand(BaseCommand):

    def __init__(self):
        BaseCommand.__init__(self)
        self.help_message = """david admin %s -f ${setting_path}"""
        self.admin_url = ""
        self.client = None
        self.settings = None
        self.get_setting_map()

    def prepare(self, argv, config):
        try:
            longopts = ["help"] + ["%s=" % v for v in self.longopts]
            opts, args = getopt.getopt(argv, "hf:", longopts=longopts)
        except getopt.error as msg:
            raise Usage(self.help_message)

        setting_path = None
        # option processing
        for option, value in opts:
            if option in ("-h", "--help"):
                raise Usage(self.help_message)
            if option in ("-f"):
                setting_path = value
        if setting_path is None:
            raise Usage(self.help_message)
        admin_config = config["admin"]
        self.admin_url = admin_config["url"]
        self.client = Admin.connect(
            self.admin_url,
            admin_config["username"],
            admin_config["password"])
        self.settings = yaml.load(open(setting_path), Loader=yaml.FullLoader)

    def find_setting_id(self, client, setting_type, item):
        for setting in client.list(setting_type):
            find = False
            for column in self.setting_map[setting_type]:
                if setting[column] != item[column]:
                    find = False
                    break
                else:
                    find = True

            if find:
                return setting["ID"]
        return -1

    def get_column_values(self, setting_type, setting):
        values = {}
        for column in self.setting_map[setting_type]:
            values[column] = setting["spec"][column]
        return values

    # according to setting type, define data comparison key columns
    def get_setting_map(self):
        self.setting_map = dict()
        self.setting_map["datalab"] = ["Group", "Name"]
        self.setting_map["function"] = ["Trigger", "Name"]
        self.setting_map["instancetypes"] = ["Group", "Name"]
        self.setting_map["storages"] = ["Value"]
        self.setting_map["users"] = ["Username"]


@invoker.mapping("admin", "create")
class AdminCreateCommand(AdminCommand):

    def __init__(self):
        AdminCommand.__init__(self)
        self.help_message = self.help_message % "create"

    def do_execute(self):
        self.action(self.client, self.settings["type"], self.settings["items"])

    def action(self, client, setting_type, items):
        for setting in items:
            try:
                item = self.get_column_values(setting_type, setting)
                client.create(setting_type, setting["spec"])
                print(
                    "Creating resource [%s-%s] is success" %
                    (setting_type, item))
            except Exception as e:
                print(
                    "Creating resource [%s-%s] is failed, message=[%s]" %
                    (setting_type, item, e))


@invoker.mapping("admin", "update")
class AdminUpdateCommand(AdminCommand):

    def __init__(self):
        AdminCommand.__init__(self)
        self.help_message = self.help_message % "update"

    def do_execute(self):
        self.action(self.client, self.settings["type"], self.settings["items"])

    def action(self, client, setting_type, items):
        for setting in items:
            try:
                item = self.get_column_values(setting_type, setting)
                setting_id = self.find_setting_id(client, setting_type, item)
                if setting_id < 0:
                    raise Exception("Cannot find setting")
                else:
                    client.update(setting_type, setting_id, setting["spec"])
                print(
                    "Updating resource [%s-%s] is success" %
                    (setting_type, item))
            except Exception as e:
                print(
                    "Updating resource [%s-%s] is failed, message=[%s]" %
                    (setting_type, item, e))


@invoker.mapping("admin", "delete")
class AdminDeleteCommand(AdminCommand):

    def __init__(self):
        AdminCommand.__init__(self)
        self.help_message = self.help_message % "delete"

    def do_execute(self):
        self.action(self.client, self.settings["type"], self.settings["items"])

    def action(self, client, setting_type, items):
        for setting in items:
            try:
                item = self.get_column_values(setting_type, setting)
                setting_id = self.find_setting_id(
                    self.client, setting_type, item)
                if setting_id < 0:
                    raise Exception("Cannot find setting [%s]" % item)
                else:
                    self.client.delete(setting_type, setting_id)
                print(
                    "Deleting resource [%s-%s] is success" %
                    (setting_type, item))
            except Exception as e:
                print(
                    "Deleting resource [%s-%s] is failed, message=[%s]" %
                    (setting_type, item, e))


@invoker.mapping("admin", "sync")
class AdminSyncCommand(AdminCommand):

    def __init__(self):
        AdminCommand.__init__(self)
        self.help_message = self.help_message % "sync"
        self.key_concat = "____"

    # base on input columns to retrieve data
    def get_key_attributes(self, data, columns, is_from_setting):
        keys = set()
        for d in data:
            key = ""
            for idx, c in enumerate(columns):
                if(is_from_setting):
                    key += str(d["spec"][c])
                else:
                    key += str(d[c])
                if(idx != len(columns) - 1):
                    key += self.key_concat
            keys.add(key)
        return keys

    # find items by input keys
    def get_items_by_keys(self, keys, columns, items, is_from_setting):
        finds = []
        for item in items:
            key = ""
            for idx, c in enumerate(columns):
                if(is_from_setting):
                    key += str(item['spec'][c])
                else:
                    key += str(item[c])
                if(idx != len(columns) - 1):
                    key += self.key_concat
            if(key in keys):
                finds.append(item)
        return finds

    def do_execute(self):
        setting_type = self.settings["type"]

        if setting_type not in self.setting_map:
            raise Exception(
                "setting type is not correct. "
                "only allow datalab, function, instancetypes, storages, users")

        instances = self.client.list(setting_type)
        old_keys = self.get_key_attributes(
            instances, self.setting_map[setting_type], False)
        new_keys = self.get_key_attributes(
            self.settings["items"], self.setting_map[setting_type], True)

        create_items = self.get_items_by_keys(
            new_keys - old_keys,
            self.setting_map[setting_type],
            self.settings["items"],
            True)
        self.__create_items(setting_type, create_items)
        update_items = self.get_items_by_keys(
            new_keys.intersection(old_keys),
            self.setting_map[setting_type],
            self.settings["items"],
            True)
        self.__update_items(setting_type, update_items)
        delete_items = self.get_items_by_keys(
            old_keys - new_keys,
            self.setting_map[setting_type],
            instances,
            False)
        self.__delete_items(setting_type, delete_items)

    def __create_items(self, setting_type, items):
        invoker[("admin", "create")].action(self.client, setting_type, items)

    def __update_items(self, setting_type, items):
        invoker[("admin", "update")].action(self.client, setting_type, items)

    def __delete_items(self, setting_type, items):
        for item in items:
            setting_id = ""
            try:
                setting_id = self.find_setting_id(
                    self.client, setting_type, item)
                if setting_id < 0:
                    raise Exception("Cannot find setting")
                else:
                    self.client.delete(setting_type, setting_id)
                print(
                    "Deleting resource [%s-%s] is success" %
                    (setting_type, setting_id))
            except Exception as e:
                print(
                    "Deleting resource [%s-%s] is failed, message=[%s]" %
                    (setting_type, setting_id, e))


@invoker.mapping("function", "run")
class FunctionRunCommand(BaseCommand):

    def __init__(self):
        BaseCommand.__init__(self)
        self.help_message = """david function run [--command xxx] "
                              "[--instance-type-name xxx] "
                              "[--before-execution xxx] "
                              "[-e key=value]... "
                              "function_name [args]..."""
        self.admin_url = ""
        self.client = None
        self.settings = None
        self.longopts = ["command", "instance-type-name", "before-execution"]
        self.function_name = ""
        self.args = ""
        self.env = {}
        self.command = ""
        self.before_execution = ""
        self.instance_type_name = ""

    def prepare(self, argv, config):
        try:
            longopts = ["help"] + ["%s=" % v for v in self.longopts]
            opts, args = getopt.getopt(argv, "he:", longopts=longopts)
        except getopt.error as msg:
            print(traceback.format_tb(msg.__traceback__))
            raise Usage(self.help_message)

        if len(args) == 0:
            raise Usage(self.help_message)

        self.function_name = args[0]
        self.args = args[1:]
        # option processing
        for option, value in opts:
            if option in ("-h", "--help"):
                raise Usage(self.help_message)
            if option in ("-e"):
                data = value.split("=")
                if len(data) == 2:
                    self.env[data[0]] = data[1]
            if option == "--command":
                self.command = value
            if option == "--before-execution":
                self.before_execution = value
            if option == "--instance-type-name":
                self.instance_type_name = value

        datalab_config = config["datalab"]
        self.client = FaaS.connect(**datalab_config)

    def do_execute(self):
        instance = self.client.get_instance(self.function_name)
        if instance is None:
            raise Exception(
                "Function name [%s] not exist!" %
                self.function_name)
        job = instance.submit_job(instance_type_name=self.instance_type_name,
                                  before_execution=self.before_execution,
                                  command=self.command,
                                  args=self.args,
                                  env=self.env)
        status, log = job.getstatusoutput()
        print(log)
        sys.exit(status)


class FunctionManageCommand(BaseCommand):

    def __init__(self):
        self.help_message = """david function %s -f ${setting_path}"""
        self.client = None
        self.settings = None
        self.longopts = []

    def prepare(self, argv, config):
        try:
            longopts = ["help"] + ["%s=" % v for v in self.longopts]
            opts, args = getopt.getopt(argv, "hf:", longopts=longopts)
        except getopt.error as msg:
            raise Usage(self.help_message)

        setting_path = None
        # option processing
        for option, value in opts:
            if option in ("-h", "--help"):
                raise Usage(self.help_message)
            if option in ("-f"):
                setting_path = value
        if setting_path is None:
            raise Usage(self.help_message)
        datalab_config = config["datalab"]
        self.client = FaaS.connect(**datalab_config)
        self.settings = yaml.load(open(setting_path), Loader=yaml.FullLoader)


@invoker.mapping("function", "list")
class FunctionListCommand(FunctionManageCommand):

    def __init__(self):
        self.longopts = []
        self.help_message = """david function list"""

    def prepare(self, argv, config):
        try:
            longopts = ["help"] + ["%s=" % v for v in self.longopts]
            opts, args = getopt.getopt(argv, "h", longopts=longopts)
        except getopt.error as msg:
            raise Usage(self.help_message)
        for option, value in opts:
            if option in ("-h", "--help"):
                raise Usage(self.help_message)
        datalab_config = config["datalab"]
        self.client = FaaS.connect(**datalab_config)

    def do_execute(self):
        exit_code = 0
        try:
            columns = ("Trigger", "Owner", "Name", "URL")
            print(
                "{:<20}{:<20}{:<20}{:<20}".format(
                    columns[0],
                    columns[1],
                    columns[2],
                    columns[3]))
            for instance in self.client.get_instances():
                print("{:<20}{:<20}{:<20}{:<20}".format(
                    instance[columns[0]],
                    instance[columns[1]],
                    instance[columns[2]],
                    instance[columns[3]]))
        except Exception as e:
            print("List instance failed: [%s]" % e)
            exit_code = 1
        sys.exit(exit_code)


@invoker.mapping("function", "create")
class FunctionCreateCommand(FunctionManageCommand):

    def __init__(self):
        FunctionManageCommand.__init__(self)
        self.help_message = self.help_message % "create"

    def do_execute(self):
        exit_code = 0
        for setting in self.settings:
            try:
                print("Try to create instance: [%s]" % setting["name"])
                self.client.create_function(**setting)
                print("Created instance: [%s]" % setting["name"])
            except Exception as e:
                print(traceback.format_tb(e.__traceback__))
                print("Created instance failed: [%s]" % e)
                exit_code = 1
        sys.exit(exit_code)


@invoker.mapping("function", "delete")
class FunctionDeleteCommand(FunctionManageCommand):

    def __init__(self):
        FunctionManageCommand.__init__(self)
        self.help_message = self.help_message % "delete"

    def do_execute(self):
        exit_code = 0
        for setting in self.settings:
            try:
                instance = self.client.get_instance(setting["name"])
                print("Try to destroy instance: [%s]" % setting["name"])
                instance.destroy()
                print("Destroyed instance: [%s]" % setting["name"])
            except Exception as e:
                print(traceback.format_tb(e.__traceback__))
                print("Destroyed instance failed: [%s]" % e)
                exit_code = 1
        sys.exit(exit_code)


@invoker.mapping("function", "restart")
class FunctionRestartCommand(FunctionManageCommand):

    def __init__(self):
        FunctionManageCommand.__init__(self)
        self.help_message = self.help_message % "restart"

    def do_execute(self):
        exit_code = 0
        for setting in self.settings:
            try:
                instance = self.client.get_instance(setting["name"])
                if instance is None:
                    print(
                        "Instance: [%s] does not exist, skipped..." %
                        setting["name"])
                else:
                    instance.restart()
                    print("Restarted instance: [%s]" % setting["name"])
            except Exception as e:
                print("Restart instance failed: [%s]" % e)
                exit_code = 1
        sys.exit(exit_code)


@invoker.mapping("function", "apply")
class FunctionApplyCommand(FunctionManageCommand):

    def __init__(self):
        FunctionManageCommand.__init__(self)
        self.help_message = self.help_message % "apply"

    def do_execute(self):
        exit_code = 0
        for setting in self.settings:
            try:
                instance = self.client.get_instance(setting["name"])
                print("Try to apply instance: [%s]" % setting["name"])
                if instance is None:
                    self.client.create_function(**setting)
                    print("Created instance: [%s]" % setting["name"])
                else:
                    new_setting = {
                        "instance_number": setting.get(
                            "instance_number", 1),
                        "function_code": setting.get(
                            "function_code", ""),
                        "function_requirement": setting.get(
                            "function_requirement", ""),
                        "git_repo": setting.get(
                            "git_repo", ""),
                        "git_branch": setting.get(
                            "git_branch", ""),
                        "git_entrypoint": setting.get(
                            "git_entrypoint", ""),
                        "zip_file_path": setting.get(
                            "zip_file_path", ""),
                        "zip_entrypoint": setting.get(
                            "zip_entrypoint", "")}
                    instance.update(**new_setting)
                    print("Applied instance: [%s]" % setting["name"])
            except Exception as e:
                print("Applied instance failed: [%s]" % e)
                exit_code = 1
        sys.exit(exit_code)


class DataLabManageCommand(BaseCommand):

    def __init__(self):
        self.help_message = """david datalab %s -f ${setting_path}"""
        self.client = None
        self.settings = None
        self.longopts = []

    def prepare(self, argv, config):
        try:
            longopts = ["help"] + ["%s=" % v for v in self.longopts]
            opts, args = getopt.getopt(argv, "hf:", longopts=longopts)
        except getopt.error as msg:
            raise Usage(self.help_message)

        setting_path = None
        # option processing
        for option, value in opts:
            if option in ("-h", "--help"):
                raise Usage(self.help_message)
            if option in ("-f"):
                setting_path = value
        if setting_path is None:
            raise Usage(self.help_message)
        datalab_config = config["datalab"]
        self.client = DataLab.connect(**datalab_config)
        self.settings = yaml.load(open(setting_path), Loader=yaml.FullLoader)


@invoker.mapping("datalab", "list")
class FunctionListCommand(DataLabManageCommand):

    def __init__(self):
        self.longopts = []
        self.help_message = """david function list"""

    def prepare(self, argv, config):
        try:
            longopts = ["help"] + ["%s=" % v for v in self.longopts]
            opts, args = getopt.getopt(argv, "h", longopts=longopts)
        except getopt.error as msg:
            raise Usage(self.help_message)
        for option, value in opts:
            if option in ("-h", "--help"):
                raise Usage(self.help_message)
        datalab_config = config["datalab"]
        self.client = DataLab.connect(**datalab_config)

    def do_execute(self):
        exit_code = 0
        try:
            columns = ("TypeName", "TypeGroup", "Owner", "Name", "URL")
            print(
                "{:<20}{:<20}{:<20}{:<20}{:<20}".format(
                    columns[0],
                    columns[1],
                    columns[2],
                    columns[3],
                    columns[4],))
            for instance in self.client.get_instances():
                print("{:<20}{:<20}{:<20}{:<20}{:<20}".format(
                    instance[columns[0]],
                    instance[columns[1]],
                    instance[columns[2]],
                    instance[columns[3]],
                    instance[columns[4]]))
        except Exception as e:
            print(traceback.format_tb(e.__traceback__))
            print("List instance failed: [%s]" % e)
            exit_code = 1
        sys.exit(exit_code)


@invoker.mapping("datalab", "create")
class DataLabCreateCommand(DataLabManageCommand):

    def __init__(self):
        DataLabManageCommand.__init__(self)
        self.help_message = self.help_message % "create"

    def do_execute(self):
        exit_code = 0
        for setting in self.settings:
            try:
                print("Try to create instance: [%s]" % setting["name"])
                self.client.create_datalab(**setting)
                print("Created instance: [%s]" % setting["name"])
            except Exception as e:
                print(traceback.format_tb(e.__traceback__))
                print("Created instance failed: [%s]" % e)
                exit_code = 1
        sys.exit(exit_code)


@invoker.mapping("datalab", "delete")
class DataLabDeleteCommand(DataLabManageCommand):

    def __init__(self):
        DataLabManageCommand.__init__(self)
        self.help_message = self.help_message % "delete"

    def do_execute(self):
        exit_code = 0
        for setting in self.settings:
            try:
                instance = self.client.get_instance(
                    setting["name"], setting["lab_name"])
                print("Try to destroy instance: [%s]" % setting["name"])
                instance.destroy()
                print("Destroyed instance: [%s]" % setting["name"])
            except Exception as e:
                print("Destroyed instance failed: [%s]" % e)
                exit_code = 1
        sys.exit(exit_code)
