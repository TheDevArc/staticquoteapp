
const servicePriceList = {
    "tp-silver": { name: "TallyPrime SILVER", price: 22500, type: "Perpetual", desc: "Includes 1Yr Tally.net features & service support, On-site Installation" },
    "tp-gold": { name: "TallyPrime GOLD", price: 67500, type: "Perpetual", desc: "Includes 1Yr Tally.net features & service support" },
    "upgrade": { name: "TallyPrime SILVER to GOLD Upgrade", price: 45000, type: "Perpetual", desc: "Include Upgraded Version, Support & Service For 1Yr, On-site Insttallation." },
    "tss-silver": { name: "Tally Software Services SILVER", price: 4500, type: "Yearly", desc: "Renewal of Tally.Net Services For SILVER" },
    "tss-gold": { name: "Tally Software Services GOLD", price: 13500, type: "Yearly", desc: "Renewal of Tally.Net Services For GOLD" },
    "tss-auditor": { name: "Tally Software Services AUDITOR", price: 10000, type: "Yearly", desc: "Audit features renewal for TallyPrime." },
    "cloud": { name: "Tally On Cloud", price: 12000, type: "Yearly", desc: "Access Tally from anywhere via Cloud hosting." },
    "amc": { name: "Annual Maintenance Contract (AMC)", price: 0, type: "Yearly", desc: "Priority support and periodic health checks." },
    "biz": { name: "Biz Analyst", price: 2500, type: "Yearly", desc: "Mobile app for Tally analysis." },
    "tp-cust": { name: "TallyPrime Customisation", price: 0, type: "One-Time", desc: "Custom TDL/Report development." },
    "pgrbk": { name: "PagarBook", price: 5000, type: "Yearly", desc: "Staff Attendance & Payroll management." },
    "crdflw": { name: "CredFlow", price: 10000, type: "Yearly", desc: "Automated payment collection for Tally." },
    "bzsoft": { name: "Busy Accounting Software", price: 18000, type: "Perpetual", desc: "Busy Accounting License." }
};

function updatePDF() {
    // 1. Meta Information Sync [cite: 5, 7, 8, 9]
    document.getElementById('out-refno').innerText = document.getElementById('in-refno').value || "IEC/2026/QT-101";
    document.getElementById('out-client').innerText = document.getElementById('in-client').value || "Customer Name";
    document.getElementById('out-address').innerText = document.getElementById('in-address').value || "Customer Address";
    document.getElementById('out-mobile').innerText = document.getElementById('in-mobile').value || "Contact No";
    
    // 2. Fetch Control Inputs
    const priceMode = document.getElementById('in-price-mode').value;
    const manualPriceInput = parseFloat(document.getElementById('in-manual-price').value) || 0;
    const duration = parseInt(document.getElementById('in-duration').value) || 1;
    const taxPercent = parseFloat(document.getElementById('in-tax-percent').value) || 18;
    const isDiscountEnabled = document.getElementById('in-discount-toggle').value === 'enable';
    const globalDiscount = parseFloat(document.getElementById('in-discount').value) || 0;
    
    const selectedOptions = Array.from(document.getElementById('in-service').selectedOptions);
    const tableBody = document.getElementById('out-items-body');

    tableBody.innerHTML = "";
    let subtotal = 0;

    // 3. Process Items with Fixed Pricing Logic
    selectedOptions.forEach((option) => {
        const item = servicePriceList[option.value];
        if (item) {
            let basePrice = item.price;

            // price switching
            if (priceMode === 'manual') {
                switch (option.value) {
                    case 'tp-cust':
                        basePrice = manualPriceInput;
                        break;

                    case 'amc':
                        basePrice = manualPriceInput;

                    case 'biz':
                        basePrice = manualPriceInput;
                    default:
                        break;
                }
            }

            let linePrice = (item.type === "Yearly") ? basePrice * duration : basePrice;
            let itemGst = (linePrice * taxPercent) / 100;
            subtotal += linePrice;

            // 5-Column Table Generation 
            tableBody.innerHTML += `
            <tr>
                <td style="width: 40%;">
                    <strong>${item.name}</strong><br>
                    <small style="font-size: 8.5px; color: #666; line-height: 1;">${item.desc}</small>
                </td>
                <td class="text-center" style="width: 15%;">${item.type === 'Yearly' ? duration + ' Yr' : 'One Time'}</td>
                <td class="text-center" style="width: 15%;">Rs. ${linePrice.toLocaleString('en-IN')}</td>
                <td class="text-center" style="width: 10%;">${taxPercent}%</td>
                <td class="text-right" style="width: 20%;">Rs. ${itemGst.toLocaleString('en-IN')}</td>
            </tr>`;
        }
    });

    // 4. Calculations & Totals [cite: 19]
    const taxableValue = subtotal - (isDiscountEnabled ? globalDiscount : 0);
    const finalTax = (taxableValue * taxPercent) / 100;
    const grandTotal = Math.round(taxableValue + finalTax);

    // Update Output UI
    document.getElementById('out-subtotal').innerText = `Rs. ${subtotal.toLocaleString('en-IN')}`;
    document.getElementById('out-tax-amount').innerText = `Rs. ${finalTax.toLocaleString('en-IN')}`;
    document.getElementById('out-total').innerText = `Rs. ${grandTotal.toLocaleString('en-IN')}`;
    document.getElementById('out-words').innerText = "Rupees " + numberToWords(grandTotal) + " Only";
    document.getElementById('current-date').innerText = "Date: " + new Date().toLocaleDateString('en-GB');
}

// UI Toggle Helpers
function togglePriceUI() {
    const isManual = document.getElementById('in-price-mode').value === 'manual';
    document.getElementById('manual-price-container').style.display = isManual ? 'block' : 'none';
    updatePDF();
}

function toggleDiscountUI() {
    const isVisible = document.getElementById('in-discount-toggle').value === 'enable';
    document.getElementById('discount-controls').style.display = isVisible ? 'block' : 'none';
    document.getElementById('discount-row').style.display = isVisible ? 'flex' : 'none';
    updatePDF();
}

// Indian Number to Words Converter [cite: 21]
function numberToWords(num) {
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    let n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return '';
    let str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
    str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
    return str.trim();
}

// Initialize
window.onload = updatePDF;
