package log

import (
	"encoding/json"
	"os"
	"runtime"
	"runtime/debug"
	"strconv"
	"sync"
)

// Output is exported so that stdout can be synchronized with external printing functions
var Output sync.Mutex

// JSON encodes & print v on stdout as a JSON Lines object. Encodes :
//   - nil as {}
//   - string as {"Message":string}
//   - error as {"Message":error.Error(),"Error":error}
//   - non-object serializable type :
//     - {"Item":v}
//   - object serializable type :
//     - v
// Its also adds a field "File" that is "path/to/file.go:line" of the caller, but can be overridden.
func JSON(v interface{}) {
	Output.Lock()
	defer Output.Unlock()
	obj := map[string]interface{}{}
	if _, file, line, ok := runtime.Caller(1); ok {
		obj["File"] = file + ":" + strconv.Itoa(line)
	}
	switch item := v.(type) {
	case nil:
	case string:
		obj["Message"] = item
	case error:
		obj["Message"] = item.Error()
		obj["Error"] = item
	default:
		b, err := json.Marshal(item)
		if err != nil {
			panic(err)
		}
		// Is item is not serializable as a JSON object, put it in a field
		if json.Unmarshal(b, &obj) != nil {
			obj["Item"] = item
		}
	}
	if err := json.NewEncoder(os.Stdout).Encode(obj); err != nil {
		panic(err)
	}
}

// Recover recovers panics and write a JSON Lines formatted entry
// Use it like this :
// func main() { // or func handler(w http.ResponseWriter, r *http.Request) {
//     defer log.Recover()
func Recover() {
	if r := recover(); r != nil {
		Output.Lock()
		if err, ok := r.(error); ok {
			json.NewEncoder(os.Stdout).Encode(struct {
				Message string
				Error   error
				Stack   string
			}{err.Error(), err, string(debug.Stack())})
		} else {
			json.NewEncoder(os.Stdout).Encode(struct {
				Error interface{}
				Stack string
			}{r, string(debug.Stack())})
		}
		Output.Unlock()
		os.Exit(1)
	}
}
