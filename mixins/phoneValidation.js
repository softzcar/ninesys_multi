import { parsePhoneNumberFromString } from 'libphonenumber-js'

export default {
    methods: {
        /**
         * Valida y formatea un número de teléfono.
         * @param {string} phoneNumber - El número de teléfono a validar.
         * @param {string} defaultCountry - El código de país por defecto (ISO 3166-1 alpha-2).
         * @returns {object} - Objeto con el resultado: { isValid: boolean, formatted: string|null, error: string|null }
         */
        validateAndFormatPhone(phoneNumber, defaultCountry = 'VE') {
            if (!phoneNumber) {
                return { isValid: false, formatted: null, error: 'El teléfono es obligatorio.' }
            }

            // Limpiar caracteres no permitidos (dejar solo números y +)
            // Aunque libphonenumber maneja esto, es bueno limpiar basura obvia antes
            // Pero libphonenumber es bastante inteligente. Vamos a confiar en él principalmente,
            // pero si el usuario mete letras, el parser fallará o devolverá null.

            const phoneNumberParsed = parsePhoneNumberFromString(phoneNumber, defaultCountry)

            if (phoneNumberParsed && phoneNumberParsed.isValid()) {
                return {
                    isValid: true,
                    formatted: phoneNumberParsed.format('E.164').replace('+', ''), // Retorna formato 58414... (sin +)
                    error: null
                }
            } else {
                // Intento de re-validación agregando '+' si no lo tiene
                if (!phoneNumber.startsWith('+')) {
                    const phoneNumberWithPlus = '+' + phoneNumber
                    const phoneNumberParsedPlus = parsePhoneNumberFromString(phoneNumberWithPlus)

                    if (phoneNumberParsedPlus && phoneNumberParsedPlus.isValid()) {
                        return {
                            isValid: true,
                            formatted: phoneNumberParsedPlus.format('E.164').replace('+', ''),
                            error: null
                        }
                    }
                }

                return {
                    isValid: false,
                    formatted: null,
                    error: 'Número de teléfono inválido.'
                }
            }
        },

        /**
         * Método para usar en eventos @input o @blur para limpiar caracteres no numéricos básicos
         * si se desea una limpieza agresiva visualmente.
         * @param {string} value 
         */
        cleanPhoneInput(value) {
            if (!value) return ''
            // Permitir solo números y el signo + al inicio
            return value.replace(/[^0-9+]/g, '')
        }
    }
}
