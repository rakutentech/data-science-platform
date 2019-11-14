package models

import (
	"crypto/md5"
	"fmt"
	"strings"
)

const (
	// Running key
	Running = "Running"
	// Pending key
	Pending = "Pending"
	// Failed key
	Failed = "Failed"
	// Unknown key
	Unknown = "Unknown"
	// Success key
	Success = "Success"
	// Killed key
	Killed = "Killed"
)

const (
	//RawFunctionContext FunctionRef meaning it will store function context and requirement to data path
	RawFunctionContext = "inline"
	//ZipFileFunctionContext FunctionRef meaning it will store zip file to data path
	ZipFileFunctionContext = "zip"
	// GitProjectFunctionContext FunctionRef meaning github proejct url
	GitProjectFunctionContext = "git"
)

const (
	DatabaseAuthenticator = "Database"
	LDAPAuthenticator     = "LDAP"
)

const (
	DataLabResource      = "DataLab"
	FunctionResource     = "Function"
	InstanceTypeResource = "InstanceType"
)

const (
	UserConstraint  = "User"
	GroupConstraint = "Group"
)

const (
	HTTPTrigger  = "http"
	EventTrigger = "event"
)

const (
	// DbSQLite - sqlite
	DbSQLite = "sqlite"
	// DbMySQL - mysql
	DbMySQL = "mysql"
)

type PermissionRoles struct {
	AccessibleUsers  []string
	AccessibleGroups []string
}

const (
	DeploymentTemplateName         = "deployment"
	ServiceTemplateName            = "service"
	IngressTemplateName            = "ingress"
	JobTemplateName                = "job"
	DefaultFunctionTemplateName    = "defaultFunction"
	DefaultRequirementTemplateName = "defaultRequirement"
)

type KubeDeploymentTemplate struct {
	DeploymentTemplate string
	ServiceTemplate    string
	IngressTemplate    string
}

type KubeJobTemplate struct {
	JobTemplate string
}

type DefaultContextTemplate struct {
	DefaultFunction    string
	DefaultRequirement string
}

// LabInstance table definition, https://beego.me/docs/mvc/model/models.md
type LabInstanceData struct {
	ID               int    `orm:"auto"`
	UUID             string `orm:"unique"`
	TypeName         string `orm:"column(type_name)" valid:"Required"`
	TypeGroup        string `orm:"column(type_group)" valid:"Required"`
	Name             string `valid:"Required;Match(/[a-z0-9-]{3,20}/)"`
	InstanceTypeName string `valid:"Required"`
	InstanceNumber   int
	EphemeralStorage int
	StorageScale     string
	Owner            string `orm:"index" valid:"Required"`
	CreateAt         int64
	Namespace        string
}

// multiple fields unique key
func (u *LabInstanceData) TableUnique() [][]string {
	return [][]string{
		[]string{"Name", "TypeName", "TypeGroup", "Owner"},
	}
}

type LabInstance struct {
	LabInstanceData
	LoadBalancer string
	TagsJSON     string
}
type FunctionInstanceData struct {
	ID                  int    `orm:"auto"`
	UUID                string `orm:"unique"`
	FunctionName        string `orm:"column(function_name)" valid:"Required"`
	Name                string `valid:"Required;Match(/[a-z0-9-]{3,20}/)"`
	InstanceTypeName    string `valid:"Required"`
	EphemeralStorage    int64
	StorageScale        string
	InstanceNumber      int    `valid:"Range(1, 255)"`
	Owner               string `orm:"index" valid:"Required"`
	CreateAt            int64
	Namespace           string
	IngressPath         string
	Trigger             string `valid:"Required"`
	FunctionContextType string
}

type FunctionInstance struct {
	FunctionInstanceData
	FunctionRef  string
	LoadBalancer string
	TagsJSON     string
}

// multiple fields unique key
func (u *FunctionInstance) TableUnique() [][]string {
	return [][]string{
		[]string{"Name", "Trigger", "Owner"},
	}
}

type LabSetting struct {
	ID           int    `orm:"auto"`
	Name         string `form:"name" valid:"Required;Match(/[a-zA-Z0-9-]{3,20}/)"`
	Group        string `form:"group"`
	Description  string `form:"description"`
	LoadBalancer string `form:"loadBalancer"`
	Public       bool   `form:"public"`
	TemplatePath string
}

// multiple fields unique key
func (u *LabSetting) TableUnique() [][]string {
	return [][]string{
		[]string{"Name", "Group"},
	}
}

type FunctionSetting struct {
	ID              int    `orm:"auto"`
	Name            string `orm:"unique" form:"functionName" valid:"Required;Match(/[a-z0-9-]{3,50}/)"`
	Description     string `form:"description"`
	ProgramLanguage string `form:"programLanguage" valid:"Required"`
	Trigger         string `form:"trigger" valid:"Required"`
	Public          bool   `form:"public"`
	LoadBalancer    string `form:"loadBalancer"`
	TemplatePath    string
}

type User struct {
	ID        int    `orm:"auto"`
	Username  string `orm:"unique" form:"username" valid:"Required"`
	AuthType  string `form:"authType"`
	Password  string `form:"password"`
	Group     string `form:"group"`
	Namespace string `form:"namespace"`
}

type DatalabGroup struct {
	ID   int    `orm:"auto"`
	Name string `orm:"unique" form:"datalabgroupname" valid:"Required"`
}

type InstanceGroup struct {
	ID   int    `orm:"auto"`
	Name string `orm:"unique" form:"instancegroupname" valid:"Required"`
}

type Group struct {
	ID   int    `orm:"auto"`
	Name string `orm:"unique" form:"groupname" valid:"Required"`
}

type Storage struct {
	ID    int    `orm:"auto"`
	Label string `orm:"unique" form:"storagename" valid:"Required"`
	Value int64  `form:"value"`
}

type Permission struct {
	ID             int    `orm:"auto"`
	ResourceType   string `valid:"Required"`
	ResourceName   string `valid:"Required"`
	ConstraintType string `valid:"Required"`
	ConstraintName string `valid:"Required"`
}

type JobInstance struct {
	ID               int    `orm:"auto"`
	JobID            string `orm:"index;column(job_id);unique"`
	InstanceName     string `orm:"index"`
	UUID             string `orm:"index" orm:"unique"`
	InstanceTypeName string
	Namespace        string
	Owner            string `orm:"index"`
	InstanceNumber   int
	CreateAt         int64
	FinishAt         int64
	Duration         float64
	Status           string
	Parameters       string `orm:"size(2048)"`
}

type Tags map[string]string

type InstanceTypeSetting struct {
	ID          int    `orm:"auto"`
	Name        string `orm:"index;unique" form:"name" valid:"Required"`
	Description string
	Group       string
	CPU         float64
	GPU         float64
	Memory      int64
	MemoryScale string
	Public      bool
}

type InstanceType struct {
	InstanceTypeSetting
	TagsJSON string
}

func (c *LabInstance) GetIngressPath() string {
	ingesskey := fmt.Sprintf("%s-%s-%s-%d", c.TypeGroup, c.TypeName, c.Name, c.CreateAt)
	return strings.ToLower(fmt.Sprintf("/labs/%s/%s", c.Owner, fmt.Sprintf("%x", md5.Sum([]byte(ingesskey)))))
}
func (c *FunctionInstance) GetIngressPath() string {
	return strings.ToLower(fmt.Sprintf("/%s%s", c.Owner, c.IngressPath))
}

type JobRequest struct {
	Args             []string          `json:"args,omitempty"`
	Env              map[string]string `json:"env,omitempty"`
	BeforeExecution  string            `json:"beforeExecution,omitempty"`
	Command          string            `json:"command,omitempty"`
	InstanceTypeName string            `json:"instanceTypeName,omitempty"`
}

type PermissionHandler interface {
	GetResourceType() string
	GetResourceName() string
	GetPublic() bool
}

type PodStatusHandler interface {
	GetPodKey() string
	GetPodNamespace() string
	GetPodExternalEndpoint() string
	GetPodNumber() int
	IsJob() bool
}

func (c *LabInstance) GetPodKey() string {
	return c.UUID
}

func (c *LabInstance) GetPodNamespace() string {
	return c.Namespace
}

func (c *LabInstance) GetPodExternalEndpoint() string {
	return c.LoadBalancer
}

func (c *LabInstance) GetPodNumber() int {
	return c.InstanceNumber
}

func (c *LabInstance) IsJob() bool {
	return false
}

func (c *FunctionInstance) GetPodKey() string {
	return c.UUID
}

func (c *FunctionInstance) GetPodNamespace() string {
	return c.Namespace
}

func (c *FunctionInstance) GetPodExternalEndpoint() string {
	if c.IsEventTrigger() {
		return fmt.Sprintf("/function/%s/utilities", c.Name)
	} else {
		return c.LoadBalancer
	}
}

func (c *FunctionInstance) GetPodNumber() int {
	return c.InstanceNumber
}

func (c *FunctionInstance) IsJob() bool {
	return c.IsEventTrigger()
}

func (c *LabSetting) GetResourceType() string {
	return DataLabResource
}
func (c *FunctionSetting) GetResourceType() string {
	return FunctionResource
}

func (c *InstanceType) GetResourceType() string {
	return InstanceTypeResource
}

func (c *LabSetting) GetResourceName() string {
	return fmt.Sprintf("%s-%s", c.Group, c.Name)
}
func (c *FunctionSetting) GetResourceName() string {
	return c.Name
}

func (c *InstanceType) GetResourceName() string {
	return c.Name
}

func (c *LabSetting) GetPublic() bool {
	return c.Public
}
func (c *FunctionSetting) GetPublic() bool {
	return c.Public
}

func (c *InstanceType) GetPublic() bool {
	return c.Public
}

type TagsHandler interface {
	GetTagsJSON() string
}

func (c *InstanceType) GetTagsJSON() string {
	return c.TagsJSON
}

func (c *LabInstance) GetTagsJSON() string {
	return c.TagsJSON
}

func (c *FunctionInstance) GetTagsJSON() string {
	return c.TagsJSON
}

type TemplatePathHandler interface {
	GetTemplatePath() string
}

func (c *LabSetting) GetTemplatePath() string {
	return strings.ToLower(fmt.Sprintf("%s/template/datalab/group-%s/%s", c.TemplatePath, c.Group, c.Name))
}
func (c *FunctionSetting) GetTemplatePath() string {
	return strings.ToLower(fmt.Sprintf("%s/template/function/trigger-%s/%s", c.TemplatePath, c.Trigger, c.Name))
}

// GetAPIPath /apis/$USER_NAME/$INSTANCE_NAME
func (c *FunctionInstance) GetAPIPath() string {
	return strings.ToLower(fmt.Sprintf("/apis/%s/%s", c.Owner, c.Name))
}

func (c *FunctionInstance) IsEventTrigger() bool {
	return c.Trigger == EventTrigger
}
