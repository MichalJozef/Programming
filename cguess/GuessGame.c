#include <stdio.h>
#include <stdlib.h>
#include <time.h>

int main() {
    int character;
    time_t t;
    srand((unsigned) time(&t));
    unsigned int seed = rand() % 97;
    unsigned int secret = seed + 97;
    unsigned char round = 0;

    if (secret > 122) {
        unsigned short int reminder = secret - 122;
        secret = 97 + (reminder % 27);
    }
    printf("Guess a secret character [a-z] and press return\n");
    while (round < 10) {
        if ((character = getchar()) == secret) {
            printf("\nYou've won!!! Your guess '%c' matches the secret character '%c'\n", character, secret);
            break;
        }
        if ((character = getchar()) != 10) {
            printf("\n***You have entered more than one character!***\n");
            break;
        }
        ++round;
        if (round < 9) {
            printf("\nYou have %d rounds left. Try again:\n", 10 - round);
        }
        if (round == 9) {
            printf("\nYou have %d round left. Last guess:\n", 10 - round);
        }
    }
    if (round == 10) {
        printf("\n***Game over!***\n");
    }
    return 0;
}
