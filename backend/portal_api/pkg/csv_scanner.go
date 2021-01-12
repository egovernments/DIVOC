package pkg

import (
	"encoding/csv"
	"sort"
	"strconv"
	"strings"
)
import "io"

type Scanner struct {
	Reader *csv.Reader
	Head   map[string]int
	Row    []string
}

func NewScanner(o io.Reader) Scanner {
	csv_o := csv.NewReader(o)
	header, e := csv_o.Read()
	if e != nil {
		return Scanner{}
	}
	m := map[string]int{}
	for n, s := range header {
		m[strings.TrimSpace(s)] = n
	}
	return Scanner{Reader: csv_o, Head: m}
}

func (o *Scanner) Scan() bool {
	a, e := o.Reader.Read()
	o.Row = a
	return e == nil
}

func (o Scanner) Text(s string) string {
	if key, ok := o.Head[s]; ok {
		return o.Row[key]
	}
	return ""
}

func (o Scanner) int64(s string) int64 {
	number, err := strconv.ParseInt(o.Row[o.Head[s]], 10, 64)
	if err != nil {
		return 0 //todo handle parsing error
	}
	return number
}

// Headers Returns the headers of csv as array of string
func (o Scanner) GetHeaders() []string {
	sortByValueList := GetHeaderSorted(o.Head)

	keys := make([]string, 0, len(o.Head))
	for _, value := range sortByValueList {
		keys = append(keys, value.Key)
	}
	return keys
}

type KV struct {
	Key   string
	Value int
}

func GetHeaderSorted(headers map[string]int) []KV {
	var sortByValueList []KV
	for k, v := range headers {
		sortByValueList = append(sortByValueList, KV{k, v})
	}
	sort.Slice(sortByValueList, func(i, j int) bool {
		return sortByValueList[i].Value < sortByValueList[j].Value
	})
	return sortByValueList
}
