document.addEventListener("DOMContentLoaded", () => {
  const invoiceNumber = "INV-" + Math.floor(Math.random() * 1000000);
  document.getElementById("invoiceNumber").value = invoiceNumber;
  addItem();
});

function addItem() {
  const container = document.getElementById("itemsContainer");

  const div = document.createElement("div");
  div.classList.add("item-row");
  div.innerHTML = `
    <input type="text" placeholder="Description" class="itemDescription" />
    <input type="number" placeholder="Quantity" class="itemQuantity" />
    <input type="number" placeholder="Rate" class="itemRate" />
  `;

  container.appendChild(div);
}

document.getElementById("invoiceForm").addEventListener("input", calculateTotal);

function calculateTotal() {
  let subtotal = 0;

  const quantities = document.querySelectorAll(".itemQuantity");
  const rates = document.querySelectorAll(".itemRate");

  for (let i = 0; i < quantities.length; i++) {
    const quantity = parseFloat(quantities[i].value) || 0;
    const rate = parseFloat(rates[i].value) || 0;
    subtotal += quantity * rate;
  }

  const taxPercent = parseFloat(document.getElementById("tax").value) || 0;
  const discountPercent = parseFloat(document.getElementById("discount").value) || 0;
  const amountPaid = parseFloat(document.getElementById("amountPaid").value) || 0;

  const taxAmount = (subtotal * taxPercent) / 100;
  const discountAmount = (subtotal * discountPercent) / 100;

  const total = subtotal + taxAmount - discountAmount;
  const remaining = total - amountPaid;

  document.getElementById("totalAmount").textContent = total.toFixed(2);
  document.getElementById("remainingBalance").textContent = remaining.toFixed(2);

  // Determine payment status
  let status = "Unpaid";
  if (amountPaid >= total) {
    status = "Paid";
  } else if (amountPaid > 0 && amountPaid < total) {
    status = "Partial";
  }
  document.getElementById("paymentStatus").textContent = status;
}

document.getElementById("invoiceForm").addEventListener("submit", function (e) {
  e.preventDefault();
  generatePreview();

  // Gather invoice data and save it to backend
  const invoiceData = collectInvoiceData();
  saveInvoiceToBackend(invoiceData);
});

function generatePreview() {
  const name = document.getElementById("clientName").value;
  const email = document.getElementById("clientEmail").value;
  const phone = document.getElementById("clientPhone").value;
  const address = document.getElementById("clientAddress").value;
  const invoiceNumber = document.getElementById("invoiceNumber").value;
  const invoiceDate = document.getElementById("invoiceDate").value;
  const dueDate = document.getElementById("dueDate").value;
  const tax = document.getElementById("tax").value || "0";
  const discount = document.getElementById("discount").value || "0";
  const amountPaid = document.getElementById("amountPaid").value || "0.00";
  const remainingBalance = document.getElementById("remainingBalance").textContent;
  const paymentStatus = document.getElementById("paymentStatus").textContent;
  const notes = document.getElementById("notes").value;
  const totalAmount = document.getElementById("totalAmount").textContent;

  const descriptions = document.querySelectorAll(".itemDescription");
  const quantities = document.querySelectorAll(".itemQuantity");
  const rates = document.querySelectorAll(".itemRate");

  let items = [];
  for (let i = 0; i < descriptions.length; i++) {
    const desc = descriptions[i].value;
    const qty = parseFloat(quantities[i].value) || 0;
    const rate = parseFloat(rates[i].value) || 0;
    const total = (qty * rate).toFixed(2);
    items.push({ description: desc, quantity: qty, rate: rate, total });
  }

  let html = `
    <p><strong>Invoice #: </strong>${invoiceNumber}</p>
    <p><strong>Invoice Date: </strong>${invoiceDate}</p>
    <p><strong>Due Date: </strong>${dueDate}</p>
    <p><strong>Client: </strong>${name}</p>
    <p><strong>Email: </strong>${email}</p>
    <p><strong>Phone: </strong>${phone}</p>
    <p><strong>Address: </strong>${address}</p>
    <hr>
    <h3>Items:</h3>
    <ul>
  `;

  items.forEach(item => {
    html += `<li>${item.description} - ${item.quantity} x ${item.rate} = $${item.total}</li>`;
  });

  html += `
    </ul>
    <p><strong>Tax: </strong>${tax}%</p>
    <p><strong>Discount: </strong>${discount}%</p>
    <p><strong>Total: </strong>$${totalAmount}</p>
    <p><strong>Amount Paid: </strong>$${amountPaid}</p>
    <p><strong>Remaining Balance: </strong>$${remainingBalance}</p>
    <p><strong>Payment Status: </strong>${paymentStatus}</p>
    <p><strong>Notes: </strong>${notes}</p>
  `;

  const enableInstallments = document.getElementById("enableInstallments").checked;
  if (enableInstallments) {
    const numInstallments = parseInt(document.getElementById("numInstallments").value) || 0;
    html += `<h3>Installment Payments:</h3><ul>`;
    for (let i = 1; i <= numInstallments; i++) {
      const instField = document.getElementById(`installment-${i}`);
      const instValue = parseFloat(instField.value) || 0;
      html += `<li>Installment ${i}: $${instValue.toFixed(2)}</li>`;
    }
    html += `</ul>`;
  }

  document.getElementById("previewContent").innerHTML = html;
  document.getElementById("invoiceForm").style.display = "none";
  document.getElementById("invoicePreview").style.display = "block";
}

function backToForm() {
  document.getElementById("invoiceForm").style.display = "block";
  document.getElementById("invoicePreview").style.display = "none";
}

function downloadPDF() {
  const buttons = document.querySelectorAll('#invoicePreview button');
  buttons.forEach(btn => btn.style.display = 'none');

  const element = document.getElementById("invoicePreview").firstElementChild;

  setTimeout(() => {
    const opt = {
      margin: 0.5,
      filename: 'invoice.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        scrollY: 0
      },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
      buttons.forEach(btn => btn.style.display = 'inline-block');
    });
  }, 300);
}

function toggleInstallments() {
  const enabled = document.getElementById("enableInstallments").checked;
  document.getElementById("installmentSection").style.display = enabled ? "block" : "none";
  document.getElementById("installmentFields").innerHTML = "";
}

function generateInstallmentFields() {
  const count = parseInt(document.getElementById("numInstallments").value) || 0;
  const container = document.getElementById("installmentFields");
  container.innerHTML = "";

  const totalAmount = parseFloat(document.getElementById("totalAmount").textContent) || 0;
  const amountPaid = parseFloat(document.getElementById("amountPaid").value) || 0;
  const remainingBalance = totalAmount - amountPaid;

  const splitAmount = count > 0 ? (remainingBalance / count).toFixed(2) : 0;

  for (let i = 1; i <= count; i++) {
    const input = document.createElement("input");
    input.type = "number";
    input.id = `installment-${i}`;
    input.placeholder = `Installment ${i} Amount`;
    input.value = splitAmount;
    container.appendChild(input);
  }
}

// 🌐 Send Invoice Data to Backend
async function saveInvoiceToBackend(invoiceData) {
  try {
    const response = await fetch("https://invoice-backend-ame5.onrender.com/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invoiceData)
    });

    if (response.ok) {
      alert("✅ Invoice saved successfully!");
    } else {
      alert("❌ Failed to save invoice. Please try again.");
      console.error("Failed to save invoice:", response.statusText);
    }
  } catch (error) {
    alert("❌ Error saving invoice. Check console for details.");
    console.error("Error saving invoice:", error);
  }
}

// Gather all form data into one object
function collectInvoiceData() {
  const name = document.getElementById("clientName").value;
  const email = document.getElementById("clientEmail").value;
  const phone = document.getElementById("clientPhone").value;
  const address = document.getElementById("clientAddress").value;
  const invoiceNumber = document.getElementById("invoiceNumber").value;
  const invoiceDate = document.getElementById("invoiceDate").value;
  const dueDate = document.getElementById("dueDate").value;
  const tax = parseFloat(document.getElementById("tax").value) || 0;
  const discount = parseFloat(document.getElementById("discount").value) || 0;
  const amountPaid = parseFloat(document.getElementById("amountPaid").value) || 0;
  const remainingBalance = parseFloat(document.getElementById("remainingBalance").textContent) || 0;
  const paymentStatus = document.getElementById("paymentStatus").textContent;
  const notes = document.getElementById("notes").value;
  const totalAmount = parseFloat(document.getElementById("totalAmount").textContent);

  const items = [];
  document.querySelectorAll(".item-row").forEach(row => {
    const description = row.querySelector(".itemDescription").value;
    const quantity = parseFloat(row.querySelector(".itemQuantity").value) || 0;
    const rate = parseFloat(row.querySelector(".itemRate").value) || 0;
    const total = quantity * rate;

    items.push({ description, quantity, rate, total });
  });

  const installments = [];
  const enableInstallments = document.getElementById("enableInstallments").checked;
  if (enableInstallments) {
    const numInstallments = parseInt(document.getElementById("numInstallments").value) || 0;
    for (let i = 1; i <= numInstallments; i++) {
      const instValue = parseFloat(document.getElementById(`installment-${i}`).value) || 0;
      installments.push(instValue);
    }
  }

  return {
    client: { name, email, phone, address },
    invoiceNumber,
    invoiceDate,
    dueDate,
    items,
    tax,
    discount,
    totalAmount,
    amountPaid,
    remainingBalance,
    paymentStatus,
    notes,
    installments
  };
}
