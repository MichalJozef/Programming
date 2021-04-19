package converter;

import java.io.File;
import java.io.FileNotFoundException;
import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;
import java.util.Map;
import java.util.LinkedHashMap;

public class Main {

    private enum FileFormat {
        SIMPLE_JSON, COMPLEX_JSON, SIMPLE_XML, COMPLEX_XML, UNKNOWN
    }

    private static String simpleJSON(List<String> input) {
        String temp = input.get(0);
        int indexOfQuotesForElement = temp.indexOf('"');
        String element = temp.substring(indexOfQuotesForElement + 1, temp.indexOf('\"', indexOfQuotesForElement + 1));
        int indexOfQuotesForValue = temp.indexOf('\"', temp.indexOf(':'));
        String value = temp.substring(indexOfQuotesForValue + 1, temp.indexOf('\"', indexOfQuotesForValue + 1));
        return "<" + element + ">" + value + "</" + element + ">";
    }

    private static String complexJSON(List<String> input) {
        LinkedHashMap<String, String> attributes = new LinkedHashMap<>();
        String elementValue = "";
        final String element = input.get(1).trim().substring(1, input.get(1).trim().lastIndexOf('\"'));
        for (String str: input) {
            if (str.trim().contains("@")) {
                final String attributeValue = str.substring(str.indexOf(':') + 1, str.indexOf(',')).replace("\"", "");
                final String attribute = str.trim().substring(2, str.trim().indexOf('\"', 3));
                attributes.put(attribute.trim() + " = ", attributeValue.trim());
            } else if (str.trim().contains("null")) {
                elementValue = "null";
            } else if (str.trim().contains("#")) {
                elementValue = str.substring(str.indexOf('\"', str.indexOf(':')) + 1, str.lastIndexOf('\"'));
            }
        }
        StringBuilder result = new StringBuilder();
        result.append("<").append(element).append(" ");
        for (Map.Entry<String, String> set: attributes.entrySet()) {
            result.append(set.getKey()).append("\"").append(set.getValue()).append("\" ");
        }

        if (elementValue.equals("null")) {
            result.append("/>");
            return new String(result);
        } else {
            result.append(">").append(elementValue).append("</").append(element).append(">");
            return new String(result).replace(" >", ">");
        }
    }

    private static String simpleXML(List<String> input) {
        return input.get(0)
                .trim()
                .substring(0, input.get(0).indexOf('/') - 1)
                .replace("<", "{\"")
                .replace(">", "\":\"")
                + "\"}";
    }
    private static String complexXML(List<String> input) {
        if (input.get(0).contains("/>")) {
            String[] splitInput = input.get(0).trim().split(" ");
            String element = splitInput[0].substring(1);
            StringBuilder result = new StringBuilder();
            List<String> attributes = new ArrayList<>();
            List<String> attributeValues = new ArrayList<>();
            for (String attribute : splitInput) {
                if (attribute.matches("^\\w+")) {
                    attributes.add(attribute);
                }
                if (attribute.matches("\"\\w+\"")) {
                    attributeValues.add(attribute);
                }
            }
            if (attributes.size() == attributeValues.size()) {
                result.append("{\n\t\"")
                        .append(element)
                        .append("\" : {\n\t\t");
                for (int i = 0; i < attributes.size(); i++) {
                    result.append("\"@")
                            .append(attributes.get(i))
                            .append("\" : ")
                            .append(attributeValues.get(i))
                            .append(",\n\t\t");
                }
                result.append("\"#")
                        .append(element)
                        .append("\" : null\n\t}\n}");
                return result.toString();
            }
        } else {
            String elementValue = input.get(0).trim()
                    .substring(input.get(0).indexOf('>') + 1 , input.get(0).indexOf('/') - 1);
            String shorterInput = input.get(0).trim().substring(0, input.get(0).indexOf('>'));
            String[] splitInput = shorterInput.split(" ");
            String element = splitInput[0].substring(1);
            StringBuilder result = new StringBuilder();
            List<String> attributes = new ArrayList<>();
            List<String> attributeValues = new ArrayList<>();
            for (String attribute : splitInput) {
                if (attribute.matches("^\\w+")) {
                    attributes.add(attribute);
                }
                if (attribute.matches("\"\\w+\"")) {
                    attributeValues.add(attribute);
                }
            }
            if (attributes.size() == attributeValues.size()) {
                result.append("{\n\t\"")
                        .append(element)
                        .append("\" : {\n\t\t");
                for (int i = 0; i < attributes.size(); i++) {
                    result.append("\"@")
                            .append(attributes.get(i))
                            .append("\" : ")
                            .append(attributeValues.get(i))
                            .append(",\n\t\t");
                }
                result.append("\"#")
                        .append(element)
                        .append("\" : \"")
                        .append(elementValue)
                        .append("\"\n\t}\n}");
                return result.toString();
            }
        }
        return "Not properly formatted input for XLM to JSON provided";
    }

    private static String converter(FileFormat fileFormat, List<String> input) {
        switch (fileFormat) {
            case SIMPLE_JSON: return simpleJSON(input);
            case SIMPLE_XML: return simpleXML(input);
            case COMPLEX_JSON: return complexJSON(input);
            case COMPLEX_XML: return complexXML(input);
            case UNKNOWN: return "Not properly formatted input provided";
            default: return "¯\\_(ツ)_/¯";
        }
    }

    public static void main(String[] args) {

        final FileFormat fileFormat;

        final List<String> toByConvertedInput = new ArrayList<>();

        try (final Scanner scanner = new Scanner(new File("test.txt"))) {

            String line = scanner.nextLine();

            if (line.trim().startsWith("{\"") && line.trim().endsWith("\"}")) {
                fileFormat = FileFormat.SIMPLE_JSON;
            } else if (line.trim().startsWith("{")) {
                fileFormat = FileFormat.COMPLEX_JSON;
            } else if (line.trim().startsWith("<") && line.trim().contains("\"")) {
                fileFormat = FileFormat.COMPLEX_XML;
            } else if (line.trim().startsWith("<")) {
                fileFormat = FileFormat.SIMPLE_XML;
            } else {
                fileFormat = FileFormat.UNKNOWN;
            }

            toByConvertedInput.add(line);

            while (scanner.hasNext()) {
                toByConvertedInput.add(scanner.nextLine());
            }

            String result = converter(fileFormat, toByConvertedInput);

            System.out.println(result);

        } catch (FileNotFoundException fe) {
            System.out.println("Missing file " + fe);
        }
    }
}
