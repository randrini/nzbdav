import { redirect } from "react-router";
import type { Route } from "./+types/route";
import { sessionStorage } from "~/auth/authentication.server";
import { Layout } from "../_index/components/layout/layout";
import { TopNavigation } from "../_index/components/top-navigation/top-navigation";
import { LeftNavigation } from "../_index/components/left-navigation/left-navigation";
import styles from "./route.module.css"
import { Alert } from 'react-bootstrap';
import { backendClient, type HistoryResponse, type QueueResponse } from "~/clients/backend-client.server";
import { EmptyQueue } from "./components/empty-queue/empty-queue";
import { HistoryTable } from "./components/history-table/history-table";
import { QueueTable } from "./components/queue-table/queue-table";

type BodyProps = {
    loaderData: { queue: QueueResponse, history: HistoryResponse },
    actionData: { error: string } | undefined
};

export async function loader({ request }: Route.LoaderArgs) {
    let session = await sessionStorage.getSession(request.headers.get("cookie"));
    let user = session.get("user");
    if (!user) return redirect("/login");

    var queuePromise = backendClient.getQueue();
    var historyPromise = backendClient.getHistory();
    var queue = await queuePromise;
    var history = await historyPromise;
    return {
        queue: queue,
        history: history,
    }
}

export default function Queue(props: Route.ComponentProps) {
    return (
        <Layout
            topNavComponent={TopNavigation}
            bodyChild={<Body loaderData={props.loaderData} actionData={props.actionData} />}
            leftNavChild={<LeftNavigation />}
        />
    );
}

function Body({ loaderData, actionData }: BodyProps) {
    const { queue, history } = loaderData;
    return (
        <div className={styles.container}>
            {/* queue */}
            <div className={styles.section}>
                <h3 className={styles["section-title"]}>
                    Queue
                </h3>
                <div className={styles["section-body"]}>
                    {/* error message */}
                    {actionData?.error &&
                        <Alert variant="danger">
                            {actionData?.error}
                        </Alert>
                    }
                    {queue.slots.length > 0 ? <QueueTable queue={queue} /> : <EmptyQueue />}
                </div>
            </div>

            {/* history */}
            <div className={styles.section}>
                <h3 className={styles["section-title"]}>
                    History
                </h3>
                <div className={styles["section-body"]}>
                    <HistoryTable history={history} />
                </div>
            </div>
        </div>
    );
}

export async function action({ request }: Route.ActionArgs) {
    let session = await sessionStorage.getSession(request.headers.get("cookie"));
    let user = session.get("user");
    if (!user) return redirect("/login");

    try {
        const formData = await request.formData();
        const nzbFile = formData.get("nzbFile");
        if (nzbFile instanceof File) {
            await backendClient.addNzb(nzbFile);
        } else {
            return { error: "Error uploading nzb." }
        }
    } catch (error) {
        if (error instanceof Error) {
            return { error: error.message };
        }
        throw error;
    }
}