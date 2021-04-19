import java.util.*;

public class Pajko {
    public static void main(String args[]) {
        
      final int[][] map = new int[10][10];
      final int konope = 88;
      int pajko = 9;
      int moves = 10;

      System.out.printf("\nWelcome to Pajko!\n\n");
      System.out.printf("Running on: %s %s %s\n\n", System.getProperty("os.name"), System.getProperty("os.version"), System.getProperty("os.arch"));	
      System.out.printf("Programming language is Java (%s) version: %s %s %s\n\n", "\uD83C\uDF84", System.getProperty("java.specification.vendor"), System.getProperty("java.specification.name"), System.getProperty("java.specification.version"));
      
      for (int i = 0; i < 10; i++) {
          for (int j = 0; j < 10; j++) {
              map[i][j] = i * 10 + j;
              if (map[i][j] < 10) {
                 System.out.print(" " + map[i][j] + " ");
                 continue;
              }
              System.out.print(map[i][j] + " ");
          }
        System.out.print("\n");
      }
      
      System.out.print("\nKonope: " + konope + " || " + "Pajko: " + pajko + "\n");
      
      while (moves > 0) {
          
          if (pajko == konope) {
              System.out.println("\nLife is good ;-)");
              return;
          }
          
          int lineKonope = konope / 10;
          int columnKonope = konope % 10;
          int linePajko = pajko / 10;
          int columnPajko = pajko % 10;
          
          // move SE
          if (linePajko < lineKonope && columnPajko < columnKonope) {
              pajko = map[linePajko + 1][columnPajko + 1];
              moves--;
              System.out.println("Konope: " + konope + " || " + "Pajko: " + pajko);
              continue;
          // move SW    
          } else if (linePajko < lineKonope && columnPajko > columnKonope) {
              pajko = map[linePajko + 1][columnPajko - 1];
              moves--;
              System.out.println("Konope: " + konope + " || " + "Pajko: " + pajko);
              continue;
          // move S      
          } else if (linePajko < lineKonope && columnPajko == columnKonope) {
              pajko = map[linePajko + 1][columnPajko];
              moves--;
              System.out.println("Konope: " + konope + " || " + "Pajko: " + pajko);
              continue;
          // move W
          } else if (linePajko == lineKonope && columnPajko > columnKonope) {
              pajko = map[linePajko][columnPajko - 1];
              moves--;
              System.out.println("Konope: " + konope + " || " + "Pajko: " + pajko);
              continue;
          // move E
          } else if (linePajko == lineKonope && columnPajko < columnKonope) {
              pajko = map[linePajko][columnPajko + 1];
              moves--;
              System.out.println("Konope: " + konope + " || " + "Pajko: " + pajko);
              continue;
          // move N 
          } else if (linePajko > lineKonope && columnPajko == columnKonope) {
              pajko = map[linePajko - 1][columnPajko];
              moves--;
              System.out.println("Konope: " + konope + " || " + "Pajko: " + pajko);
              continue;
          // move NE
          } else if (linePajko > lineKonope && columnPajko < columnKonope) {
              pajko = map[linePajko - 1][columnPajko + 1];
              moves--;
              System.out.println("Konope: " + konope + " || " + "Pajko: " + pajko);
              continue;
          // move NW      
          } else if (linePajko > lineKonope && columnPajko > columnKonope) {
              pajko = map[linePajko - 1][columnPajko - 1];
              moves--;
              System.out.println("Konope: " + konope + " || " + "Pajko: " + pajko);
              continue;
          }
      }
      
      System.out.println("You are desperately lost ;-(");
      
    }
}
