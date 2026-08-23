const display = document.getElementById('display');
const expressionEl = document.getElementById('expression');
const buttons = document.querySelectorAll('.btn');

let currentValue = '0';
let previousValue = null;
let operator = null;
let waitingForOperand = false;
let justEvaluated = false;
let expression = '';

const OPERATORS = {
  '+': (a, b) => a + b,
  '-': (a, b) => a - b,
  '*': (a, b) => a * b,
  '/': (a, b) => a / b,
};

const SYMBOLS = {
  '+': '+',
  '-': '−',
  '*': '×',
  '/': '÷',
};

function render() {
  expressionEl.textContent = expression || '\u00A0';
  display.textContent = currentValue;
}

function allClear() {
  currentValue = '0';
  previousValue = null;
  operator = null;
  waitingForOperand = false;
  justEvaluated = false;
  expression = '';
  display.classList.remove('error');
  render();
}

function setError(message) {
  currentValue = message;
  previousValue = null;
  operator = null;
  waitingForOperand = false;
  justEvaluated = false;
  expression = '';
  display.classList.add('error');
  render();
}

function inputDigit(digit) {
  if (display.classList.contains('error')) {
    allClear();
  }
  if (justEvaluated) {
    currentValue = digit;
    justEvaluated = false;
    expression = '';
  } else if (waitingForOperand) {
    currentValue = digit;
    waitingForOperand = false;
  } else {
    currentValue = currentValue === '0' ? digit : currentValue + digit;
  }
  render();
}

function inputDecimal() {
  if (display.classList.contains('error')) {
    allClear();
  }
  if (justEvaluated) {
    currentValue = '0.';
    justEvaluated = false;
    expression = '';
  } else if (waitingForOperand) {
    currentValue = '0.';
    waitingForOperand = false;
  } else if (!currentValue.includes('.')) {
    currentValue += '.';
  }
  render();
}

function backspace() {
  if (display.classList.contains('error')) {
    allClear();
    return;
  }
  if (waitingForOperand || justEvaluated) {
    return;
  }
  currentValue = currentValue.length > 1 ? currentValue.slice(0, -1) : '0';
  render();
}

function calculate(a, op, b) {
  const result = OPERATORS[op](parseFloat(a), parseFloat(b));
  return String(parseFloat(result.toPrecision(12)));
}

function setOperator(nextOperator) {
  if (display.classList.contains('error')) {
    return;
  }
  const inputValue = parseFloat(currentValue);

  if (operator && waitingForOperand) {
    expression = expression.slice(0, -1) + SYMBOLS[nextOperator] + ' ';
    operator = nextOperator;
    render();
    return;
  }

  if (previousValue === null) {
    previousValue = inputValue;
    expression = currentValue + ' ' + SYMBOLS[nextOperator] + ' ';
  } else if (operator) {
    if (operator === '/' && inputValue === 0) {
      setError('Cannot divide by zero');
      return;
    }
    const result = calculate(previousValue, operator, inputValue);
    previousValue = parseFloat(result);
    expression += currentValue + ' ' + SYMBOLS[nextOperator] + ' ';
  }

  operator = nextOperator;
  waitingForOperand = true;
  justEvaluated = false;
  render();
}

function evaluate() {
  if (display.classList.contains('error')) {
    return;
  }
  if (operator === null || waitingForOperand) {
    return;
  }
  const inputValue = parseFloat(currentValue);

  if (operator === '/' && inputValue === 0) {
    setError('Cannot divide by zero');
    return;
  }

  const result = calculate(previousValue, operator, inputValue);
  expression += currentValue + ' =';
  currentValue = result;
  previousValue = null;
  operator = null;
  waitingForOperand = false;
  justEvaluated = true;
  render();
}

function highlightOperator() {
  buttons.forEach((btn) => {
    if (btn.dataset.action === 'operator') {
      btn.classList.toggle('active', btn.dataset.value === operator);
    }
  });
}

buttons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const action = btn.dataset.action;

    switch (action) {
      case 'ac':
        allClear();
        break;
      case 'del':
        backspace();
        break;
      case 'operator':
        setOperator(btn.dataset.value);
        break;
      case 'decimal':
        inputDecimal();
        break;
      case 'equals':
        evaluate();
        break;
      default:
        if (btn.dataset.value !== undefined) {
          inputDigit(btn.dataset.value);
        }
    }

    highlightOperator();
  });
});
