package kubernetes

import (
	"fmt"
	"regexp"

	api "k8s.io/api/core/v1" //https://github.com/kubernetes/api/blob/master/core/v1/types.go
)

type PodMatcher struct {
	TargetID   string // TargetID will be UUID or JobID
	Type1Regex *regexp.Regexp
	Type2Regex *regexp.Regexp
}

func NewPodMatcher(TargetID string) *PodMatcher {

	return &PodMatcher{
		TargetID:   TargetID,
		Type1Regex: regexp.MustCompile(fmt.Sprintf("^%s-\\w+$", TargetID)),
		Type2Regex: regexp.MustCompile(fmt.Sprintf("^%s-\\w+-\\w+$", TargetID)),
	}
}

func (c *PodMatcher) MatchUUID(pod api.Pod) bool {
	// If length of TargetID >= 47
	// pod Name = TargetID-xxxxxx       : type1
	// else
	// pod Name = TargetID-xxxxxx-xxxxx : type2
	if len(c.TargetID) >= 47 {
		return c.Type1Regex.MatchString(pod.Name)
	} else {
		return c.Type2Regex.MatchString(pod.Name)
	}
}

func (c *PodMatcher) MatchJobID(pod api.Pod) bool {
	// pod Name = TargetID-xxxxx : type2
	return c.Type1Regex.MatchString(pod.Name)
}
