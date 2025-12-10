const { parsePhoneNumberFromString } = require('libphonenumber-js');

// --- Mock del Componente ---
const componentMock = {
    adminData: { phoneNumber: '', countryCode: 'VE' },
    countryCodes: [
        { value: 'VE', text: '+58 (Venezuela)' },
        { value: 'US', text: '+1 (Estados Unidos)' },
        { value: 'CO', text: '+57 (Colombia)' }
    ],

    // Mixin Logic
    validateAndFormatPhone(phoneNumber, defaultCountry = 'VE') {
        if (!phoneNumber) return { isValid: false };
        const phoneNumberParsed = parsePhoneNumberFromString(phoneNumber, defaultCountry);
        if (phoneNumberParsed && phoneNumberParsed.isValid()) {
            return {
                isValid: true,
                formatted: phoneNumberParsed.format('E.164').replace('+', ''),
                error: null
            };
        }
        return { isValid: false };
    },

    // Component Logic
    parseAndSetPhoneNumber(type, fullNumber) {
        if (!fullNumber) return;
        const fullPhoneNumber = fullNumber.toString();

        // Sort codes by length desc
        const sortedCountryCodes = [...this.countryCodes].sort((a, b) => {
            const codeA = (a.text.match(/\+(\d+)/) || ['', ''])[1];
            const codeB = (b.text.match(/\+(\d+)/) || ['', ''])[1];
            return codeB.length - codeA.length;
        });

        for (const country of sortedCountryCodes) {
            const match = country.text.match(/\+(\d+)/);
            if (match) {
                const dialingCode = match[1];
                if (fullPhoneNumber.startsWith(dialingCode)) {
                    console.log(`   -> Detectado País: ${country.value} (+${dialingCode}), Número: ${fullPhoneNumber.substring(dialingCode.length)}`);
                    this.adminData.countryCode = country.value;
                    this.adminData.phoneNumber = fullPhoneNumber.substring(dialingCode.length);
                    return;
                }
            }
        }
    },

    handlePhoneBlur(type) {
        const data = this.adminData;
        if (!data.phoneNumber) return;

        const countryCodeData = this.countryCodes.find(c => c.value === data.countryCode);
        const phoneCode = countryCodeData ? countryCodeData.text.match(/\+(\d+)/)[1] : '';
        let rawNumber = data.phoneNumber;

        // Simular input del usuario
        const fullNumberToValidate = `+${phoneCode}${rawNumber}`;
        console.log(`Validando: ${fullNumberToValidate}`);

        const result = this.validateAndFormatPhone(fullNumberToValidate, data.countryCode);

        if (result.isValid) {
            console.log(`   -> Válido. Formateado (sin +): ${result.formatted}`);
            this.parseAndSetPhoneNumber(type, result.formatted);
        } else {
            console.log(`   -> Inválido con prefijo. Probando raw: ${rawNumber}`);
            const resultRaw = this.validateAndFormatPhone(rawNumber, data.countryCode);
            if (resultRaw.isValid) {
                console.log(`   -> Válido Raw. Formateado: ${resultRaw.formatted}`);
                this.parseAndSetPhoneNumber(type, resultRaw.formatted);
            } else {
                console.log(`   -> Totalmente Inválido`);
            }
        }
    }
};

// --- Tests ---
console.log("=== TEST CONFIGURACION WIZARD ===\n");

// Caso 1: Usuario escribe número local (0414...) con prefijo VE seleccionado
console.log("Caso 1: Local VE (04147307169) con Code VE (+58)");
componentMock.adminData.countryCode = 'VE';
componentMock.adminData.phoneNumber = '04147307169';
componentMock.handlePhoneBlur('admin');
// Esperado: Code VE, Phone 4147307169 (sin 0, porque 58414...)

// Caso 2: Usuario escribe número completo (58414...) en el input
console.log("\nCaso 2: Completo en Input (584147307169) con Code VE");
componentMock.adminData.countryCode = 'VE';
componentMock.adminData.phoneNumber = '584147307169';
componentMock.handlePhoneBlur('admin');
// Esperado: Code VE, Phone 4147307169

// Caso 3: Usuario cambia país a US y escribe número US
console.log("\nCaso 3: US (+1) y número (2025550109)");
componentMock.adminData.countryCode = 'US';
componentMock.adminData.phoneNumber = '2025550109';
componentMock.handlePhoneBlur('admin');
// Esperado: Code US, Phone 2025550109

// Caso 4: Inválido
console.log("\nCaso 4: Inválido (123)");
componentMock.adminData.countryCode = 'VE';
componentMock.adminData.phoneNumber = '123';
componentMock.handlePhoneBlur('admin');
// Esperado: Inválido
