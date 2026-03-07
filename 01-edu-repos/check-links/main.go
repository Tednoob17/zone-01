package main

import (
	"log"
	"net/http"
	"os"
	"path"
	"regexp"
	"strings"
)

// TODO: should I use a Markdown parser?
func getLinks(cont []byte) []string {
	reLink := regexp.MustCompile(`\[.+\]\((\S+\(?\S+\)?)\)`)
	matches := reLink.FindAllStringSubmatch(string(cont), -1)
	var links []string
	for _, match := range matches {
		if len(match) > 1 {
			link := match[1]
			// TODO: have a general function to clean up hyperlink?
			if strings.HasPrefix(link, "<") && strings.HasSuffix(link, ">") {
				link = strings.TrimLeft(link, "<")
				link = strings.TrimRight(link, ">")
			}
			links = append(links, link)
			// TODO: create a filter to skip all the "known" exceptions
		}
	}
	return links
}

// Use HTTP inspired status code return for relative path as well
func checkLink(link string, filePath string) int {
	if strings.HasPrefix(link, "http") {
		res, err := http.Get(link)
		if err != nil {
			return 500
		}
		return res.StatusCode
	}
	linkAbsPath := path.Join(path.Dir(filePath), link)
	if _, err := os.Stat(linkAbsPath); err != nil {
		// Keep it simple: assume file is missing
		return 404
	}
	return 200
}

type LinkChecker struct {
	FilePath   string
	Link       string
	StatusCode int
}

func checkFilePath(filePath string) ([]LinkChecker, error) {
	cont, err := os.ReadFile(filePath)
	if err != nil {
		// TODO: is there a better way than printing out to handle err?
		// Should I stop for any reason?
		log.Printf("Error reading %s: %v", filePath, err)
		return nil, err
	}

	links := getLinks(cont)
	ch := make(chan map[string]int)
	for _, link := range links {
		go func(text string) {
			ch <- map[string]int{link: checkLink(link, filePath)}
		}(link)
	}

	var res []LinkChecker
	for range links {
		for link, status := range <-ch {
			res = append(res, LinkChecker{
				FilePath:   filePath,
				Link:       link,
				StatusCode: status,
			})
		}
	}
	return res, nil
}

func main() {
	input, ok := os.LookupEnv("INPUT_FILEPATH")
	if !ok {
		return
	}
	filePaths := strings.Split(input, " ")
	res := make(chan []LinkChecker)
	for _, filePath := range filePaths {
		go func(filepath string) {
			fileChecker, _ := checkFilePath(filepath)
			res <- fileChecker
		}(filePath)
	}
	brokenLinksCount := 0
	for range filePaths {
		for _, check := range <-res {
			if check.StatusCode != 200 {
				log.Printf("(%s): %s -> %d\n", check.FilePath, check.Link, check.StatusCode)
				brokenLinksCount++
			}
		}
	}
    if brokenLinksCount != 0 {
        log.Fatalf("Found %d broken links!", brokenLinksCount)
    }
}
