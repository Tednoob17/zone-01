package solutions

import (
	"strings"
	"unicode"
)

func isValidWord(word string) bool {
	if word == "" {
		return false
	}

	last := rune(word[len(word)-1])
	if strings.ContainsRune(".,!?;:", last) {
		word = word[:len(word)-1]
		if word == "" {
			return false
		}
	}

	firstRune := []rune(word)[0]
	if !unicode.IsLetter(firstRune) {
		return false
	}

	for _, r := range word {
		if !unicode.IsLetter(r) {
			return false
		}
	}

	return true
}

func LongestWord(s string) string {
	words := strings.Fields(s)
	longest := ""

	for _, w := range words {
		if isValidWord(w) {
			if len([]rune(w)) > len([]rune(longest)) {
				longest = w
			}
		}
	}

	return longest
}
