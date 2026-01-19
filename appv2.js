const servicePriceList = {
    "tp-silver": { name: "TallyPrime SILVER", price: 22500, type: "Perpetual", desc: "Includes 1Yr Tally.net features & service support, On-site Installation"},
    "tp-gold": { name: "TallyPrime GOLD", price: 67500, type: "Perpetual", desc: "Includes 1Yr Tally.net features & service support"},
    "upgrade": { name: "TallyPrime SILVER to GOLD Upgrade", price: 45000, type: "Perpetual", desc: "Include Upgraded Version, Support & Service For 1Yr, On-site Insttallation."},
    "tss-auditor": {name:"Tally Software Services AUDITOR", price: 6750, type: "Yearly", desc: "Renewal of Tally.Net Services For AUDITOR"},
    "tss-silver": { name: "Tally Software Services SILVER", price: 4500, type: "Yearly", desc: "Renewal of Tally.Net Services For GOLD"},
    "tss-gold": { name: "Tally Software Services GOLD", price: 13500, type: "Yearly", desc: "Renewal of Tally.Net Services For GOLD."},
    "amc": { name: "Annual Maintenance Contract (AMC)", price: 0, type: "Yearly", desc: "Includes 1yr Techincal Support, Tally Data-backup & Repair, Tally updates"},
    "biz": { name: "Biz Analyst", price: 2500, type: "Yearly", desc: "Includes On-site Installation, For 1Yr/User = Rs. 3300+GST, Get 1+ Yr Extra on Subscription of 2 or 3 Yrs"},
    "tp-cust": { name: "TallyPrime Customisation", price: 0, type: "One-Time", desc: "Custom TDL/Report development."},
    "pgrbk": { name: "PagarBook", price: 0, type: "Yearly", desc: "Staff Attendance & Payroll management."},
    "crdflw": { name: "CredFlow", price: 0, type: "Yearly", desc: "Automated payment collection for Tally."},
    "bzsoft": { name: "Busy Accounting Software", price: 0, type: "Perpetual", desc: "Busy Accounting License."},
    "cloud": {name: "TallyPrime On Cloud", price: 8000, type: "Yearly", desc: "Includes Tally On Cloud For 1Yr, 99% Up-time, 10GB Data Storage Per User"}
};

function updatePDF() {
    // 1. Client & Attention Sync
    document.getElementById('out-client').innerText = document.getElementById('in-client').value || "Customer Name";
    document.getElementById('out-address').innerText = document.getElementById('in-address').value || "Customer Address";
    document.getElementById('out-mobile').innerText = document.getElementById('in-mobile').value || "Contact No";
    document.getElementById('out-attn-name').innerText = document.getElementById('in-katen').value;
    
    const refNo = document.getElementById('in-refno').value;
    document.getElementById('out-refno').innerText = refNo || "IEC/2026/QT-101";

    // 2. Fetch Control Logic
    const priceMode = document.getElementById('in-price-mode').value;
    const manualPriceInput = parseFloat(document.getElementById('in-manual-price').value) || 0;
    const duration = parseInt(document.getElementById('in-duration').value) || 1;
    const isDiscountEnabled = document.getElementById('in-discount-toggle').value === 'enable';
    const selectedOptions = Array.from(document.getElementById('in-service').selectedOptions);
    const tableBody = document.getElementById('out-items-body');

    tableBody.innerHTML = "";
    let subtotal = 0;
    let autoDiscount = 0;

    // 3. Process Selected Services
    selectedOptions.forEach((option) => {
        const item = servicePriceList[option.value];
        if (item) {
            // Determine base price based on mode
            let basePrice = (priceMode === 'manual') ? manualPriceInput : item.price;
            let finalPrice = basePrice;

            if (item.type === "Yearly") {
                finalPrice = basePrice * duration;
                // Auto-discount logic: 10% off for 2-year commitment
                if(isDiscountEnabled && duration >= 2) {
                    autoDiscount += (finalPrice * 0.10);
                }
            }
            
            subtotal += finalPrice;

            // Render Table Row with Description
            tableBody.innerHTML += `
            <tr>
                <td>
                    <strong>${item.name}</strong><br>
                    <small style="color: #666; display: block; margin-top: 4px; line-height: 1.2;">
                        ${item.desc || "Standard software service"}
                    </small>
                </td>
                <td class="text-center">${item.type === 'Yearly' ? duration + ' Yr' : 'One Time'}</td>
                <td class="text-right">Rs. ${finalPrice.toLocaleString('en-IN')}</td>
            </tr>`;
        }
    });

    // 4. Final Calculations
    const manualDiscount = isDiscountEnabled ? (parseFloat(document.getElementById('in-discount').value) || 0) : 0;
    const totalDiscount = autoDiscount + manualDiscount;
    const taxPercent = parseFloat(document.getElementById('in-tax-percent').value) || 18;
    
    const taxableValue = Math.max(0, subtotal - totalDiscount);
    const taxAmount = (taxableValue * taxPercent) / 100;
    const grandTotal = taxableValue + taxAmount;

    // 5. Update PDF UI
    document.getElementById('out-subtotal').innerText = `Rs. ${subtotal.toLocaleString('en-IN')}`;
    document.getElementById('out-discount-val').innerText = `- Rs. ${totalDiscount.toLocaleString('en-IN')}`;
    document.getElementById('out-tax-rate').innerText = taxPercent;
    document.getElementById('out-tax-amount').innerText = `Rs. ${taxAmount.toLocaleString('en-IN')}`;
    document.getElementById('out-total').innerText = `Rs. ${Math.round(grandTotal).toLocaleString('en-IN')}`;
    
    // Date & Words
    document.getElementById('current-date').innerText = "Date: " + new Date().toLocaleDateString('en-GB');
    
    // Adding Amount in Words (Ensure a <p id="out-words"> exists in your HTML footer/totals area)
    const wordsEl = document.getElementById('out-words');
    if(wordsEl) {
        wordsEl.innerText = "Amount in words: Rupees " + numberToWords(Math.round(grandTotal)) + " Only";
    }
}

// TOGGLE HANDLERS
function toggleAttnUI() {
    const isVisible = document.getElementById('in-attn-toggle').value === 'yes';
    document.getElementById('attn-control').style.display = isVisible ? 'block' : 'none';
    document.getElementById('out-katen-wrapper').style.display = isVisible ? 'block' : 'none';
    updatePDF();
}

function toggleDiscountUI() {
    const isVisible = document.getElementById('in-discount-toggle').value === 'enable';
    document.getElementById('discount-controls').style.display = isVisible ? 'block' : 'none';
    document.getElementById('discount-row').style.display = isVisible ? 'flex' : 'none';
    updatePDF();
}


// price
function togglePriceUI() {
    const isManual = document.getElementById('in-price-mode').value === 'manual';
    // Matches your HTML ID manual-price-container
    document.getElementById('manual-price-container').style.display = isManual ? 'block' : 'none';
    updatePDF();
}


// number to words function
function numberToWords(num) {
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    if ((num = num.toString()).length > 9) return 'Overflow';
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

// Run update on load
window.onload = updatePDF;