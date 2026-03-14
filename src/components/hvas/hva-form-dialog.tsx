import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateHva, useUpdateHva } from "@/hooks/use-hvas";
import { useAccounts } from "@/hooks/use-accounts";
import type { Tdvsp_hvasModel } from "@/generated";
import { toast } from "sonner";

type Hva = Tdvsp_hvasModel.Tdvsp_hvas;

interface HvaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  hva?: Hva;
}

interface FormData {
  tdvsp_name: string;
  tdvsp_description: string;
  tdvsp_date: string;
  tdvsp_customer: string;
}

const EMPTY_FORM: FormData = {
  tdvsp_name: "",
  tdvsp_description: "",
  tdvsp_date: "",
  tdvsp_customer: "",
};

const NONE_VALUE = "__none__";

function hvaToForm(item: Hva): FormData {
  const customerId = (item as unknown as Record<string, string>)._tdvsp_customer_value ?? "";
  return {
    tdvsp_name: item.tdvsp_name ?? "",
    tdvsp_description: item.tdvsp_description ?? "",
    tdvsp_date: item.tdvsp_date ? item.tdvsp_date.slice(0, 10) : "",
    tdvsp_customer: customerId,
  };
}

export function HvaFormDialog({
  open,
  onOpenChange,
  mode,
  hva,
}: HvaFormDialogProps) {
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const createMutation = useCreateHva();
  const updateMutation = useUpdateHva();
  const { data: accounts } = useAccounts();
  const isPending = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (open) {
      setForm(mode === "edit" && hva ? hvaToForm(hva) : EMPTY_FORM);
    }
  }, [open, mode, hva]);

  function updateField(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.tdvsp_name.trim()) {
      toast.error("Name is required");
      return;
    }

    const record: Record<string, unknown> = {
      tdvsp_name: form.tdvsp_name.trim(),
      tdvsp_description: form.tdvsp_description.trim() || undefined,
      tdvsp_date: form.tdvsp_date || undefined,
    };

    if (form.tdvsp_customer) {
      record["tdvsp_Customer@odata.bind"] = `/accounts(${form.tdvsp_customer})`;
    } else {
      record["tdvsp_Customer@odata.bind"] = undefined;
    }

    if (mode === "create") {
      createMutation.mutate(
        record as unknown as Omit<Tdvsp_hvasModel.Tdvsp_hvasBase, "tdvsp_hvaid">,
        {
          onSuccess: () => {
            toast.success(`Created "${form.tdvsp_name}"`);
            onOpenChange(false);
          },
          onError: (err) => toast.error(`Create failed: ${err.message}`),
        }
      );
    } else if (hva) {
      updateMutation.mutate(
        { id: hva.tdvsp_hvaid, fields: record },
        {
          onSuccess: () => {
            toast.success(`Updated "${form.tdvsp_name}"`);
            onOpenChange(false);
          },
          onError: (err) => toast.error(`Update failed: ${err.message}`),
        }
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "New HVA" : `Edit ${hva?.tdvsp_name ?? ""}`}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="tdvsp_name">Name *</Label>
              <Input
                id="tdvsp_name"
                value={form.tdvsp_name}
                onChange={(e) => updateField("tdvsp_name", e.target.value)}
                placeholder="Executive briefing session"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="tdvsp_customer">Customer</Label>
                <Select
                  value={form.tdvsp_customer || NONE_VALUE}
                  onValueChange={(v) =>
                    updateField("tdvsp_customer", v === NONE_VALUE ? "" : v)
                  }
                >
                  <SelectTrigger id="tdvsp_customer">
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE_VALUE}>None</SelectItem>
                    {accounts?.map((a) => (
                      <SelectItem key={a.accountid} value={a.accountid}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tdvsp_date">Date</Label>
                <Input
                  id="tdvsp_date"
                  type="date"
                  value={form.tdvsp_date}
                  onChange={(e) => updateField("tdvsp_date", e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tdvsp_description">Description</Label>
              <Textarea
                id="tdvsp_description"
                value={form.tdvsp_description}
                onChange={(e) => updateField("tdvsp_description", e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? "Saving..."
                : mode === "create"
                  ? "Create"
                  : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
