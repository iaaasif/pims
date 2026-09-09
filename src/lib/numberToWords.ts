/**
 * Converts a number into South Asian (Lakh, Crore) word format for Taka.
 */
export function numberToWords(num: number): string {
    if (num === 0) return 'Zero Taka Only'

    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
        'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

    function convertLessThanThousand(n: number): string {
        let str = ''
        if (n >= 100) {
            str += ones[Math.floor(n / 100)] + ' Hundred '
            n %= 100
        }
        if (n >= 20) {
            str += tens[Math.floor(n / 10)] + (n % 10 > 0 ? '-' + ones[n % 10] : '')
        } else if (n > 0) {
            str += ones[n]
        }
        return str.trim()
    }

    let result = ''
    let n = Math.floor(num)

    // Crore
    if (n >= 10000000) {
        result += convertLessThanThousand(Math.floor(n / 10000000)) + ' Crore '
        n %= 10000000
    }

    // Lakh
    if (n >= 100000) {
        result += convertLessThanThousand(Math.floor(n / 100000)) + ' Lakh '
        n %= 100000
    }

    // Thousand
    if (n >= 1000) {
        result += convertLessThanThousand(Math.floor(n / 1000)) + ' Thousand '
        n %= 1000
    }

    // Remaining
    if (n > 0) {
        result += convertLessThanThousand(n)
    }

    return (result.trim() + ' Taka Only').replace(/\s+/g, ' ')
}
