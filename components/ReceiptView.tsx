"use client";

export type ReceiptData = {
  receiptNo: string;
  amount: number;
  createdAt: string;
  feePayment?: { method?: string; transactionId?: string; allocations?: { amount: number; installment?: { label?: string } }[] };
  admission?: { applicationId?: string; studentId?: string; course?: string; name?: string };
  student?: { name?: string; email?: string; phone?: string };
};

export default function ReceiptView({ r }: { r: ReceiptData }) {
  const allocs = r.feePayment?.allocations || [];
  return (
    <div className="bg-white text-slate-900 p-6 max-w-md w-full">
      <div className="text-center border-b-2 border-navy-900 pb-3">
        <div className="font-display font-bold text-lg">AYAAN INSTITUTE</div>
        <div className="text-[11px] tracking-widest text-slate-500">GROUP OF COMPETITIVE INSTITUTIONS</div>
        <div className="text-xs text-slate-500 mt-1">Fee Receipt</div>
      </div>
      <div className="mt-4 grid gap-1.5 text-sm">
        <div className="flex justify-between"><span className="text-slate-500">Receipt No</span><b>{r.receiptNo}</b></div>
        <div className="flex justify-between"><span className="text-slate-500">Date</span><span>{new Date(r.createdAt).toLocaleString("en-IN")}</span></div>
        <div className="flex justify-between"><span className="text-slate-500">Student</span><span>{r.student?.name || r.admission?.name || "—"}</span></div>
        {(r.admission?.studentId || r.admission?.applicationId) && (
          <div className="flex justify-between"><span className="text-slate-500">IDs</span><span className="text-xs">{[r.admission?.studentId, r.admission?.applicationId].filter(Boolean).join(" • ")}</span></div>
        )}
        {r.admission?.course && <div className="flex justify-between"><span className="text-slate-500">Course</span><span>{r.admission.course}</span></div>}
        <div className="flex justify-between"><span className="text-slate-500">Method</span><span className="capitalize">{r.feePayment?.method || "—"}</span></div>
        {r.feePayment?.transactionId && <div className="flex justify-between"><span className="text-slate-500">Ref</span><span className="text-xs">{r.feePayment.transactionId}</span></div>}
      </div>
      {allocs.length > 0 && (
        <div className="mt-3 border-t border-dashed pt-2">
          <div className="text-xs font-bold text-slate-500">ALLOCATED TO</div>
          {allocs.map((a: any, i: number) => (
            <div key={i} className="flex justify-between text-sm mt-1">
              <span>{a.installment?.label || "Installment"}</span>
              <span>₹{Number(a.amount).toLocaleString("en-IN")}</span>
            </div>
          ))}
        </div>
      )}
      <div className="mt-3 border-t-2 border-navy-900 pt-2 flex justify-between font-bold text-lg">
        <span>Paid</span>
        <span>₹{Number(r.amount).toLocaleString("en-IN")}</span>
      </div>
      <div className="mt-3 text-center text-[11px] text-slate-400">Computer-generated receipt • Ayaan Institute • +91 88866 67222</div>
      <button onClick={() => window.print()} className="mt-4 w-full py-2.5 rounded-full bg-navy-900 text-white text-sm print:hidden">Print / Save PDF</button>
    </div>
  );
}
