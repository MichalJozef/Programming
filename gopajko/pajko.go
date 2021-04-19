package main

import (
	"fmt"
	"runtime"
)

const width int = 10
var pajko int = 17
var konope int = 85 
var moves int = 10

func main() {
	var s[width][width] int
	fmt.Printf("\nWelcome to Pajko!\n\n")
	fmt.Printf("Running on: %s %s\n\n", runtime.GOOS, runtime.GOARCH)
	fmt.Printf("Programming language is Go (%s) version: %s\n\n", "\U0001F988", runtime.Version())

	for i := 0; i < width; i++ {
		for j := 0; j < width; j++ {
			s[i][j] = i * 10 + j
			if i == 0 {
				fmt.Printf(" %d ", s[i][j])
			} else {
				fmt.Printf("%d ", s[i][j])
			}
		}
		fmt.Println()
	}
	fmt.Printf("\nKonope: %d || Pajko: %d\n", konope, pajko)
	for moves > 0 {
		if pajko == konope {
			fmt.Println("\nLife is good :-)")
			return
		}
		lineKonope := konope / 10
		columnKonope := konope % 10
		linePajko := pajko / 10
		columnPajko := pajko % 10
		
		// move SE
		if linePajko < lineKonope  && columnPajko < columnKonope {
			pajko = s[linePajko + 1][columnPajko + 1]
			moves--
			fmt.Println("Konope:", konope, "||", "Pajko:", pajko)
			continue
		}
		// move	SW
		if linePajko < lineKonope && columnPajko > columnKonope {
			pajko = s[linePajko + 1][columnPajko - 1]
			moves--
			fmt.Println("Konope:", konope, "||", "Pajko:", pajko)
			continue
		} 
		// move S
		if linePajko < lineKonope && columnPajko == columnKonope {
			pajko = s[linePajko + 1][columnPajko]
			moves--
			fmt.Println("Konope:", konope, "||", "Pajko:", pajko)
			continue
		}
		// move W
		if linePajko == lineKonope && columnPajko > columnKonope {
			pajko = s[linePajko][columnPajko - 1]
			moves--
			fmt.Println("Konope:", konope, "||", "Pajko:", pajko)
			continue
		}
		// move E
		if linePajko == lineKonope && columnPajko < columnKonope {
			pajko = s[linePajko][columnPajko + 1]
			moves--
			fmt.Println("Konope:", konope, "||", "Pajko:", pajko)
			continue
		}
		// move N
		if linePajko > lineKonope && columnPajko == columnKonope {
			pajko = s[linePajko - 1][columnPajko]
			moves--
			fmt.Println("Konope:", konope, "||", "Pajko:", pajko)
			continue
		}
		// move NE
		if linePajko > lineKonope && columnPajko < columnKonope {
			pajko = s[linePajko - 1][columnPajko + 1]
			moves--
			fmt.Println("Konope:", konope, "||", "Pajko:", pajko)
			continue
		}
		// move NW
		if linePajko > lineKonope && columnPajko > columnKonope {
			pajko = s[linePajko - 1][columnPajko - 1]
			moves--
			fmt.Println("Konope:", konope, "||", "Pajko:", pajko)
			continue
		}
	}
	fmt.Println("You are desperately lost :-(")
}
