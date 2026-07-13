const displayEl = document.getElementById('display');
  const historyEl = document.getElementById('history');

  let current = '0';
  let previous = null;
  let operator = null;
  let justEvaluated = false;

  function updateScreen(){
    displayEl.textContent = current;
    historyEl.textContent = previous !== null && operator
      ? `${formatNum(previous)} ${operator}`
      : '\u00A0';
  }

  function formatNum(n){
    if (n === null || n === undefined) return '';
    const num = Number(n);
    if (Number.isNaN(num)) return 'Error';
    if (Math.abs(num) > 1e12) return num.toExponential(4);
    return num.toString().length > 12 ? num.toPrecision(10).toString() : num.toString();
  }

  function inputDigit(d){
    if (justEvaluated){
      current = d;
      justEvaluated = false;
    } else {
      current = (current === '0') ? d : current + d;
    }
    if (current.replace('-','').replace('.','').length > 14) return;
    updateScreen();
  }

  function inputDecimal(){
    if (justEvaluated){
      current = '0.';
      justEvaluated = false;
      updateScreen();
      return;
    }
    if (!current.includes('.')) current += '.';
    updateScreen();
  }

  function setOperator(op){
    if (operator && previous !== null && !justEvaluated){
      compute();
    }
    previous = parseFloat(current);
    operator = op;
    justEvaluated = false;
    current = '0';
    updateScreen();
  }

  function compute(){
    if (operator === null || previous === null) return;
    const a = previous;
    const b = parseFloat(current);
    let result;
    switch(operator){
      case '+': result = a + b; break;
      case '−': result = a - b; break;
      case '×': result = a * b; break;
      case '÷': result = b === 0 ? NaN : a / b; break;
      default: return;
    }
    current = Number.isNaN(result) ? 'Error' : formatNum(result);
    operator = null;
    previous = null;
    justEvaluated = true;
    updateScreen();
  }

  function clearAll(){
    current = '0';
    previous = null;
    operator = null;
    justEvaluated = false;
    updateScreen();
  }

  function backspace(){
    if (justEvaluated) { clearAll(); return; }
    current = current.length > 1 ? current.slice(0, -1) : '0';
    updateScreen();
  }

  function percent(){
    current = formatNum(parseFloat(current) / 100);
    updateScreen();
  }

  function flashKey(el){
    if (!el) return;
    el.classList.add('key-pressed');
    setTimeout(() => el.classList.remove('key-pressed'), 100);
  }

  document.querySelector('.keys').addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    if (btn.dataset.num !== undefined) inputDigit(btn.dataset.num);
    else if (btn.dataset.op !== undefined) setOperator(btn.dataset.op);
    else if (btn.dataset.action === 'equals') compute();
    else if (btn.dataset.action === 'clear') clearAll();
    else if (btn.dataset.action === 'backspace') backspace();
    else if (btn.dataset.action === 'decimal') inputDecimal();
    else if (btn.dataset.action === 'percent') percent();
  });

  const keyMap = {
    '+': '[data-op="+"]',
    '-': '[data-op="−"]',
    '*': '[data-op="×"]',
    '/': '[data-op="÷"]',
    '%': '[data-action="percent"]',
    '.': '[data-action="decimal"]',
    'Enter': '[data-action="equals"]',
    '=': '[data-action="equals"]',
    'Backspace': '[data-action="backspace"]',
    'Escape': '[data-action="clear"]',
  };

  window.addEventListener('keydown', (e) => {
    if (e.key >= '0' && e.key <= '9'){
      inputDigit(e.key);
      flashKey(document.querySelector(`[data-num="${e.key}"]`));
      return;
    }
    const selector = keyMap[e.key];
    if (!selector) return;
    e.preventDefault();
    const el = document.querySelector(selector);
    flashKey(el);

    if (e.key === '+') setOperator('+');
    else if (e.key === '-') setOperator('−');
    else if (e.key === '*') setOperator('×');
    else if (e.key === '/') setOperator('÷');
    else if (e.key === '%') percent();
    else if (e.key === '.') inputDecimal();
    else if (e.key === 'Enter' || e.key === '=') compute();
    else if (e.key === 'Backspace') backspace();
    else if (e.key === 'Escape') clearAll();
  });

  updateScreen();
