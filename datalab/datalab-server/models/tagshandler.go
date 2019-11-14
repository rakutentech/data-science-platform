package models

import (
	"encoding/json"

	"github.com/astaxie/beego/logs"
)

type TagsHandlerManager struct {
	handler TagsHandler
}

func NewTagsHandlerManager(handler TagsHandler) *TagsHandlerManager {
	return &TagsHandlerManager{
		handler: handler,
	}
}

func (c *TagsHandlerManager) GetTags() *Tags {
	var tags Tags
	err := json.Unmarshal([]byte(c.handler.GetTagsJSON()), &tags)
	if err != nil {
		logs.Warn(err.Error())
	}
	return &tags
}

func (c *TagsHandlerManager) ConvertTagsToJSON(tags Tags) []byte {
	data, err := json.Marshal(tags)
	if err != nil {
		logs.Warn(err.Error())
	}
	return data
}
