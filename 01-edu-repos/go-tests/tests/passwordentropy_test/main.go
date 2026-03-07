package main

import (
	student "student"

	"github.com/01-edu/go-tests/lib/challenge"
	"github.com/01-edu/go-tests/lib/random"
	"github.com/01-edu/go-tests/solutions"
)

func main() {
	fullCharset := "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[]{}|:;,.<>?/\\"

	testCases := []string{
		"",
		"abc",
		"ABC",
		"123",
		"!@#",
		"aA1!",
		"SuperStrongP@ss123!",
		"password",
		"PASSWORD123!",
		"0000",
		random.Str(fullCharset, random.IntBetween(10, 30)),
	}

	for _, input := range testCases {
		challenge.Function("Entropy", student.Entropy, solutions.Entropy, input)
	}
}
