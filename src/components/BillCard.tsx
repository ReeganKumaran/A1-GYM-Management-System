interface Bill {
  memberId: string;
  amount: number;
  date: string;
  dueDate: string;
  description: string;
  status: "paid" | "pending" | "overdue";
  paymentMethod: string;
}

interface BillCardProps {
  bill: Bill;
}

const statusStyles: Record<string, { bg: string; text: string }> = {
  paid: { bg: "bg-green-500/15", text: "text-green-400" },
  pending: { bg: "bg-yellow-500/15", text: "text-yellow-400" },
  overdue: { bg: "bg-red-500/15", text: "text-red-400" },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function BillCard({ bill }: BillCardProps) {
  const status = statusStyles[bill.status] || statusStyles.pending;

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-gray-400">{bill.description}</p>
          <p className="mt-1 text-2xl font-bold text-white">
            ${bill.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.text} border border-current/20`}
        >
          {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
        </span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Bill Date</span>
          <span className="text-gray-300">{formatDate(bill.date)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Due Date</span>
          <span className="text-gray-300">{formatDate(bill.dueDate)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Payment Method</span>
          <span className="text-gray-300">{bill.paymentMethod}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Member ID</span>
          <span className="text-gray-300 font-mono text-xs">
            {bill.memberId}
          </span>
        </div>
      </div>
    </div>
  );
}
