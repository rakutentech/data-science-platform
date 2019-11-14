//swaggerDef.js
module.exports = {
  info: {
    // API informations (required)
    title: 'API Documentation', // Title (required)
    version: '1.0.0', // Version (required)
    description: 'Datalab User API', // Description (optional)
  },
  apis: ['src/api/v1/user/*'], //change this according to path where your code lies  
  components: {
    "schemas": {
      "user_delete": {
        "properties": {
          "ID": {
            "type": "integer"
          }
        }
      },
      "lab_instance": {
        "properties": {
          "TypeName": {
            "type": "string"
            },
            "TypeGroup": {
            "type": "string"
            },
            "Name": {
            "type": "string"
            },
            "InstanceTypeName": {
            "type": "string"
            },
            "InstanceNumber": {
            "type": "integer"
            },
            "EphemeralStorage": {
            "type": "integer"
            },
            "StorageScale": {
            "type": "string"
            },
            "Owner": {
            "type": "string"
            },
            "EphemeralStorage": {
            "type": "integer"
            },
            "CreateAt": {
            "type": "integer"
            },
            "Namespace": {
            "type": "string"
            },
            "LoadBalancer": {
            "type": "integer"
            },
            "TagsJSON": {
            "type": "string"
            }
        }
      },
      "function_instance": {
        "properties": {
          "FunctionName": {
            "type": "string"
          },
          "Name": {
            "type": "string"
          },
          "InstanceTypeName": {
            "type": "string"
          },
          "EphemeralStorage": {
            "type": "integer"
          },
          "StorageScale": {
            "type": "string"
          },
          "InstanceNumber": {
            "type": "integer"
          },
          "Owner": {
            "type": "string"
          },
          "CreateAt": {
            "type": "integer"
          },
          "Namespace": {
            "type": "string"
          },
          "IngressPath": {
            "type": "string"
          },
          "Trigger": {
            "type": "string"
          },
          "FunctionContextType": {
            "type": "string"
          },
          "FunctionRef": {
            "type": "string"
          }	,
          "LoadBalancer": {
            "type": "string"
          }	,
          "TagsJSON": {
            "type": "string"
          }	
        }
      },
      "function_instance_put": {
        "properties": {
          "ID": {
            "type": "integer"
          },
          "FunctionName": {
            "type": "string"
          },
          "Name": {
            "type": "string"
          },
          "InstanceTypeName": {
            "type": "string"
          },
          "EphemeralStorage": {
            "type": "integer"
          },
          "StorageScale": {
            "type": "string"
          },
          "InstanceNumber": {
            "type": "integer"
          },
          "Owner": {
            "type": "string"
          },
          "CreateAt": {
            "type": "integer"
          },
          "Namespace": {
            "type": "string"
          },
          "IngressPath": {
            "type": "string"
          },
          "Trigger": {
            "type": "string"
          },
          "FunctionContextType": {
            "type": "string"
          },
          "LoadBalancer": {
            "type": "string"
          }	,
          "TagsJSON": {
            "type": "string"
          }	
        }
      }
    }
  }
};