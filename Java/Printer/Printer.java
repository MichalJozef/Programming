/**
 * Simple printing programm
 * Version 0.0.1
 * Author Michal Jozef
 * Only for purposes of job interviews
 */

package com.michaljozef;


import org.jetbrains.annotations.Contract;

class Printer {

    private static double tonerLevel = 100;
    private static int numOfPages = 0;
    private boolean isDuplex;

    Printer(boolean isDuplex) {
        this.isDuplex = isDuplex;
    }

    void getValues() {
        System.out.printf("%.2f%n", tonerLevel);
        System.out.println(numOfPages);
        System.out.println(isDuplex);
        System.out.println(" ");
    }

    @Contract(pure = true)
    private double getTonerLevel() {
        return tonerLevel;
    }

    void print(int page) throws InterruptedException {
        if (page < 1) {
            System.err.println("Number of pages must be greater than 0");
            System.exit(-1);
        }

        if (page == 1) {
            Thread.sleep(1000);
            numOfPages += page;
            tonerLevel -= 0.01;
            System.out.println("1 page was printed...");
        } else {
            System.out.println("Printing " + page + " pages...");
            Thread.sleep(2000);
            for (int i = 1; i <= page; i++) {
                if (i == 1) {
                    Thread.sleep(1000);
                    numOfPages += 1;
                    tonerLevel -= 0.01;
                    System.out.println(i + " page was printed...");
                    continue;
                }
                Thread.sleep(1000);
                numOfPages += 1;
                tonerLevel -= 0.01;
                System.out.println(i + " pages were printed...");
            }
            System.out.println(" ");
            System.out.println("Total " + page + " pages were printed!");
        }
        System.out.printf("Toner level: %.2f%%%n", getTonerLevel());
        System.out.println("Total number of printed pages: " + numOfPages);
        System.out.println(" ");
    }
}
