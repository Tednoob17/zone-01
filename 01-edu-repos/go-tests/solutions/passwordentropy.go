package solutions

import (
	"math"
	"unicode"
)

func Entropy(password string) float64 {
	const (
		lowerBit = 1 << iota
		upperBit
		digitBit
		specialBit
	)

	used := 0
	poolSize := 0.0

	for _, r := range password {
		if used&lowerBit == 0 && unicode.IsLower(r) {
			used |= lowerBit
			poolSize += 26
		} else if used&upperBit == 0 && unicode.IsUpper(r) {
			used |= upperBit
			poolSize += 26
		} else if used&digitBit == 0 && unicode.IsDigit(r) {
			used |= digitBit
			poolSize += 10
		} else if used&specialBit == 0 && !unicode.IsLetter(r) && !unicode.IsDigit(r) {
			used |= specialBit
			poolSize += 32
		}

		if used == lowerBit|upperBit|digitBit|specialBit {
			break
		}
	}

	if poolSize == 0 {
		return 0
	}

	return float64(len(password)) * math.Log2(poolSize)
}
