const fs = require('fs');

let content = fs.readFileSync('index.html', 'utf8');

const meta = `    <title>Libido | Conexões adultas com privacidade e segurança</title>
    <meta name="description" content="Conheça o Libido, uma plataforma exclusiva para maiores de 18 anos, criada para conexões adultas com liberdade, respeito, privacidade e segurança." />
    <meta property="og:title" content="Libido | Conexões adultas com privacidade e segurança" />
    <meta property="og:description" content="Conheça o Libido, uma plataforma exclusiva para maiores de 18 anos, criada para conexões adultas com liberdade, respeito, privacidade e segurança." />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Libido | Conexões adultas com privacidade e segurança" />
    <meta name="twitter:description" content="Conheça o Libido, uma plataforma exclusiva para maiores de 18 anos, criada para conexões adultas com liberdade, respeito, privacidade e segurança." />
    <link rel="canonical" href="https://libido.app" />`;

content = content.replace(/<title>My Google AI Studio App<\/title>/, meta);

fs.writeFileSync('index.html', content, 'utf8');
console.log("index.html updated");
