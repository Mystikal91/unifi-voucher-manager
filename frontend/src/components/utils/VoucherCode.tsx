import { copyText } from "@/utils/clipboard";
import { formatCode } from "@/utils/format";
import { notify } from "@/utils/notifications";
import { useState } from "react";
import { Voucher } from "@/types/voucher";
import { useRouter } from "next/navigation";
import { storePrintJob } from "@/utils/print";

type Props = {
  voucher: Voucher;
  contentClassName?: string;
};

export default function VoucherCode({ voucher, contentClassName = "" }: Props) {
  const code = formatCode(voucher.code);
  const [_copied, setCopied] = useState(false);
  const router = useRouter();

  const handleCopy = async () => {
    if (await copyText(voucher.code)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      notify("Codice copiato negli appunti!", "success");
    } else {
      notify("Impossibile copiare codice", "error");
    }
  };

  const handlePrint = () => {
    const batchId = storePrintJob([voucher], "list");
    router.replace(`/print?batchId=${batchId}`);
  };

  return (
    <div className={`text-center ${contentClassName}`}>
      <div
        onClick={handleCopy}
        className="cursor-pointer mb-4 text-3xl voucher-code"
      >
        {code}
      </div>
      <div className="flex-center gap-3">
        <button onClick={handleCopy} className="btn-success">
          Copia Codice
        </button>
        <button onClick={handlePrint} className="btn-primary">
          Stampa Voucher
        </button>
      </div>
    </div>
  );
}
