package main

import (
	student "student"

	"github.com/01-edu/go-tests/lib/challenge"
	"github.com/01-edu/go-tests/lib/random"
	"github.com/01-edu/go-tests/solutions"
)

func main() {
	prefixes := []string{"un", "re", "in", "im", "dis", "pre"}
	suffixes := []string{"able", "ible", "ness", "ment", "tion", "er", "ing", "ly"}

	lastword := prefixes[random.IntBetween(0, len(prefixes)-1)] + "random" + suffixes[random.IntBetween(0, len(suffixes)-1)]

	args := []struct {
		word     string
		prefixes []string
		suffixes []string
	}{
		{"unbelievable", prefixes, suffixes},
		{"redoing", prefixes, suffixes},
		{"impossible", prefixes, suffixes},
		{"happiness", prefixes, suffixes},
		{"preorder", prefixes, suffixes},
		{"convert", prefixes, suffixes},
		{"dismount", prefixes, suffixes},
		{"unlikely", prefixes, suffixes},
		{"starter", prefixes, suffixes},
		{lastword, prefixes, suffixes},
	}

	for _, arg := range args {
		challenge.Function("WordAnatomy", student.WordAnatomy, solutions.WordAnatomy, arg.word, arg.prefixes, arg.suffixes)
	}

}
