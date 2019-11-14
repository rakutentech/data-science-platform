#!/usr/bin/env python
# encoding: utf-8


import getopt
import os
import sys

import yaml

from .davidcmd import invoker
from .usage import Usage

help_message = """
Usage: david [--config $CONFIG_PATH] COMMAND_TYPE
$CONFIG_PATH default is '~/.david.yml'
COMMAND TYPE LIST
%s
""" % '\n'.join(["  " + v for v in invoker.list_command_types()])


def init(config_path):
    """
    Config example:
      admin:
        url: http://xxxx.xxxx
        username: xxx
        password: xxx
    """
    config = yaml.load(open(config_path, "r"), Loader=yaml.FullLoader)
    return config


def main(argv=None):

    if argv is None:
        argv = sys.argv

    # option processing
    config_path = os.environ['HOME'] + "/.david.yml"
    try:
        opts, args = getopt.getopt(argv[1:], "h", ["help", "config="])
        raise_usage = len(argv) < 2
        next_argv_index = 1 if len(argv) >= 2 else 0
        for option, value in opts:
            if option in ("-h", "--help"):
                raise_usage = True
            if option in ("--config"):
                config_path = value
                next_argv_index = 3 if len(argv) > 3 else 0
        config = init(config_path)
        command_type = argv[next_argv_index]

        if raise_usage or command_type not in invoker.list_command_types():
            raise Usage(help_message)

        argv = argv[next_argv_index+1:]
        command_name = argv[0] if len(argv) > 0 else ""
        if command_name not in invoker.list_commands(command_type):
            commands = ["  " + v for v in invoker.list_commands(command_type)]
            command_list = '\n'.join(commands)
            raise Usage("""Command type: %s\nSupport Commands\n%s
             """ % (command_type, command_list))

        argv = argv[1:]
        invoker.execute(command_type, command_name, config, argv)

    except Usage as err:
        print(str(err.msg))
        return 2


if __name__ == "__main__":
    sys.exit(main())
