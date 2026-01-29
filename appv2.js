const servicePriceList = {
    "tp-silver": { name: "TallyPrime SILVER", price: 22500, type: "Perpetual", desc: "Includes 1Yr Tally.net features & service support, On-site Installation" },
    "tp-gold": { name: "TallyPrime GOLD", price: 67500, type: "Perpetual", desc: "Includes 1Yr Tally.net features & service support" },
    "upgrade": { name: "TallyPrime SILVER to GOLD Upgrade", price: 45000, type: "Perpetual", desc: "Include Upgraded Version, Support & Service For 1Yr, On-site Insttallation." },
    "tss-silver": { name: "Tally Software Services SILVER", price: 4500, type: "Yearly", desc: "Renewal of Tally.Net Services For SILVER" },
    "tss-gold": { name: "Tally Software Services GOLD", price: 13500, type: "Yearly", desc: "Renewal of Tally.Net Services For GOLD" },
    "cloud": { name: "Tally On Cloud", price: 12000, type: "Yearly", desc: "Access Tally from anywhere via Cloud hosting." },
    "amc": { name: "Annual Maintenance Contract (AMC)", price: 0, type: "Yearly", desc: "Priority support and periodic health checks." },
    "biz": { name: "Biz Analyst", price: 2500, type: "Yearly", desc: "Mobile app for Tally analysis." },
    "tp-cust": { name: "TallyPrime Customisation", price: 0, type: "One-Time", desc: "Custom TDL/Report development." }
};

function updatePDF() {
    // 1. Sync Text Data
    document.getElementById('out-refno').innerText = document.getElementById('in-refno').value || "IEC/2026/QT-101";
    document.getElementById('out-client').innerText = document.getElementById('in-client').value || "Customer Name";
    document.getElementById('out-address').innerText = document.getElementById('in-address').value || "Customer Address";
    document.getElementById('out-mobile').innerText = document.getElementById('in-mobile').value || "Contact No";
    
    // 2. Fetch Inputs
    const priceMode = document.getElementById('in-price-mode').value;
    const manualPriceInput = parseFloat(document.getElementById('in-manual-price').value) || 0;
    const duration = parseInt(document.getElementById('in-duration').value) || 1;
    const taxPercent = parseFloat(document.getElementById('in-tax-percent').value) || 18;
    const isDiscountEnabled = document.getElementById('in-discount-toggle').value === 'enable';
    const globalDiscount = parseFloat(document.getElementById('in-discount').value) || 0;
    const selectedOptions = Array.from(document.getElementById('in-service').selectedOptions);
    
    const tableBody = document.getElementById('out-items-body');
    tableBody.innerHTML = "";

    let rawSubtotal = 0;
    let runningGstTotal = 0;

    // 3. Process Each Service
    selectedOptions.forEach((option) => {
        const item = servicePriceList[option.value];
        if (item) {
            let basePrice = item.price;

            // Handle Manual Pricing for specific items
            if (priceMode === 'manual' && ['tp-cust', 'amc', 'biz'].includes(option.value)) {
                basePrice = manualPriceInput;
            }

            let linePrice = (item.type === "Yearly") ? basePrice * duration : basePrice;
            rawSubtotal += linePrice;

            // --- THE GST FIX ---
            // Calculate proportional discount for THIS item
            let itemDiscountShare = isDiscountEnabled ? (globalDiscount / selectedOptions.length) : 0;
            let itemTaxableValue = linePrice - itemDiscountShare;
            
            // Calculate GST ONLY on the discounted taxable value
            let itemGst = (itemTaxableValue * taxPercent) / 100;
            runningGstTotal += itemGst;

            tableBody.innerHTML += `
            <tr>
                <td><strong>${item.name}</strong><br><small style="font-size: 8.5px; color: #666;">${item.desc}</small></td>
                <td class="text-center">${item.type === 'Yearly' ? duration + ' Yr' : 'One Time'}</td>
                <td class="text-center">Rs. ${linePrice.toLocaleString('en-IN')}</td>
                <td class="text-center">${taxPercent}%</td>
                <td class="text-right">Rs. ${itemGst.toLocaleString('en-IN')}</td>
            </tr>`;
        }
    });

    // 4. Update Final Totals
    const finalTaxableValue = rawSubtotal - (isDiscountEnabled ? globalDiscount : 0);
    const grandTotal = Math.round(finalTaxableValue + runningGstTotal);
    
    document.getElementById('out-subtotal').innerText = `Rs. ${rawSubtotal.toLocaleString('en-IN')}`;
    document.getElementById('out-discount-val').innerText = `- Rs. ${globalDiscount.toLocaleString('en-IN')}`;
    document.getElementById('out-tax-amount').innerText = `Rs. ${runningGstTotal.toLocaleString('en-IN')}`;
    document.getElementById('out-total').innerText = `Rs. ${grandTotal.toLocaleString('en-IN')}`;
    document.getElementById('out-words').innerText = "Rupees " + numberToWords(grandTotal) + " Only";
    document.getElementById('current-date').innerText = "Date: " + new Date().toLocaleDateString('en-GB');
}

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


function toggleAttnUI() {
    const isVisible = document.getElementById('in-attn-toggle').value === 'yes';
    document.getElementById('attn-control').style.display = isVisible ? 'block' : 'none';
    document.getElementById('out-katen-wrapper').style.display = isVisible ? 'block' : 'none';
    updatePDF();
}

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

window.onload = updatePDF;
