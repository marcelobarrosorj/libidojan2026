const fs = require('fs');
const path = 'src/components/PixCheckout.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
`import { useState, useEffect } from 'react';`,
`import React, { useState, useEffect } from 'react';`
);

fs.writeFileSync(path, code);
