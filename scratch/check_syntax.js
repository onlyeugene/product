const fs = require('fs');
const content = fs.readFileSync('/Users/onlyeugene/Downloads/yip-product-uploader/src/screens/ProductDetailScreen.tsx', 'utf8');

function checkBalance(str) {
  const stack = [];
  const map = {
    '(': ')',
    '[': ']',
    '{': '}'
  };

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (map[char]) {
      stack.push({ char, line: str.substring(0, i).split('\n').length });
    } else if (Object.values(map).includes(char)) {
      const last = stack.pop();
      if (!last || map[last.char] !== char) {
        console.log(`Unbalanced ${char} at line ${str.substring(0, i).split('\n').length}`);
        if (last) console.log(`Expected ${map[last.char]} for ${last.char} from line ${last.line}`);
        return false;
      }
    }
  }

  if (stack.length > 0) {
    const last = stack.pop();
    console.log(`Unclosed ${last.char} from line ${last.line}`);
    return false;
  }

  console.log('Balanced!');
  return true;
}

checkBalance(content);
