"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Printer, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface BillPrintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  tableNumber: string;
  onConfirm: () => Promise<void>;
}

export function BillPrintDialog({
  open,
  onOpenChange,
  orderId,
  tableNumber,
  onConfirm,
}: BillPrintDialogProps) {
  const [isPrinting, setIsPrinting] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://192.168.1.3:4000/api";

  const handlePrintPDF = async () => {
    setIsPrinting(true);
    try {
      const token = localStorage.getItem("waiterToken");
      const response = await fetch(`${API_URL}/orders/${orderId}/bill/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to generate PDF");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `bill-table-${tableNumber}-${Date.now()}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);

      toast.success("Đã tải bill PDF thành công!");
    } catch (error) {
      console.error("Print PDF error:", error);
      toast.error("Không thể in PDF");
    } finally {
      setIsPrinting(false);
    }
  };

  const handlePrintThermal = async () => {
    setIsPrinting(true);
    try {
      const token = localStorage.getItem("waiterToken");
      const response = await fetch(`${API_URL}/orders/${orderId}/bill/thermal`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to generate thermal bill");

      const escpos = await response.text();
      
      // Check if Web Serial API is available
      if ('serial' in navigator) {
        try {
          // @ts-ignore
          const port = await navigator.serial.requestPort();
          await port.open({ baudRate: 9600 });
          
          const writer = port.writable.getWriter();
          const encoder = new TextEncoder();
          await writer.write(encoder.encode(escpos));
          writer.releaseLock();
          await port.close();
          
          toast.success("Đã in bill nhiệt thành công!");
        } catch (serialError: any) {
          if (serialError.name === 'NotFoundError') {
            toast.error("Không tìm thấy máy in. Vui lòng kết nối máy in.");
          } else {
            throw serialError;
          }
        }
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(escpos);
        toast.info("Lệnh in đã copy vào clipboard. Paste vào phần mềm máy in.");
      }
    } catch (error: any) {
      console.error("Print thermal error:", error);
      toast.error("Không thể in bill nhiệt");
    } finally {
      setIsPrinting(false);
    }
  };

  const handleConfirmPayment = async () => {
    setIsConfirming(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error("Confirm payment error:", error);
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Xác nhận thanh toán</DialogTitle>
          <DialogDescription>
            Bàn {tableNumber} - Bạn muốn in bill cho khách?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handlePrintPDF}
            disabled={isPrinting || isConfirming}
          >
            {isPrinting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileText className="mr-2 h-4 w-4" />
            )}
            In PDF (A5)
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handlePrintThermal}
            disabled={isPrinting || isConfirming}
          >
            {isPrinting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Printer className="mr-2 h-4 w-4" />
            )}
            In nhiệt (80mm)
          </Button>

          <div className="pt-2 text-center text-sm text-muted-foreground">
            Bạn có thể bỏ qua và xác nhận trực tiếp
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isConfirming}
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirmPayment}
            disabled={isConfirming}
            className="bg-green-600 hover:bg-green-700"
          >
            {isConfirming ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xác nhận...
              </>
            ) : (
              "Xác nhận thanh toán"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
