//swaggerDef.js
module.exports = {
  info: {
    // API informations (required)
    title: 'API Documentation', // Title (required)
    version: '1.0.0', // Version (required)
    description: 'Datalab Admin API', // Description (optional)
  },
  // basePath: '/admin-api-docs',
  apis: ['src/api/v1/admin/*'], //change this according to path where your code lies  
  components: {
    "schemas": {
      "user": {
        "properties": {
          "ID": {
            "type": "integer"
          },
          "Username": {
            "type": "string",
            "example": "username"
          },
          "Password": {
            "type": "string"
          },
          "AuthType": {
            "type": "string"
          },
          "Group": {
            "type": "string"
          },
          "Namespace": {
            "type": "string"
          }
        }
      },
      "groups": {
        "properties": {
          "ID": {
            "type": "integer"
          },
          "Name": {
            "type": "string"
          }
        }
      },
      "datalab": {
        "properties": {
          "ID": {
            "type": "integer"
          },"Name": {
            "type": "string"
          },"Group": {
            "type": "string"
          },"Description": {
            "type": "string"
          },"LoadBalancer": {
            "type": "string"
          },"Public": {
            "type": "boolean"
          }
        }
      },
      "datalabgroups": {
        "properties": {
          "ID": {
            "type": "integer"
          },
          "Name": {
            "type": "string"
          }
        }
      },
      "function_post": {
        "properties": {
          "Name": {
            "type": "string"
          },
          "Description": {
            "type": "string"
          },
          "ProgramLanguage": {
            "type": "string"
          },
          "Trigger": {
            "type": "string"
          },
          "LoadBalancer": {
            "type": "string"
          },
          "DefaultFunction": {
            "type": "string"
          },
          "DefaultRequirement": {
            "type": "string"
          }
        }
      },
      "function": {
        "properties": {
          "ID": {
            "type": "integer"
          },
          "Name": {
            "type": "string"
          },
          "Description": {
            "type": "string"
          },
          "ProgramLanguage": {
            "type": "string"
          },
          "Trigger": {
            "type": "string"
          },
          "LoadBalancer": {
            "type": "string"
          },
          "DefaultFunction": {
            "type": "string"
          },
          "DefaultRequirement": {
            "type": "string"
          }
        }
      },
      "instancetypegroups": {
        "properties": {
          "ID": {
            "type": "integer"
          },
          "Name": {
            "type": "string"
          }
        }
      },
      "instancetypes": {
        "properties": {
          "ID": {
            "type": "integer"
          },
          "Name": {
            "type": "string"
          },
          "Description": {
            "type": "string"
          },
          "Group": {
            "type": "string"
          },
          "CPU": {
            "type": "string"
          },
          "GPU": {
            "type": "string"
          },
          "Memory": {
            "type": "string"
          },
          "MemoryScale": {
            "type": "string"
          },
          "Public": {
            "type": "boolean"
          }
        }
      },
      "storages": {
        "properties": {
          "ID": {
            "type": "integer"
          },
          "Label": {
            "type": "string"
          },
          "Value": {
            "type": "integer"
          }
        }
      },
      "delete_operation": {
        "properties": {
          "ID": {
            "type": "integer"
          }
        }
      }
    }
  }
};