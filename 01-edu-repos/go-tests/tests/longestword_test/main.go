package main

import (
	"math/rand"
	student "student"

	"github.com/01-edu/go-tests/lib/challenge"
	"github.com/01-edu/go-tests/solutions"
)

func main() {
	args := []string{
		"GO programming is fun",
		"",
		"Hello world",
		"Lorem ipsum dolor sit amet",
		"      spaced    out   words   ",
		"123 4567 89",
		"symbols! @#$%^&*() word",
		"a b c d e f g h i j",
		"multiple    spaces   between    words",
		"word1 word2 word3word4",
		"   leading and trailing spaces   ",
		"UPPER lower MIXEDcase",
		"    ", "",
		"!@#$%^&*()_+",
		"abc defghijklmnopqrstuvwxyz",
		"symbols! @#$%^&*() word",
	}

	randomChars := "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789&é'(-è_)çà}@^`|[{#~}] "
	randomString := ""

	for i := 0; i < 20; i++ {
		randomString += string(randomChars[rand.Intn(len(randomChars))])
	}

	args = append(args, randomString)

	for _, arg := range args {
		challenge.Function("LongestWord", solutions.LongestWord, student.LongestWord, arg)
	}
}
