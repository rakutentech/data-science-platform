#!/usr/bin/env python
# encoding: utf-8


class Usage(Exception):
    def __init__(self, msg):
        self.msg = msg
