use std::io;

fn main() {
    println!("\nFor quit press 'q' or 'Q' and hit enter.");
    println!("Please, input n-th number of Fibonacci sequence:\n");
    loop {
        let mut user_input = String::new();
        io::stdin().read_line(&mut user_input).expect("Failed to read the user input!");
        if user_input.to_lowercase().trim() == "q" { break }
        let user_input = match user_input.trim().parse::<u32>() {
            Ok(number) => number,
            Err(_) => {
                println!("\nPlease, input n-th number of Fibonacci sequence:\n");
                continue;
            }
        };
        println!("\nThe {}-th number of Fibonacci series is {}\n", user_input, fib(user_input));
        println!("For quit press 'q' or 'Q' and hit enter.");
        println!("Please, input n-th number of Fibonacci sequence:\n");
    }
}

fn fib(number: u32) -> u32 {

    fn calculate(number: u32) -> u32 {
        let mut counter = 4;
        let mut a = 1;
        let mut b = 1;
        while counter <= number {
            b += a;
            a = b - a;
            counter += 1
        }
        b
    }

    match number {
        0 => 0,
        1 => 0,
        2 => 1,
        3 => 1,
        _ => calculate(number),
    }

}