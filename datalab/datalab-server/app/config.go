package app

import (
	"time"

	"github.com/astaxie/beego"
)

var globalConfig *AppConfig

func init() {
	globalConfig = NewConfig()
}

const (
	InCluster    = "inCluster"
	OutOfCluster = "outOfCluster"
	FakeCluster  = "fakeCluster"
)

// SetConfig is for get global AppConfig to help unit test
func SetConfig(config *AppConfig) {
	globalConfig = config
}

// GetConfig is for get global AppConfig
func GetConfig() *AppConfig {
	return globalConfig
}

func NewConfig() *AppConfig {
	config := new(AppConfig)
	config.DataPath = beego.AppConfig.DefaultString("datadir", "./data")
	config.TimeZone = beego.AppConfig.DefaultString("timezone", "Local")
	config.TokenKey = beego.AppConfig.DefaultString("token_key", "<TOKEN>") //REPLACE this TOKEN
	jobHistoryExpireString := beego.AppConfig.DefaultString("job_history_expire", "72h")
	expireDuration, err := time.ParseDuration(jobHistoryExpireString)
	if err == nil {
		config.JobHistoryExpire = expireDuration
	} else {
		config.JobHistoryExpire, _ = time.ParseDuration("72h")
	}
	config.DB = DatabaseConfig{
		DBType:       beego.AppConfig.DefaultString("dbtype", "sqlite"),
		MaxIdleConns: beego.AppConfig.DefaultInt("maxidleconns", 30),
		MaxOpenConns: beego.AppConfig.DefaultInt("maxopenconns", 30),
		Sqlite: SqliteConfig{
			Path: beego.AppConfig.DefaultString("dbpath", "./lab.db"),
		},
		MySQL: MySQLConfig{
			URL: beego.AppConfig.DefaultString("mysql_url", "Unkonwn"),
		},
	}

	config.Kube = KubernetesConfig{
		Mode: beego.AppConfig.DefaultString("kube_mode", InCluster),
	}
	config.Admin = AdminConfig{
		Name:     beego.AppConfig.DefaultString("admin_name", "admin"),
		Password: beego.AppConfig.DefaultString("admin_password", "admin"),
		Key:      beego.AppConfig.DefaultString("admin_key", "admin"),
		URLPath:  beego.AppConfig.DefaultString("adminpath", "/admin"),
	}
	config.User = UserLoginConfig{
		Key:              beego.AppConfig.DefaultString("user_key", "sdfdsfds"),
		LDAPServer:       beego.AppConfig.DefaultString("ldap_server", ""),
		LDAPPort:         beego.AppConfig.DefaultInt("ldap_port", 389),
		LDAPBindUser:     beego.AppConfig.DefaultString("ldap_bind_user", ""),
		LDAPBindPassword: beego.AppConfig.DefaultString("ldap_bind_password", ""),
		LDAPBaseDN:       beego.AppConfig.DefaultString("ldap_basedn", ""),
		LDAPFilterDN:     beego.AppConfig.DefaultString("ldap_filterdn", ""),
	}
	loginExpireString := beego.AppConfig.DefaultString("login_expire", "72h")
	expireDuration, err = time.ParseDuration(loginExpireString)
	if err == nil {
		config.User.LoginExpire = expireDuration
	} else {
		config.User.LoginExpire, _ = time.ParseDuration("1h")
	}
	config.Log = LogConfig{
		LogType:  beego.AppConfig.DefaultString("log_type", "console"),
		LogLevel: beego.AppConfig.DefaultString("log_level", "debug"),
		LogPath:  beego.AppConfig.DefaultString("log_path", "./datalab.log"),
	}
	return config
}

// AppConfig including whole application config such as k8s, datalab, admin, db
type AppConfig struct {
	DataPath         string
	TimeZone         string
	Admin            AdminConfig
	User             UserLoginConfig
	DB               DatabaseConfig
	Kube             KubernetesConfig
	Log              LogConfig
	TokenKey         string
	JobHistoryExpire time.Duration
}

type SqliteConfig struct {
	Path string
}

type MySQLConfig struct {
	URL string
}

type DatabaseConfig struct {
	DBType       string
	Sqlite       SqliteConfig
	MySQL        MySQLConfig
	MaxIdleConns int
	MaxOpenConns int
}

type KubernetesConfig struct {
	Mode string
}

type AdminConfig struct {
	URLPath  string
	Name     string
	Password string
	Key      string
}

type UserLoginConfig struct {
	Key              string
	LoginExpire      time.Duration
	LDAPServer       string
	LDAPPort         int
	LDAPBindUser     string
	LDAPBindPassword string
	LDAPBaseDN       string
	LDAPFilterDN     string
}

type LogConfig struct {
	LogType  string
	LogLevel string
	LogPath  string
}
