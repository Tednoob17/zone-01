package main

import (
	"fmt"
	"reflect"
	"testing"
)

var getLinksTestCases = []struct {
	Cont []byte
	Exp  []string
}{
	{
		[]byte(`# title here 

asdf
asdf
sadf
asdfasdfsadf


asdfdasf asdfasdf

In the text check [http://something1](http://something) and what else.

And here you go [a file](./some/where/inside).

[A valid link](https://google.com) somewhere 

... `), []string{
			"http://something",
			"./some/where/inside",
			"https://google.com",
		},
	},
	{
		[]byte(`....
http://bing.com

And a [link](https://bing-link.com) somewhere in the text.

[an image here](./dir/images/img1.png) and go.

And [another link](dir/images/img1.png) and go. `),
		[]string{
			"https://bing-link.com",
			"./dir/images/img1.png",
			"dir/images/img1.png",
		},
	},
}

func TestGetLinks(t *testing.T) {
	for i, tc := range getLinksTestCases {
		t.Run(fmt.Sprintf("test case %d", i), func(t *testing.T) {
			got := getLinks(tc.Cont)
			if !reflect.DeepEqual(got, tc.Exp) {
				t.Fatalf("\ngot: %#v\nexp: %#v", got, tc.Exp)
			}
		})
	}
}
