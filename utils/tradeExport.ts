import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";

export function exportTradeBookPDF(trades: any[]) {
  if (!Array.isArray(trades) || trades.length === 0) {
    throw new Error("No trades available");
  }

  const doc = new jsPDF("landscape");

  doc.setFontSize(14);
  doc.text("Trade Book", 14, 15);

  autoTable(doc, {
    startY: 22,
    head: [[
      "Instrument",
      "Product",
      "Qty",
      "Price",
      "Time",
      "Trade Value",
      "Side",
    ]],
    body: trades.map((row) => [
      row.symbol,
      row.productType,
      row.tradedQty,
      row.tradePrice,
      row.orderDateTime,
      row.tradeValue,
      row.side === "-1" ? "SELL" : "BUY",
    ]),
    styles: {
      fontSize: 9,
      halign: "center",
    },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 6) {
        if (data.cell.text[0] === "BUY") {
          data.cell.styles.fillColor = [22, 163, 74]; // green
          data.cell.styles.textColor = [255, 255, 255];
        }
        if (data.cell.text[0] === "SELL") {
          data.cell.styles.fillColor = [220, 38, 38]; // red
          data.cell.styles.textColor = [255, 255, 255];
        }
      }
    },
  });

  doc.save(`trade-book-${Date.now()}.pdf`);
}

export function exportTradeBookCSV(trades: any[]) {
  if (!Array.isArray(trades) || trades.length === 0) {
    throw new Error("No trades available");
  }

  const cleanData = trades.map((row) => ({
    symbol: row.symbol,
    productType: row.productType,
    tradedQty: row.tradedQty,
    tradePrice: row.tradePrice,
    orderDateTime: row.orderDateTime,
    tradeValue: row.tradeValue,
    side: row.side === "-1" ? "SELL" : "BUY",
  }));

  const csv = Papa.unparse(cleanData);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `trade-book-${Date.now()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
