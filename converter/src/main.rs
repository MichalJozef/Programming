use std::io;

fn main() {
    println!("\nWelcome to awesome The Converter!");
    println!("----------------------------------------------\n");
    println!("The Converter interchangeably calculates Fahrenheit temperatures to Celsius temperatures and vice versa.\n");
    println!("Usage: <integral number, unit>");
    println!("Integral number --> any number within degrees scale");
    println!("Unit --> 'c' for Celsius or 'f' for Fahrenheit");
    println!("Example input: 13, c --> converts 13 degrees Celsius to Fahrenheit");
    println!("For quit press 'q' or 'Q' and hit enter\n\n");
    println!("Please, insert your value and unit:\n");

    loop {
        let mut input = String::new();
        io::stdin().read_line(&mut input).expect("Failed to read");
        if input.to_lowercase().trim() == "q" {
            println!("\nBye Bye 👋");
            break
        }
        let delimiter =  match input.find(',') {
            Option::None => {
                println!("\nPlease, delimit your input with comma -> format <number, unit>\n");
                continue;
            },
            Option::Some(num) => num,
        };

        let (temperature, unit)= input.split_at(delimiter);
        let temperature = match temperature.trim().parse::<i32>() {
            Ok(num) => num,
            Err(_) => {
                println!("\nPlease, do not misbehave –> format <number, unit> exp. \n");
                println!("Example input: 13, c --> converts 13 degrees Celsius to Fahrenheit\n");
                continue;
            }
        };
        let unit = unit.to_lowercase().replace(',', "");
        let unit = unit.trim();
        match unit {
            "c" => {
                celsius_to_fahrenheit(temperature);
                println!("\nPlease input new values or press 'q' to quit\n");
                continue
            },
            "f" => {
                fahrenheit_to_celsius(temperature);
                println!("Please input new values or press 'q' to quit\n");
                continue
            }
            _ => {
                println!("\nPlease, do not misbehave –> format <number, unit>");
                println!("Example input: 13, c --> converts 13 degrees Celsius to Fahrenheit\n");
                continue
            }
        }
    }
}

fn fahrenheit_to_celsius(temperature: i32) {
    let result = (temperature - 32) * 5/9;
    println!("\n************************************************************");
    println!("* {} degrees of Fahrenheit equals to {} degrees of Celsius *", temperature, result);
    println!("************************************************************\n");
}

fn celsius_to_fahrenheit(temperature: i32) {
    let result = temperature * 9/5 + 32;
    println!("\n************************************************************");
    println!("* {} degrees of Celsius equals to {} degrees of Fahrenheit *", temperature, result);
    println!("************************************************************\n")
}
