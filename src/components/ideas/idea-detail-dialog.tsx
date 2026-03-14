import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Tdvsp_ideasModel } from "@/generated";
import { useAccounts } from "@/hooks/use-accounts";
import { useContacts } from "@/hooks/use-contacts";
import { Pencil } from "lucide-react";
import { CATEGORY_LABELS, categoryVariant } from "./labels";

type Idea = Tdvsp_ideasModel.Tdvsp_ideas;

interface IdeaDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  idea?: Idea;
  onEdit: (item: Idea) => void;
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

export function IdeaDetailDialog({
  open,
  onOpenChange,
  idea,
  onEdit,
}: IdeaDetailDialogProps) {
  const { data: accounts } = useAccounts();
  const { data: contacts } = useContacts();

  if (!idea) return null;

  const accountId = (idea as unknown as Record<string, string>)._tdvsp_account_value;
  const accountName = idea.tdvsp_accountname
    ?? accounts?.find((a) => a.accountid === accountId)?.name;

  const contactId = (idea as unknown as Record<string, string>)._tdvsp_contact_value;
  const contactName = idea.tdvsp_contactname
    ?? contacts?.find((c) => c.contactid === contactId)
      ? `${contacts?.find((c) => c.contactid === contactId)?.firstname ?? ""} ${contacts?.find((c) => c.contactid === contactId)?.lastname ?? ""}`.trim()
      : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between pr-8">
            <DialogTitle>{idea.tdvsp_name}</DialogTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(idea)}
            >
              <Pencil className="mr-2 h-3 w-3" />
              Edit
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={idea.statecode === 0 ? "default" : "secondary"}>
              {idea.statecodename ?? "Active"}
            </Badge>
            {idea.tdvsp_category != null && (
              <Badge variant={categoryVariant(idea.tdvsp_category)}>
                {CATEGORY_LABELS[idea.tdvsp_category]}
              </Badge>
            )}
          </div>

          <Separator />

          <dl>
            <DetailRow label="Account" value={accountName} />
            <DetailRow label="Contact" value={contactName} />
            <DetailRow
              label="Category"
              value={idea.tdvsp_category != null ? CATEGORY_LABELS[idea.tdvsp_category] : null}
            />
          </dl>

          {idea.tdvsp_description && (
            <>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Description</p>
                <p className="text-sm whitespace-pre-wrap">
                  {idea.tdvsp_description}
                </p>
              </div>
            </>
          )}

          <Separator />
          <dl>
            <DetailRow label="Owner" value={idea.owneridname} />
          </dl>
        </div>
      </DialogContent>
    </Dialog>
  );
}
