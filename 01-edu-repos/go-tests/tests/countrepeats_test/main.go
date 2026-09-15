package main

import (
	"strings"
	student "student"

	"github.com/01-edu/go-tests/lib/challenge"
	"github.com/01-edu/go-tests/lib/random"
	"github.com/01-edu/go-tests/solutions"
)

func main() {
	table := []string{
		"ABCABC",        // Expected: "ABCABC"
		"AAABBC",        // Expected: "A3B2C"
		"JjjJohhnnnNn",  // Expected: "Jj2Joh2n3Nn"
		"     ",         // Expected: " 5"
		" AAABBC ",      // Expected: " A3B2C "
		"",              // Expected: ""
		"A",             // Expected: "A"
		"AA",            // Expected: "A2"
		"AAAAAA",        // Expected: "A6"
		"123333",        // Expected: "1234"
		"aAbBCc",        // Expected: "aAbBCc"
		"!!@@##",        // Expected: "!2@2#2"
		"   AAA   ",     // Expected: " 3A3 3"
		"111ABC",        // Expected: "13ABC"
		"aaaBBBccc1111", // Expected: "a3B3c314"
	}
	characters := "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

	wordLength := random.IntBetween(5, 12)
	randomWord := ""
	for i := 0; i < wordLength; i++ {
		char := string(characters[random.IntBetween(0, len(characters)-1)])
		repeatChar := random.IntBetween(1, 7)
		randomWord += strings.Repeat(char, repeatChar)
	}
	table = append(table, randomWord)

	for _, s := range table {
		challenge.Function("CountRepeats", student.CountRepeats, solutions.CountRepeats, s)
	}
}
