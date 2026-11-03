-- Fix: recording an expense failed because the payment-only invoice check read NEW.invoice_id on expenses rows.
CREATE OR REPLACE FUNCTION public.validate_ledger_relations() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
  IF TG_TABLE_NAME = 'project_workers' THEN
    IF EXISTS (SELECT 1 FROM public.workers WHERE id = NEW.worker_id AND status IN ('unavailable','on_leave')) THEN
      RAISE EXCEPTION 'Worker is unavailable for new assignments';
    END IF;
  ELSIF TG_TABLE_NAME = 'invoice_items' THEN
    IF NEW.quantity <= 0 OR NEW.rate < 0 THEN RAISE EXCEPTION 'Invalid invoice quantity or rate'; END IF;
  ELSE
    IF NEW.user_id IS DISTINCT FROM auth.uid() AND current_user NOT IN ('postgres','service_role') THEN
      RAISE EXCEPTION 'Invalid owner';
    END IF;
    IF TG_TABLE_NAME = 'projects' THEN
      IF NEW.budget < 0 OR NEW.manual_progress < 0 OR NEW.manual_progress > 100 OR length(trim(NEW.name)) = 0 THEN
        RAISE EXCEPTION 'Invalid project';
      END IF;
      IF NEW.client_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.clients WHERE id = NEW.client_id AND user_id = NEW.user_id) THEN
        RAISE EXCEPTION 'Invalid client owner';
      END IF;
    ELSE
      IF NEW.project_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.projects WHERE id = NEW.project_id AND user_id = NEW.user_id) THEN
        RAISE EXCEPTION 'Invalid project owner';
      END IF;
      IF TG_TABLE_NAME = 'invoices' THEN
        IF NEW.client_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.clients WHERE id = NEW.client_id AND user_id = NEW.user_id) THEN
          RAISE EXCEPTION 'Invalid client owner';
        END IF;
      ELSE
        IF NEW.amount <= 0 THEN RAISE EXCEPTION 'Amount must be positive'; END IF;
        IF TG_TABLE_NAME = 'payments' THEN
          IF NEW.invoice_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.invoices WHERE id = NEW.invoice_id AND user_id = NEW.user_id AND project_id IS NOT DISTINCT FROM NEW.project_id) THEN
            RAISE EXCEPTION 'Invalid invoice owner or project';
          END IF;
        END IF;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END $$;