package main

import (
	"bufio"
	"fmt"
	"os"
	"time"
	"strings"
)

type FileSet []map[string]int

type Result struct {
	sentence map[string]FileSet
	fileSet  map[string]int
}

func main() {
	start := time.Now()
	files := os.Args[1:]
	//count := make(map[string]int)
	fileSet := make(map[string]int)
	result := &Result{sentence: make(map[string]FileSet), fileSet: fileSet}
	if len(files) == 0 {
		countLines(os.Stdin, /*count,*/ result)
	} else {
		for _, file := range files {
			pFile, err := os.Open(file)
			if err != nil {
				fmt.Fprintf(os.Stderr, "%v", err)
				continue
			}
			countLines(pFile, /*count,*/ result)
			result.fileSet = make(map[string]int)
			pFile.Close()
		}
	}
	fmt.Println("_____________________________________________________________________________________________________")
	fmt.Println("|                                            -=RESULTS=-                                            |")
	for sentence, value := range result.sentence {
		for _, bundle := range value {
			for key, item := range bundle {
				if len(key) > 22 {
					key = key[:22] + "..."
				}
				if len(sentence) > 22 {
					sentence = sentence[:22] + "..."
				}
				formatedKey := fmt.Sprintf("<<%-30v", key+">>")
				formatedSentence := fmt.Sprintf("<<%-25v", sentence+">>")
				formatedItem := fmt.Sprintf("%7v", item)
				if item > 1 {
					fmt.Printf("| Found duplicate in file %v%vCount: %v |\n", formatedSentence, formatedKey, formatedItem)
				}
			}
		}
	}
	fmt.Println("|___________________________________________________________________________________________________|")
	stop := time.Now()
	fmt.Println("\nElapsed time: ", stop.Sub(start))
	fmt.Println("Map len (Result.sentence):",len(result.sentence))
	fmt.Println("Map len (Result.fileSet):",len(result.fileSet))
	fmt.Println("Result object", result)
}

func countLines(f *os.File, /*count map[string]int,*/ result *Result) {
	input := bufio.NewScanner(f)
	for input.Scan() {
		word := strings.Trim(input.Text(), " ")
		if len(word) == 0 {
			continue
		} else {
			result.fileSet[word]++
		}
	}
	result.sentence[f.Name()] = append(result.sentence[f.Name()], result.fileSet)
	result.fileSet = nil
}
