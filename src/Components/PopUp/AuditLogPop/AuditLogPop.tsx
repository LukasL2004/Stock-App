import { useEffect, useState } from "react";
import type { AuditLogInterface } from "../../../Services/Interfaces/AuditLogInterface";
import AuditLog from "../../../Services/AuditLogService";
import Modal from "../../UI/Modal";
import ActivityList from "../../Transactions/ActivityList";
import FormError from "../../UI/FormError";
import { errorMessage } from "../../../lib/http";

export default function AuditLogPop({ closed }: { closed: () => void }) {
  const [items, setItems] = useState<AuditLogInterface[]>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    AuditLog.GetAudit()
      .then(setItems)
      .catch((e) => setError(errorMessage(e)));
  }, []);

  return (
    <Modal title="Activity" description="Every buy and sell on your account." onClose={closed} wide>
      <FormError message={error} />
      <ActivityList items={items} loading={!items && !error} pageSize={8} />
    </Modal>
  );
}
