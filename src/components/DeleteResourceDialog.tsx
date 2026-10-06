import { useEffect, useState, type FormEvent } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

interface DeleteResourceDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  reasonRequired?: boolean;
  submitting?: boolean;
  onOpenChange(open: boolean): void;
  onConfirm(reason?: string): void | Promise<void>;
}

export function DeleteResourceDialog({ open, title, description, confirmLabel, reasonRequired = false, submitting = false, onOpenChange, onConfirm }: DeleteResourceDialogProps) {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (!open) setReason('');
  }, [open]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedReason = reason.trim();
    if (reasonRequired && trimmedReason.length < 2) return;
    void onConfirm(trimmedReason || undefined);
  }

  return <Dialog open={open} onOpenChange={(nextOpen) => { if (!submitting) onOpenChange(nextOpen); }}>
    <DialogContent>
      <form onSubmit={submit} className="space-y-4">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {reasonRequired ? <div className="space-y-2"><Label htmlFor="delete-reason">Motivo</Label><Textarea id="delete-reason" value={reason} onChange={(event) => setReason(event.target.value)} minLength={2} maxLength={2000} placeholder="Indicá por qué se elimina este registro" required /></div> : null}
        <DialogFooter>
          <Button type="button" variant="outline" disabled={submitting} onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button type="submit" variant="destructive" disabled={submitting || (reasonRequired && reason.trim().length < 2)}>{submitting ? 'Eliminando…' : confirmLabel}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>;
}
