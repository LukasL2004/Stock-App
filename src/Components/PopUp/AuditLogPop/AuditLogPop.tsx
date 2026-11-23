import { useEffect, useState } from "react";
import type { AuditLogInterface } from "../../../Services/Interfaces/AuditLogInterface";
import AuditLog from "../../../Services/AuditLogService";
import Modal from "../../UI/Modal";
import ActivityList from "../../Transactions/ActivityList";
import FormError from "../../UI/FormError";
import { errorMessage } from "../../../lib/http";
import { useI18n } from "../../../i18n/useI18n";

export default function AuditLogPop({ closed }: { closed: () => void }) {
  const { t } = useI18n();
  const [items, setItems] = useState<AuditLogInterface[]>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    AuditLog.GetAudit()
      .then(setItems)
      .catch((e) => setError(errorMessage(e)));
  }, []);

  return (
    <Modal title={t("modal.activity.title")} description={t("modal.activity.desc")} onClose={closed} wide>
      <FormError message={error} />
      <ActivityList items={items} loading={!items && !error} pageSize={8} />
    </Modal>
  );
}
