import { useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../../components/layouts/Layout";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { ArrowLeft, Printer } from "lucide-react";
import { useChalaniDetail } from "../_hooks/useChalani";
import { useReactToPrint } from "react-to-print";
// import html2canvas from "html2canvas";
// import jsPDF from "jspdf";

const ChalaniDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const printRef = useRef<HTMLDivElement>(null);

    const { chalani, isLoading, isError } = useChalaniDetail(Number(id));

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Chalani-${chalani?.chalan_no || id}`,
    });


    // Handle download PDF - simplified black and white version
//     const handleDownloadPDF = async () => {
//         if (!printRef.current || !chalani) return;

//         try {
//             // Clone the element
//             const element = printRef.current;
//          const clonedElement = element.cloneNode(true) as HTMLElement;

// // Add pdf class for custom styling
// clonedElement.classList.add('pdf');

// // Position off-screen with fixed width (A4-friendly)
// clonedElement.style.cssText = `
//   position: absolute;
//   left: -9999px;
//   top: 0;
//   width: 210mm; /* A4 width */
//   min-height: 297mm;
//   padding: 20mm;
//   box-sizing: border-box;
//   background: white;
// `;

// document.body.appendChild(clonedElement);

//             // Force simple black and white colors
//             const forceBlackWhite = (el: HTMLElement) => {
//                 // Set safe black/white colors
//                 el.style.backgroundColor = '#ffffff';
//                 el.style.color = '#000000';
//                 el.style.borderColor = '#000000';

//                 // Process all children
//                 Array.from(el.children).forEach(child => {
//                     forceBlackWhite(child as HTMLElement);
//                 });
//             };

//             forceBlackWhite(clonedElement);

//             const canvas = await html2canvas(clonedElement, {
//                 scale: 2,
//                 useCORS: true,
//                 logging: false,
//                 backgroundColor: '#ffffff',
//             });

//             // Remove cloned element
//             document.body.removeChild(clonedElement);

//             const imgData = canvas.toDataURL("image/png");
//             const pdf = new jsPDF({
//                 orientation: "portrait",
//                 unit: "mm",
//                 format: "a4",
//             });

//             const imgWidth = 210; // A4 width in mm
//             const imgHeight = (canvas.height * imgWidth) / canvas.width;

//             pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
//             pdf.save(`Chalani-${chalani.chalan_no}.pdf`);
//         } catch (error) {
//             console.error("Error generating PDF:", error);
//             alert("Failed to generate PDF. Please try again.");
//         }
//     };
    // Format date
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
            });
        } catch {
            return dateString;
        }
    };

    // Format currency
    const formatCurrency = (amount: string | number) => {
        const num = typeof amount === "string" ? parseFloat(amount) : amount;
        return isNaN(num) ? "0.00" : num.toFixed(2);
    };

    // Calculate subtotal
    const calculateSubtotal = () => {
        if (!chalani) return 0;
        return chalani.chalani_items.reduce(
            (sum, item) => sum + parseFloat(item.total_price),
            0
        );
    };

    // Calculate discount amount
    const calculateDiscountAmount = () => {
        if (!chalani || !chalani.discount_value) return 0;
        const subtotal = calculateSubtotal();
        const discountValue = parseFloat(chalani.discount_value);

        if (isNaN(discountValue) || discountValue === 0) return 0;

        if (chalani.discount_type === "percentage") {
            return (subtotal * discountValue) / 100;
        }
        return discountValue;
    };

    if (isLoading) {
        return (
            <Layout>
                <div className="flex justify-center items-center h-64">
                    <div className="text-lg">Loading chalani...</div>
                </div>
            </Layout>
        );
    }

    if (isError || !chalani) {
        return (
            <Layout>
                <div className="text-center py-8">
                    <p className="text-red-600 mb-4">Error loading chalani details</p>
                    <Button onClick={() => navigate("/chalani")}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to List
                    </Button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-5xl mx-auto py-6">
                {/* Header with Actions */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Chalani #{chalani.chalan_no}
                            </h1>
                            <p className="text-gray-600 mt-1">{chalani.name}</p>
                        </div>
                        <Button variant="outline" onClick={() => navigate("/chalani")}>
                            Back
                        </Button>
                    </div>

                    {/* Action Buttons */}
                    <Card className="mb-6">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold">Estimate #{chalani.chalan_no}</h3>
                                    <p className="text-sm text-gray-600">
                                        Generated on {formatDate(chalani.issue_date)}
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <Button variant="outline" onClick={handlePrint}>
                                        <Printer className="h-4 w-4 mr-2" />
                                        Print
                                    </Button>
                                    {/* <Button variant="outline" onClick={handleDownloadPDF}>
                                        <Download className="h-4 w-4 mr-2" />
                                        Download PDF
                                    </Button> */}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Printable Content */}
                <Card className="shadow-lg">
                    <CardContent className="p-6 md:p-12" ref={printRef}>
                        {/* Company Header */}
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-900">
                                MONALISA ENTERPRISES Pvt. Ltd.
                            </h1>
                            <p className="text-sm text-gray-600 mt-2">
                                GPO BOX No.23484, Tewa Tower, 4th Floor, Teku Road, Kathmandu
                            </p>
                            <p className="text-sm text-gray-600">Tel: 977-01-5354488</p>
                        </div>

                        
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Ch.No.{chalani.chalan_no}
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="bg-black text-white px-8 py-2 rounded">
                                    <h2 className="text-lg font-semibold">CHALANI / DELIVERY SLIP</h2>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-700">
                                    Date: {formatDate(chalani.issue_date)}
                                </p>
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div className="mb-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm">
                                        <span className="font-semibold">Name:</span> {chalani.name}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm">
                                        <span className="font-semibold">Invoice No.</span>
                                        {chalani.chalan_no}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="mb-8">
                            <table className="w-full border-collapse border border-gray-300">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="border border-gray-300 py-3 px-4 text-left text-sm font-semibold">
                                            S.N
                                        </th>
                                        <th className="border border-gray-300 py-3 px-4 text-left text-sm font-semibold">
                                            Particulars
                                        </th>
                                        <th className="border border-gray-300 py-3 px-4 text-center text-sm font-semibold">
                                            Quantity
                                        </th>
                                        <th className="border border-gray-300 py-3 px-4 text-left text-sm font-semibold">
                                            Remarks
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {chalani.chalani_items.map((item, index) => (
                                        <tr key={item.id}>
                                            <td className="border border-gray-300 py-3 px-4 text-sm">
                                                {index + 1}
                                            </td>
                                            <td className="border border-gray-300 py-3 px-4">
                                                <div className="text-sm font-medium">
                                                    {item.product_variations.name}
                                                </div>
                                               
                                            </td>
                                            <td className="border border-gray-300 py-3 px-4 text-center text-sm">
                                                {item.quantity}
                                            </td>
                                            <td className="border border-gray-300 py-3 px-4 text-sm">
                                                {/* Remarks column */}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer Message */}
                        <div className="text-center mb-8 py-3 border-t border-b border-gray-300">
                            <p className="text-sm">
                                I received the above mentioned items hereby signed with Name & contact
                                details.
                            </p>
                        </div>

                        {/* Signature Section */}
                        <div className="flex justify-between items-end">
                            <div className="space-y-1">
                                <p className="text-sm">
                                    <span className="font-semibold">Received By:</span>{" "}
                                    ........................................................
                                </p>
                                <p className="text-sm">
                                    <span className="font-semibold">Date:</span>{" "}
                                    {formatDate(chalani.issue_date)}
                                </p>
                                <p className="text-sm">
                                    <span className="font-semibold">Contact No.</span>{" "}
                                    ........................................................
                                </p>
                                <p className="text-sm">
                                    <span className="font-semibold">Signature:</span>
                                    ........................................................
                                </p>
                            </div>

                            <div className="text-right">
                                <p className="text-sm">
                                    ................................................................
                                </p>
                                <p className="text-sm font-semibold mt-2">
                                    For Monalisa Enterprises Pvt.Ltd.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Additional Info Card (Not printed) */}
                <Card className="mt-6 no-print">
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Financial Details</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Subtotal:</span>
                                <span className="font-semibold">
                                    NPR {formatCurrency(calculateSubtotal())}
                                </span>
                            </div>

                            {parseFloat(chalani.discount_value || "0") > 0 && (
                                <>
                                    <div className="flex justify-between text-red-600">
                                        <span>
                                            Discount ({chalani.discount_type === "percentage"
                                                ? `${chalani.discount_value}%`
                                                : "Fixed"}):
                                        </span>
                                        <span className="font-semibold">
                                            -NPR {formatCurrency(calculateDiscountAmount())}
                                        </span>
                                    </div>
                                </>
                            )}

                            <div className="border-t pt-3 flex justify-between">
                                <span className="text-lg font-bold">Grand Total:</span>
                                <span className="text-xl font-bold text-green-600">
                                    NPR {formatCurrency(chalani.total_amount)}
                                </span>
                            </div>
                        </div>

                        {/* Items Detail */}
                        <div className="mt-6">
                            <h4 className="font-semibold mb-3">Item Details</h4>
                            <div className="space-y-2">
                                {chalani.chalani_items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex justify-between items-center p-3 bg-gray-50 rounded"
                                    >
                                        <div>
                                            <p className="font-medium">{item.product_variations.name}</p>
                                            <p className="text-sm text-gray-600">
                                                Qty: {item.quantity} × NPR {formatCurrency(item.unit_price)}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold">
                                                NPR {formatCurrency(item.total_price)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Print Styles */}
            <style>{`
  @media print {
    .no-print {
      display: none !important;
    }
    body {
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
  }

  /* PDF-specific adjustments - applied during html2canvas capture */
  .pdf .bg-black {
    background-color: #000000 !important;
    -webkit-print-color-adjust: exact;
  }
  .pdf table {
    font-size: 14px;
  }
  .pdf th, .pdf td {
    padding: 10px 12px !important;
  }
  .pdf .text-3xl {
    font-size: 2.5rem !important;
  }
  .pdf .text-xl {
    font-size: 1.375rem !important;
  }
`}</style>
        </Layout>
    );
};

export default ChalaniDetail;