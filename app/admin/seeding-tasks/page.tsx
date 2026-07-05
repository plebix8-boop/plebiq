import { MockUserBatchList } from "@/features/admin/components/seeding/mock-user-batch-list";
import { MockUserSeedingTask } from "@/features/admin/components/seeding/mock-user-seeding-task";
import type { MockUserBatchSummary } from "@/features/admin/types";
import { createAdminClient } from "@/utils/supabase/admin";

type AuthUserRecord = {
  created_at?: string | null;
  user_metadata?: Record<string, unknown> | null;
};

async function getMockUserBatches(): Promise<MockUserBatchSummary[]> {
  const adminSupabase = createAdminClient();
  const users: AuthUserRecord[] = [];
  let page = 1;
  const perPage = 200;

  while (true) {
    const { data, error } = await adminSupabase.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) {
      throw new Error(error.message);
    }

    const chunk = data.users ?? [];
    users.push(...chunk);

    if (chunk.length < perPage) {
      break;
    }

    page += 1;
  }

  const grouped = new Map<string, MockUserBatchSummary>();

  for (const user of users) {
    const metadata = user.user_metadata ?? {};
    const batchId =
      typeof metadata.mock_batch_id === "string" ? metadata.mock_batch_id : null;
    const isMock = metadata.is_mock === true;
    const seededAt =
      typeof metadata.mock_created_at === "string"
        ? metadata.mock_created_at
        : null;

    if (!batchId || !isMock) {
      continue;
    }

    const current = grouped.get(batchId);

    if (!current) {
      grouped.set(batchId, {
        batchId,
        userCount: 1,
        seededStartAt: seededAt,
        seededEndAt: seededAt,
        batchCreatedAt: user.created_at ?? null,
      });
      continue;
    }

    current.userCount += 1;

    if (seededAt && (!current.seededStartAt || seededAt < current.seededStartAt)) {
      current.seededStartAt = seededAt;
    }

    if (seededAt && (!current.seededEndAt || seededAt > current.seededEndAt)) {
      current.seededEndAt = seededAt;
    }

    if (
      user.created_at &&
      (!current.batchCreatedAt || user.created_at < current.batchCreatedAt)
    ) {
      current.batchCreatedAt = user.created_at;
    }
  }

  return [...grouped.values()].sort((a, b) => {
    if (!a.batchCreatedAt && !b.batchCreatedAt) {
      return a.batchId.localeCompare(b.batchId);
    }

    if (!a.batchCreatedAt) {
      return 1;
    }

    if (!b.batchCreatedAt) {
      return -1;
    }

    return b.batchCreatedAt.localeCompare(a.batchCreatedAt);
  });
}

export default async function AdminSeedingTasksPage() {
  const batches = await getMockUserBatches();

  return (
    <div className="w-full min-w-0 space-y-6 p-6 sm:p-8 lg:p-10">
      <div>
        <h1 className="text-xl font-bold text-admin-text">Data Seeding Tasks</h1>
        <p className="mt-0.5 max-w-2xl text-sm text-admin-text-muted">
          Run controlled synthetic data jobs so the admin panel can be tested before
          real traffic arrives.
        </p>
      </div>

      <MockUserSeedingTask />
      <MockUserBatchList batches={batches} />
    </div>
  );
}
