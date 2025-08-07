import { useQuery } from "@tanstack/react-query";
import { getCohortList, cohortListData } from "./cohortService";
export const refetchInterval: number = 5 * 60 * 1000;
export const gcTime: number = 10 * 60 * 1000;
export const useCohortList = (userId: cohortListData) => {
  return useQuery({
    queryKey: ["cohort"],
    queryFn: () => getCohortList(userId),
    refetchInterval: refetchInterval,
    gcTime: gcTime,
  });
};
