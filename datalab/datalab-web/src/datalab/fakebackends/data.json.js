const fakeData = {
  fakeCert: 'ssssh',
  fakeExpire: '60s',
  // Fake App data
  fakeUser: {
    Username: 'fake',
    Password: 'fake',
    AuthType: 'Database',
    Group: 'fake-group',
    Namespace: 'fakse-ns',
    UserToken: 'fdfmklmlskfd'
  },
  fakeResourceQuota: {
    CPUUsage: 80.0,
    CPUTotal: 100.0,
    MemoryUsage: 80.0,
    MemoryTotal: 200.0,
    GPUUsage: 0.0,
    GPUTotal: 1.0
  },
  fakeAppDataLabSettings: [
    {
      ID:1, 
      Name: 'MyLab', 
      Description: 'test Lab', 
      Group: 'DSD'
    },
    {
      ID:2, 
      Name: 'MyLab2', 
      Description: 'test Lab2', 
      Group: 'DSD2'
    }
  ],
  fakeAppFunctionSettings: [
    {
      ID:1, 
      Name: 'MyFunc1', 
      Description: 'test func', 
      ProgramLanguage: 'python', 
      Trigger:'http',
      LoadBalancer: 'dummy2',
      DefaultFunction:'hello world', 
      DefaultRequirement:'###'
    },
    {
      ID:2, 
      Name: 'MyFunc2', 
      Description: 'test func', 
      ProgramLanguage: 'sh', 
      Trigger:'event', 
      DefaultFunction:'hello world2', 
      DefaultRequirement:'###2'
    }
  ],
  fakeDataLabInstances: [
    {ID: 1,
      UUID: 'feji32ojediosj',
      TypeName: 'MyLab',
      TypeGroup: 'DSD',
      Name: 'mylab',
      InstanceTypeName: 's1.small',
      EphemeralStorage: 100,
      StorageScale: 'GiB',
      Owner: 'fake',         
      URL: 'http://localhost',
      CreateAt: 1549601195,
      InternalEndpoints: ['mylab-abc1'],
      Restarts: 0,
      Namespace: 'ns1',
      RunningInstances: 1,
      PendingInstances: 0,
      Tags: {
        env: 'stg',
        app: 'fronent'
      }
    },
    {ID: 2,
      UUID: 'dsfdfsdfdsl',
      TypeName: 'MyLab2',
      TypeGroup: 'DSD2',
      Name: 'mylab1',
      InstanceTypeName: 's1.media',
      EphemeralStorage: 50,
      StorageScale: 'GiB',
      Owner: 'fake',         
      URL: '',
      CreateAt: 1549601195,
      InternalEndpoints: ['mylab1-abc1', 'mylab1-abc2'],
      Restarts: 3,
      Namespace: 'ns1',
      RunningInstances: 0,
      PendingInstances: 1,
      Tags: {
      }
    },
  ],
  fakeFunctionInstances: [
    {ID: 1,
      UUID: 'feji32ojediosj',
      FunctionName: 'MyFunc1',
      Name: 'myfunc1',
      Trigger: 'http',
      InstanceTypeName: 's1.small',
      Owner: 'fake',         
      URL: 'http://localhost',
      InstanceNumber: 3,
      CreateAt: 1549601195,
      InternalEndpoints: ['mylab-abc1'],
      Restarts: 0,
      IngressPath: '/myfunc',
      FunctionRef: '/ref/myfun1',
      FunctionContextType: 'inline',
      FunctionContext: {
        Code: 'print("hello")',
        Requirement: '- echo',
        GitRepo: '',
        GitBranch: '',
        GitEntrypoint:'',
        ZipFileData: '',
        ZipFileName: '',
        ZipEntrypoint: '',
      },
      Namespace: 'ns1',
      RunningInstances: 2,
      PendingInstances: 1,
      Tags: {
        env: 'stg',
        app: 'fronent'
      }
    },
    {ID: 2,
      UUID: 'jfkdlfjskdlfjdslk',
      FunctionName: 'MyFunc2',
      Name: 'myfunc2',
      Trigger: 'event',
      InstanceTypeName: 's1.media',
      Owner: 'fake',         
      URL: '/function/myfunc2/utilities',
      InstanceNumber: 0,
      CreateAt: 1549701195,
      InternalEndpoints: [],
      Restarts: 0,
      IngressPath: '',
      FunctionRef: '/ref/myfun2',
      FunctionContextType: 'git',
      FunctionContext: {
        Code: '',
        Requirement: '',
        GitRepo: 'git://mygitrepo',
        GitBranch: 'master',
        GitEntrypoint:'test.sh',
        ZipFileData: '',
        ZipFileName: '',
        ZipEntrypoint: '',
      },
      Namespace: 'ns1',
      RunningInstances: 0,
      PendingInstances: 0,
      Tags: {
      },
    },  {ID: 3,
      UUID: 'ssssss',
      FunctionName: 'MyFunc2',
      Name: 'myfunc3',
      Trigger: 'event',
      InstanceTypeName: 's1.small',
      Owner: 'fake',         
      URL: '/function/myfunc3/utilities',
      InstanceNumber: 0,
      CreateAt: 1549701195,
      InternalEndpoints: [],
      Restarts: 0,
      IngressPath: '',
      FunctionRef: '/ref/myfun3',
      FunctionContextType: 'zip',
      FunctionContext: {
        Code: '',
        Requirement: '',
        GitRepo: '',
        GitBranch: '',
        GitEntrypoint:'',
        ZipFileData: '',
        ZipFileName: 'my.zip',
        ZipEntrypoint: 'test.py',
      },
      Namespace: 'ns1',
      RunningInstances: 0,
      PendingInstances: 0,
      Tags: {
      }
    }
  ],
  fakeFunctionJobs: [
    {
      ID: 1,
      JobID: 'job-myjob-abcd-1',
      UUID: 'jfkdlfjskdlfjdslk',
      InstanceName: 'myfunc2',
      Namespace: 'ns1',
      Owner: 'fake',
      CreateAt: 1552185716,
      FinishAt: 1552186040,
      Duration: 318,
      Status: 'Running',
      Parameters: '{"kk": 123}' 
    },
    {
      ID: 2,
      JobID: 'job-myjob-abcd-2',
      UUID: 'jfkdlfjskdlfjdslk',
      InstanceName: 'myfunc2',
      Namespace: 'ns1',
      Owner: 'fake',
      CreateAt: 1552186716,
      FinishAt: 1552196040,
      Duration: 1318,
      Status: 'Success',
      Parameters: '{}' 
    },
    {
      ID: 3,
      JobID: 'job-myjob-abcd-3',
      UUID: 'jfkdlfjskdlfjdslk',
      InstanceName: 'myfunc2',
      Namespace: 'ns1',
      Owner: 'fake',
      CreateAt: 1552186716,
      FinishAt: 0,
      Duration: 0,
      Status: 'Pending',
      Parameters: '{}' 
    }
  ],
  fakeLog: 'hello world',
  fakeAppInstanceTypeSettings: [
    {
      ID: 1, 
      Name: 's1.small',
      Description: '0.5 cpu X 512 MiB',
      Group: 'Standard',
      CPU: 0.5,
      GPU: 0,
      Memory: 512,
      MemoryScale: 'MiB'
    },
    {
      ID: 2, 
      Name: 's1.media',
      Description: '1 cpu X 1 GiB',
      Group: 'Standard',
      CPU: 1.0,
      GPU: 1,
      Memory: 1,
      MemoryScale: 'GiB'
    }
  ],
  fakeAppStorageSettings: [
    {ID: 1, Label: '10 GB', Value:10},
    {ID: 2, Label: '50 GB', Value:50},
    {ID: 3, Label: '100 GB', Value:100},
  ],
  // Fake Admin Data
  fakeAdmin: {
    Username: 'admin',
    Password: 'admin',
  },
  fakeClusterInfo: {
    CPUUsage: 80.0,
    CPUTotal: 100.0,
    MemoryUsage: 80.0,
    MemoryTotal: 200.0,
    GPUUsage: 1.0,
    GPUTotal: 2.0,
    Groups: [
      {
        Name: 'group1',
        Data: {        
          User: 18,
          JobRunning: 10,
          CPUUsage: 10.0,
          MemoryUsage: 40.0,
          GPUUsage: 1.0,
        }
      },
      {
        Name: 'group2',
        Data: {        
          User: 6,
          JobRunning: 3,
          CPUUsage: 3.0,
          MemoryUsage: 20.0,
          GPUUsage: 0.0,
        }
      }
    ],
    Namespaces:[
      {
        Name:'ns1',
        Data: {
          CPUUsage: 30.0,
          CPUTotal: 50.0,
          MemoryUsage: 30.0,
          MemoryTotal: 200.0,
          GPUUsage: 1.0,
          GPUTotal: 3.0,
        }
      },
      {
        Name:'ns2',
        Data: {
          CPUUsage: 20.0,
          CPUTotal: 100.0,
          MemoryUsage: 10.0,
          MemoryTotal: 250.0,
          GPUUsage: 0.0,
          GPUTotal: 0.0,
        }
      }
    ]
  },
  fakeDataLabSettings: [
    {
      ID:1, 
      Name: 'MyLab', 
      Description: 'test Lab', 
      LoadBalancer: 'dummy',
      Group: 'DSD',
      DeploymentTemplate:'dd', 
      ServiceTemplate:'ss', 
      IngressTemplate:'ii', 
      Public: false,
      AccessibleUsers: [
        'user1'
      ],
      AccessibleGroups: [
        'group1'
      ]
    },
    {
      ID:2, 
      Name: 'MyLab2', 
      Description: 'test Lab2', 
      LoadBalancer: 'dummy2',
      Group: '',
      DeploymentTemplate:'dd2', 
      ServiceTemplate:'ss2', 
      IngressTemplate:'ii2', 
      Public: true,
      AccessibleUsers: [],
      AccessibleGroups: []
    }
  ],
  fakeDataLabGroupSettings: [
    {ID: 1, Name: 'DSD'},
    {ID: 2, Name: 'Common'}
  ],
  fakeFunctionSettings: [
    {
      ID:1, 
      Name: 'MyFun1', 
      Description: 'test func', 
      ProgramLanguage: 'python', 
      Trigger:'http',
      LoadBalancer: 'dummy2',
      DefaultFunction:'hello world', 
      DefaultRequirement:'###', 
      DeploymentTemplate:'dd2', 
      ServiceTemplate:'ss2', 
      IngressTemplate:'ii2',
      Public: false,
      AccessibleUsers: [
        'user1'
      ],
      AccessibleGroups: [
        'group1'
      ]
    },
    {
      ID:2, 
      Name: 'MyFun2', 
      Description: 'test func', 
      ProgramLanguage: 'sh', 
      Trigger:'event', 
      DefaultFunction:'hello world2', 
      DefaultRequirement:'###2', 
      JobTemplate:'jjjj', 
      Public: true,
      AccessibleUsers: [],
      AccessibleGroups: []
    }
  ],
  fakeUserSettings: [
    {ID: 1, Username: 'user1', AuthType: 'LDAP', Password:'', Group: 'group1', Namespace: 'ns1'},
    {ID: 2, Username: 'user2', AuthType: 'Database', Password:'abc', Group: 'group2', Namespace: 'ns2'}
  ],
  fakeGroupSettings: [
    {ID: 1, Name: 'group1'},
    {ID: 2, Name: 'group2'}
  ],
  fakeInstanceTypeGroupSettings: [
    {ID: 1, Name: 'Standard'},
    {ID: 2, Name: 'Computing'}
  ],
  fakeInstanceTypeSettings: [
    {
      ID: 1, 
      Name: 's1.small',
      Description: '0.5 cpu X 512 MiB',
      Group: 'Standard',
      CPU: 0.5,
      GPU: 0,
      Memory: 512,
      MemoryScale: 'MiB',
      Public: false,
      AccessibleUsers: ['user1'],
      AccessibleGroups: [],
      Tags: {
        env: 'stg',
        app: 'fronent'
      }
    },
    {
      ID: 2, 
      Name: 's1.media',
      Description: '1 cpu X 1 GiB',
      Group: 'Standard',
      CPU: 1.0,
      GPU: 0,
      Memory: 1,
      MemoryScale: 'GiB',
      Public: true,
      AccessibleUsers: [],
      AccessibleGroups: [],
      Tags: {
      }
    }
  ],
  fakeStorageSettings: [
    {ID: 1, Label: '10 GB', Value:10},
    {ID: 2, Label: '50 GB', Value:50},
    {ID: 3, Label: '100 GB', Value:100},
  ]
}

export default fakeData