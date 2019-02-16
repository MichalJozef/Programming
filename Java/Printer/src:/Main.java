package com.michaljozef;

public class Main {

    public static void main(String[] args) {

        Printer printer = new Printer(false);
        try {
            printer.print(6);
            printer.print(5);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        Printer printer1 = new Printer(false);
        try {
            printer1.print(4);
            printer1.print(5);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
