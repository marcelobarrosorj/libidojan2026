const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Add import
content = content.replace(/import \{ PinScreen \} from "\.\/components\/PinScreen";/, 'import { PinScreen } from "./components/PinScreen";\nimport { LandingPage } from "./components/LandingPage";');

// Add state
content = content.replace(/const \[isLogin, setIsLogin\] = useState\(true\);/, 'const [isLogin, setIsLogin] = useState(true);\n  const [showLanding, setShowLanding] = useState(true);');

// Add conditional rendering
const returnIndex = content.lastIndexOf('return (');
const fallbackRender = `  if (showLanding) {
    return <LandingPage onLoginClick={() => { setIsLogin(true); setShowLanding(false); }} onRegisterClick={() => { setIsLogin(false); setShowLanding(false); }} />;
  }

  return (`;

content = content.substring(0, returnIndex) + fallbackRender + content.substring(returnIndex + 8);

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log("App.tsx updated for LandingPage");
