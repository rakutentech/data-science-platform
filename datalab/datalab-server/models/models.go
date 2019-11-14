package models

import (
	"fmt"
	"os"
	"reflect"

	"github.com/rakutentech/data-science-platform/datalab/datalab-server/app"
	"github.com/astaxie/beego/logs"
	"github.com/astaxie/beego/orm"
)

func init() {
	// When test mode, skip init db
	if os.Getenv("TEST_LAB_MODE") != "1" {
		factory := NewDBFactory(app.GetConfig())
		factory.Init()
	}
}

// ModelManager is used for controling database
type ModelManager struct {
	o     orm.Ormer
	table string
}

// NewModelManager is for contorling db instance
func NewModelManager(model interface{}) *ModelManager {
	m := new(ModelManager)
	m.table = reflect.TypeOf(model).Name()
	return m
}

// GetOrm ... get ORM object
func (m *ModelManager) GetOrm() orm.Ormer {
	if m.o == nil {
		m.o = orm.NewOrm()
	}
	return m.o
}

// All will return a list of struct
func (m *ModelManager) All(instances interface{}) {
	o := m.GetOrm()
	//https://github.com/astaxie/beego/issues/3622
	// Hotfix: Unexpected limit=1000, waiting for new beego version
	_, err := o.QueryTable(m.table).Limit(-1).All(instances)
	if err != nil {
		logs.Warn("%s", err.Error())
	}
}

// FindInstances will find a list of instance
func (m *ModelManager) FindInstances(conditions map[string]interface{}, instances interface{}) {
	o := m.GetOrm()
	qs := o.QueryTable(m.table)
	for k, v := range conditions {
		qs = qs.Filter(k, v)
	}

	//https://github.com/astaxie/beego/issues/3622
	// Hotfix: Unexpected limit=1000, waiting for new beego version
	_, err := qs.Limit(-1).All(instances)
	if err != nil {
		logs.Warn("%s", err.Error())
	}
}

// FindOne will find a instance
func (m *ModelManager) FindOne(conditions map[string]interface{}, instance interface{}) (err error) {
	o := m.GetOrm()
	qs := o.QueryTable(m.table)
	for k, v := range conditions {
		qs = qs.Filter(k, v)
	}
	err = qs.One(instance)
	if err != nil {
		logs.Warn("%s", err.Error())
	}
	return err
}

// Count will counting instances
func (m *ModelManager) Count() int64 {
	o := m.GetOrm()
	cnt, err := o.QueryTable(m.table).Count()
	if err != nil {
		logs.Warn("%s", err.Error())
	}
	return cnt
}

// Create will create a db row
func (m *ModelManager) Create(instance interface{}) error {
	o := m.GetOrm()

	_, err := o.Insert(instance)
	if err != nil {
		logs.Warn("%s", err.Error())
	}
	return err
}

// Update will update a db row
func (m *ModelManager) Update(instance interface{}) error {
	o := m.GetOrm()

	_, err := o.Update(instance)
	if err != nil {
		logs.Warn("%s", err.Error())
	}
	return err
}

// Delete will delete a db row
func (m *ModelManager) Delete(instance interface{}) error {
	o := m.GetOrm()
	if _, err := o.Delete(instance); err != nil {
		return err
	}
	return nil
}

// FindInstanceByID is find a db row by Id
func (m *ModelManager) FindInstanceByID(id interface{}, instance interface{}) error {
	o := m.GetOrm()
	qs := o.QueryTable(m.table)
	qs = qs.Filter("ID", id)
	err := qs.One(instance)
	if err != nil {
		logs.Warn("%s", err.Error())
	}
	return err
}

// FindInstanceByName is find a db row by Id
func (m *ModelManager) FindInstanceByName(name interface{}, instance interface{}) error {
	o := m.GetOrm()
	qs := o.QueryTable(m.table)
	qs = qs.Filter("Name", name)
	err := qs.One(instance)
	if err != nil {
		logs.Warn("%s", err.Error())
	}
	return err
}

func (m *ModelManager) DeleteWhere(table, conditionString string) error {
	o := m.GetOrm()
	_, err := o.Raw(fmt.Sprintf("DELETE FROM %s WHERE %s", table, conditionString)).Exec()
	return err
}
