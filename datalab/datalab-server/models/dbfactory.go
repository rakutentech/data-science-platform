package models

import (
	"github.com/rakutentech/data-science-platform/datalab/datalab-server/app"
	"github.com/astaxie/beego/orm"
	_ "github.com/go-sql-driver/mysql"
	_ "github.com/mattn/go-sqlite3"
)

// DBFactory is a interface for database usage
type DBFactory interface {
	Init()
}

// SqliteFactory is a real struct of DBFactory
type SqliteFactory struct {
	config *app.AppConfig
}

// MysqlFactory is a real struct of DBFactory
type MysqlFactory struct {
	config *app.AppConfig
}

func registerModels() {
	orm.RegisterModel(new(LabSetting))
	orm.RegisterModel(new(FunctionSetting))
	orm.RegisterModel(new(InstanceType))
	orm.RegisterModel(new(User))
	orm.RegisterModel(new(Permission))
	orm.RegisterModel(new(Storage))
	orm.RegisterModel(new(Group))
	orm.RegisterModel(new(DatalabGroup))
	orm.RegisterModel(new(InstanceGroup))
	orm.RegisterModel(new(LabInstance))
	orm.RegisterModel(new(FunctionInstance))
	orm.RegisterModel(new(JobInstance))
}

func (f *SqliteFactory) Init() {
	orm.RegisterDriver("sqlite", orm.DRSqlite)
	aliasName := "default" //ORM must register a database with alias default
	dbPath := f.config.DB.Sqlite.Path
	orm.RegisterDataBase(aliasName, "sqlite3", dbPath)
	orm.SetMaxIdleConns(aliasName, f.config.DB.MaxIdleConns)
	orm.SetMaxOpenConns(aliasName, f.config.DB.MaxOpenConns)
	err := orm.RunSyncdb(aliasName, false, true)
	if err != nil {
		panic(err)
	}
}

func (f *MysqlFactory) Init() {
	orm.RegisterDriver("mysql", orm.DRMySQL)
	aliasName := "default" //ORM must register a database with alias default
	mysqlURL := f.config.DB.MySQL.URL
	orm.RegisterDataBase(
		aliasName,
		"mysql",
		mysqlURL,
		f.config.DB.MaxIdleConns,
		f.config.DB.MaxOpenConns,
	)
	err := orm.RunSyncdb(aliasName, false, true)
	if err != nil {
		panic(err)
	}
}

// NewDBFactory create a dbfactory by name
func NewDBFactory(config *app.AppConfig) (factory DBFactory) {
	registerModels()
	if config.DB.DBType == DbMySQL {
		factory = &MysqlFactory{
			config: config,
		}
	} else if config.DB.DBType == DbSQLite {
		factory = &SqliteFactory{
			config: config,
		}
	} else {
		panic("Undefined db setting")
	}
	return
}
