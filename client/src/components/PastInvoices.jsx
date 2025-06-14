import React, { useEffect, useState } from "react";
import axios from "axios";
import { jsPDF } from "jspdf"; // Import jsPDF
import "jspdf-autotable";
import { FaRegFilePdf } from "react-icons/fa";
import { FaTrashCan } from "react-icons/fa6";
import { toast } from "react-toastify";
import companyInfo from "../utils/companyInfo.jsx";
import backendUrl from "./AddInvoiceForm.jsx"

const PastInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [showModal, setShowModal] = useState(false); // For modal visibility
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null); // To store the invoice ID
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, []);

  
const fetchInvoices = async () => {
  try {
    const response = await axios.get(`${backendUrl}/api/invoices/all`);
    setInvoices(response.data);
  } catch (err) {
    console.error("Failed to fetch invoices", err);
  }
};


  const confirmDeleteInvoice = (invoiceId) => {
    setSelectedInvoiceId(invoiceId);
    setShowModal(true); // Show the modal
  };

const deleteInvoice = async () => {
  setIsLoading(true);
  try {
    const response = await axios.delete(`${backendUrl}/api/invoices/${selectedInvoiceId}`);

    setInvoices((prevInvoices) =>
      prevInvoices.filter((invoice) => invoice._id !== selectedInvoiceId)
    );

    setShowModal(false);
    if (response.status === 200) {
      toast.success("Invoice deleted successfully!");
    }
  } catch (err) {
    console.error("Failed to delete invoice", err);
    toast.error("Failed to delete invoice");
  } finally {
    setIsLoading(false);
  }
};

 const downloadPDF = (invoice) => {

console.log("Company Info:", companyInfo); // ← à ajouter ici

  const doc = new jsPDF();

  // 🔸 Ajoute tes infos d'entreprise
  doc.setFontSize(12);
  doc.text(companyInfo.name, 20, 20);
  doc.text(`NINEA : ${companyInfo.ninea}`, 20, 28);
  doc.text(`Adresse : ${companyInfo.address}`, 20, 36);
  doc.text(`Téléphone : ${companyInfo.phone}`, 20, 44);
  doc.text(`Email : ${companyInfo.email}`, 20, 52);
  doc.line(20, 58, 190, 58); // ligne de séparation

  // 🔹 Infos client
  doc.text(`ID Facture : ${invoice._id}`, 20, 66);
  doc.text(`Nom client : ${invoice.customerName}`, 20, 74);
  doc.text(`Email client : ${invoice.customerEmail}`, 20, 82);
  doc.text(
    `Date : ${new Date(invoice.createdAt).toLocaleDateString()}`,
    20,
    90
  );

  doc.text(`Montant total : $${invoice.total.toFixed(2)}`, 20, 98);

  // 🔹 Tableau des produits
  const tableColumnHeaders = [
    "Produit",
    "Quantité",
    "Prix ($)",
    "Taxe (%)",
    "Total ($)",
  ];

  const tableRows = invoice.products.map((product) => [
    product.name,
    product.quantity,
    product.price.toFixed(2),
    invoice.tax.toFixed(2),
    (product.quantity * product.price).toFixed(2),
  ]);

  doc.autoTable({
    startY: 110,
    head: [tableColumnHeaders],
    body: tableRows,
  });

  doc.save(`facture_${invoice._id}.pdf`);
};
  return (
    <div className="p-4 sm:p-6 bg-gray-100 min-h-screen">
      <div className="max-w-full sm:max-w-4xl mx-auto bg-white shadow-lg rounded-lg">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 text-center py-4 border-b border-gray-200">
          Past Invoices
        </h1>
        <div className="overflow-x-auto">
          <table className="w-full table-auto text-sm text-left text-gray-600">
            <thead className="text-xs uppercase bg-gray-200 text-gray-700">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice, index) => (
                <tr
                  key={invoice._id}
                  className={`border-b ${
                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } hover:bg-blue-50`}
                >
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {invoice.customerName}
                  </td>
                  <td className="px-4 py-3">{invoice.customerEmail}</td>
                  <td className="px-4 py-3 font-bold text-green-600">
                    ${invoice.total.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    {new Date(invoice.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      onClick={() => downloadPDF(invoice)}
                      className="bg-neutral-700 text-white py-2 px-3 rounded-md hover:bg-neutral-800 transition"
                    >
                      <FaRegFilePdf className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => confirmDeleteInvoice(invoice._id)}
                      className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      <FaTrashCan className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {invoices.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            No invoices found. Start creating your first invoice!
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Confirm Delete
            </h3>
            <p className="text-gray-600">
              Are you sure you want to delete this invoice? This action cannot
              be undone.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={deleteInvoice}
                disabled={isLoading}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
              >
                {isLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PastInvoices;
