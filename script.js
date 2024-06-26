function showTime(){
    var date = new Date();
    var h = date.getHours(); // 0 - 23
    var m = date.getMinutes(); // 0 - 59
    var s = date.getSeconds(); // 0 - 59
    var session = "AM";
    
    if(h == 0){
        h = 12;
    }
    
    if(h > 12){
        h = h - 12;
        session = "PM";
    }
    
    h = (h < 10) ? "0" + h : h;
    m = (m < 10) ? "0" + m : m;
    s = (s < 10) ? "0" + s : s;
    
    var time = h + ":" + m + ":" + s + " " + session;
    document.getElementById("MyClockDisplay").innerText = time;
    document.getElementById("MyClockDisplay").textContent = time;
    
    setTimeout(showTime, 1000);
}

showTime();

var input_amount = document.getElementById("original-currency-amount");
var from_currency = document.getElementById("from_currency");
var to_currency = document.getElementById("to_currency");
var exchange_rate = document.getElementById("exchange-rate");
var exchange = document.getElementById("exchange");
var output_amount = document.getElementById("output-text");
var output_from = document.getElementById("from");
var output_to = document.getElementById("to");

exchange.addEventListener("click", () => {
    [from_currency.value, to_currency.value] = [to_currency.value, from_currency.value];
    calculate();
});

function calculate() {
    const from_currency_value = from_currency.value;
    const to_currency_value = to_currency.value;
    
    fetch(`https://api.exchangerate-api.com/v4/latest/${from_currency_value}`)
    .then(res => res.json())
    .then(res => {
        const rate = res.rates[to_currency_value];
        exchange_rate.value = `${rate}`
        const to_amount = (input_amount.value * rate).toFixed(3);
        output_from.innerText= `${input_amount.value} ${from_currency_value}`;
        output_to.innerText = `${to_amount} ${to_currency_value}`;
        output_amount.style.display="block";
    })
}

document.getElementById("exchange_button").addEventListener("click", () => {
    calculate();
});
