
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
    // 1. Meta Information Sync
    document.getElementById('out-refno').innerText = document.getElementById('in-refno').value || "IEC/2026/QT-101";
    document.getElementById('out-client').innerText = document.getElementById('in-client').value || "Customer Name";
    document.getElementById('out-address').innerText = document.getElementById('in-address').value || "Customer Address";
    document.getElementById('out-mobile').innerText = document.getElementById('in-mobile').value || "Contact No";
    
    const priceMode = document.getElementById('in-price-mode').value;
    const manualPriceInput = parseFloat(document.getElementById('in-manual-price').value) || 0;
    const duration = parseInt(document.getElementById('in-duration').value) || 1;
    const taxPercent = parseFloat(document.getElementById('in-tax-percent').value) || 18;
    const isDiscountEnabled = document.getElementById('in-discount-toggle').value === 'enable';
    const globalDiscount = parseFloat(document.getElementById('in-discount').value) || 0;
    
    const selectedOptions = Array.from(document.getElementById('in-service').selectedOptions);
    const tableBody = document.getElementById('out-items-body');

    tableBody.innerHTML = "";
    let totalTaxableValue = 0;
    let totalGstAmount = 0;
    let rawSubtotal = 0;

    // 2. Process Items
    selectedOptions.forEach((option) => {
        const item = servicePriceList[option.value];
        if (item) {
            let basePrice = item.price;

            // Manual price logic
            if (priceMode === 'manual') {
                if (['tp-cust', 'amc', 'biz'].includes(option.value)) {
                    basePrice = manualPriceInput;
                }
            }

            let linePrice = (item.type === "Yearly") ? basePrice * duration : basePrice;
            rawSubtotal += linePrice;

            // Apply discount proportionally to each item for accurate GST calculation
            let itemDiscount = isDiscountEnabled ? (globalDiscount / selectedOptions.length) : 0;
            let itemTaxable = linePrice - itemDiscount;
            let itemGst = (itemTaxable * taxPercent) / 100;

            totalTaxableValue += itemTaxable;
            totalGstAmount += itemGst;

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

    // 3. Final Calculations
    const grandTotal = Math.round(totalTaxableValue + totalGstAmount);

    // 4. Update Output UI
    // We show the "Taxable Value" as the subtotal if discount is used, or the raw total if not.
    document.getElementById('out-subtotal').innerText = `Rs. ${totalTaxableValue.toLocaleString('en-IN')}`;
    document.getElementById('out-tax-amount').innerText = `Rs. ${totalGstAmount.toLocaleString('en-IN')}`;
    document.getElementById('out-total').innerText = `Rs. ${grandTotal.toLocaleString('en-IN')}`;
    document.getElementById('out-discount-val').innerText = `- Rs. ${globalDiscount.toLocaleString('en-IN')}`;
    
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
