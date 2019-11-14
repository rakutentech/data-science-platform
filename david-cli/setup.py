# -*- coding: utf-8 -*-
"""
    david-cli
    ~~~~~~~~

    The python library and CLI tool for wrapper Openlab REST API.
    :license: BSD, see LICENSE for more details.
"""
from setuptools import setup, find_packages

classifiers = [
    'Development Status :: 4 - Beta',
    'Environment :: Web Environment',
    'Intended Audience :: Developers',
    'Intended Audience :: System Administrators',
    'License :: OSI Approved :: BSD License',
    'Operating System :: MacOS',
    'Operating System :: POSIX',
    'Operating System :: Unix',
    'Operating System :: Microsoft',
    'Operating System :: OS Independent',
    'Programming Language :: Python :: 2.7',
    'Topic :: Internet :: Proxy Servers',
    'Topic :: Internet :: WWW/HTTP :: HTTP Servers',
]

setup(
    name='david',
    version='1.0.1',
    description='The python library and CLI tool for wrapper Openlab',
    long_description=open('README.md').read().strip(),
    author='Rakuten',
    author_email='',
    url='https://git/david-cli/browse',
    license='BSD',
    packages=find_packages(),
    install_requires=['requests', 'PyYAML', 'jinja2', 'pandas'],
    classifiers=classifiers,
    entry_points={
        'console_scripts': [
            'david = david.cli.main:main'
        ]
    }
)
