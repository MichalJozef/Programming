/**
 * Calendar - what day was it...?
 * Version 0.0.1
 * Author Michal Jozef
 * Only for purposes of job interviews
 */

import java.util.*;

public class Result extends java.util.GregorianCalendar {

    private static int year = 1980;
    private static int month = 12;
    private static int day = 14;

    private static void findDay(int year, int month, int day) throws Exception {

        month -= 1;

        Result calendar = new Result();
        calendar.clear();

        boolean isThirtyOneDayLong = (month == Result.JANUARY || month == Result.MARCH || month == Result.MAY || month == Result.JULY || month == Result.AUGUST || month == Result.OCTOBER || month == Result.DECEMBER);
        boolean isFebruary = (month == Result.FEBRUARY);
        boolean thirtyDays = (!isThirtyOneDayLong && !isFebruary);

        if (isFebruary && day > 28) {
            throw new Exception("Illegal number of days for a given month");
        }
        if (thirtyDays && day > 30) {
            throw new Exception("Illegal number of days for a given month");
        }
        if (!(year >= 1900 && year <= 3000)) {
            throw new Exception("Given year must be in scale from 2000 to 3000");
        }
        if (!(month > 0 && month < 12)) {
            throw new Exception("Given month out off scale");
        }

        calendar.set(year, month, day);
        calendar.complete();

        Map<Integer, String> weekDays = new HashMap<>(Result.DAY_OF_WEEK);
        weekDays.put(Result.SUNDAY, "SUNDAY");
        weekDays.put(Result.MONDAY, "MONDAY");
        weekDays.put(Result.TUESDAY, "TUESDAY");
        weekDays.put(Result.WEDNESDAY, "WEDNESDAY");
        weekDays.put(Result.THURSDAY, "THURSDAY");
        weekDays.put(Result.FRIDAY, "FRIDAY");
        weekDays.put(Result.SATURDAY, "SATURDAY");

        System.out.println("\n********************");
        System.out.println(weekDays.get(calendar.get(7)));
        System.out.println("********************");
    }

    public static void main(String[] args) throws Exception {
        findDay(year, month, day);
    }
}
