const { parsePhoneNumberFromString } = require('libphonenumber-js');

// --- Lógica del Mixin (Replicada para test en Node sin Babel) ---
const phoneValidationMixin = {
    methods: {
        validateAndFormatPhone(phoneNumber, defaultCountry = 'VE') {
            if (!phoneNumber) {
                return { isValid: false, formatted: null, error: 'El teléfono es obligatorio.' }
            }

            const phoneNumberParsed = parsePhoneNumberFromString(phoneNumber, defaultCountry)

            if (phoneNumberParsed && phoneNumberParsed.isValid()) {
                return {
                    isValid: true,
                    formatted: phoneNumberParsed.format('E.164').replace('+', ''), // Sin el +
                    error: null
                }
            } else {
                return {
                    isValid: false,
                    formatted: null,
                    error: 'Número de teléfono inválido.'
                }
            }
        },
        cleanPhoneInput(value) {
            if (!value) return ''
            return value.replace(/[^0-9+]/g, '')
        }
    }
};

// --- Simulación de phoneExist ---
// Mock de clientes
const myCustomers = [
    { id: 1, first_name: 'Juan', last_name: 'Perez', phone: '584141234567' }, // Cliente existente
    { id: 2, first_name: 'Maria', last_name: 'Gomez', phone: '584249876543' }
];

function phoneExist(telefono, currentId = null) {
    let result = { exist: false, msg: "" };
    const formattedPhone = telefono;

    if (formattedPhone && formattedPhone.trim().length) {
        let existingCustomer = myCustomers.find(
            (item) => item.phone === formattedPhone
        );

        if (existingCustomer) {
            const isSameCustomer = currentId && (String(currentId) === String(existingCustomer.id));

            if (!isSameCustomer) {
                result.exist = true;
                result.msg = `El teléfono ${formattedPhone} ya está registrado al cliente ${existingCustomer.first_name} ${existingCustomer.last_name}.`;
            }
        }
    }
    return result;
}

// --- Ejecución de Tests ---
console.log("=== INICIANDO PRUEBAS DE VALIDACIÓN DE TELÉFONO ===\n");

const validator = phoneValidationMixin.methods;

// Test 1: Limpieza de caracteres
const inputSucio = "0414-123.45.67";
const inputLimpio = validator.cleanPhoneInput(inputSucio);
console.log(`Test 1: Limpieza de '${inputSucio}' -> '${inputLimpio}'`);
if (inputLimpio === "04141234567") console.log("✅ PASÓ"); else console.error("❌ FALLÓ");

// Test 2: Formateo VENEZUELA (0414 -> 58414...)
const inputLocal = "04147307169";
const resLocal = validator.validateAndFormatPhone(inputLocal);
console.log(`\nTest 2: Formateo Local '${inputLocal}' -> '${resLocal.formatted}'`);
if (resLocal.isValid && resLocal.formatted === "584147307169") console.log("✅ PASÓ"); else console.error("❌ FALLÓ");

// Test 3: Formateo INTERNACIONAL (+1...)
const inputInt = "+1 202-555-0109";
const resInt = validator.validateAndFormatPhone(inputInt);
console.log(`\nTest 3: Formateo Internacional '${inputInt}' -> '${resInt.formatted}'`);
if (resInt.isValid && resInt.formatted === "12025550109") console.log("✅ PASÓ"); else console.error("❌ FALLÓ");

// Test 4: Número Inválido
const inputInv = "0414123";
const resInv = validator.validateAndFormatPhone(inputInv);
console.log(`\nTest 4: Número Inválido '${inputInv}' -> isValid: ${resInv.isValid}`);
if (!resInv.isValid) console.log("✅ PASÓ"); else console.error("❌ FALLÓ");

// Test 5: Unicidad - Duplicado
const phoneDup = "584141234567"; // Juan Perez
const checkDup = phoneExist(phoneDup);
console.log(`\nTest 5: Unicidad (Duplicado) '${phoneDup}' -> Exist: ${checkDup.exist}`);
if (checkDup.exist) console.log("✅ PASÓ"); else console.error("❌ FALLÓ");

// Test 6: Unicidad - Mismo Cliente (Editando)
const checkSelf = phoneExist(phoneDup, 1); // ID 1 es Juan Perez
console.log(`\nTest 6: Unicidad (Mismo Cliente) '${phoneDup}' ID:1 -> Exist: ${checkSelf.exist}`);
if (!checkSelf.exist) console.log("✅ PASÓ"); else console.error("❌ FALLÓ");

// Test 7: Unicidad - Nuevo Número
const phoneNew = "584120000000";
const checkNew = phoneExist(phoneNew);
console.log(`\nTest 7: Unicidad (Nuevo) '${phoneNew}' -> Exist: ${checkNew.exist}`);
if (!checkNew.exist) console.log("✅ PASÓ"); else console.error("❌ FALLÓ");

console.log("\n=== PRUEBAS FINALIZADAS ===");
