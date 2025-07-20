// 🌐 Fetch and display all saved invoices
async function fetchInvoices() {
  try {
    const response = await fetch("https://invoice-backend-ame5.onrender.com/api/invoices");
    const invoices = await response.json();

    const savedInvoicesDiv = document.getElementById("savedInvoices");
    savedInvoicesDiv.innerHTML = ""; // Clear previous content

    if (invoices.length === 0) {
      savedInvoicesDiv.innerHTML = "<p>No invoices found.</p>";
      return;
    }

    // Build a table
    let table = "<table border='1' cellpadding='8' cellspacing='0' style='border-collapse: collapse; width: 100%;'>";
    table += `
      <tr style="background-color: #f2f2f2;">
        <th>Invoice #</th>
        <th>Client</th>
        <th>Total</th>
        <th>Status</th>
        <th>Date</th>
      </tr>
    `;

    invoices.forEach(invoice => {
      table += `
        <tr>
          <td>${invoice.invoiceNumber}</td>
          <td>${invoice.client.name}</td>
          <td>$${invoice.totalAmount.toFixed(2)}</td>
          <td>${invoice.paymentStatus}</td>
          <td>${invoice.invoiceDate}</td>
        </tr>
      `;
    });

    table += "</table>";
    savedInvoicesDiv.innerHTML = table;

  } catch (error) {
    console.error("Error fetching invoices:", error);
    alert("❌ Failed to fetch invoices. Check console for details.");
  }
}
