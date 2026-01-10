import { TransactionForm } from "@/components/TransactionForm";

export default function AddTransaction() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#D68AB1] to-[#B48] text-black flex items-center justify-center px-4 py-10">
      <div className="max-w-4xl w-full">
        <TransactionForm />
      </div>
    </div>
  );
}
