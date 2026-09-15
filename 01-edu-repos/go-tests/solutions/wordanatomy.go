package solutions

func WordAnatomy(initialWord string, prefixArray []string, suffixArray []string) string {
	matchedPrefix := ""
	matchedSuffix := ""

	for _, prefix := range prefixArray {
		if hasPrefix(initialWord, prefix) {
			matchedPrefix = prefix
			break
		}
	}
	for _, suffix := range suffixArray {
		if hasSuffix(initialWord, suffix) {
			matchedSuffix = suffix
			break
		}
	}

	return "prefix: " + matchedPrefix + "," + " suffix: " + matchedSuffix
}

func hasPrefix(initialWord, prefix string) bool {
	if len(prefix) > len(initialWord) {
		return false
	}

	return initialWord[:len(prefix)] == prefix
}

func hasSuffix(initialWord, suffix string) bool {
	if len(suffix) > len(initialWord) {
		return false
	}

	return initialWord[len(initialWord)-len(suffix):] == suffix
}
