import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Tdvsp_hvasModel } from "@/generated";
import { useAccounts } from "@/hooks/use-accounts";
import { Pencil } from "lucide-react";

type Hva = Tdvsp_hvasModel.Tdvsp_hvas;

interface HvaDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hva?: Hva;
  onEdit: (item: Hva) => void;
}

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="grid grid-cols-3 gap-2 py-1.5">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="col-span-2 text-sm">{value}</dd>
    </div>
  );
}

export function HvaDetailDialog({
  open,
  onOpenChange,
  hva,
  onEdit,
}: HvaDetailDialogProps) {
  const { data: accounts } = useAccounts();

  if (!hva) return null;

  const customerId = (hva as unknown as Record<string, string>)._tdvsp_customer_value;
  const customerName = hva.tdvsp_customername
    ?? accounts?.find((a) => a.accountid === customerId)?.name;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between pr-8">
            <DialogTitle>{hva.tdvsp_name}</DialogTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(hva)}
            >
              <Pencil className="mr-2 h-3 w-3" />
              Edit
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={hva.statecode === 0 ? "default" : "secondary"}>
              {hva.statecodename ?? "Active"}
            </Badge>
          </div>

          <Separator />

          <dl>
            <DetailRow label="Customer" value={customerName} />
            <DetailRow
              label="Date"
              value={hva.tdvsp_date ? new Date(hva.tdvsp_date).toLocaleDateString() : null}
            />
          </dl>

          {hva.tdvsp_description && (
            <>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Description</p>
                <p className="text-sm whitespace-pre-wrap">
                  {hva.tdvsp_description}
                </p>
              </div>
            </>
          )}

          <Separator />
          <dl>
            <DetailRow label="Owner" value={hva.owneridname} />
          </dl>
        </div>
      </DialogContent>
    </Dialog>
  );
}
