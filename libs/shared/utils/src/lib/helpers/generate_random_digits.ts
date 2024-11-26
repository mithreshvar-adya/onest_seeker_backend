
async function generateRandomDigits(max_digits:number) {
    const digits = '0123456789';
    let otp = '';

    for (let i = 0; i < max_digits; i++) {
        const randomIndex = Math.floor(Math.random() * digits.length);
        otp += digits[randomIndex];
    }

    return otp;
}

export {
    generateRandomDigits
}