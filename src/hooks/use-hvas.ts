import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tdvsp_hvasService } from "@/generated";
import type { Tdvsp_hvasModel } from "@/generated";

const HVAS_KEY = ["hvas"] as const;

export function useHvas(options?: { filter?: string; orderBy?: string[] }) {
  return useQuery({
    queryKey: [...HVAS_KEY, options],
    queryFn: async () => {
      const result = await Tdvsp_hvasService.getAll({
        filter: options?.filter,
        orderBy: options?.orderBy ?? ["tdvsp_name asc"],
      });
      return result.data ?? [];
    },
  });
}

export function useHva(id: string | undefined) {
  return useQuery({
    queryKey: [...HVAS_KEY, id],
    queryFn: async () => {
      const result = await Tdvsp_hvasService.get(id!);
      return result.data;
    },
    enabled: !!id,
  });
}

export function useCreateHva() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      record: Omit<Tdvsp_hvasModel.Tdvsp_hvasBase, "tdvsp_hvaid">
    ) => {
      const result = await Tdvsp_hvasService.create(record);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HVAS_KEY });
    },
  });
}

export function useUpdateHva() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      fields,
    }: {
      id: string;
      fields: Partial<Omit<Tdvsp_hvasModel.Tdvsp_hvasBase, "tdvsp_hvaid">>;
    }) => {
      const result = await Tdvsp_hvasService.update(id, fields);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HVAS_KEY });
    },
  });
}

export function useDeleteHva() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await Tdvsp_hvasService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HVAS_KEY });
    },
  });
}
