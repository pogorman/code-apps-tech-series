import { useState } from "react";
import { useContacts, useDeleteContact } from "@/hooks/use-contacts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ContactFormDialog } from "./contact-form-dialog";
import { ContactDetailDialog } from "./contact-detail-dialog";
import { ContactDeleteDialog } from "./contact-delete-dialog";
import { Plus, Search } from "lucide-react";
import type { ContactsModel } from "@/generated";
import { toast } from "sonner";

type Contact = ContactsModel.Contacts;

export function ContactList() {
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editContact, setEditContact] = useState<Contact | null>(null);
  const [viewContact, setViewContact] = useState<Contact | null>(null);
  const [deleteContact, setDeleteContact] = useState<Contact | null>(null);

  const escaped = search.replace(/'/g, "''");
  const filter = search
    ? `contains(firstname, '${escaped}') or contains(lastname, '${escaped}')`
    : undefined;

  const { data: contacts, isLoading, error } = useContacts({ filter });
  const deleteMutation = useDeleteContact();

  function handleDelete() {
    if (!deleteContact) return;
    const name =
      deleteContact.fullname ??
      `${deleteContact.firstname ?? ""} ${deleteContact.lastname}`.trim();
    deleteMutation.mutate(deleteContact.contactid, {
      onSuccess: () => {
        toast.success(`Deleted "${name}"`);
        setDeleteContact(null);
      },
      onError: (err) => {
        toast.error(`Delete failed: ${err.message}`);
      },
    });
  }

  if (error) {
    return (
      <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive">
        Failed to load contacts: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Contact
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Job Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : contacts?.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground py-8"
                >
                  {search
                    ? "No contacts match your search."
                    : "No contacts found. Create one to get started."}
                </TableCell>
              </TableRow>
            ) : (
              contacts?.map((contact) => {
                const displayName =
                  contact.fullname ??
                  `${contact.firstname ?? ""} ${contact.lastname}`.trim();
                return (
                  <TableRow
                    key={contact.contactid}
                    className="cursor-pointer"
                    onClick={() => setViewContact(contact)}
                  >
                    <TableCell className="font-medium">{displayName}</TableCell>
                    <TableCell>
                      {contact.parentcustomeridname ?? "\u2014"}
                    </TableCell>
                    <TableCell>{contact.emailaddress1 ?? "\u2014"}</TableCell>
                    <TableCell>{contact.telephone1 ?? "\u2014"}</TableCell>
                    <TableCell>{contact.jobtitle ?? "\u2014"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          contact.statecode === 0 ? "default" : "secondary"
                        }
                      >
                        {contact.statecodename ?? "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div
                        className="flex gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditContact(contact)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteContact(contact)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <ContactFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        mode="create"
      />

      <ContactFormDialog
        open={!!editContact}
        onOpenChange={(open) => {
          if (!open) setEditContact(null);
        }}
        mode="edit"
        contact={editContact ?? undefined}
      />

      <ContactDetailDialog
        open={!!viewContact}
        onOpenChange={(open) => {
          if (!open) setViewContact(null);
        }}
        contact={viewContact ?? undefined}
        onEdit={(contact) => {
          setViewContact(null);
          setEditContact(contact);
        }}
      />

      <ContactDeleteDialog
        open={!!deleteContact}
        onOpenChange={(open) => {
          if (!open) setDeleteContact(null);
        }}
        contactName={
          deleteContact
            ? (deleteContact.fullname ??
              `${deleteContact.firstname ?? ""} ${deleteContact.lastname}`.trim())
            : ""
        }
        onConfirm={handleDelete}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
