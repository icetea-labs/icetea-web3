const { ecc } = require('../dist')
const configKey = '5K4kMyGz839wEsG7a9xvPNXCmtgFE5He2Q8y9eurEQ4uNgpSRq7'
const from = ecc.toPublicKey(configKey)
console.log('from',from);
