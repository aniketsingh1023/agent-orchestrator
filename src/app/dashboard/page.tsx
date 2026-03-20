import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getOrCreateUser } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const user = await getOrCreateUser();
  if (!user) redirect("/sign-in");

  const [total, running, failed, completed] = await Promise.all([
    db.task.count({ where: { userId: user.id } }),
    db.task.count({ where: { userId: user.id, status: "RUNNING" } }),
    db.task.count({ where: { userId: user.id, status: "FAILED" } }),
    db.task.count({ where: { userId: user.id, status: "COMPLETED" } }),
  ]);

  const stats = [
    { title: "Total Tasks", value: total, color: "text-neutral-900" },
    { title: "Running", value: running, color: "text-orange-600" },
    { title: "Completed", value: completed, color: "text-green-600" },
    { title: "Failed", value: failed, color: "text-red-600" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
        <p className="text-neutral-500 mt-1">
          Welcome back{user.name ? `, ${user.name}` : ""}. Here&apos;s your overview.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-neutral-500">
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-neutral-500">
            Quota Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-neutral-100 rounded-full h-3">
              <div
                className="bg-orange-500 h-3 rounded-full transition-all"
                style={{
                  width: `${Math.min((user.tasksUsedThisMonth / user.taskQuota) * 100, 100)}%`,
                }}
              />
            </div>
            <span className="text-sm font-medium text-neutral-600">
              {user.tasksUsedThisMonth} / {user.taskQuota}
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-2">
            {user.plan} plan — {user.taskQuota - user.tasksUsedThisMonth} tasks remaining this month
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
