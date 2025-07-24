import type { QueueResponse } from "~/clients/backend-client.server"
import styles from "./queue-table.module.css"
import { Badge, OverlayTrigger, Table, Tooltip } from "react-bootstrap"

export type QueueTableProps = {
    queue: QueueResponse
}

export function QueueTable({ queue }: QueueTableProps) {
    return (
        <Table responsive>
            <thead>
                <tr>
                    <th className={styles["first-table-header"]}>FileName</th>
                    <th className={styles["table-header"]}>Category</th>
                    <th className={styles["table-header"]}>Status</th>
                    <th className={styles["last-table-header"]}>Size</th>
                </tr>
            </thead>
            <tbody>
                {queue.slots.map((slot, index) =>
                    <tr key={index}>
                        <td className={styles["row-title"]}>
                            <div className={styles.truncate}>
                                {slot.filename}
                            </div>
                        </td>
                        <td className={styles["row-column"]}>
                            <CategoryBadge category={slot.cat} />
                        </td>
                        <td className={styles["row-column"]}>
                            <StatusBadge status={slot.status} />
                        </td>
                        <td className={styles["row-column"]}>
                            {formatFileSize(Number(slot.mb) * 1024 * 1024)}
                        </td>
                    </tr>
                )}
            </tbody>
        </Table>
    );
}

export function CategoryBadge({ category }: { category: string }) {
    const categoryLower = category?.toLowerCase();
    let variant = 'secondary';
    if (categoryLower === 'movies') variant = 'primary';
    if (categoryLower === 'tv') variant = 'info';
    return <Badge bg={variant}>{categoryLower}</Badge>
}

export function StatusBadge({ status, error }: { status: string, error?: string }) {
    const statusLower = status?.toLowerCase();
    let variant = "secondary";
    if (statusLower === "completed") variant = "success";
    if (statusLower === "failed") variant = "danger";
    if (statusLower === "downloading") variant = "primary";

    if (error?.startsWith("Article with message-id")) error = "Missing articles";
    const badgeClass = statusLower === "failed" ? styles["failure-badge"] : "";
    const overlay = statusLower == "failed"
        ? <Tooltip>{error}</Tooltip>
        : <></>;

    return (
        <OverlayTrigger placement="top" overlay={overlay} trigger="click">
            <Badge bg={variant} className={badgeClass}>{statusLower}</Badge>
        </OverlayTrigger>
    );
}

export function formatFileSize(bytes: number) {
    var suffix = "B";
    if (bytes >= 1024) { bytes /= 1024; suffix = "KB"; }
    if (bytes >= 1024) { bytes /= 1024; suffix = "MB"; }
    if (bytes >= 1024) { bytes /= 1024; suffix = "GB"; }
    if (bytes >= 1024) { bytes /= 1024; suffix = "TB"; }
    if (bytes >= 1024) { bytes /= 1024; suffix = "PB"; }
    return `${bytes.toFixed(2)} ${suffix}`;
}