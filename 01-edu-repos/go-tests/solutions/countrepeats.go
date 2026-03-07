package solutions

import (
	"strconv"
)

func CountRepeats(s string) string {
	if s == "" {
		return s
	}

	var result string
	var counter = 1

	for i := 0; i < len(s); i++ {
		if i+1 < len(s) && string(s[i]) == string(s[i+1]) {
			counter++
		} else {
			result += string(s[i])
			if counter > 1 {
				result += strconv.Itoa(counter)
			}
			counter = 1
		}
	}
	return result
}
