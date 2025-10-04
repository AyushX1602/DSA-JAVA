import React from 'react';
import { useUserStats, useTripStats } from '@/hooks/react-query/use-admin';

export default function DebugAdminData() {
  const userStatsQuery = useUserStats();
  const tripStatsQuery = useTripStats();

  return (
    <div className="p-4 bg-gray-100 m-4">
      <h2 className="text-lg font-bold mb-4">Admin Data Debug</h2>

      <div className="mb-4">
        <h3 className="font-semibold">User Stats Query:</h3>
        <pre className="text-xs bg-white p-2 overflow-auto">
          {JSON.stringify(
            {
              isLoading: userStatsQuery.isLoading,
              isError: userStatsQuery.isError,
              isSuccess: userStatsQuery.isSuccess,
              error: userStatsQuery.error?.message,
              data: userStatsQuery.data,
            },
            null,
            2,
          )}
        </pre>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold">Trip Stats Query:</h3>
        <pre className="text-xs bg-white p-2 overflow-auto">
          {JSON.stringify(
            {
              isLoading: tripStatsQuery.isLoading,
              isError: tripStatsQuery.isError,
              isSuccess: tripStatsQuery.isSuccess,
              error: tripStatsQuery.error?.message,
              data: tripStatsQuery.data,
            },
            null,
            2,
          )}
        </pre>
      </div>

      <button
        onClick={() => {
          userStatsQuery.refetch();
          tripStatsQuery.refetch();
        }}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Refetch Data
      </button>
    </div>
  );
}
